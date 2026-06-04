import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Space, Tag, Button, Statistic,
  Tabs, Badge, Alert, Input, Select, Rate, Divider, message, Tooltip,
} from 'antd';
import {
  SafetyOutlined, FileSearchOutlined, ThunderboltOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  ClockCircleOutlined, UserOutlined, BellOutlined, SendOutlined,
  EditOutlined, EyeOutlined, WarningOutlined, QuestionCircleOutlined,
  ExperimentOutlined, PlusOutlined,
} from '@ant-design/icons';
import type {
  GovernanceExecution, WorkflowStage, WorkflowSubStep,
  HumanInteractionType, HumanInteractionMode, BlockingTask,
} from '../../types';

// ============================================================
// 四阶段定义
// ============================================================
const STAGES = [
  { key: 'perception' as const, name: '感知', icon: '🔍', color: '#1677ff', bg: '#e6f4ff',
    subName: '特征获取 → 策略执行 → 自迭代' },
  { key: 'judgment' as const, name: '研判', icon: '🧠', color: '#722ed1', bg: '#f9f0ff',
    subName: 'Case分发 → 风险研判' },
  { key: 'mitigation' as const, name: '处置', icon: '🛡️', color: '#ff4d4f', bg: '#fff2f0',
    subName: '处罚 / 流控打压' },
  { key: 'reinforcement' as const, name: '补防', icon: '🔧', color: '#52c41a', bg: '#f6ffed',
    subName: '已知风险→PE补防 | 未知→规则定义→PE补防' },
];

// ============================================================
// Mock: 三Agent最新执行数据
// ============================================================

// ---- 品退感知智能防控 ----
const QRD_LATEST: GovernanceExecution = {
  id: 'QRD-20260604-001', agentName: 'quality_return_defense',
  input: '扫描今日高品退风险SKU，执行全链路治理', status: 'awaiting_approval',
  totalDurationMs: 6120, createdAt: '2026-06-04 10:30:00',
  executedBy: '运营A',
  overallMetrics: { totalCases: 2341, effectiveRecall: 106, rulesGenerated: 2, actionsTaken: 2 },
  stages: [
    // ---- 感知 ----
    {
      stage: 'perception', status: 'completed', needsApproval: false,
      metrics: { durationMs: 2500, recallCases: 106, strategyEffectiveRate: 94.2 },
      blockingTasks: [],
      subSteps: [
        {
          id: 'q-p1', name: '感知特征获取', type: 'skill_call', status: 'success',
          input: 'product_scan --date=today --filter=return_rate>15%',
          output: '扫描2,341件商品，筛选退货率>15%高风险候选106件。美妆38%、食品19%、服饰13%',
          duration_ms: 420, details: '基于品退率+投诉量+风险权重三维特征筛选',
          humanInteraction: {
            type: 'confirm_signal', mode: 'non_blocking', label: '确认特征范围',
            description: '确认感知特征筛选逻辑是否合理',
            nonBlockingConfig: { feedbackType: 'suggestion',
              quickActions: [{ value: 'ok', label: '👍 准确' }, { value: 'add', label: '➕ 补充特征' }, { value: 'narrow', label: '🔽 过宽' }],
              showInput: true, inputPlaceholder: '补充说明...' },
          }, feedback_entries: [],
        },
        {
          id: 'q-p2', name: '感知策略执行', type: 'skill_call', status: 'success',
          input: 'risk_scan --products=106 --threshold=high --metrics=return_rate,complaint_rate',
          output: '高风险2件(P88421虚假交易92分、P88435夸大宣传87分)，中风险15件，低风险89件',
          duration_ms: 1800, details: '多维风险扫描，高阈值过滤低置信度信号',
          humanInteraction: {
            type: 'annotate_fp_fn', mode: 'non_blocking', label: '标注准确度',
            description: '标记扫描结果中是否有误报或漏报',
            nonBlockingConfig: { feedbackType: 'annotation',
              quickActions: [{ value: 'correct', label: '✅ 全对' }, { value: 'fp', label: '❌ 有误报' }, { value: 'fn', label: '🔍 有漏报' }],
              showInput: true, inputPlaceholder: '描述误报/漏报的具体case...' },
          }, feedback_entries: [],
        },
        {
          id: 'q-p3', name: '感知策略自迭代', type: 'llm_reason', status: 'success',
          input: '回溯: 漏报率5.8%，当前阈值high(≥85分)',
          output: 'AI建议阈值调至medium-high(75分)，召回率94.2%→97.5%，误报率仅+1.2%',
          duration_ms: 280, details: '基于7天漏报趋势自适应调整感知策略参数',
          humanInteraction: {
            type: 'suggest_improvement', mode: 'non_blocking', label: '评估建议',
            description: '对AI的策略自迭代建议提供反馈',
            nonBlockingConfig: { feedbackType: 'suggestion',
              quickActions: [{ value: 'adopt', label: '✅ 采纳' }, { value: 'reject', label: '❌ 暂不采纳' }],
              showInput: true, inputPlaceholder: '补充建议...' },
          }, feedback_entries: [],
        },
      ],
    },
    // ---- 研判 ----
    {
      stage: 'judgment', status: 'completed', needsApproval: false,
      metrics: { durationMs: 650, riskCases: 2 },
      blockingTasks: [
        { id: 'block-q-j', stepId: 'q-j2', stepName: '风险研判', interactionType: 'return_judgment',
          assignment: { assignee: '品质审核组长-张', assigneeRole: '品质审核组长', deadline: '今日12:00', priority: 'high',
            instruction: '需人工确认2个高风险case的研判结论并补充研判原因' },
          description: '研判结论需人工确认后才能进入处置阶段', createdAt: '2026-06-04 10:31', status: 'pending' },
      ],
      subSteps: [
        {
          id: 'q-j1', name: 'Case自动分发', type: 'decision', status: 'success',
          input: '高风险case 2件: P88421(虚假交易), P88435(夸大宣传)',
          output: 'P88421→品质审核组(虚假交易专项) | P88435→内容治理组(夸大宣传专项)',
          duration_ms: 280,
          humanInteraction: {
            type: 'confirm_dispatch', mode: 'non_blocking', label: '审核分发',
            description: '确认case分发到正确的治理团队',
            nonBlockingConfig: { feedbackType: 'correction',
              quickActions: [{ value: 'ok', label: '✅ 正确' }, { value: 'wrong', label: '🔄 需调整' }], showInput: false },
          }, feedback_entries: [],
        },
        {
          id: 'q-j2', name: '风险研判', type: 'llm_reason', status: 'success',
          input: 'P88421: 虚假交易92分, 退货率34.2%, 投诉12条\nP88435: 夸大宣传87分, 功效描述与备案不符',
          output: '研判: P88421确认刷单引流(用户投诉+商家自认); P88435确认夸大功效(备案不符+达人直播回放)',
          duration_ms: 370, details: '综合用户投诉、售后记录、备案信息、直播回放等多维研判',
          humanInteraction: {
            type: 'return_judgment', mode: 'blocking', label: '🔴 人工研判确认',
            description: 'AI研判结论需人工最终确认并补充研判原因。此操作阻断裂后处置流程',
            blockingConfig: {
              assignment: { assignee: '品质审核组长-张', assigneeRole: '品质审核组长', deadline: '今日12:00', priority: 'high',
                instruction: '请审核AI研判结论，确认或修正后提交研判结果和原因' },
              actionLabel: '提交研判结论', secondaryLabel: '转交他人', inputRequired: true,
              inputLabel: '研判结果与原因',
              hasOptions: [{ value: 'confirm', label: '✅ 确认AI研判' }, { value: 'modify', label: '✏️ 修正后确认' }, { value: 'reject', label: '❌ 驳回' }],
              notifyChannels: ['in_app', 'dingtalk'],
            },
          }, feedback_entries: [],
        },
      ],
    },
    // ---- 处置 ----
    {
      stage: 'mitigation', status: 'blocked', needsApproval: true,
      metrics: { durationMs: 1200, disposedCases: 0 },
      blockingTasks: [
        { id: 'block-q-m', stepId: 'q-m1', stepName: '处罚方案决策', interactionType: 'approve_action',
          assignment: { assignee: '品质审核组长-张', assigneeRole: '品质审核组长', priority: 'urgent',
            instruction: '研判完成后需审批处置方案，处置立即生效' },
          description: '处置方案需人工审批后执行（不可逆操作）', createdAt: '2026-06-04 10:31', status: 'pending' },
      ],
      subSteps: [
        {
          id: 'q-m1', name: '处罚方案决策', type: 'decision', status: 'success',
          input: 'P88421(虚假交易确认)+P88435(夸大宣传确认)',
          output: '方案: ①P88421下架+扣保证金¥5000+降权7天 ②P88435限流50%+冻结货款¥2340',
          duration_ms: 1200, details: '基于研判结论和平台规则引擎自动匹配处罚条款',
          humanInteraction: {
            type: 'approve_action', mode: 'blocking', label: '🔴 批准执行',
            description: '处置方案需人工审批后执行，不可逆操作',
            blockingConfig: {
              assignment: { assignee: '品质审核组长-张', assigneeRole: '品质审核组长', priority: 'urgent',
                instruction: '审批后处置立即生效，请确认方案无误' },
              actionLabel: '审批并执行', secondaryLabel: '驳回方案', inputRequired: true,
              inputLabel: '审批意见',
              hasOptions: [{ value: 'approve', label: '✅ 批准全部' }, { value: 'modify', label: '✏️ 修改后批准' }, { value: 'reject', label: '❌ 驳回' }],
              notifyChannels: ['in_app', 'dingtalk', 'email'],
            },
          }, feedback_entries: [],
        },
      ],
    },
    // ---- 补防 ----
    {
      stage: 'reinforcement', status: 'pending', needsApproval: false,
      metrics: { durationMs: 0, iteratedStrategies: 0, newRecalledCases: 0 },
      blockingTasks: [],
      subSteps: [
        {
          id: 'q-r1', name: 'PE策略补防(已知风险)', type: 'decision', status: 'success',
          input: '虚假交易+退货率>30%的已知模式',
          output: '待处置完成后生成: auto_block_high_return_fake_trade (预计月拦截~120件)',
          duration_ms: 0, details: '等待处置阶段审批通过后自动触发PE策略生成',
          humanInteraction: {
            type: 'approve_rule', mode: 'blocking', label: '审批策略上线',
            description: 'PE策略上线后会自动拦截匹配商品',
            blockingConfig: {
              assignment: { assignee: '策略运营-李', assigneeRole: '策略运营', priority: 'normal',
                instruction: '处置完成后触发策略补防评估' },
              actionLabel: '审批策略', inputRequired: false,
              hasOptions: [{ value: 'approve', label: '✅ 批准' }, { value: 'reject', label: '❌ 驳回' }],
            },
          }, feedback_entries: [],
        },
        {
          id: 'q-r2', name: '规则定义(未知风险留档)', type: 'llm_reason', status: 'success',
          input: '本次无未知风险模式。2件均为已知虚假交易/夸大宣传类型',
          output: '无需触发规则定义。case已归档至案例库供后续训练',
          duration_ms: 220,
          humanInteraction: {
            type: 'confirm_dispatch', mode: 'non_blocking', label: '查看样本',
            description: '查看已归档的case样本',
            nonBlockingConfig: { feedbackType: 'suggestion',
              quickActions: [{ value: 'view', label: '👁️ 查看' }], showInput: false },
          }, feedback_entries: [],
        },
      ],
    },
  ],
};

// ---- 大盘风险水位巡检 ----
const RWL_LATEST: GovernanceExecution = {
  id: 'RWL-20260604-001', agentName: 'risk_water_level',
  input: '全量风险水位巡检(156项指标)', status: 'completed',
  totalDurationMs: 4200, createdAt: '2026-06-04 08:00:00',
  executedBy: '风险监控组-运营D',
  overallMetrics: { totalCases: 156, effectiveRecall: 3, rulesGenerated: 1, actionsTaken: 3 },
  stages: [
    {
      stage: 'perception', status: 'completed', needsApproval: false,
      metrics: { durationMs: 1800, recallCases: 3, strategyEffectiveRate: 100 },
      blockingTasks: [],
      subSteps: [
        { id: 'r-p1', name: '感知特征获取', type: 'skill_call', status: 'success',
          input: 'risk_scan --scope=global --metrics=all --baseline=7d_avg',
          output: '156项指标拉取完成。3项超警戒线: 虚假交易+2.1%, 退款率+0.8%, 客诉量+5.3%',
          duration_ms: 1500,
          humanInteraction: { type: 'confirm_signal', mode: 'non_blocking', label: '确认指标',
            description: '确认异常指标检测是否准确',
            nonBlockingConfig: { feedbackType: 'suggestion',
              quickActions: [{ value: 'ok', label: '👍 准确' }, { value: 'miss', label: '🔍 有遗漏' }],
              showInput: true, inputPlaceholder: '补充...' },
          }, feedback_entries: [],
        },
        { id: 'r-p2', name: '感知策略执行', type: 'skill_call', status: 'success',
          input: 'anomaly_detect --metrics=虚假交易,退款率,客诉量 --drilldown=category',
          output: '虚假交易→3C+个护类目; 退款率连续3周↑; 客诉量→618预热正常波动',
          duration_ms: 300,
          humanInteraction: { type: 'annotate_fp_fn', mode: 'non_blocking', label: '确认异常判定',
            description: '标注异常检测是否准确',
            nonBlockingConfig: { feedbackType: 'annotation',
              quickActions: [{ value: 'ok', label: '✅ 全对' }, { value: 'fp', label: '❌ 误报' }],
              showInput: true, inputPlaceholder: '描述...' },
          }, feedback_entries: [],
        },
      ],
    },
    {
      stage: 'judgment', status: 'completed', needsApproval: false,
      metrics: { durationMs: 800, riskCases: 3 },
      blockingTasks: [],
      subSteps: [
        { id: 'r-j1', name: '异常Case分发', type: 'decision', status: 'success',
          input: '3项异常归因数据', output: '虚假交易→商品治理组, 退款率→体验治理组, 客诉→客服运营组',
          duration_ms: 200,
          humanInteraction: { type: 'confirm_dispatch', mode: 'non_blocking', label: '审核分发',
            description: '确认分发正确',
            nonBlockingConfig: { feedbackType: 'correction',
              quickActions: [{ value: 'ok', label: '✅ 正确' }, { value: 'wrong', label: '🔄 调整' }], showInput: false },
          }, feedback_entries: [],
        },
        { id: 'r-j2', name: '异常研判', type: 'llm_reason', status: 'success',
          input: '3项异常及归因数据',
          output: '研判: 虚假交易确认异常→治理干预; 退款率趋势异常→下周归因; 客诉→正常波动',
          duration_ms: 600,
          humanInteraction: { type: 'return_judgment', mode: 'blocking', label: '🔴 人工研判',
            description: '确认AI研判结论，补充人工判断',
            blockingConfig: {
              assignment: { assignee: '风险监控主管-王', assigneeRole: '风险监控主管', priority: 'normal',
                instruction: '确认异常研判结论，主要关注退款率趋势是否需要提前干预' },
              actionLabel: '提交研判结论', inputRequired: true, inputLabel: '研判意见',
              hasOptions: [{ value: 'confirm', label: '✅ 确认' }, { value: 'upgrade', label: '⬆️ 升级退款率' }],
            },
          }, feedback_entries: [],
        },
      ],
    },
    {
      stage: 'mitigation', status: 'completed', needsApproval: true,
      approvalStatus: 'approved', approvalBy: '运营主管-王', approvedAt: '06-04 08:10',
      metrics: { durationMs: 1200, disposedCases: 3 },
      blockingTasks: [],
      subSteps: [
        { id: 'r-m1', name: '异常处置', type: 'decision', status: 'success',
          input: '虚假交易→干预, 退款率→观察, 客诉→忽略',
          output: '①3C+个护启动虚假交易专项排查 ②周度退款率归因报告 ③客诉标记正常波动',
          duration_ms: 1200,
          humanInteraction: { type: 'approve_action', mode: 'blocking', label: '🔴 批准处置',
            description: '专项排查将触发批量扫描',
            blockingConfig: {
              assignment: { assignee: '运营主管-王', assigneeRole: '运营主管', priority: 'high',
                instruction: '批准虚假交易专项排查启动' },
              actionLabel: '批准启动', inputRequired: false,
              hasOptions: [{ value: 'approve', label: '✅ 批准' }, { value: 'reject', label: '❌ 暂不启动' }],
            },
          }, feedback_entries: [],
        },
      ],
    },
    {
      stage: 'reinforcement', status: 'completed', needsApproval: false,
      metrics: { durationMs: 400, iteratedStrategies: 1, newRecalledCases: 0 },
      blockingTasks: [],
      subSteps: [
        { id: 'r-r1', name: '巡检规则优化', type: 'llm_reason', status: 'success',
          input: '退款率连续3周↑但仅单周超标触发', output: '增加"连续3周↑"触发条件。下次自动应用',
          duration_ms: 400,
          humanInteraction: { type: 'suggest_improvement', mode: 'non_blocking', label: '评估规则优化',
            description: '评估AI建议的规则优化',
            nonBlockingConfig: { feedbackType: 'suggestion',
              quickActions: [{ value: 'adopt', label: '✅ 采纳' }, { value: 'delay', label: '⏸️ 再观察' }],
              showInput: true, inputPlaceholder: '补充...' },
          }, feedback_entries: [],
        },
      ],
    },
  ],
};

// ---- 举报实时泛化打压 ----
const RPC_LATEST: GovernanceExecution = {
  id: 'RPC-20260604-001', agentName: 'report_crackdown',
  input: '处理虚假宣传举报队列，泛化识别同类违规并打压', status: 'completed',
  totalDurationMs: 5800, createdAt: '2026-06-04 11:00:00',
  executedBy: '举报处理组-运营F',
  overallMetrics: { totalCases: 234, effectiveRecall: 1247, rulesGenerated: 1, actionsTaken: 1247 },
  stages: [
    {
      stage: 'perception', status: 'completed', needsApproval: false,
      metrics: { durationMs: 2500, recallCases: 1247, strategyEffectiveRate: 93.5 },
      blockingTasks: [],
      subSteps: [
        { id: 'c-p1', name: '举报信号采集', type: 'skill_call', status: 'success',
          input: 'report_process --queue=pending --type=虚假宣传 --limit=500',
          output: '234条举报: 功效夸大58%, 价格欺诈22%, 虚假销量15%, 其他5%',
          duration_ms: 500,
          humanInteraction: { type: 'confirm_signal', mode: 'non_blocking', label: '确认举报队列',
            description: '确认举报筛选逻辑',
            nonBlockingConfig: { feedbackType: 'suggestion',
              quickActions: [{ value: 'ok', label: '👍 合理' }, { value: 'filter', label: '🔽 需筛选' }], showInput: false },
          }, feedback_entries: [],
        },
        { id: 'c-p2', name: '违规核实+泛化种子提取', type: 'skill_call', status: 'success',
          input: 'verify_reports + extract_seed --confidence=0.9',
          output: '确认违规187条(79.9%), 存疑32条, 误报15条。28组高置信泛化种子',
          duration_ms: 2000,
          humanInteraction: { type: 'annotate_fp_fn', mode: 'non_blocking', label: '核查种子质量',
            description: '检查泛化种子的准确性和覆盖率',
            nonBlockingConfig: { feedbackType: 'annotation',
              quickActions: [{ value: 'good', label: '✅ 质量好' }, { value: 'low', label: '🔍 覆盖率低' }, { value: 'fp', label: '❌ 有误种' }],
              showInput: true, inputPlaceholder: '具体说明...' },
          }, feedback_entries: [],
        },
      ],
    },
    {
      stage: 'judgment', status: 'completed', needsApproval: false,
      metrics: { durationMs: 600, riskCases: 1247 },
      blockingTasks: [],
      subSteps: [
        { id: 'c-j1', name: '泛化case分发', type: 'decision', status: 'success',
          input: '28组种子触发1247件同类商品',
          output: '功效夸大18组→内容治理组, 虚假销量7组→商品治理组, 价格欺诈3组→价格合规组',
          duration_ms: 200,
          humanInteraction: { type: 'confirm_dispatch', mode: 'non_blocking', label: '审核分发',
            description: '确认分发准确',
            nonBlockingConfig: { feedbackType: 'correction',
              quickActions: [{ value: 'ok', label: '✅ 正确' }, { value: 'wrong', label: '🔄 调整' }], showInput: false },
          }, feedback_entries: [],
        },
        { id: 'c-j2', name: '批量风险研判', type: 'llm_reason', status: 'success',
          input: '1247件按种子分组风险分级',
          output: '高风险892件(确认违规), 中风险297件(限流观察), 低风险58件(释放)',
          duration_ms: 400,
          humanInteraction: { type: 'return_judgment', mode: 'blocking', label: '🔴 人工抽检确认',
            description: '批量分级需人工抽检确认',
            blockingConfig: {
              assignment: { assignee: '举报处理主管-赵', assigneeRole: '举报处理主管', priority: 'high',
                instruction: '抽检高风险档45件(约5%)确认分级准确率' },
              actionLabel: '提交抽检结论', inputRequired: true, inputLabel: '抽检结论',
              hasOptions: [{ value: 'pass', label: '✅ 抽检通过' }, { value: 'fail', label: '❌ 不通过，需调整' }],
            },
          }, feedback_entries: [],
        },
      ],
    },
    {
      stage: 'mitigation', status: 'completed', needsApproval: true,
      approvalStatus: 'approved', approvalBy: '运营主管-赵', approvedAt: '06-04 11:08',
      metrics: { durationMs: 2500, disposedCases: 1247 },
      blockingTasks: [],
      subSteps: [
        { id: 'c-m1', name: '批量打压执行', type: 'skill_call', status: 'success',
          input: 'crackdown --ids=1247 --delete=892 --limit=355 --release=58',
          output: '✅ 处置完成: 删除892件, 限流355件, 释放58件',
          duration_ms: 2500,
          humanInteraction: { type: 'approve_action', mode: 'blocking', label: '🔴 批准批量处置',
            description: '不可逆删除892件，需确认抽检通过后批准',
            blockingConfig: {
              assignment: { assignee: '运营主管-赵', assigneeRole: '运营主管', priority: 'urgent',
                instruction: '批量处置不可逆，请确认抽检结果' },
              actionLabel: '批准批量处置', inputRequired: true, inputLabel: '批准意见',
              hasOptions: [{ value: 'approve', label: '✅ 批准全部' }, { value: 'part', label: '⚠️ 部分执行' }, { value: 'reject', label: '❌ 驳回' }],
              notifyChannels: ['in_app', 'dingtalk', 'email'],
            },
          }, feedback_entries: [],
        },
      ],
    },
    {
      stage: 'reinforcement', status: 'completed', needsApproval: true,
      approvalStatus: 'modified', approvalBy: '策略运营-张', approvedAt: '06-04 11:30',
      metrics: { durationMs: 400, iteratedStrategies: 1, newRecalledCases: 300 },
      blockingTasks: [],
      subSteps: [
        { id: 'c-r1', name: 'PE策略补防', type: 'decision', status: 'success',
          input: '功效夸大18组种子图片相似度>90%',
          output: '新增策略: auto_block_efficacy_img (相似度>0.80→拦截) 预计月拦截~300件',
          duration_ms: 400,
          humanInteraction: { type: 'approve_rule', mode: 'blocking', label: '审批策略上线',
            description: '策略运营将阈值0.85→0.80扩大召回',
            blockingConfig: {
              assignment: { assignee: '策略运营-张', assigneeRole: '策略运营', priority: 'normal',
                instruction: '确认修改后阈值0.80是否合理' },
              actionLabel: '审批上线', inputRequired: false,
              hasOptions: [{ value: 'approve', label: '✅ 批准(0.80)' }, { value: 'keep', label: '🔄 保持0.85' }],
            },
          }, feedback_entries: [],
        },
      ],
    },
  ],
};

const EXECUTIONS: Record<string, GovernanceExecution> = {
  quality_return_defense: QRD_LATEST,
  risk_water_level: RWL_LATEST,
  report_crackdown: RPC_LATEST,
};

// ============================================================
// Agent 配置
// ============================================================
interface AgentConfig {
  display_name: string; icon: React.ReactNode; description: string;
  kpis: { label: string; value: number | string; unit: string; color?: string }[];
}
const AGENT_CFG: Record<string, AgentConfig> = {
  quality_return_defense: {
    display_name: '品退感知智能防控', icon: <SafetyOutlined />,
    description: '基于品质退货数据，智能感知商品质量风险，前置拦截问题商品',
    kpis: [
      { label: '监控SKU', value: '125,000', unit: '个' },
      { label: '前置拦截', value: 3421, unit: '次', color: '#52c41a' },
      { label: '品退下降', value: '18.5%', unit: '', color: '#1677ff' },
      { label: '准确率', value: '94.7%', unit: '', color: '#ff4d4f' },
    ],
  },
  risk_water_level: {
    display_name: '大盘风险水位巡检', icon: <FileSearchOutlined />,
    description: '全域风险水位监控，自动巡检各业务线风险指标，及时发现异常波动',
    kpis: [
      { label: '监控指标', value: 156, unit: '项' },
      { label: '异常发现', value: 234, unit: '次', color: '#ff4d4f' },
      { label: '覆盖率', value: '98.5%', unit: '', color: '#52c41a' },
      { label: '响应', value: '2.3', unit: 'min', color: '#1677ff' },
    ],
  },
  report_crackdown: {
    display_name: '举报实时泛化打压', icon: <ThunderboltOutlined />,
    description: '基于用户举报信号，实时泛化识别同类风险，自动化打压处置',
    kpis: [
      { label: '处理举报', value: '23,410', unit: '条' },
      { label: '泛化识别', value: 8920, unit: '条', color: '#52c41a' },
      { label: '打压处置', value: 5670, unit: '次', color: '#ff4d4f' },
      { label: '泛化准确率', value: '92.3%', unit: '', color: '#1677ff' },
    ],
  },
};

// ============================================================
// 子组件: 阻断任务横幅
// ============================================================
function BlockingBanner({ tasks }: { tasks: BlockingTask[] }) {
  if (tasks.length === 0) return null;
  return (
    <Alert
      type="error" showIcon icon={<WarningOutlined />}
      style={{ marginBottom: 12, border: '1px solid #ff4d4f', background: '#fff2f0' }}
      message={<Space><Typography.Text strong style={{ color: '#ff4d4f' }}>⛔ 流程阻断 — {tasks.length} 项人工操作待处理，后续阶段已暂停</Typography.Text></Space>}
      description={
        <div style={{ marginTop: 6 }}>
          {tasks.map(t => (
            <Card key={t.id} size="small" style={{ marginBottom: 6, borderColor: '#ffd666', background: '#fffbe6' }}>
              <Row align="middle">
                <Col flex="auto">
                  <Space direction="vertical" size={2}>
                    <Space>
                      <Tag color="red" style={{ fontSize: 11 }}>
                        {t.interactionType === 'return_judgment' ? '🧠 需人工研判' : t.interactionType === 'approve_action' ? '⚠️ 需审批处置' : '🔒 需审批规则'}
                      </Tag>
                      <Typography.Text strong style={{ fontSize: 12 }}>{t.stepName}</Typography.Text>
                    </Space>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t.description}</Typography.Text>
                    <Space size={12}>
                      <Space size={2}><UserOutlined style={{ color: '#ff4d4f', fontSize: 10 }} />
                        <Typography.Text style={{ fontSize: 11 }}><strong>{t.assignment.assignee}</strong> ({t.assignment.assigneeRole})</Typography.Text>
                      </Space>
                      {t.assignment.deadline && <Space size={2}><ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 10 }} />
                        <Typography.Text style={{ fontSize: 11, color: '#ff4d4f' }}>截止: {t.assignment.deadline}</Typography.Text>
                      </Space>}
                      <Tag color={t.assignment.priority === 'urgent' ? 'red' : 'orange'} style={{ fontSize: 9 }}>
                        {t.assignment.priority === 'urgent' ? '紧急' : '高优'}
                      </Tag>
                    </Space>
                  </Space>
                </Col>
                <Col>
                  <Button type="primary" danger size="small" block
                    style={{ fontWeight: 600, boxShadow: '0 1px 4px rgba(255,77,79,0.25)' }}>
                    {t.interactionType === 'return_judgment' ? '前往研判' : '前往审批'}
                  </Button>
                  <Button size="small" block style={{ marginTop: 4, color: '#1677ff', borderColor: '#1677ff' }}>转交他人</Button>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      }
    />
  );
}

// ============================================================
// 子组件: 子步骤卡片 (含人工交互入口)
// ============================================================
function StepCard({ step }: { step: WorkflowSubStep }) {
  const [correctionMode, setCorrectionMode] = useState<string | null>(null); // null | qa-value for corrective input
  const [correctResult, setCorrectResult] = useState('');
  const [correctReason, setCorrectReason] = useState('');
  const hi = step.humanInteraction;
  const isBlocking = hi.mode === 'blocking';

  const handleQuickAction = (qa: { value: string; label: string }) => {
    const isNegative = qa.value === 'fp' || qa.value === 'fn' || qa.value === 'wrong'
      || qa.value === 'reject' || qa.value === 'has_fp' || qa.value === 'has_fn';
    const isNeutral = qa.value === 'filter' || qa.value === 'narrow' || qa.value === 'miss'
      || qa.value === 'low' || qa.value === 'low_coverage' || qa.value === 'too_broad';

    if (isNegative || isNeutral) {
      // 负反馈 & 中性反馈：需要提供正确的执行路径/结果
      setCorrectionMode(qa.value);
      return;
    }
    // 正反馈：直接记录
    message.success(`已记录: ${qa.label}`);
  };

  const submitCorrection = () => {
    if (!correctResult.trim()) { message.warning('请填写正确的执行路径或结果'); return; }
    message.success('反馈已提交，正确的执行路径已记录');
    setCorrectionMode(null);
    setCorrectResult('');
    setCorrectReason('');
  };

  return (
    <div style={{
      marginBottom: 10, padding: '10px 12px', borderRadius: 6,
      background: isBlocking ? '#fffbe6' : '#fafafa',
      border: `1px solid ${isBlocking ? '#ffd666' : '#e8e8e8'}`,
      borderLeft: `4px solid ${step.status === 'success' ? '#52c41a' : '#ff4d4f'}`,
      boxShadow: isBlocking ? '0 1px 3px rgba(255,77,79,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        <Space size={4} wrap>
          <Typography.Text strong style={{ fontSize: 12 }}>{step.name}</Typography.Text>
          <Tag color="purple" style={{ fontSize: 8, lineHeight: '14px' }}>{step.type}</Tag>
          <Tag style={{ fontSize: 8, lineHeight: '14px' }}>{(step.duration_ms / 1000).toFixed(2)}s</Tag>
          {isBlocking && <Tag color="red" style={{ fontSize: 8, lineHeight: '14px' }}>⛔ 阻断</Tag>}
        </Space>
      </div>

      {/* Output */}
      <div style={{ marginTop: 6, background: '#fff', borderRadius: 4, padding: '6px 8px', border: '1px solid #f0f0f0' }}>
        <Typography.Text style={{ fontSize: 11, whiteSpace: 'pre-wrap', color: '#333', lineHeight: '18px' }}>
          <strong style={{ color: '#1677ff' }}>📤 </strong>
          {step.output.length > 150 ? step.output.slice(0, 150) + '...' : step.output}
        </Typography.Text>
        {step.details && (
          <Tooltip title={step.details}>
            <QuestionCircleOutlined style={{ fontSize: 10, color: '#999', marginLeft: 4 }} />
          </Tooltip>
        )}
      </div>

      {/* === 阻断型交互 === */}
      {isBlocking && hi.blockingConfig && (
        <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 4, background: '#fff2f0', border: '2px solid #ff7875' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space><Tag color="red" style={{ fontSize: 10, fontWeight: 600 }}>⛔ 阻断流程</Tag>
              <Typography.Text strong style={{ fontSize: 11 }}>{hi.label}</Typography.Text>
            </Space>
            <Typography.Text type="secondary" style={{ fontSize: 10 }}>{hi.description}</Typography.Text>
            <div style={{ background: '#fff', borderRadius: 4, padding: '6px 10px', border: '1px solid #ffd666' }}>
              <Space size={8}><UserOutlined style={{ color: '#ff4d4f', fontSize: 11 }} />
                <Typography.Text style={{ fontSize: 11 }}><strong>分配给: {hi.blockingConfig.assignment.assignee}</strong>
                  <span style={{ color: '#999' }}> ({hi.blockingConfig.assignment.assigneeRole})</span></Typography.Text>
                {hi.blockingConfig.assignment.deadline && <Tag color="red" style={{ fontSize: 9 }}>截止: {hi.blockingConfig.assignment.deadline}</Tag>}
              </Space>
              {hi.blockingConfig.assignment.instruction && <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
                📋 {hi.blockingConfig.assignment.instruction}</Typography.Text>}
            </div>
            <Space style={{ justifyContent: 'flex-end', width: '100%', marginTop: 2 }} size={4} wrap>
              {hi.blockingConfig.hasOptions && (
                <Select size="small" defaultValue={hi.blockingConfig.hasOptions[0].value} style={{ width: 190, fontSize: 10 }}
                  options={hi.blockingConfig.hasOptions.map(o => ({ value: o.value, label: o.label }))} />
              )}
              {hi.blockingConfig.inputRequired && <Input size="small" placeholder={hi.blockingConfig.inputLabel} style={{ width: 170 }} />}
              <Button size="small" type="primary" danger
                style={{ fontWeight: 600, borderRadius: 4, boxShadow: '0 1px 4px rgba(255,77,79,0.3)' }}>
                {hi.blockingConfig.actionLabel}
              </Button>
              {hi.blockingConfig.secondaryLabel && (
                <Button size="small" style={{ color: '#1677ff', borderColor: '#1677ff' }}>{hi.blockingConfig.secondaryLabel}</Button>
              )}
            </Space>
          </Space>
        </div>
      )}

      {/* === 非阻断型交互 === */}
      {!isBlocking && hi.nonBlockingConfig && (
        <div style={{
          marginTop: 6, padding: '6px 8px', borderRadius: 4,
          background: '#fff', border: '1px solid #d9d9d9',
        }}>
          {/* 快捷操作行 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <Space size={4}>
              <Tag style={{ fontSize: 9, lineHeight: '14px', background: '#f0f5ff', color: '#1677ff', border: '1px solid #adc6ff' }}>
                {hi.label}
              </Tag>
              <Typography.Text style={{ fontSize: 10, color: '#888' }}>{hi.description}</Typography.Text>
            </Space>
            <Space size={4} wrap>
              {hi.nonBlockingConfig.quickActions?.map(qa => {
                const isPositive = qa.value === 'ok' || qa.value === 'correct' || qa.value === 'good'
                  || qa.value === 'adopt' || qa.value === 'accurate' || qa.value === 'all_correct' || qa.value === 'view';
                const isNegative = qa.value === 'fp' || qa.value === 'fn' || qa.value === 'wrong'
                  || qa.value === 'reject' || qa.value === 'has_fp' || qa.value === 'has_fn';
                const isNeutral = qa.value === 'filter' || qa.value === 'narrow' || qa.value === 'miss'
                  || qa.value === 'low' || qa.value === 'low_coverage' || qa.value === 'too_broad';
                const isAdd = qa.value === 'add' || qa.value === 'need_add';
                const isActive = correctionMode === qa.value;

                return (
                  <Button
                    key={qa.value} size="small"
                    type={isActive ? 'primary' : 'default'}
                    style={{
                      fontSize: 10, padding: '0 8px', height: 24, borderRadius: 12,
                      ...(isPositive ? { background: '#f6ffed', color: '#389e0d', borderColor: '#b7eb8f' } : {}),
                      ...(isNegative ? { background: '#fff2f0', color: '#cf1322', borderColor: '#ffa39e' } : {}),
                      ...(isNeutral ? { background: '#fffbe6', color: '#d48806', borderColor: '#ffe58f' } : {}),
                      ...(isAdd ? { background: '#e6f7ff', color: '#096dd9', borderColor: '#91d5ff' } : {}),
                      ...(isActive ? { fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' } : {}),
                    }}
                    onClick={() => handleQuickAction(qa)}
                  >{qa.label}</Button>
                );
              })}
              {hi.nonBlockingConfig.showInput && correctionMode === null && (
                <Button size="small" type="link" icon={<EditOutlined />}
                  style={{ fontSize: 10, padding: '0 4px', color: '#1677ff', fontWeight: 500 }}
                  onClick={() => setCorrectionMode('detail')}>详细反馈</Button>
              )}
              {correctionMode !== null && (
                <Button size="small" type="link" style={{ fontSize: 10, padding: '0 4px', color: '#999' }}
                  onClick={() => { setCorrectionMode(null); setCorrectResult(''); setCorrectReason(''); }}>取消</Button>
              )}
            </Space>
          </div>

          {/* 负反馈/中性反馈：内联纠正表单 */}
          {correctionMode !== null && (
            <div style={{
              marginTop: 8, padding: '8px 10px', borderRadius: 4,
              background: '#fff7e6', border: '1px solid #ffd666',
            }}>
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <Space size={4}>
                  <Tag color="orange" style={{ fontSize: 10 }}>
                    {correctionMode === 'detail' ? '📝 补充反馈' : '🔧 需要纠正'}
                  </Tag>
                  <Typography.Text style={{ fontSize: 11, color: '#d48806' }}>
                    {correctionMode === 'detail'
                      ? '请描述你的详细反馈或改进建议'
                      : '当前执行结果被认为有误或不足，请提供你认为正确的执行路径或结果'}
                  </Typography.Text>
                </Space>
                <div>
                  <Typography.Text style={{ fontSize: 10, color: '#666' }}>
                    <strong>正确的执行路径 / 期望结果 *</strong>
                  </Typography.Text>
                  <Input.TextArea
                    size="small" rows={2}
                    placeholder={
                      step.type === 'decision' ? '例如：应将该case分发到XX组而非YY组，因为...' :
                      step.type === 'llm_reason' ? '例如：正确研判结论应该是...，因为...' :
                      '请描述正确的执行方式和期望输出...'
                    }
                    value={correctResult}
                    onChange={e => setCorrectResult(e.target.value)}
                    style={{ fontSize: 11, marginTop: 2 }}
                  />
                </div>
                <div>
                  <Typography.Text style={{ fontSize: 10, color: '#666' }}>
                    <strong>纠正原因（可选）</strong>
                  </Typography.Text>
                  <Input
                    size="small"
                    placeholder="简要说明为什么要这样纠正..."
                    value={correctReason}
                    onChange={e => setCorrectReason(e.target.value)}
                    style={{ fontSize: 11, marginTop: 2 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  <Button size="small"
                    onClick={() => { setCorrectionMode(null); setCorrectResult(''); setCorrectReason(''); }}>
                    取消
                  </Button>
                  <Button size="small" type="primary" onClick={submitCorrection}
                    style={{ fontWeight: 500 }}>
                    提交纠正结果
                  </Button>
                </div>
              </Space>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 子组件: 阶段Tab内容
// ============================================================
function StageTabContent({ stage, stageDef }: { stage: WorkflowStage; stageDef: typeof STAGES[0] }) {
  const m = stage.metrics;
  const isBlocked = stage.status === 'blocked' || stage.status === 'needs_approval';

  // 按阶段类型选指标
  const stageMetrics = (() => {
    switch (stageDef.key) {
      case 'perception': return [
        { label: '召回Case量', value: m.recallCases ?? '-', unit: '件', color: '#1677ff' },
        { label: '策略有效率', value: m.strategyEffectiveRate != null ? `${m.strategyEffectiveRate}%` : '-', unit: '', color: '#52c41a' },
      ];
      case 'judgment': return [
        { label: '风险Case数', value: m.riskCases ?? '-', unit: '件', color: '#722ed1' },
      ];
      case 'mitigation': return [
        { label: '处置Case数', value: m.disposedCases ?? '-', unit: '件', color: '#ff4d4f' },
      ];
      case 'reinforcement': return [
        { label: '迭代策略条数', value: m.iteratedStrategies ?? '-', unit: '条', color: '#52c41a' },
        { label: '新增召回审出风险Case', value: m.newRecalledCases ?? '-', unit: '件', color: '#1677ff' },
      ];
    }
  })();

  return (
    <div>
      {/* 阶段状态+指标汇总 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col span={24}>
          <Card size="small" style={{ background: stageDef.bg, borderLeft: `4px solid ${stageDef.color}` }}>
            <Row gutter={24} align="middle">
              <Col flex="auto">
                <Space size={8}>
                  <span style={{ fontSize: 24 }}>{stageDef.icon}</span>
                  <div>
                    <Space><Typography.Text strong style={{ fontSize: 15 }}>{stageDef.name}</Typography.Text>
                      {stage.status === 'completed' && <Tag color="green">✅ 已完成</Tag>}
                      {(stage.status === 'blocked' || stage.status === 'needs_approval') && <Tag color="red">⛔ 已阻断</Tag>}
                      {stage.status === 'pending' && <Tag>⏳ 待执行</Tag>}
                    </Space>
                    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{stageDef.subName}</Typography.Text>
                  </div>
                </Space>
              </Col>
              {stageMetrics.map((metric, i) => (
                <Col key={i}>
                  <Statistic title={metric.label} value={metric.value} suffix={metric.unit}
                    valueStyle={{ fontSize: 22, color: metric.color }} />
                </Col>
              ))}
              <Col>
                <Statistic title="执行耗时" value={m.durationMs > 0 ? `${(m.durationMs / 1000).toFixed(1)}s` : '等待中'}
                  valueStyle={{ fontSize: 16 }} />
              </Col>
              {stage.approvalStatus === 'approved' && (
                <Col><Tag color="green">✅ {stage.approvalBy} 已审批 — {stage.approvedAt}</Tag></Col>
              )}
              {stage.approvalStatus === 'modified' && (
                <Col><Tag color="orange">✏️ {stage.approvalBy} 已修改通过</Tag></Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 阻断任务 */}
      <BlockingBanner tasks={stage.blockingTasks.filter(t => t.status === 'pending')} />

      {/* 子步骤列表 */}
      <Typography.Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
        📋 工作流执行步骤 ({stage.subSteps.filter(s => s.status === 'success').length}/{stage.subSteps.length} 步完成)
      </Typography.Text>
      {stage.subSteps.map(step => <StepCard key={step.id} step={step} />)}

      {stage.subSteps.length === 0 && (
        <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无执行步骤</div>
      )}
    </div>
  );
}

// ============================================================
// 主页面: OrgAgentDetail
// ============================================================
export default function OrgAgentDetail() {
  const { name = 'quality_return_defense' } = useParams();
  const navigate = useNavigate();
  const cfg = AGENT_CFG[name] || AGENT_CFG['quality_return_defense'];
  const exec = EXECUTIONS[name];

  const blockingTotal = exec ? exec.stages.flatMap(s => s.blockingTasks).filter(t => t.status === 'pending').length : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <Space>{cfg.icon}
          <Typography.Title level={4} style={{ margin: 0 }}>{cfg.display_name}</Typography.Title>
          <Tag color="green">组织</Tag>
          {blockingTotal > 0 && <Tag color="red" style={{ fontSize: 12 }}>⛔ {blockingTotal} 项阻断待处理</Tag>}
        </Space>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 2, marginLeft: 0 }}>{cfg.description}</Typography.Text>
      </div>

      {/* KPI */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {cfg.kpis.map((k, i) => (
          <Col span={6} key={i}><Card size="small"><Statistic title={k.label} value={k.value} suffix={k.unit} valueStyle={{ color: k.color }} /></Card></Col>
        ))}
      </Row>

      {/* 全局阻断告警 */}
      <BlockingBanner
        tasks={exec ? exec.stages.flatMap(s => s.blockingTasks).filter(t => t.status === 'pending') : []}
      />

      {/* 执行信息 */}
      {exec ? (
        <>
          <Card size="small" style={{ marginBottom: 12, background: '#fafafa' }}>
            <Row gutter={16}>
              <Col flex="auto">
                <Space size={12}>
                  <Tag color="blue">最新执行</Tag>
                  <Typography.Text strong>{exec.id}</Typography.Text>
                  <Typography.Text type="secondary">输入: {exec.input}</Typography.Text>
                  <Tag color={exec.status === 'completed' ? 'green' : 'orange'}>{exec.status === 'completed' ? '已完成' : '待审批'}</Tag>
                </Space>
              </Col>
              <Col>
                <Space size={24}>
                  <Statistic title="总耗时" value={(exec.totalDurationMs / 1000).toFixed(1)} suffix="s" valueStyle={{ fontSize: 16 }} />
                  <Statistic title="执行人" value={exec.executedBy} valueStyle={{ fontSize: 14 }} />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{exec.createdAt}</Typography.Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 整体指标 */}
          <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
            <Col span={6}><Card size="small"><Statistic title="处理总量" value={exec.overallMetrics.totalCases.toLocaleString()} suffix="件" /></Card></Col>
            <Col span={6}><Card size="small"><Statistic title="有效召回" value={exec.overallMetrics.effectiveRecall.toLocaleString()} suffix="件" valueStyle={{ color: '#1677ff' }} /></Card></Col>
            <Col span={6}><Card size="small"><Statistic title="处置动作" value={exec.overallMetrics.actionsTaken.toLocaleString()} suffix="件" valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
            <Col span={6}><Card size="small"><Statistic title="规则产出" value={exec.overallMetrics.rulesGenerated} suffix="条" valueStyle={{ color: '#52c41a' }} /></Card></Col>
          </Row>

          {/* === 四阶段 Tabs === */}
          <Card size="small">
            <Tabs
              defaultActiveKey="perception"
              tabBarStyle={{ marginBottom: 0 }}
              items={STAGES.map(sd => {
                const stage = exec.stages.find(s => s.stage === sd.key)!;
                const blocking = stage.blockingTasks.filter(t => t.status === 'pending').length;
                const m = stage.metrics;
                // 按阶段类型提取标签上要显示的指标 snippet
                const metricSnippet = (() => {
                  switch (sd.key) {
                    case 'perception':
                      return <span style={{ fontSize: 11, color: '#1677ff', fontWeight: 600 }}>
                        召回{m.recallCases ?? '-'}件 · 有效率{m.strategyEffectiveRate ?? '-'}%
                      </span>;
                    case 'judgment':
                      return <span style={{ fontSize: 11, color: '#722ed1', fontWeight: 600 }}>
                        风险{m.riskCases ?? '-'}件
                      </span>;
                    case 'mitigation':
                      return <span style={{ fontSize: 11, color: '#ff4d4f', fontWeight: 600 }}>
                        处置{m.disposedCases ?? '-'}件
                      </span>;
                    case 'reinforcement':
                      return <span style={{ fontSize: 11, color: '#52c41a', fontWeight: 600 }}>
                        策略{m.iteratedStrategies ?? '-'}条 · 新增召回{m.newRecalledCases ?? '-'}件
                      </span>;
                  }
                })();
                return {
                  key: sd.key,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <Space size={4}>
                        <span style={{ fontSize: 15 }}>{sd.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{sd.name}</span>
                        {blocking > 0 && <Badge count={blocking} size="small" style={{ backgroundColor: '#ff4d4f' }} />}
                        {stage.status === 'completed' && !blocking &&
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />}
                      </Space>
                      {stage.status !== 'pending' && (
                        <span style={{
                          padding: '1px 8px', borderRadius: 10, fontSize: 11,
                          background: sd.bg, lineHeight: '20px',
                        }}>
                          {metricSnippet}
                        </span>
                      )}
                      {stage.status === 'pending' && (
                        <Tag style={{ fontSize: 10 }}>⏳ 待执行</Tag>
                      )}
                    </div>
                  ),
                  children: <StageTabContent stage={stage} stageDef={sd} />,
                };
              })}
            />
          </Card>

          {/* 历史记录入口 */}
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Button type="link" icon={<EyeOutlined />}>查看历史执行记录</Button>
          </div>
        </>
      ) : (
        <Card size="small" style={{ textAlign: 'center', padding: 40 }}>
          <ExperimentOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Typography.Title level={5} style={{ color: '#999' }}>暂无执行记录</Typography.Title>
        </Card>
      )}

      {/* 图例 */}
      <Card size="small" style={{ marginTop: 12, background: '#f6f8fa' }}>
        <Space size={24}>
          <Space size={4}><Tag color="red" style={{ fontSize: 10 }}>⛔ 阻断型</Tag>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>暂停流程，需分配人员完成操作后继续</Typography.Text></Space>
          <Space size={4}><Tag color="default" style={{ fontSize: 10 }}>📝 非阻断型</Tag>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>流程运行中可随时反馈，不阻塞执行</Typography.Text></Space>
        </Space>
      </Card>
    </div>
  );
}
