import asyncio
import json
from datetime import datetime, timedelta
from typing import AsyncIterator, Optional

from app.agents.base import BaseAgent


class RiskAgent(BaseAgent):
    """风险感知 Agent — 监控风险信号并生成告警"""

    def __init__(self):
        super().__init__(
            name="risk_agent",
            display_name="风险感知 Agent",
            description="监控治理风险信号，实时告警，提供风险分析",
        )

    def _build_system_prompt(self) -> str:
        return """你是快手电商的风险感知助手。
你的职责是：
1. 监控各业务线的风险信号
2. 对风险进行分级（高/中/低）
3. 提供风险分析和处置建议
4. 主动发现潜在风险趋势"""

    async def process(
        self,
        message: str,
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        msg = message.lower()
        response = ""

        if "新增" in msg or "最新" in msg or "最近" in msg:
            response = self._get_recent_alerts()
        elif "高" in msg or "严重" in msg or "紧急" in msg:
            response = self._get_high_risk_alerts()
        elif "统计" in msg or "趋势" in msg or "分析" in msg or "报表" in msg:
            response = self._get_risk_trend()
        elif "处理" in msg or "处置" in msg or "解决" in msg:
            response = self._get_handling_suggestions()
        else:
            response = self._get_overview()

        for char in response:
            yield char
            await asyncio.sleep(0.015)

    def _get_overview(self) -> str:
        return """## 📊 风险总览

| 风险等级 | 数量 | 趋势 |
|---------|------|------|
| 🔴 高风险 | 2 | ↑ 较昨日+1 |
| 🟡 中风险 | 5 | → 较昨日持平 |
| 🟢 低风险 | 12 | ↓ 较昨日-3 |

**重点关注：**
- 商品合规风险上升，主要集中在"夸大宣传"
- 某头部直播间近期投诉率上升 15%

建议对相关商家进行预警提醒。"""

    def _get_recent_alerts(self) -> str:
        return """## 🔔 最新风险告警

| 时间 | 级别 | 标题 | 状态 |
|------|------|------|------|
| 10:32 | 🔴高 | 商品ID#88421 涉嫌虚假交易 | 待处理 |
| 09:15 | 🔴高 | 直播间#3392 违规宣传保健品 | 处理中 |
| 08:50 | 🟡中 | 店铺"XX旗舰店"售后纠纷激增 | 待处理 |
| 08:12 | 🟡中 | 物流超时率突破阈值(8.7%) | 观察中 |
| 07:30 | 🟢低 | 5条商品标题不合规 | 已忽略 |

> 建议优先处理 **2条高风险告警**，已超 2 小时未响应。"""

    def _get_high_risk_alerts(self) -> str:
        return """## 🔴 高风险告警详情

### 告警1：虚假交易
- **商品ID**: 88421
- **店铺**: 某某数码专营店
- **风险描述**: 短时内异常交易订单 237 笔，疑似刷单
- **涉及金额**: ¥45,690
- **建议**: 立即冻结交易，启动调查流程
- **状态**: ⏳ 待处理

### 告警2：违规宣传保健品
- **直播间ID**: 3392
- **主播**: 某某优选
- **风险描述**: 直播间宣传普通食品具有治疗功效
- **证据**: 已截取违规片段 3 条
- **建议**: 立即断流，按《内容审核标准》第4.2条处罚
- **状态**: 🔄 处理中（已指派审核员）

> ⚠️ 两条高风险告警均已超 2 小时未解决，建议尽快处理！"""

    def _get_risk_trend(self) -> str:
        return """## 📈 近7天风险趋势

```
高风险   ┃ ██▁▂▄▆█
中风险   ┃ ████████
低风险   ┃ ██████████▁▂
         ━━━━━━━━━━━━━
         一 二 三 四 五 六 日
```

**关键发现：**
- 高风险事件呈 **上升趋势**（+40% WoW）
- 商品合规类风险占比最高（42%）
- 周末直播类风险显著增加

建议加强周末时段的人工审核力度。"""

    def _get_handling_suggestions(self) -> str:
        return """## ✅ 风险处置建议

基于当前风险状况，建议按以下优先级处理：

### P0 - 立即处理
1. **商品#88421 虚假交易案** → 冻结资金 + 证据固定
2. **直播间#3392 违规宣传案** → 断流 + 处罚

### P1 - 今日内
3. **店铺售后纠纷激增** → 核查店铺服务能力
4. **物流超时率超标** → 协调物流侧排查

### P2 - 本周内
5. **标题不合规批量治理** → 批量通知修改

> 需要我来协调相关 Agent 执行具体处置操作吗？"""

    def get_capabilities(self) -> list[str]:
        return [
            "实时风险监控",
            "风险分级告警",
            "风险趋势分析",
            "处置建议生成",
        ]
