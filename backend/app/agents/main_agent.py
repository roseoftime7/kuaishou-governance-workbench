import asyncio
import json
from typing import AsyncIterator, Optional

from app.agents.base import BaseAgent


class MainAgent(BaseAgent):
    """主 Agent — 中枢协调器，负责意图识别、任务路由和对话管理"""

    def __init__(self):
        super().__init__(
            name="main_agent",
            display_name="司衡 Themis",
            description="电商治理WorkBuddy，协调各子Agent完成治理工作",
        )
        self.sub_agents: dict[str, BaseAgent] = {}

    def register_sub_agent(self, agent: BaseAgent):
        self.sub_agents[agent.name] = agent

    def _build_system_prompt(self) -> str:
        return """你是快手电商治理运营团队的 AI 助手 — 司衡 Themis（电商治理WorkBuddy）。
你的职责是：
1. 理解用户的需求，判断应该由哪个子 Agent 来处理
2. 如果需要多个子 Agent 协作，进行任务分解和编排
3. 将子 Agent 的结果整合后以清晰的方式回复用户
4. 主动发现潜在风险并提醒用户

子 Agent 包括：
- risk_agent: 风险感知 — 监控风险信号，处理告警
- inspection_agent: 巡检 — 自动化巡检任务
- review_agent: PE审核 — 商品/内容审核
- consultation_agent: 治理咨询 — 策略/规则咨询

如果用户的问题明确属于某个子 Agent 的职责范围，
你应该引导用户使用对应的子 Agent，或者协调子 Agent 来处理。"""

    async def process(
        self,
        message: str,
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        ctx = context or {}
        agent_routed = ctx.get("agent_routed")

        if agent_routed and agent_routed in self.sub_agents:
            agent = self.sub_agents[agent_routed]
            async for chunk in agent.process(message, context):
                yield chunk
            return

        # 模拟主 Agent 响应
        simulated = self._simulate_response(message)
        for chunk in simulated:
            yield chunk
            await asyncio.sleep(0.02)

    def _simulate_response(self, message: str) -> list[str]:
        msg = message.lower()
        responses = []

        if any(kw in msg for kw in ["风险", "预警", "告警", "异常", "风险感知"]):
            responses.append(
                "我检测到您想了解风险相关信息，已为您协调 **风险感知 Agent** 来处理。\n\n"
                "当前风险概况：\n"
                "- 🔴 高风险告警：2 条（商品违规、虚假交易）\n"
                "- 🟡 中风险告警：5 条（售后纠纷、物流超时）\n"
                "- 🟢 低风险告警：12 条\n\n"
                "是否需要查看具体的风险详情或处理建议？"
            )
        elif any(kw in msg for kw in ["巡检", "检查", "扫描", "检测"]):
            responses.append(
                "已为您启动 **巡检 Agent**。\n\n"
                "最近的巡检结果：\n"
                "- 商品合规巡检：已完成 ✅ (通过率 96.3%)\n"
                "- 店铺资质巡检：进行中 ⏳\n"
                "- 直播内容巡检：待启动 ⏸️\n\n"
                "您可以指定巡检类型或查看详细报告。"
            )
        elif any(kw in msg for kw in ["审核", "PE", "商品审核", "内容审核"]):
            responses.append(
                "已为您对接 **PE审核 Agent**。\n\n"
                "当前审核队列：\n"
                "- 待审核商品：23 件\n"
                "- 待审核内容：47 条\n"
                "- 高风险待审：3 件\n\n"
                "需要如何处理？可以按风险等级筛选或批量操作。"
            )
        elif any(kw in msg for kw in ["咨询", "政策", "规则", "策略", "怎么", "如何", "合规"]):
            responses.append(
                "已为您连接 **治理咨询 Agent**。\n\n"
                "您可以咨询以下方面的治理策略：\n"
                "1. 📋 商品合规政策\n"
                "2. ⚖️ 商家违规处罚规则\n"
                "3. 🛡️ 内容审核标准\n"
                "4. 📊 治理数据分析\n\n"
                "请问您想了解哪方面的内容？"
            )
        else:
            responses.append(
                f"您好！我是 **司衡 Themis**，您的电商治理WorkBuddy。\n\n"
                f"我可以帮助您处理以下事务：\n\n"
                f"1. ⚠️ **风险感知** — 监控治理风险，实时告警\n"
                f"2. 🔍 **巡检管理** — 自动化巡检任务\n"
                f"3. ✅ **PE审核** — 商品/内容审核\n"
                f"4. 💡 **治理咨询** — 策略规则咨询\n\n"
                f"请告诉我您需要什么帮助？"
            )

        # 将完整响应按字符分割成块模拟流式输出
        result = []
        for char in responses[0]:
            result.append(char)
        return result

    def get_capabilities(self) -> list[str]:
        return [
            "意图识别与任务路由",
            "多Agent协调编排",
            "对话上下文管理",
            "风险主动预警",
        ]
