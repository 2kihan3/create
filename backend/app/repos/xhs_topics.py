from __future__ import annotations

from typing import Any

from app.db import connect, dumps, loads
from app.repos.base import new_id, now_iso
from app.schemas import TopicUpdate


def _topic(row: Any) -> dict[str, Any]:
    item = dict(row)
    item["copy"] = loads(item.get("copy"), {})
    item["image_prompts"] = loads(item.get("image_prompts"), [])
    item["images"] = loads(item.get("images"), [])
    return item


def list_topics(project_id: str) -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM xhs_topics WHERE project_id = ? ORDER BY sort_order, created_at",
            (project_id,),
        ).fetchall()
        return [_topic(row) for row in rows]


def get_topic(topic_id: str) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM xhs_topics WHERE id = ?", (topic_id,)).fetchone()
        return _topic(row) if row else None


def create_topic(project_id: str, title: str, angle: str, brief: str, sort_order: int) -> dict[str, Any]:
    topic_id = new_id("topic")
    now = now_iso()
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO xhs_topics (
              id, project_id, title, angle, brief, status, sort_order,
              copy, image_prompts, images, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                topic_id,
                project_id,
                title,
                angle,
                brief,
                "planned",
                sort_order,
                "{}",
                "[]",
                "[]",
                now,
                now,
            ),
        )
    return get_topic(topic_id)  # type: ignore[return-value]


def update_topic(topic_id: str, payload: TopicUpdate) -> dict[str, Any] | None:
    current = get_topic(topic_id)
    if not current:
        return None
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        return current
    columns = []
    values: list[Any] = []
    for key, value in updates.items():
        columns.append(f"{key} = ?")
        values.append(value)
    columns.append("updated_at = ?")
    values.append(now_iso())
    values.append(topic_id)
    with connect() as conn:
        conn.execute(f"UPDATE xhs_topics SET {', '.join(columns)} WHERE id = ?", values)
    return get_topic(topic_id)


def set_topic_generation(topic_id: str, *, status: str, copy: dict[str, Any] | None = None,
                         image_prompts: list[Any] | None = None, images: list[Any] | None = None) -> dict[str, Any] | None:
    fields = ["status = ?", "updated_at = ?"]
    values: list[Any] = [status, now_iso()]
    if copy is not None:
        fields.append("copy = ?")
        values.append(dumps(copy))
    if image_prompts is not None:
        fields.append("image_prompts = ?")
        values.append(dumps(image_prompts))
    if images is not None:
        fields.append("images = ?")
        values.append(dumps(images))
    values.append(topic_id)
    with connect() as conn:
        conn.execute(f"UPDATE xhs_topics SET {', '.join(fields)} WHERE id = ?", values)
    return get_topic(topic_id)


def delete_topic(topic_id: str) -> bool:
    with connect() as conn:
        cur = conn.execute("DELETE FROM xhs_topics WHERE id = ?", (topic_id,))
        return cur.rowcount > 0
