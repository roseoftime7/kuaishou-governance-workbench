# 司衡/Themis——电商治理WorkBuddy 工作台

治理运营智能体（Agent）全生命周期管理平台，提供从个人孵化 → 组织生产 → 监控反馈的完整闭环。

## 系统架构

```
┌─────────────────────────────────────────────────┐
│                  前端 (React + Vite)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ 工作台首页│ │ 个人分身  │ │   组织分身        │ │
│  │ Dashboard│ │ 孵化/对话 │ │ 监控/反馈/训练    │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│                   ↕ HTTP / WebSocket              │
│              Vite Proxy (/api → :8000)            │
├─────────────────────────────────────────────────┤
│                 后端 (FastAPI)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Agent    │ │ Skill 库 │ │   WebSocket       │ │
│  │ 服务     │ │ 管理     │ │   实时通信        │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│                   ↕ SQLAlchemy                    │
├─────────────────────────────────────────────────┤
│                  SQLite / PostgreSQL              │
│  agents | conversations | messages | risk_alerts │
│  inspection_tasks | review_items | consultations │
└─────────────────────────────────────────────────┘
```

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端框架 | React 19 + TypeScript | |
| 构建工具 | Vite 8 | |
| UI 组件库 | Ant Design 6 | |
| 状态管理 | Zustand 5 | |
| 路由 | React Router 7 | |
| 后端框架 | Python FastAPI | |
| 数据库 ORM | SQLAlchemy 2.0 (异步) | |
| 数据库 | SQLite (开发) / PostgreSQL (生产) | |
| AI SDK | Anthropic SDK | |
| 实时通信 | WebSocket | |

## 项目结构

```
kuaishou-governance-workbench/
├── backend/                          # Python 后端
│   ├── app/
│   │   ├── agents/                   # Agent 定义
│   │   │   ├── base.py               # BaseAgent 基类
│   │   │   ├── main_agent.py         # 主 Agent
│   │   │   ├── inspection_agent.py   # 巡检 Agent
│   │   │   ├── review_agent.py       # 审核 Agent
│   │   │   ├── risk_agent.py         # 风险 Agent
│   │   │   └── consultation_agent.py # 咨询 Agent
│   │   ├── db/
│   │   │   └── database.py           # 数据库连接与初始化
│   │   ├── models/
│   │   │   └── models.py             # SQLAlchemy 数据模型
│   │   ├── services/
│   │   │   └── agent_service.py      # Agent 服务层
│   │   ├── websocket/
│   │   │   └── manager.py            # WebSocket 连接管理
│   │   └── main.py                   # FastAPI 入口 & 路由
│   ├── .env                          # 环境变量（已加入 .gitignore）
│   ├── .env.example                  # 环境变量模板
│   ├── requirements.txt              # Python 依赖
│   └── governance.db                 # SQLite 数据库文件
│
├── frontend/                         # React 前端
│   ├── src/
│   │   ├── api/
│   │   │   └── index.ts              # API 封装 (REST + WebSocket)
│   │   ├── components/
│   │   │   └── layout/               # 布局组件
│   │   │       ├── AppLayout.tsx     # 主布局 (Sider + Header + Content)
│   │   │       ├── AppSidebar.tsx    # 侧边栏导航
│   │   │       └── AppHeader.tsx     # 顶部栏
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx     # 工作台首页
│   │   │   └── incubation/          # 个人分身（孵化模式）
│   │   │       ├── IncubationDashboard.tsx  # 孵化舱仪表盘
│   │   │       ├── AgentChatPage.tsx         # Agent 对话
│   │   │       └── AgentStudio.tsx           # Agent 工作室
│   │   │   └── production/          # 组织分身（生产模式）
│   │   │       ├── ProductionDashboard.tsx   # 生产仪表盘
│   │   │       ├── OrgAgentDetail.tsx        # Agent 详情
│   │   │       ├── TrainingTrack.tsx         # 训练追踪
│   │   │       └── ProductionFeedback.tsx    # 反馈管理
│   │   ├── store/
│   │   │   └── index.ts              # Zustand 全局状态
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript 类型定义
│   │   ├── App.tsx                   # 路由配置
│   │   └── main.tsx                  # 入口
│   ├── index.html
│   ├── vite.config.ts                # Vite 配置（含 API 代理）
│   └── package.json
│
└── start.sh                          # 一键启动脚本
```

## 快速启动

### 前置依赖

- Node.js >= 20
- Python >= 3.10
- Anthropic API Key

### 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 ANTHROPIC_API_KEY

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

后端启动后访问 http://localhost:8000/docs 查看 Swagger API 文档。

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 http://localhost:5173，API 请求通过 Vite Proxy 代理到后端 8000 端口。

### 一键启动

```bash
bash start.sh
```

## 核心页面

| 路由 | 页面 | 功能 |
|---|---|---|
| `/` | 工作台首页 | 个人/组织分身运转概览 |
| `/incubation` | 个人分身仪表盘 | 创建和管理个人 Agent |
| `/incubation/agents/:name` | Agent 对话 | 与 Agent 实时对话 |
| `/incubation/studio` | Agent 工作室 | 可视化编排 Agent 工作流 |
| `/production` | 组织分身仪表盘 | 组织 Agent 运行监控 |
| `/production/agents/:name` | Agent 详情 | 核心资产与量化指标 |
| `/production/training` | 训练追踪 | 训练数据与迭代管理 |
| `/production/feedback` | 反馈管理 | 执行反馈与标注 |

## API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| GET | `/api/agents` | Agent 列表 |
| GET | `/api/agents/{name}` | Agent 详情 |
| POST | `/api/chat` | 同步聊天 |
| GET | `/api/incubation/agents` | 个人 Agent 列表 |
| POST | `/api/incubation/agents` | 创建个人 Agent |
| POST | `/api/incubation/agents/{name}/promote` | 升级为组织 Agent |
| GET | `/api/production/agents` | 组织 Agent 列表 |
| GET | `/api/production/execution-logs` | 执行日志 |
| GET/POST | `/api/production/feedback` | 反馈管理 |
| GET | `/api/production/training-data` | 训练数据 |
| GET | `/api/production/iterations` | 迭代记录 |
| GET | `/api/production/assets/{name}` | Agent 核心资产 |
| GET | `/api/production/metrics` | 量化产出指标 |
| GET | `/api/skills` | Skill 库 |
| GET | `/api/execution-steps/{id}` | 执行步骤详情 |
| WS | `/ws/chat` | WebSocket 实时聊天 |

## 数据库模型

| 表 | 说明 |
|---|---|
| `agents` | Agent 基本信息 |
| `conversations` | 对话会话 |
| `messages` | 聊天消息 |
| `risk_alerts` | 风险告警 |
| `inspection_tasks` | 巡检任务 |
| `review_items` | 审核条目 |
| `consultation_records` | 咨询记录 |

## 移交说明

### 开发接手后建议

1. **环境配置**: 申请并配置 ANTHROPIC_API_KEY
2. **数据库**: SQLite 适合开发，生产环境建议切换为 PostgreSQL
3. **前端构建**: `npm run build` 产出到 `frontend/dist/`
4. **部署**: 前端可部署到 CDN 或 Nginx，后端推荐容器化部署
5. **CORS**: 生产环境需要更新 `app/main.py` 中的 `allow_origins`
