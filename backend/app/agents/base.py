from typing import AsyncIterator, Optional


class BaseAgent:
    """Agent 基类，所有子 Agent 继承此类"""

    def __init__(self, name: str, display_name: str, description: str):
        self.name = name
        self.display_name = display_name
        self.description = description
        self.system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        """构建系统提示词"""
        return f"你是{self.display_name}，{self.description}"

    async def process(
        self,
        message: str,
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        """处理消息并流式返回响应
        子类必须实现此方法
        """
        raise NotImplementedError

    def get_capabilities(self) -> list[str]:
        """返回 Agent 能力列表"""
        return []

    def get_status_info(self) -> dict:
        return {
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
        }
