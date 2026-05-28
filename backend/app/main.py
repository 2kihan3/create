from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db import ASSET_DIR, ensure_data_dirs, init_db
from app.repos import assets, model_configs, projects, xhs_topics
from app.schemas import (
    CopyReviewRequest,
    GenerateCopyRequest,
    GenerateImagesRequest,
    GenerateTopicsRequest,
    ImagesReviewRequest,
    ModelConfigCreate,
    ModelConfigUpdate,
    ModelSelectionUpdate,
    ProjectCreate,
    ProjectUpdate,
    TopicUpdate,
)
from app.services.model_gateway import ModelGateway
from app.services.xhs_service import XhsService
from app.workflows.xhs import build_xhs_graph

app = FastAPI(title="Creator Agent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

xhs_service = XhsService()
ensure_data_dirs()


@app.on_event("startup")
def startup() -> None:
    init_db()
    model_configs.seed_demo_model_configs()
    build_xhs_graph()


app.mount("/assets", StaticFiles(directory=str(ASSET_DIR)), name="assets")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/model-configs")
def list_model_configs(model_type: str | None = Query(default=None)) -> list[dict]:
    return model_configs.list_model_configs(model_type)


@app.post("/api/model-configs")
def create_model_config(payload: ModelConfigCreate) -> dict:
    return model_configs.create_model_config(payload)


@app.patch("/api/model-configs/{config_id}")
def update_model_config(config_id: str, payload: ModelConfigUpdate) -> dict:
    item = model_configs.update_model_config(config_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="model_config_not_found")
    return item


@app.delete("/api/model-configs/{config_id}")
def delete_model_config(config_id: str) -> dict[str, bool]:
    return {"ok": model_configs.delete_model_config(config_id)}


@app.post("/api/model-configs/{config_id}/test")
async def test_model_config(config_id: str) -> dict:
    config = model_configs.get_model_config(config_id)
    if not config:
        raise HTTPException(status_code=404, detail="model_config_not_found")
    result = await ModelGateway().test_config(config)
    status = "ok" if result["ok"] else "failed"
    model_configs.update_model_config(config_id, ModelConfigUpdate())
    return {**result, "test_status": status}


@app.get("/api/projects")
def list_projects() -> list[dict]:
    return projects.list_projects()


@app.post("/api/projects")
def create_project(payload: ProjectCreate) -> dict:
    return projects.create_project(payload)


@app.get("/api/projects/{project_id}")
def get_project(project_id: str) -> dict:
    project = projects.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="project_not_found")
    if project["project_type"] == "xhs":
        project["topics"] = xhs_topics.list_topics(project_id)
    project["assets"] = assets.list_assets(project_id)
    return project


@app.patch("/api/projects/{project_id}")
def update_project(project_id: str, payload: ProjectUpdate) -> dict:
    item = projects.update_project(project_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="project_not_found")
    return item


@app.post("/api/projects/{project_id}/model-selection")
def update_model_selection(project_id: str, payload: ModelSelectionUpdate) -> dict:
    item = projects.update_model_selection(project_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="project_not_found")
    return item


@app.get("/api/projects/{project_id}/assets")
def list_project_assets(project_id: str) -> list[dict]:
    return assets.list_assets(project_id)


@app.get("/api/projects/{project_id}/xhs/topics")
def list_xhs_topics(project_id: str) -> list[dict]:
    return xhs_topics.list_topics(project_id)


@app.post("/api/projects/{project_id}/xhs/topics/generate")
async def generate_xhs_topics(project_id: str, payload: GenerateTopicsRequest) -> list[dict]:
    try:
        return await xhs_service.generate_weekly_topics(project_id, payload)
    except KeyError:
        raise HTTPException(status_code=404, detail="project_not_found")


@app.patch("/api/xhs/topics/{topic_id}")
def update_xhs_topic(topic_id: str, payload: TopicUpdate) -> dict:
    item = xhs_topics.update_topic(topic_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="topic_not_found")
    return item


@app.delete("/api/xhs/topics/{topic_id}")
def delete_xhs_topic(topic_id: str) -> dict[str, bool]:
    return {"ok": xhs_topics.delete_topic(topic_id)}


@app.post("/api/xhs/topics/{topic_id}/copy/generate")
async def generate_xhs_copy(topic_id: str, payload: GenerateCopyRequest) -> dict:
    try:
        return await xhs_service.generate_copy(topic_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/xhs/topics/{topic_id}/copy/review")
async def review_xhs_copy(topic_id: str, payload: CopyReviewRequest) -> dict:
    try:
        return await xhs_service.review_copy(topic_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/xhs/topics/{topic_id}/images/generate")
async def generate_xhs_images(topic_id: str, payload: GenerateImagesRequest) -> dict:
    try:
        return await xhs_service.generate_images(topic_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post("/api/xhs/topics/{topic_id}/images/review")
async def review_xhs_images(topic_id: str, payload: ImagesReviewRequest) -> dict:
    try:
        return await xhs_service.review_images(topic_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
