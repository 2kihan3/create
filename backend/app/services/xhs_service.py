from __future__ import annotations

import json
from typing import Any

from app.repos import model_configs, projects, xhs_topics
from app.schemas import CopyReviewRequest, GenerateCopyRequest, GenerateImagesRequest, GenerateTopicsRequest, ImagesReviewRequest
from app.services.model_gateway import ModelGateway


class XhsService:
    def __init__(self) -> None:
        self.gateway = ModelGateway()

    async def generate_weekly_topics(self, project_id: str, payload: GenerateTopicsRequest) -> list[dict[str, Any]]:
        project = projects.get_project(project_id)
        if not project:
            raise KeyError("project_not_found")
        config = model_configs.get_model_config(project.get("default_text_model_config_id"))
        memory = project.get("memory") or {}
        prompt = f"""
请为一个小红书项目生成一周选题计划，数量为 {payload.count} 个。
账号定位：{json.dumps(memory, ensure_ascii=False)}
本周目标：{payload.week_goal or "维持账号风格一致，产出可执行的图文选题"}

请只返回 JSON 数组，每项包含 title、angle、brief。
"""
        raw = await self.gateway.generate_text(config, prompt, "你是小红书内容选题策划。")
        planned = self._parse_json(raw, fallback=[])
        if not isinstance(planned, list) or not planned:
            planned = self._parse_json(ModelGateway()._mock_text("选题"), fallback=[])
        existing = xhs_topics.list_topics(project_id)
        created = []
        for index, item in enumerate(planned[: payload.count]):
            created.append(
                xhs_topics.create_topic(
                    project_id,
                    str(item.get("title", f"选题 {index + 1}")),
                    str(item.get("angle", "内容角度")),
                    str(item.get("brief", "选题简介")),
                    len(existing) + index,
                )
            )
        projects.touch_project(project_id)
        return created

    async def generate_copy(self, topic_id: str, payload: GenerateCopyRequest) -> dict[str, Any]:
        topic = self._topic(topic_id)
        project = self._project(topic["project_id"])
        config = model_configs.get_model_config(project.get("default_text_model_config_id"))
        prompt = f"""
请基于以下小红书选题生成可发布的内容草稿。

项目记忆：{json.dumps(project.get("memory") or {}, ensure_ascii=False)}
选题标题：{topic["title"]}
选题角度：{topic["angle"]}
选题简介：{topic["brief"]}
用户补充信息：{payload.extra_info or "无"}

请只返回 JSON：
{{
  "title": "最终标题",
  "body": "正文",
  "tags": ["标签1"],
  "image_prompts": ["配图提示词1", "配图提示词2", "配图提示词3"]
}}
"""
        raw = await self.gateway.generate_text(config, prompt, "你是小红书爆款图文内容创作者。")
        copy = self._parse_json(raw, fallback={})
        if not isinstance(copy, dict) or not copy.get("body"):
            copy = self._parse_json(ModelGateway()._mock_text("文案"), fallback={})
        image_prompts = copy.get("image_prompts") or []
        updated = xhs_topics.set_topic_generation(
            topic_id,
            status="copy_pending_review",
            copy={
                "title": copy.get("title", topic["title"]),
                "body": copy.get("body", ""),
                "tags": copy.get("tags", []),
                "review_feedback": None,
            },
            image_prompts=image_prompts,
        )
        projects.touch_project(topic["project_id"])
        return updated  # type: ignore[return-value]

    async def review_copy(self, topic_id: str, payload: CopyReviewRequest) -> dict[str, Any]:
        topic = self._topic(topic_id)
        copy = topic.get("copy") or {}
        if payload.edited_title:
            copy["title"] = payload.edited_title
        if payload.edited_body:
            copy["body"] = payload.edited_body
        if payload.edited_tags is not None:
            copy["tags"] = payload.edited_tags
        copy["review_feedback"] = payload.feedback
        status = "copy_approved" if payload.approved else "planned"
        updated = xhs_topics.set_topic_generation(topic_id, status=status, copy=copy)
        projects.touch_project(topic["project_id"])
        return updated  # type: ignore[return-value]

    async def generate_images(self, topic_id: str, payload: GenerateImagesRequest) -> dict[str, Any]:
        topic = self._topic(topic_id)
        project = self._project(topic["project_id"])
        config = model_configs.get_model_config(project.get("default_image_model_config_id"))
        prompts = list(topic.get("image_prompts") or [])
        if not prompts:
            copy = topic.get("copy") or {}
            prompts = [f"小红书竖版配图，主题：{copy.get('title') or topic['title']}，真实生活方式摄影"]
        prompts = prompts[: payload.count]
        if payload.feedback:
            prompts = [f"{prompt}。根据反馈调整：{payload.feedback}" for prompt in prompts]
        generated = await self.gateway.generate_images(config, project_id=topic["project_id"], topic_id=topic_id, prompts=prompts)
        current_images = list(topic.get("images") or [])
        if payload.regenerate_indices:
            for offset, image_index in enumerate(payload.regenerate_indices):
                if 0 <= image_index < len(current_images) and offset < len(generated):
                    current_images[image_index] = generated[offset]
            images = current_images
        else:
            images = generated
        updated = xhs_topics.set_topic_generation(topic_id, status="images_pending_review", images=images)
        projects.touch_project(topic["project_id"])
        return updated  # type: ignore[return-value]

    async def review_images(self, topic_id: str, payload: ImagesReviewRequest) -> dict[str, Any]:
        topic = self._topic(topic_id)
        if payload.approved:
            status = "completed"
        else:
            status = "copy_approved"
        copy = dict(topic.get("copy") or {})
        copy["image_review_feedback"] = payload.feedback
        updated = xhs_topics.set_topic_generation(topic_id, status=status, copy=copy)
        projects.touch_project(topic["project_id"])
        return updated  # type: ignore[return-value]

    def _topic(self, topic_id: str) -> dict[str, Any]:
        topic = xhs_topics.get_topic(topic_id)
        if not topic:
            raise KeyError("topic_not_found")
        return topic

    def _project(self, project_id: str) -> dict[str, Any]:
        project = projects.get_project(project_id)
        if not project:
            raise KeyError("project_not_found")
        return project

    def _parse_json(self, raw: str, fallback: Any) -> Any:
        try:
            return json.loads(raw)
        except Exception:
            start = raw.find("{")
            end = raw.rfind("}")
            if start >= 0 and end > start:
                try:
                    return json.loads(raw[start : end + 1])
                except Exception:
                    pass
            start = raw.find("[")
            end = raw.rfind("]")
            if start >= 0 and end > start:
                try:
                    return json.loads(raw[start : end + 1])
                except Exception:
                    pass
        return fallback
