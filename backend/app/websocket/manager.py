import json
import asyncio
from typing import Optional
from fastapi import WebSocket


class ConnectionManager:
    """WebSocket 连接管理"""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)

    async def send_message(self, client_id: str, message: dict):
        ws = self.active_connections.get(client_id)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(client_id)

    async def broadcast(self, message: dict):
        disconnected = []
        for client_id, ws in self.active_connections.items():
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(client_id)
        for cid in disconnected:
            self.disconnect(cid)

    async def send_stream(
        self,
        client_id: str,
        agent_name: str,
        content_generator,
    ):
        """流式发送 Agent 响应"""
        full_content = ""
        await self.send_message(client_id, {
            "type": "stream_start",
            "agent": agent_name,
        })

        async for chunk in content_generator:
            full_content += chunk
            await self.send_message(client_id, {
                "type": "stream_chunk",
                "agent": agent_name,
                "content": chunk,
            })
            await asyncio.sleep(0.01)

        await self.send_message(client_id, {
            "type": "stream_end",
            "agent": agent_name,
            "full_content": full_content,
        })
        return full_content

    async def send_error(self, client_id: str, error: str):
        await self.send_message(client_id, {
            "type": "error",
            "content": error,
        })


manager = ConnectionManager()
