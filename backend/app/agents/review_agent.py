import asyncio
import json
from typing import AsyncIterator, Optional

from app.agents.base import BaseAgent


class ReviewAgent(BaseAgent):
    """PE审核 Agent — 商品/内容审核"""

    def __init__(self):
        super().__init__(
            name="review_agent",
            display_name="PE审核 Agent",
            description="商品和内容审核，风险评估，审核队列管理",
        )

    def _build_system_prompt(self) -> str:
        return """你是快手电商的PE审核助手。
你的职责是：
1. 商品发布审核和风险评估
2. 直播内容审核
3. 审核队列管理和分配
4. 提供审核标准和依据"""

    async def process(
        self,
        message: str,
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        msg = message.lower()

        if "队列" in msg or "待审核" in msg or "排队" in msg:
            response = self._get_queue()
        elif "高风险" in msg or "紧急" in msg or "优先" in msg:
            response = self._get_high_risk_items()
        elif "通过" in msg or "通过率" in msg or "统计" in msg:
            response = self._get_statistics()
        elif "标准" in msg or "规则" in msg or "依据" in msg or "怎么审" in msg:
            response = self._get_review_standards()
        elif "审核" in msg and ("商品" in msg or "产品" in msg):
            response = self._review_product()
        else:
            response = self._get_overview()

        for char in response:
            yield char
            await asyncio.sleep(0.015)

    def _get_overview(self) -> str:
        return """## ✅ PE审核工作台

### 当前状态
| 指标 | 数值 |
|------|------|
| 待审核商品 | 23 件 |
| 待审核内容 | 47 条 |
| 高风险待审 | 3 件 |
| 今日审核量 | 156 件 |
| 平均审核时长 | 2.3 min/件 |
| 通过率 | 91.2% |

### 需要关注的
- 🔴 3 件高风险商品等待紧急审核（已超 4h）
- 🟡 商品类目"保健品"审核积压 12 件
- 💡 建议优先处理高风险队列"""

    def _get_queue(self) -> str:
        return """## 📝 审核队列

### 商品审核队列 (23件)
| 优先级 | 商品ID | 标题 | 类目 | 风险分 | 等待时长 |
|-------|--------|------|------|-------|---------|
| 🔴高 | P88421 | XX 天然维生素 | 保健品 | 92 | 4h12m |
| 🔴高 | P88422 | YY 减肥茶 | 食品 | 87 | 3h45m |
| 🔴高 | P88423 | ZZ 美白丸 | 美妆 | 85 | 3h30m |
| 🟡中 | P88424 | 品牌运动鞋 | 鞋靴 | 45 | 2h10m |
| ... | ... | ... | ... | ... | ... |

### 内容审核队列 (47条)
| 优先级 | 直播间 | 违规类型 | 时长 | 等待时长 |
|-------|--------|---------|------|---------|
| 🟡中 | 直播间#2291 | 夸大宣传 | 03:22 | 1h30m |
| 🟢低 | 短视频#882 | 引导私下交易 | 00:45 | 0h45m |
| ... | ... | ... | ... | ... |

> 高风险商品平均等待 3.8h，建议增加审核人力"""

    def _get_high_risk_items(self) -> str:
        return """## 🔴 高风险审核项

| 商品ID | 商品名 | 风险分 | 风险点 | 等待时长 |
|-------|--------|-------|--------|---------|
| P88421 | XX 天然维生素 | 92 | 食品冒充保健品 | 4h12m |
| P88422 | YY 减肥茶 | 87 | 宣传减肥功效无资质 | 3h45m |
| P88423 | ZZ 美白丸 | 85 | 成分含未备案原料 | 3h30m |

### 审核建议
1. **P88421**: 要求提供保健品批文，否则驳回
2. **P88422**: 无食品+保健食品资质 → 驳回
3. **P88423**: 核查原料备案情况，暂缓上架

> 🔔 以上 3 件已超 3 小时，建议立即处理！"""

    def _get_statistics(self) -> str:
        return """## 📊 审核统计

### 今日 (05-08)
| 指标 | 数值 |
|------|------|
| 总审核量 | 156 件 |
| 通过 | 142 件 (91.0%) |
| 驳回 | 14 件 (9.0%) |
| 平均审核时长 | 2.3 min |

### 近7天趋势
```
通过率 ┃ ████████▇▇▇▇██████ 91.2%
驳回率 ┃ ███▇▇▇ 8.8%
       ━━━━━━━━━
       商品 内容 广告 直播
```

### 驳回Top原因
1. 夸大宣传 (32%)
2. 资质不全 (28%)
3. 标题违规 (18%)
4. 主图不合规 (12%)
5. 价格异常 (10%)"""

    def _get_review_standards(self) -> str:
        return """## 📋 审核标准参考

### 商品审核重点
| 维度 | 审核要点 | 参考标准 |
|------|---------|---------|
| 标题 | 无违规词、品牌词规范 | 《商品信息发布规范》V3.2 |
| 主图 | 白底图、无水印、清晰 | 《商品图片规范》V2.1 |
| 描述 | 无误导、与实物一致 | 《广告法》相关条款 |
| 资质 | 经营资质齐全有效 | 《商家准入标准》 |
| 价格 | 无不合理定价 | 《价格管理规范》 |

### 内容审核重点
| 维度 | 审核要点 |
|------|---------|
| 话术 | 无绝对化用语、无虚假宣传 |
| 资质 | 特殊品类需展示资质 |
| 行为 | 无诱导私下交易、无刷单行为 |

> 需要我查询某个具体的标准条款吗？"""

    def _review_product(self) -> str:
        return """## 🔍 商品审核结果

**商品**: XX 天然维生素
**店铺**: 健康优选旗舰店
**风险评分**: 92/100 🔴高风险

### 审核维度评分
| 维度 | 评分 | 说明 |
|------|------|------|
| 标题合规 | ⚠️ 60 | 含"治疗"敏感词 |
| 主图规范 | ✅ 90 | 合规 |
| 描述真实 | ❌ 40 | 宣传治疗功效 |
| 资质齐全 | ❌ 30 | 缺少保健品批文 |
| 价格合理 | ✅ 85 | 合规 |

### 结论：**建议驳回**
依据《商品信息发布规范》第4.2条以及《广告法》第17条，普通食品不得宣传治疗功效。"""

    def get_capabilities(self) -> list[str]:
        return [
            "商品审核",
            "内容审核",
            "风险评估打分",
            "审核队列管理",
            "审核标准查询",
        ]
