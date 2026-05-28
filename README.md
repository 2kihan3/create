# Creator Agent

本地优先的 LangGraph 内容生成工作台。当前已实现小红书图文生成 v1：

- FastAPI 后端
- SQLite 本地数据库
- 本地资产目录
- 小红书项目记忆
- 一周选题 todo
- 文案生成与确认
- 图片生成与确认
- 文本/图片模型 API 配置

## 启动后端

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=backend uvicorn app.main:app --reload --port 8000
```

后端会自动创建：

```text
data/app.db
data/assets/
```

## 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 Vite 输出的本地地址，一般是 `http://localhost:5173`。

## 模型配置

首次启动会写入两个 demo 配置：

- DeepSeek Mock/兼容：文本模型
- 通义万相 wan2.6：图片模型

没有真实 API key 时，系统会使用 mock 内容和本地 SVG 图片，方便完整测试流程。配置真实 key 后，文本模型会走 OpenAI-compatible API，图片模型会优先调用 DashScope wan2.6-image。
