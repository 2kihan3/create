from __future__ import annotations

from pathlib import Path
from typing import Any

from app.db import ASSET_DIR, connect, dumps, loads
from app.repos.base import new_id, now_iso


def _asset(row: Any) -> dict[str, Any]:
    item = dict(row)
    item["metadata"] = loads(item.get("metadata"), {})
    item["url"] = f"/assets/{Path(item['path']).relative_to(ASSET_DIR).as_posix()}"
    return item


def create_asset(
    *,
    project_id: str,
    topic_id: str | None,
    kind: str,
    filename: str,
    path: str,
    source_url: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    asset_id = new_id("asset")
    now = now_iso()
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO assets (
              id, project_id, topic_id, kind, filename, path, source_url, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                asset_id,
                project_id,
                topic_id,
                kind,
                filename,
                path,
                source_url,
                dumps(metadata or {}),
                now,
            ),
        )
        row = conn.execute("SELECT * FROM assets WHERE id = ?", (asset_id,)).fetchone()
        return _asset(row)


def list_assets(project_id: str) -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM assets WHERE project_id = ? ORDER BY created_at DESC",
            (project_id,),
        ).fetchall()
        return [_asset(row) for row in rows]
