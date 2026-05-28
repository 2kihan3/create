from __future__ import annotations

from typing import Any

from app.db import connect, dumps, loads
from app.repos.base import new_id, now_iso
from app.schemas import ModelConfigCreate, ModelConfigUpdate


def _row(row: Any) -> dict[str, Any]:
    item = dict(row)
    item["default_params"] = loads(item.get("default_params"), {})
    item["is_enabled"] = bool(item["is_enabled"])
    if item.get("api_key"):
        item["api_key_masked"] = mask_key(item["api_key"])
    return item


def mask_key(value: str) -> str:
    if len(value) <= 8:
        return "****"
    return f"{value[:4]}...{value[-4:]}"


def list_model_configs(model_type: str | None = None) -> list[dict[str, Any]]:
    sql = "SELECT * FROM model_configs"
    params: list[Any] = []
    if model_type:
        sql += " WHERE model_type = ?"
        params.append(model_type)
    sql += " ORDER BY model_type, provider, name"
    with connect() as conn:
        return [_row(row) for row in conn.execute(sql, params).fetchall()]


def get_model_config(config_id: str | None) -> dict[str, Any] | None:
    if not config_id:
        return None
    with connect() as conn:
        row = conn.execute("SELECT * FROM model_configs WHERE id = ?", (config_id,)).fetchone()
        return _row(row) if row else None


def create_model_config(payload: ModelConfigCreate) -> dict[str, Any]:
    config_id = new_id("model")
    now = now_iso()
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO model_configs (
              id, name, provider, model_type, model_name, endpoint, api_key,
              default_params, cost_label, is_enabled, test_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                config_id,
                payload.name,
                payload.provider,
                payload.model_type,
                payload.model_name,
                payload.endpoint,
                payload.api_key,
                dumps(payload.default_params),
                payload.cost_label,
                int(payload.is_enabled),
                "untested",
                now,
                now,
            ),
        )
    return get_model_config(config_id)  # type: ignore[return-value]


def update_model_config(config_id: str, payload: ModelConfigUpdate) -> dict[str, Any] | None:
    current = get_model_config(config_id)
    if not current:
        return None
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        return current
    columns = []
    values: list[Any] = []
    for key, value in updates.items():
        columns.append(f"{key} = ?")
        if key == "default_params":
            values.append(dumps(value))
        elif key == "is_enabled":
            values.append(int(value))
        else:
            values.append(value)
    columns.append("updated_at = ?")
    values.append(now_iso())
    values.append(config_id)
    with connect() as conn:
        conn.execute(f"UPDATE model_configs SET {', '.join(columns)} WHERE id = ?", values)
    return get_model_config(config_id)


def delete_model_config(config_id: str) -> bool:
    with connect() as conn:
        cur = conn.execute("DELETE FROM model_configs WHERE id = ?", (config_id,))
        return cur.rowcount > 0


def seed_demo_model_configs() -> None:
    with connect() as conn:
        count = conn.execute("SELECT COUNT(*) FROM model_configs").fetchone()[0]
    if count:
        return
    demo_configs = [
        ModelConfigCreate(
            name="DeepSeek Mock/兼容",
            provider="deepseek",
            model_type="text",
            model_name="deepseek-chat",
            endpoint="https://api.deepseek.com/v1/chat/completions",
            api_key="sk-demo",
            cost_label="低成本文本",
            default_params={"temperature": 0.7, "max_tokens": 1600},
        ),
        ModelConfigCreate(
            name="通义万相 wan2.6",
            provider="dashscope",
            model_type="image",
            model_name="wan2.6-image",
            endpoint="https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
            api_key="dashscope-demo",
            cost_label="图片生成",
            default_params={"width": 1080, "height": 1440, "n": 3},
        ),
    ]
    for config in demo_configs:
        create_model_config(config)
