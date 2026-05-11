from app.agents.main_agent import MainAgent
from app.agents.risk_agent import RiskAgent
from app.agents.inspection_agent import InspectionAgent
from app.agents.review_agent import ReviewAgent
from app.agents.consultation_agent import ConsultationAgent


class AgentService:
    """Agent 编排服务"""

    def __init__(self):
        self.main_agent = MainAgent()
        self.risk_agent = RiskAgent()
        self.inspection_agent = InspectionAgent()
        self.review_agent = ReviewAgent()
        self.consultation_agent = ConsultationAgent()

        # 注册子 Agent 到主 Agent
        self.main_agent.register_sub_agent(self.risk_agent)
        self.main_agent.register_sub_agent(self.inspection_agent)
        self.main_agent.register_sub_agent(self.review_agent)
        self.main_agent.register_sub_agent(self.consultation_agent)

    def get_all_agents(self) -> list[dict]:
        agents = [
            self.main_agent,
            self.risk_agent,
            self.inspection_agent,
            self.review_agent,
            self.consultation_agent,
        ]
        return [a.get_status_info() | {"capabilities": a.get_capabilities()} for a in agents]

    def get_agent_by_name(self, name: str):
        mapping = {
            "main_agent": self.main_agent,
            "risk_agent": self.risk_agent,
            "inspection_agent": self.inspection_agent,
            "review_agent": self.review_agent,
            "consultation_agent": self.consultation_agent,
        }
        return mapping.get(name)

    async def process_message(self, agent_name: str, message: str, context: dict = None):
        """处理消息，返回异步生成器"""
        agent = self.get_agent_by_name(agent_name)
        if not agent:
            agent = self.main_agent
        async for chunk in agent.process(message, context or {}):
            yield chunk


agent_service = AgentService()
