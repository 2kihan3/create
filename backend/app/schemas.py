from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

ProjectType = Literal["xhs", "short_drama"]
ModelType = Literal["text", "image", "video"]


class ModelConfigCreate(BaseModel):
    name: str
    provider: str
    model_type: ModelType
    model_name: str
    endpoint: str | None = None
    api_key: str | None = None
    default_params: dict[str, Any] = Field(default_factory=dict)
    cost_label: str | None = None
    is_enabled: bool = True


class ModelConfigUpdate(BaseModel):
    name: str | None = None
    provider: str | None = None
    model_type: ModelType | None = None
    model_name: str | None = None
    endpoint: str | None = None
    api_key: str | None = None
    default_params: dict[str, Any] | None = None
    cost_label: str | None = None
    is_enabled: bool | None = None


class ProjectCreate(BaseModel):
    name: str
    project_type: ProjectType = "xhs"
    memory: dict[str, Any] = Field(default_factory=dict)
    default_text_model_config_id: str | None = None
    default_image_model_config_id: str | None = None
    default_video_model_config_id: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    memory: dict[str, Any] | None = None
    default_text_model_config_id: str | None = None
    default_image_model_config_id: str | None = None
    default_video_model_config_id: str | None = None


class ModelSelectionUpdate(BaseModel):
    text_model_config_id: str | None = None
    image_model_config_id: str | None = None
    video_model_config_id: str | None = None


class GenerateTopicsRequest(BaseModel):
    week_goal: str | None = None
    count: int = Field(default=5, ge=3, le=5)


class TopicUpdate(BaseModel):
    title: str | None = None
    angle: str | None = None
    brief: str | None = None
    status: str | None = None
    sort_order: int | None = None


class GenerateCopyRequest(BaseModel):
    extra_info: str | None = None


class CopyReviewRequest(BaseModel):
    approved: bool
    feedback: str | None = None
    edited_title: str | None = None
    edited_body: str | None = None
    edited_tags: list[str] | None = None


class GenerateImagesRequest(BaseModel):
    count: int = Field(default=3, ge=1, le=6)
    regenerate_indices: list[int] | None = None
    feedback: str | None = None


class ImagesReviewRequest(BaseModel):
    approved: bool
    feedback: str | None = None
    regenerate_indices: list[int] | None = None
    regenerate_all: bool = False
