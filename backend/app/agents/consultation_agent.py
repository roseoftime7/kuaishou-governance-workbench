import asyncio
import json
from typing import AsyncIterator, Optional

from app.agents.base import BaseAgent


class ConsultationAgent(BaseAgent):
    """治理咨询 Agent — 治理策略和规则咨询"""

    def __init__(self):
        super().__init__(
            name="consultation_agent",
            display_name="治理咨询 Agent",
            description="治理策略、规则制度咨询，提供合规建议",
        )

    def _build_system_prompt(self) -> str:
        return """你是快手电商的治理策略咨询助手。
你的职责是：
1. 解答治理策略和规则相关问题
2. 提供合规建议和操作指引
3. 解释违规处罚依据
4. 帮助理解最新的治理政策变动"""

    async def process(
        self,
        message: str,
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        msg = message.lower()

        if "处罚" in msg or "违规" in msg or "扣分" in msg or "罚" in msg:
            response = self._get_penalty_info(message)
        elif "商品" in msg and ("政策" in msg or "规范" in msg or "规则" in msg):
            response = self._get_product_policy()
        elif "内容" in msg and ("政策" in msg or "规范" in msg or "规则" in msg):
            response = self._get_content_policy()
        elif "最新" in msg or "更新" in msg or "变动" in msg or "新规" in msg:
            response = self._get_recent_updates()
        elif "申诉" in msg or "复议" in msg:
            response = self._get_appeal_info()
        elif "数据" in msg or "分析" in msg or "效果" in msg:
            response = self._get_governance_data()
        else:
            response = self._get_general_info()

        for char in response:
            yield char
            await asyncio.sleep(0.015)

    def _get_general_info(self) -> str:
        return """## 💡 治理咨询服务

我可以为您提供以下方面的帮助：

1. 📋 **商品合规政策** — 商品发布规范、禁售限售规则
2. ⚖️ **违规处罚规则** — 处罚梯度、扣分规则、申诉流程
3. 🛡️ **内容审核标准** — 直播间规范、广告法合规
4. 📊 **治理数据分析** — 治理效果、违规趋势
5. 🔔 **政策更新通知** — 最新的规则调整和变动

请告诉我您想咨询哪方面的问题？"""

    def _get_penalty_info(self, message: str) -> str:
        return """## ⚖️ 违规处罚规则

### 处罚梯度（一般违规）
| 累计扣分 | 处罚措施 |
|---------|---------|
| 12分 | 警告 |
| 24分 | 限制发布商品 7天 |
| 36分 | 限制发布商品 15天 |
| 48分 | 关闭店铺 |

### 严重违规
| 违规类型 | 处罚措施 |
|---------|---------|
| 售假 | 扣除保证金 + 关闭店铺 |
| 刷单 | 限制交易 + 降权处理 |
| 严重内容违规 | 断流 + 封禁直播间 |

### 常见扣分项
- 虚假宣传：**6分/次**
- 资质不符：**4分/次**
- 售后违规：**2分/次**
- 标题违规：**2分/次**

> 需要查询具体的案例或判定依据吗？"""

    def _get_product_policy(self) -> str:
        return """## 📋 商品合规政策摘要

### 商品发布规范
1. **标题规范**
   - 品牌+品名+规格+属性
   - 禁用"最"、"第一"、"顶级"等绝对化用语
   - 不得使用医疗术语

2. **主图规范**
   - 白底图或场景图
   - 无水印、无二维码
   - 主图与商品一致

3. **资质要求**
   - 食品：食品经营许可证
   - 保健品：保健食品批文
   - 美妆：化妆品备案凭证
   - 3C：3C认证证书

### 禁售商品
- 药品/医疗器械（有资质除外）
- 野生动物及制品
- 侵权商品
- 违法违规信息服务

> 需要了解某个具体品类的详细规范吗？"""

    def _get_content_policy(self) -> str:
        return """## 🛡️ 内容审核标准

### 直播间违规红线
| 违规类别 | 典型行为 | 处罚 |
|---------|---------|------|
| 虚假宣传 | 宣称普通食品有治疗功效 | 断流+扣6分 |
| 违禁品 | 直播间售药/医疗器械 | 永久封禁 |
| 低俗内容 | 衣着暴露/不当行为 | 断流+扣12分 |
| 诱导下单 | 虚假库存/价格欺诈 | 扣4分 |
| 私下交易 | 引导至站外交易 | 扣8分 |

### 广告法合规要点
- ❌ 禁用"国家级"、"最高级"、"最佳"等用语
- ❌ 不得利用虚假或误解信息诱导
- ✅ 数据引用须注明出处
- ✅ 赠品须明确说明

> 需要按场景查询具体的合规要求吗？"""

    def _get_recent_updates(self) -> str:
        return """## 🔔 政策更新通知（2026年5月）

### 1. 保健品宣传新规（05-01起生效）
- 普通食品不得暗示保健/治疗功效
- 保健食品必须标注"蓝帽子"标识
- 违规处罚提升至 **严重违规** 级别

### 2. 直播内容审核升级（05-06起）
- 新增AI自动审核覆盖全部直播间
- 违规响应时间缩短至 **5分钟**
- 新增"诱导未成年消费"违规类型

### 3. 售后服务标准调整（05-10即将生效）
- 售后响应时效从48h缩短至 **24h**
- 新增"极速退款"覆盖商品范围

> 需要查看某个更新的详细条款吗？"""

    def _get_appeal_info(self) -> str:
        return """## 📝 申诉指南

### 申诉流程
```
收到处罚 → 查看处罚原因 → 准备申诉材料 → 提交申诉 → 等待复核
   ↓                                                        ↓
 72h内                                                  3个工作日内
```

### 申诉材料要求
| 违规类型 | 必需材料 |
|---------|---------|
| 商品违规 | 商品资质、进货凭证、品牌授权 |
| 内容违规 | 直播间回放、话术脚本 |
| 店铺处罚 | 营业执照、经营许可证 |
| 交易违规 | 订单记录、物流凭证、聊天记录 |

### 申诉时效
- 一般违规：**7个自然日**内
- 严重违规：**15个自然日**内
- 超出时效将不再受理

> 需要为您生成具体的申诉材料清单吗？"""

    def _get_governance_data(self) -> str:
        return """## 📊 治理效果数据

### 2026年4月治理月报
| 指标 | 4月 | 环比 |
|------|-----|------|
| 违规商品处理量 | 12,847 件 | ↑ 8.3% |
| 违规直播间处置 | 3,291 个 | ↑ 12.1% |
| 处罚商家数 | 892 家 | ↓ 5.4% |
| 申诉成功率 | 34.2% | ↑ 2.1% |
| 治理覆盖率 | 96.8% | ↑ 1.2% |

### 治理效果提升
- 商品合规率：**98.2%**（+0.8%）
- 内容违规率：**1.3%**（-0.4%）
- 用户投诉量：**-15%**（环比）

> 需要查看某个维度的详细数据趋势吗？"""

    def get_capabilities(self) -> list[str]:
        return [
            "治理政策解读",
            "违规处罚查询",
            "合规建议生成",
            "政策更新通知",
            "申诉流程指导",
        ]
