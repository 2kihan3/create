from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
ASSET_DIR = DATA_DIR / "assets"
DB_PATH = DATA_DIR / "app.db"


def ensure_data_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)


def connect() -> sqlite3.Connection:
    ensure_data_dirs()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


def loads(value: str | None, default: Any = None) -> Any:
    if not value:
        return default
    return json.loads(value)


def init_db() -> None:
    ensure_data_dirs()
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS model_configs (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              provider TEXT NOT NULL,
              model_type TEXT NOT NULL CHECK (model_type IN ('text', 'image', 'video')),
              model_name TEXT NOT NULL,
              endpoint TEXT,
              api_key TEXT,
              default_params TEXT NOT NULL DEFAULT '{}',
              cost_label TEXT,
              is_enabled INTEGER NOT NULL DEFAULT 1,
              test_status TEXT NOT NULL DEFAULT 'untested',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS projects (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              project_type TEXT NOT NULL CHECK (project_type IN ('xhs', 'short_drama')),
              status TEXT NOT NULL DEFAULT 'active',
              memory TEXT NOT NULL DEFAULT '{}',
              default_text_model_config_id TEXT,
              default_image_model_config_id TEXT,
              default_video_model_config_id TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY(default_text_model_config_id) REFERENCES model_configs(id),
              FOREIGN KEY(default_image_model_config_id) REFERENCES model_configs(id),
              FOREIGN KEY(default_video_model_config_id) REFERENCES model_configs(id)
            );

            CREATE TABLE IF NOT EXISTS xhs_topics (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              title TEXT NOT NULL,
              angle TEXT NOT NULL,
              brief TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'planned',
              sort_order INTEGER NOT NULL DEFAULT 0,
              copy TEXT NOT NULL DEFAULT '{}',
              image_prompts TEXT NOT NULL DEFAULT '[]',
              images TEXT NOT NULL DEFAULT '[]',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS runs (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              topic_id TEXT,
              kind TEXT NOT NULL,
              status TEXT NOT NULL,
              current_step TEXT NOT NULL,
              input TEXT NOT NULL DEFAULT '{}',
              output TEXT NOT NULL DEFAULT '{}',
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
              FOREIGN KEY(topic_id) REFERENCES xhs_topics(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS assets (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              topic_id TEXT,
              kind TEXT NOT NULL,
              filename TEXT NOT NULL,
              path TEXT NOT NULL,
              source_url TEXT,
              metadata TEXT NOT NULL DEFAULT '{}',
              created_at TEXT NOT NULL,
              FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
              FOREIGN KEY(topic_id) REFERENCES xhs_topics(id) ON DELETE SET NULL
            );
            """
        )
