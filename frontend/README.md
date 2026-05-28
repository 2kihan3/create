# 素材生成工作台 Demo

基于 React + TypeScript + Vite 的智能文案与图片生成平台前端演示。

## 功能特性

- **双场景切换**：自媒体场景（小红书/抖音/微博）与电商场景（淘宝/京东/拼多多）
- **智能文案生成**：AI驱动的文案创作，支持多风格、多参数配置
- **AI图片生成**：集成多个AI图片生成服务
  - Stable Diffusion
  - 即梦AI（火山引擎）
  - 通义万相（阿里云万相 wan2.6-image）✨
- **文生图 & 图生图**：支持纯文生图和基于参考图的图生图功能
- **API密钥管理**：支持多AI服务商API密钥配置、切换与自动激活
- **Vite 代理配置**：解决跨域问题，本地开发直接调用阿里云API
- **响应式设计**：适配桌面端与移动端

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **状态管理**：Zustand（带持久化）
- **UI组件**：Ant Design Icons + 自定义CSS
- **样式方案**：Tailwind CSS + 自定义CSS变量
- **路由管理**：React Router DOM
- **AI服务集成**：
  - 通义万相（阿里云 wan2.6-image）
  - 即梦AI（火山引擎）
  - Stable Diffusion

## 快速开始

### 环境要求
- Node.js 18+ 
- npm 9+

### 安装依赖
```bash
cd material-studio-demo
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5175 查看应用。

### 生产构建
```bash
npm run build
npm run preview
```

## 项目结构

```
src/
├── components/           # 公共组件
│   ├── Header.tsx       # 顶部导航栏
│   └── Layout.tsx       # 布局组件
├── pages/               # 页面组件
│   ├── Home.tsx         # 首页仪表板
│   ├── Copywriting.tsx  # 文案生成页
│   ├── ImageGeneration.tsx # 图片生成页
│   └── ApiKeys.tsx      # API密钥管理页 ✨
├── services/            # 服务层 ✨
│   ├── dashscopeService.ts  # 通义万相 API 服务
│   ├── jimengService.ts     # 即梦AI API 服务
│   └── stablediffusionService.ts  # Stable Diffusion API 服务
├── store/               # 状态管理
│   └── sceneStore.ts    # 场景与配置状态
├── styles/              # 样式文件
│   └── global.css       # 全局样式
└── App.tsx              # 应用入口
```

## 核心功能说明

### 1. 场景切换
- 顶部导航栏左侧切换自媒体/电商场景
- 场景切换影响：默认模板、推荐内容、预设参数
- 场景状态持久化存储（localStorage）

### 2. 文案生成
- 支持产品名称、关键词、目标受众、风格选择
- 实时生成多个文案变体
- 支持复制、编辑、导出操作
- 集成多个AI模型（OpenAI GPT-4/3.5、Claude等）

### 3. 图片生成
- **文生图**：基于文字提示生成图片
- **图生图**：基于参考图片生成，支持背景保留和风格迁移 ✨
- 提示词与负面提示词配置
- 多AI服务商支持：
  - **通义万相**（阿里云 wan2.6-image）✨
    - 支持文生图和图生图
    - SSE 流式响应解析
    - Vite 代理解决 CORS
  - **即梦AI**（火山引擎）
    - 火山引擎 v4 签名算法
  - **Stable Diffusion**
- 尺寸与宽高比预设
- 图片预览与简单编辑

### 4. API密钥管理 ✨
- 支持多个AI服务商API密钥配置
- 密钥自动激活与切换
- 密钥列表管理（添加、编辑、删除、设为当前使用）
- 状态持久化存储

### 5. 状态管理
- 使用Zustand管理全局状态
- 持久化存储：场景选择、API密钥、用户偏好
- 类型安全的TypeScript接口

## 设计亮点

1. **蓝紫渐变主题**：采用AI偏好的蓝紫色渐变，突出科技感与亲和力
2. **场景化设计**：不同场景使用不同配色与内容推荐
3. **响应式布局**：使用CSS Grid + Flexbox实现自适应布局
4. **交互反馈**：丰富的悬停、点击动画与状态提示
5. **代理配置**：本地开发通过 Vite 代理直接调用阿里云 API，无需后端

## 后续扩展方向

1. **后端集成**：连接真实AI API（OpenAI、Stable Diffusion等）
2. **模板编辑器**：可视化模板编辑与自定义
3. **协作功能**：团队项目共享与协作
4. **数据分析**：生成内容的效果分析与优化建议
5. **多语言支持**：国际化与本地化

## 功能说明

当前版本已集成真实的 AI API 服务：

- **通义万相（阿里云）**：wan2.6-image 模型，支持文生图和图生图
- **即梦AI（火山引擎）**：火山引擎 v4 签名算法
- **Stable Diffusion**：支持自定义 API 配置

## 许可证

MIT License

---

**开发团队**：素材生成工作台产品组  
**版本**：v1.1.0  
**最后更新**：2026年4月17日