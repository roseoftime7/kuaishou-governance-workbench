import asyncio
import json
from datetime import datetime, timedelta
from typing import AsyncIterator, Optional

from app.agents.base import BaseAgent


class InspectionAgent(BaseAgent):
    """巡检 Agent — 自动化巡检任务执行"""

    def __init__(self):
        super().__init__(
            name="inspection_agent",
            display_name="巡检 Agent",
            description="自动化执行巡检任务，生成巡检报告",
        )

    def _build_system_prompt(self) -> str:
        return """你是快手电商的巡检助手。
你的职责是：
1. 执行各类自动化巡检任务
2. 生成巡检报告和评分
3. 对异常项进行标记和跟进
4. 支持按需配置巡检策略"""

    async def process(
        self,
        message: str,
        context: Optional[dict] = None,
    ) -> AsyncIterator[str]:
        msg = message.lower()

        if "启动" in msg or "执行" in msg or "运行" in msg or "开始" in msg:
            response = self._run_inspection(message)
        elif "结果" in msg or "报告" in msg or "详情" in msg:
            response = self._get_inspection_detail()
        elif "列表" in msg or "所有" in msg or "历史" in msg:
            response = self._get_inspection_list()
        else:
            response = self._get_overview()

        for char in response:
            yield char
            await asyncio.sleep(0.015)

    def _get_overview(self) -> str:
        return """## 📋 巡检概览

| 巡检类型 | 最近状态 | 通过率 | 执行时间 |
|---------|---------|--------|---------|
| 商品合规巡检 | ✅ 已完成 | 96.3% | 2026-05-08 08:00 |
| 店铺资质巡检 | 🔄 进行中 | - | 2026-05-08 10:00 |
| 直播内容巡检 | ⏸️ 待启动 | - | - |
| 广告内容巡检 | ✅ 已完成 | 98.1% | 2026-05-07 22:00 |
| 售后服务质量巡检 | ⏸️ 待启动 | - | - |

**异常项：24 项** (商品合规 18 项 / 店铺资质 6 项)"""

    def _run_inspection(self, message: str) -> str:
        msg = message.lower()
        if "商品" in msg or "产品" in msg:
            inspection_type = "商品合规巡检"
            result = "✅ 完成 | 通过率 96.3% | 异常 18 项"
        elif "店铺" in msg or "资质" in msg:
            inspection_type = "店铺资质巡检"
            result = "✅ 完成 | 通过率 92.7% | 异常 6 项"
        elif "直播" in msg or "内容" in msg:
            inspection_type = "直播内容巡检"
            result = "✅ 完成 | 通过率 95.2% | 违规 3 条"
        elif "广告" in msg:
            inspection_type = "广告内容巡检"
            result = "✅ 完成 | 通过率 98.1% | 异常 2 项"
        else:
            inspection_type = "全量巡检"
            result = "✅ 完成 | 综合通过率 96.8% | 总异常 29 项"

        return f"""## 🔄 巡检执行结果

**类型**: {inspection_type}
**状态**: {result}
**执行耗时**: 12.3s

### 主要异常项
1. **商品标题不规范** (12项) — 缺少品牌词/违规词
2. **主图不合规** (5项) — 存在非白底图
3. **资质即将过期** (6项) — 7天内过期需更新
4. **直播话术违规** (3项) — 含绝对化用语
5. **售后响应超时** (3项) — 超24小时未回复

> 需要查看详细报告或对异常项进行批量处理吗？"""

    def _get_inspection_detail(self) -> str:
        return """## 📄 巡检详情报告

### 商品合规巡检 (2026-05-08 08:00)
```
已检查商品:  2,341 件
通过:       2,256 件 (96.3%)
异常:          85 件 (3.7%)
```

#### Top 异常类型
| 异常类型 | 数量 | 占比 |
|---------|------|------|
| 标题不规范 | 28 | 32.9% |
| 主图问题 | 22 | 25.9% |
| 价格异常 | 15 | 17.6% |
| 描述不符 | 12 | 14.1% |
| 资质问题 | 8 | 9.4% |

### 建议
- 对标题不规范商品进行批量修正
- 对主图问题商品下发整改通知"""

    def _get_inspection_list(self) -> str:
        return """## 📋 历史巡检记录

| ID | 类型 | 时间 | 结果 | 异常数 |
|----|------|------|------|-------|
| #INSP-008 | 商品合规巡检 | 05-08 08:00 | ✅ 96.3% | 85 |
| #INSP-007 | 广告内容巡检 | 05-07 22:00 | ✅ 98.1% | 12 |
| #INSP-006 | 店铺资质巡检 | 05-07 10:00 | ⚠️ 92.7% | 36 |
| #INSP-005 | 商品合规巡检 | 05-07 08:00 | ✅ 97.1% | 68 |
| #INSP-004 | 直播内容巡检 | 05-06 18:00 | ✅ 95.2% | 15 |
| #INSP-003 | 售后质量巡检 | 05-06 14:00 | ⚠️ 89.4% | 42 |
| #INSP-002 | 商品合规巡检 | 05-06 08:00 | ✅ 96.8% | 76 |
| #INSP-001 | 全量巡检 | 05-05 10:00 | ✅ 96.0% | 94 |

> 共 8 条记录，近一周巡检覆盖率 100%"""

    def get_capabilities(self) -> list[str]:
        return [
            "自动化巡检执行",
            "巡检报告生成",
            "异常项标记追踪",
            "巡检策略配置",
        ]
