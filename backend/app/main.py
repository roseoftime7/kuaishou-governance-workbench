import json
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db
from app.services.agent_service import agent_service
from app.websocket.manager import manager

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "治理数字人WorkBuddy")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    debug=DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== 基础 API =====

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": APP_NAME, "version": APP_VERSION}


@app.get("/api/agents")
async def list_agents():
    return {"agents": agent_service.get_all_agents()}


@app.get("/api/agents/{agent_name}")
async def get_agent(agent_name: str):
    agents = agent_service.get_all_agents()
    for a in agents:
        if a["name"] == agent_name:
            return a
    raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")


@app.post("/api/chat")
async def chat(message: dict):
    """同步聊天接口"""
    content = message.get("message", "")
    agent_name = message.get("agent", "main_agent")
    context = message.get("context", {})

    agent = agent_service.get_agent_by_name(agent_name)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")

    full_response = ""
    async for chunk in agent.process(content, context):
        full_response += chunk

    return {"response": full_response, "agent": agent_name}


# ===== 孵化模式 API =====

@app.get("/api/incubation/agents")
async def list_personal_agents():
    """获取个人 Agent 列表"""
    return {
        "agents": [
            {
                "name": "risk_watcher", "display_name": "风险监控助手",
                "description": "监控商品风险信号，自动生成告警",
                "status": "online", "version": "v0.3.2",
                "skills": ["risk_scan", "alert_generate", "trend_analysis"],
                "last_active": "2 分钟前",
            },
            {
                "name": "inspector_bot", "display_name": "巡检机器人",
                "description": "定时执行商品合规巡检",
                "status": "busy", "version": "v0.2.1",
                "skills": ["product_scan", "report_gen"],
                "last_active": "10 分钟前",
            },
        ],
        "templates": [
            {"id": "risk_monitor", "name": "风险监控 Agent", "skills": ["risk_scan", "alert_generate"]},
            {"id": "inspection_bot", "name": "巡检机器人", "skills": ["product_scan", "report_gen"]},
            {"id": "review_assistant", "name": "审核助手", "skills": ["review_score", "policy_query"]},
            {"id": "consultant", "name": "治理咨询顾问", "skills": ["policy_query", "data_analysis"]},
        ],
    }


@app.post("/api/incubation/agents")
async def create_personal_agent(config: dict):
    """创建个人 Agent"""
    return {"status": "ok", "message": f"Agent '{config.get('name')}' 创建成功", "agent": config}


@app.post("/api/incubation/agents/{name}/promote")
async def promote_agent(name: str):
    """将个人 Agent 升级为组织 Agent"""
    return {
        "status": "ok",
        "message": f"Agent '{name}' 升级申请已提交",
        "promotion_id": f"PROMO-{hash(name) % 10000:04d}",
    }


# ===== 生产反馈模式 API =====

@app.get("/api/production/agents")
async def list_org_agents():
    """获取组织 Agent 列表"""
    return {
        "agents": [
            {
                "name": "risk_agent", "display_name": "风险感知 Agent",
                "version": "v2.1.0", "status": "online",
                "usage_weekly": 4521,
            },
            {
                "name": "inspection_agent", "display_name": "巡检 Agent",
                "version": "v1.8.3", "status": "online",
                "usage_weekly": 3210,
            },
            {
                "name": "review_agent", "display_name": "PE审核 Agent",
                "version": "v3.0.1", "status": "online",
                "usage_weekly": 6789,
            },
            {
                "name": "consultation_agent", "display_name": "治理咨询 Agent",
                "version": "v1.5.0", "status": "online",
                "usage_weekly": 1876,
            },
        ],
        "stats": {
            "total_agents": 4,
            "total_executions": 12847,
            "success_rate": 96.1,
            "total_feedback": 892,
            "training_data": 1247,
        },
    }


@app.get("/api/production/execution-logs")
async def get_execution_logs():
    """获取执行日志"""
    return {
        "logs": [
            {"id": "EXEC-001", "agent_name": "risk_agent", "input": "扫描今日新增商品风险",
             "status": "success", "duration_ms": 1234, "feedback_count": 0,
             "executed_by": "运营A", "executed_at": "2026-05-08 14:32:00"},
            {"id": "EXEC-002", "agent_name": "inspection_agent", "input": "执行店铺资质巡检",
             "status": "partial", "duration_ms": 890, "feedback_count": 1,
             "executed_by": "运营B", "executed_at": "2026-05-08 13:15:00"},
            {"id": "EXEC-003", "agent_name": "review_agent", "input": "审核商品 P88421",
             "status": "success", "duration_ms": 567, "feedback_count": 2,
             "executed_by": "运营C", "executed_at": "2026-05-08 11:45:00"},
        ],
        "stats": {"total": 12847, "today": 156, "total_feedback": 892, "pending_feedback": 47},
    }


@app.post("/api/production/feedback")
async def submit_feedback(feedback: dict):
    """提交执行反馈"""
    return {
        "status": "ok",
        "message": "反馈提交成功",
        "feedback_id": f"FB-{hash(str(feedback)) % 10000:04d}",
    }


@app.get("/api/production/feedback")
async def list_feedback():
    """获取反馈列表"""
    return {
        "feedback": [
            {"id": "FB-001", "agent_name": "review_agent", "type": "suggestion",
             "content": "建议增加保健品专项审核规则", "rating": 4, "status": "open",
             "created_by": "运营C", "created_at": "2026-05-08 12:00:00"},
            {"id": "FB-002", "agent_name": "inspection_agent", "type": "correction",
             "content": "OCR识别准确率不足", "rating": 3, "status": "open",
             "created_by": "运营B", "created_at": "2026-05-08 13:30:00"},
        ],
    }


@app.get("/api/production/training-data")
async def get_training_data():
    """获取训练数据"""
    return {
        "data": [
            {"id": "TD-001", "agent_name": "review_agent", "input": "审核商品 P88421",
             "expected_output": "高风险，建议驳回并处罚",
             "actual_output": "高风险，建议驳回", "status": "labeled", "version": "v2.1.0"},
            {"id": "TD-002", "agent_name": "inspection_agent", "input": "执行店铺资质巡检",
             "expected_output": "完整巡检报告",
             "actual_output": "巡检完成，通过率 92.7%", "status": "pending", "version": "v1.8.3"},
        ],
        "stats": {"total": 1247, "pending_label": 234, "labeled": 567, "trained": 312, "verified": 134},
    }


@app.get("/api/production/iterations")
async def get_iterations():
    """获取迭代列表"""
    return {
        "iterations": [
            {"id": "ITER-001", "agent_name": "review_agent", "version": "v3.0.1",
             "change_log": "优化保健品审核规则",
             "training_data_count": 347, "metrics": {"accuracy": 94.2},
             "status": "deployed", "deployed_at": "2026-05-06", "created_at": "2026-04-28"},
            {"id": "ITER-002", "agent_name": "risk_agent", "version": "v2.1.0",
             "change_log": "增强虚假交易识别",
             "training_data_count": 892, "metrics": {"accuracy": 96.8},
             "status": "deployed", "deployed_at": "2026-05-01", "created_at": "2026-04-15"},
            {"id": "ITER-003", "agent_name": "inspection_agent", "version": "v1.9.0",
             "change_log": "改进 OCR 识别",
             "training_data_count": 156, "metrics": {"accuracy": 91.5},
             "status": "training", "created_at": "2026-05-07"},
        ],
    }


# ===== Skill 库 API =====

@app.get("/api/skills")
async def list_skills():
    """获取 Skill 库"""
    return {
        "skills": [
            {
                "id": "risk_scan", "name": "risk_scan", "display_name": "风险扫描",
                "description": "对商品列表进行风险扫描，按等级输出风险结果",
                "category": "风险治理",
                "cli_command": "ks governance risk_scan --products {products} --threshold {level}",
                "parameters": [
                    {"name": "products", "type": "string", "required": True, "description": "商品ID列表或筛选条件"},
                    {"name": "threshold", "type": "string", "required": False, "default": "high", "description": "风险阈值"},
                ],
                "output_desc": "JSON格式的风险商品列表", "version": "v2.1.0",
            },
            {
                "id": "product_scan", "name": "product_scan", "display_name": "商品查询",
                "description": "按条件查询商品列表",
                "category": "数据查询",
                "cli_command": "ks governance product_scan --date {date} --status {status}",
                "parameters": [
                    {"name": "date", "type": "string", "required": True, "description": "日期"},
                    {"name": "status", "type": "string", "required": False, "default": "all", "description": "商品状态"},
                ],
                "output_desc": "商品列表JSON", "version": "v1.5.0",
            },
            {
                "id": "alert_generate", "name": "alert_generate", "display_name": "告警生成",
                "description": "基于风险扫描结果生成结构化告警", "category": "风险治理",
                "cli_command": "ks governance alert_generate --high {h}",
                "parameters": [{"name": "high", "type": "number", "required": True, "description": "高风险数量"}],
                "output_desc": "告警消息JSON", "version": "v1.8.0",
            },
            {
                "id": "trend_analysis", "name": "trend_analysis", "display_name": "趋势分析",
                "description": "对历史风险数据做趋势分析", "category": "数据分析",
                "cli_command": "ks governance trend_analysis --days {days}",
                "parameters": [{"name": "days", "type": "number", "required": True, "description": "分析天数"}],
                "output_desc": "趋势报告JSON", "version": "v1.3.0",
            },
            {
                "id": "review_score", "name": "review_score", "display_name": "审核评分",
                "description": "对商品/内容进行审核评分", "category": "审核能力",
                "cli_command": "ks governance review_score --item {item_id} --type {type}",
                "parameters": [
                    {"name": "item_id", "type": "string", "required": True, "description": "待审核ID"},
                    {"name": "type", "type": "string", "required": True, "description": "审核类型"},
                ],
                "output_desc": "审核结果JSON", "version": "v3.0.0",
            },
            {
                "id": "policy_query", "name": "policy_query", "display_name": "政策查询",
                "description": "查询治理政策和规则", "category": "知识查询",
                "cli_command": "ks governance policy_query --q {query}",
                "parameters": [{"name": "query", "type": "string", "required": True, "description": "查询内容"}],
                "output_desc": "政策文本", "version": "v1.1.0",
            },
            {
                "id": "data_analysis", "name": "data_analysis", "display_name": "数据分析",
                "description": "对治理数据进行多维分析", "category": "数据分析",
                "cli_command": "ks governance data_analysis --query {query}",
                "parameters": [{"name": "query", "type": "string", "required": True, "description": "分析查询"}],
                "output_desc": "分析结果JSON", "version": "v1.4.0",
            },
        ],
        "cli_commands": [
            {"command": "ks governance risk_scan", "description": "风险扫描", "category": "风险治理", "example": "ks governance risk_scan --products=2341 --threshold=high"},
            {"command": "ks governance product_scan", "description": "商品查询", "category": "数据查询", "example": "ks governance product_scan --date=today"},
            {"command": "ks governance alert_generate", "description": "告警生成", "category": "风险治理", "example": "ks governance alert_generate --high=3"},
            {"command": "ks agent create", "description": "创建 Agent", "category": "Agent管理", "example": "ks agent create my_agent --skill risk_scan"},
            {"command": "ks agent run", "description": "运行 Agent", "category": "Agent管理", "example": "ks agent run my_agent --input '...' --mode debug"},
        ],
    }


# ===== Agent 核心资产 API =====

@app.get("/api/production/assets/{agent_name}")
async def get_agent_assets(agent_name: str):
    """获取 Agent 核心资产"""
    return {
        "agent_name": agent_name,
        "version": "v2.1.0",
        "prompt": {
            "system_prompt": f"你是{agent_name}，负责治理运营工作。\n1. 接收输入\n2. 调用Skill执行\n3. 分析结果\n4. 生成输出",
            "updated_at": "2026-05-01",
        },
        "workflow": {
            "steps": [
                {"name": "意图理解", "type": "llm_reason", "skill": "", "config": {}, "timeout_ms": 5000, "retry_count": 1},
                {"name": "Skill调用", "type": "skill_call", "skill": "core_skill", "config": {}, "timeout_ms": 30000, "retry_count": 2},
            ],
            "updated_at": "2026-05-01",
        },
        "knowledge_base": [
            {"id": "kb1", "title": "治理政策", "content": "治理政策内容...", "type": "policy", "updated_at": "2026-04-15"},
        ],
        "atomic_clis": ["ks governance risk_scan", "ks governance product_scan"],
        "long_term_memory": [
            {"id": "mem1", "key": "高频风险类型", "value": "虚假交易(32%)", "type": "semantic", "created_at": "2026-04-01"},
        ],
    }


@app.get("/api/production/metrics")
async def get_agent_metrics():
    """获取 Agent 量化产出指标"""
    return {
        "agents": [
            {
                "name": "risk_agent", "display_name": "风险感知 Agent",
                "cases_processed": 45210, "effective_recall": 1256, "rules_summarized": 42,
                "risks_disposed": 312, "accuracy": 96.8,
            },
            {
                "name": "attack_defense_agent", "display_name": "智能攻防 Agent",
                "cases_processed": 82341, "effective_recall": 2156, "rules_summarized": 87,
                "risks_disposed": 523, "accuracy": 95.2,
            },
        ],
        "attack_defense_daily": {
            "cases_processed": 12847, "effective_recall": 342, "rules_summarized": 15,
            "risks_disposed": 89, "accuracy": 96.8, "false_positive_rate": 3.2,
        },
        "attack_defense_trend": [
            {"date": "05-03", "effective_recall": 289, "rules_summarized": 12, "risks_disposed": 72},
            {"date": "05-04", "effective_recall": 312, "rules_summarized": 14, "risks_disposed": 78},
            {"date": "05-05", "effective_recall": 298, "rules_summarized": 11, "risks_disposed": 65},
            {"date": "05-06", "effective_recall": 334, "rules_summarized": 16, "risks_disposed": 85},
            {"date": "05-07", "effective_recall": 356, "rules_summarized": 18, "risks_disposed": 92},
            {"date": "05-08", "effective_recall": 342, "rules_summarized": 15, "risks_disposed": 89},
        ],
        "global": {
            "total_agents": 5, "total_cases": 246301, "total_recall": 6460,
            "total_rules": 239, "total_disposed": 1514, "overall_accuracy": 95.2,
        },
    }


@app.get("/api/execution-steps/{execution_id}")
async def get_execution_steps(execution_id: str):
    """获取执行步骤详情"""
    return {
        "execution_id": execution_id,
        "steps": [
            {
                "id": "s1", "name": "意图理解", "type": "llm_reason", "status": "success",
                "agent": "risk_agent", "input": "用户输入", "output": "拆解为3个子任务",
                "duration_ms": 280, "details": "LLM分析用户意图",
            },
            {
                "id": "s2", "name": "SKILL: 商品查询", "type": "skill_call", "status": "success",
                "agent": "risk_agent", "input": "product_scan --date=today", "output": "查询到 2,341 件商品",
                "duration_ms": 420,
            },
        ],
    },


# ===== WebSocket =====

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    client_id = f"client_{id(websocket)}"
    await manager.connect(client_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            content = msg.get("message", "")
            agent_name = msg.get("agent", "main_agent")
            context = msg.get("context", {})

            if not content.strip():
                continue

            async def generate():
                async for chunk in agent_service.process_message(agent_name, content, context):
                    yield chunk

            await manager.send_stream(client_id, agent_name, generate())

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        await manager.send_error(client_id, str(e))
        manager.disconnect(client_id)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
