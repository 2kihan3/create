from __future__ import annotations

from typing import Any

from app.db import connect, dumps, loads
from app.repos.base import new_id, now_iso
from app.schemas import ModelSelectionUpdate, ProjectCreate, ProjectUpdate


def _project(row: Any) -> dict[str, Any]:
    item = dict(row)
    item["memory"] = loads(item.get("memory"), {})
    return item


def list_projects() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM projects ORDER BY updated_at DESC").fetchall()
        return [_project(row) for row in rows]


def get_project(project_id: str) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        return _project(row) if row else None


def create_project(payload: ProjectCreate) -> dict[str, Any]:
    project_id = new_id("project")
    now = now_iso()
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO projects (
              id, name, project_type, status, memory,
              default_text_model_config_id, default_image_model_config_id,
              default_video_model_config_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                project_id,
                payload.name,
                payload.project_type,
                "active",
                dumps(payload.memory),
                payload.default_text_model_config_id,
                payload.default_image_model_config_id,
                payload.default_video_model_config_id,
                now,
                now,
            ),
        )
    return get_project(project_id)  # type: ignore[return-value]


def update_project(project_id: str, payload: ProjectUpdate) -> dict[str, Any] | None:
    current = get_project(project_id)
    if not current:
        return None
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        return current
    columns = []
    values: list[Any] = []
    for key, value in updates.items():
        columns.append(f"{key} = ?")
        values.append(dumps(value) if key == "memory" else value)
    columns.append("updated_at = ?")
    values.append(now_iso())
    values.append(project_id)
    with connect() as conn:
        conn.execute(f"UPDATE projects SET {', '.join(columns)} WHERE id = ?", values)
    return get_project(project_id)


def update_model_selection(project_id: str, payload: ModelSelectionUpdate) -> dict[str, Any] | None:
    return update_project(
        project_id,
        ProjectUpdate(
            default_text_model_config_id=payload.text_model_config_id,
            default_image_model_config_id=payload.image_model_config_id,
            default_video_model_config_id=payload.video_model_config_id,
        ),
    )


def touch_project(project_id: str) -> None:
    with connect() as conn:
        conn.execute("UPDATE projects SET updated_at = ? WHERE id = ?", (now_iso(), project_id))
