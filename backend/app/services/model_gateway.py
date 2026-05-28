from __future__ import annotations

import html
import json
from pathlib import Path
from typing import Any
from uuid import uuid4

import httpx

from app.db import ASSET_DIR
from app.repos import assets as asset_repo


class ModelGateway:
    async def generate_text(self, config: dict[str, Any] | None, prompt: str, system_prompt: str) -> str:
        if not config or not config.get("api_key") or str(config.get("api_key")).startswith("sk-demo"):
            return self._mock_text(prompt)

        provider = config["provider"]
        if provider in {"deepseek", "openai", "custom"}:
            return await self._openai_compatible_text(config, prompt, system_prompt)
        return self._mock_text(prompt)

    async def generate_images(
        self,
        config: dict[str, Any] | None,
        *,
        project_id: str,
        topic_id: str,
        prompts: list[str],
    ) -> list[dict[str, Any]]:
        if config and config.get("provider") == "dashscope" and config.get("api_key") and not str(config["api_key"]).startswith("dashscope-demo"):
            try:
                urls = await self._dashscope_images(config, prompts)
                saved = []
                async with httpx.AsyncClient(timeout=60) as client:
                    for index, url in enumerate(urls):
                        response = await client.get(url)
                        response.raise_for_status()
                        filename = f"{uuid4().hex[:10]}.png"
                        path = self._asset_path(project_id, "images", filename)
                        path.write_bytes(response.content)
                        saved.append(
                            asset_repo.create_asset(
                                project_id=project_id,
                                topic_id=topic_id,
                                kind="xhs_image",
                                filename=filename,
                                path=str(path),
                                source_url=url,
                                metadata={"prompt": prompts[min(index, len(prompts) - 1)]},
                            )
                        )
                return saved
            except Exception as exc:
                print(f"DashScope image generation failed, falling back to local mock: {exc}")

        return [self._mock_image(project_id, topic_id, prompt, index) for index, prompt in enumerate(prompts)]

    async def test_config(self, config: dict[str, Any]) -> dict[str, Any]:
        if config["model_type"] == "text":
            text = await self.generate_text(config, "请回复：连接正常", "你是连接测试助手。")
            return {"ok": bool(text), "message": text[:80]}
        if config["model_type"] == "image":
            return {"ok": True, "message": "图片模型配置已保存；生成任务时会进行真实调用。"}
        return {"ok": True, "message": "视频模型配置已保存。"}

    async def _openai_compatible_text(self, config: dict[str, Any], prompt: str, system_prompt: str) -> str:
        endpoint = config.get("endpoint") or "https://api.deepseek.com/v1/chat/completions"
        params = config.get("default_params") or {}
        payload = {
            "model": config.get("model_name") or "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": params.get("temperature", 0.7),
            "max_tokens": params.get("max_tokens", 1600),
        }
        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                endpoint,
                headers={"Authorization": f"Bearer {config['api_key']}", "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

    async def _dashscope_images(self, config: dict[str, Any], prompts: list[str]) -> list[str]:
        params = config.get("default_params") or {}
        endpoint = config.get("endpoint") or "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
        urls: list[str] = []
        async with httpx.AsyncClient(timeout=120) as client:
            for prompt in prompts:
                payload = {
                    "model": config.get("model_name") or "wan2.6-image",
                    "input": {"messages": [{"role": "user", "content": [{"text": prompt}]}]},
                    "parameters": {
                        "prompt_extend": params.get("prompt_extend", False),
                        "watermark": params.get("watermark", False),
                        "n": 1,
                        "negative_prompt": params.get("negative_prompt", ""),
                        "enable_interleave": True,
                        "stream": True,
                        "size": f"{params.get('width', 1080)}*{params.get('height', 1440)}",
                    },
                }
                async with client.stream(
                    "POST",
                    endpoint,
                    headers={
                        "Authorization": f"Bearer {config['api_key']}",
                        "Content-Type": "application/json",
                        "X-DashScope-Sse": "enable",
                    },
                    json=payload,
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line.startswith("data:"):
                            continue
                        raw = line[5:].strip()
                        if not raw or raw == "[DONE]":
                            continue
                        data = json.loads(raw)
                        for choice in data.get("output", {}).get("choices", []) or []:
                            for content in choice.get("message", {}).get("content", []) or []:
                                if content.get("type") == "image" and content.get("image"):
                                    urls.append(content["image"])
        if not urls:
            raise RuntimeError("DashScope did not return image URLs")
        return urls

    def _mock_text(self, prompt: str) -> str:
        if "选题" in prompt:
            return json.dumps(
                [
                    {"title": "通勤包里一定要有的 5 件小物", "angle": "实用清单", "brief": "从通勤痛点切入，强调轻量、好收纳和真实使用感。"},
                    {"title": "一周精简护肤复盘", "angle": "经验分享", "brief": "用前后对比和步骤拆解建立可信度。"},
                    {"title": "下班后 30 分钟自我恢复计划", "angle": "生活方式", "brief": "面向高压人群，给出可复制的放松流程。"},
                    {"title": "新手也能拍出干净桌面照", "angle": "教程步骤", "brief": "拆解光线、构图、道具和修图参数。"},
                    {"title": "最近反复回购的居家好物", "angle": "好物推荐", "brief": "突出真实场景、优缺点和适合人群。"},
                ],
                ensure_ascii=False,
            )
        return json.dumps(
            {
                "title": "这份日常灵感，我真的想保存一整年",
                "body": "最近一直在整理自己的内容节奏，发现真正能坚持下来的方法，反而不是很复杂的计划。\n\n我会先确定一个小主题，再把真实使用场景、遇到的问题、解决方法写下来。这样生成的内容更像一次认真分享，而不是硬凑出来的笔记。\n\n如果你也在做内容，可以先从一个具体瞬间开始：今天为什么想写它？它帮你解决了什么？谁会需要它？答案出来之后，文案和图片方向都会清楚很多。",
                "tags": ["小红书运营", "内容创作", "自媒体成长", "选题灵感"],
                "image_prompts": [
                    "小红书风格封面图，干净桌面，笔记本电脑和手帐，暖色自然光，真实生活方式摄影",
                    "竖版生活方式配图，手写选题清单，咖啡杯，简洁高级，浅色背景",
                    "内容创作者工作台，手机预览小红书笔记，柔和光线，真实摄影质感",
                ],
            },
            ensure_ascii=False,
        )

    def _mock_image(self, project_id: str, topic_id: str, prompt: str, index: int) -> dict[str, Any]:
        filename = f"{uuid4().hex[:10]}.svg"
        path = self._asset_path(project_id, "images", filename)
        safe_prompt = html.escape(prompt[:160])
        colors = [("#F7C6A3", "#78A6C8"), ("#C7E8CA", "#F2B6C6"), ("#F7D060", "#8FB9A8"), ("#B7A4E0", "#F6D6AD")]
        c1, c2 = colors[index % len(colors)]
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440">
  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient></defs>
  <rect width="1080" height="1440" fill="url(#g)"/>
  <rect x="90" y="160" width="900" height="1120" rx="36" fill="rgba(255,255,255,0.76)"/>
  <text x="140" y="280" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#202124">XHS Image Draft</text>
  <foreignObject x="140" y="350" width="800" height="700">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 42px; line-height: 1.35; color: #2f3437;">{safe_prompt}</div>
  </foreignObject>
  <text x="140" y="1180" font-family="Arial, sans-serif" font-size="32" fill="#5f6368">Mock asset · configure image API for real generation</text>
</svg>"""
        path.write_text(svg, encoding="utf-8")
        return asset_repo.create_asset(
            project_id=project_id,
            topic_id=topic_id,
            kind="xhs_image",
            filename=filename,
            path=str(path),
            metadata={"prompt": prompt, "mock": True},
        )

    def _asset_path(self, project_id: str, kind: str, filename: str) -> Path:
        folder = ASSET_DIR / "projects" / project_id / kind
        folder.mkdir(parents=True, exist_ok=True)
        return folder / filename
