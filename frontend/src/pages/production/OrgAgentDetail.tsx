import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Space, Tag, Button, Statistic,
  Table, Drawer, Input, Rate, Select, Divider, Descriptions, message,
  Alert, Badge,
} from 'antd';
import {
  SendOutlined, LockOutlined, ArrowLeftOutlined,
  SafetyOutlined, FileSearchOutlined, ThunderboltOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import type { ExecStepWithFeedback, FeedbackCoverageStatus } from '../../types';
import StepDetailPanel from '../../components/production/StepDetailPanel';
import FeedbackCoverageBadge from '../../components/production/FeedbackCoverageBadge';

// ===== Mock: 增强的执行历史（含多角色反馈） =====
interface ExecRecord {
  id: string; input: string; status: string; steps: ExecStepWithFeedback[];
  duration: number; feedback: number; time: string;
}

const EXECUTIONS_WITH_FEEDBACK: Record<string, ExecRecord[]> = {
  quality_return_defense: [
    {
      id: 'QRD-001', input: '扫描今日高品退风险SKU', status: 'completed',
      duration: 3.5, feedback: 4, time: '2026-05-09 10:30',
      steps: [
        {
          id: 'q1s1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'quality_return_defense',
          input: '扫描今日高品退风险SKU', output: '拆解为3个子任务: 商品查询→风险扫描→告警生成',
          duration_ms: 280, details: 'LLM分析用户意图，识别出需要先查商品再扫风险最后告警',
          feedback_entries: [
            { id: 'fb-q1s1-1', type: 'suggestion', content: '意图拆解准确，但建议补充对历史风险SKU的参考', created_by: '运营A', operator_role: '品质审核组', coverage_status: 'covered' as FeedbackCoverageStatus, replies: [{ id: 'r1', user: '训练团队-李', user_role: '训练团队', content: '已在v2.1.1中优化', created_at: '2026-05-10' }], created_at: '2026-05-09 11:00' },
          ],
        },
        {
          id: 'q1s2', name: 'SKILL: 商品查询', type: 'skill_call', status: 'success', agent: 'quality_return_defense',
          input: 'product_scan --date=today --status=new --category=all', output: '查询到 2,341 件新增商品，其中美妆类目 892 件（38.1%）', duration_ms: 420,
          feedback_entries: [
            { id: 'fb-q1s2-1', type: 'correction', content: '查询范围缺乏类目筛选，返回太多无关商品', created_by: '运营B', operator_role: '数据运营组', annotation: '应增加类目参数缩小范围', annotation_label: 'incorrect', coverage_status: 'in_iteration' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 11:15' },
          ],
        },
        {
          id: 'q1s3', name: 'SKILL: 风险扫描', type: 'skill_call', status: 'success', agent: 'quality_return_defense',
          input: 'risk_scan --products=2341 --threshold=high --metrics=return_rate,complaint_rate', output: '高风险 2 件 (虚假交易92分, 夸大宣传87分), 中风险 15 件, 低风险 89 件', duration_ms: 1800,
          feedback_entries: [
            { id: 'fb-q1s3-1', type: 'suggestion', content: '高风险阈值偏高，建议增加medium档位覆盖，上周就有3单中等风险升级为品退', created_by: '运营C', operator_role: '品质审核组', rating: 3, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 11:30' },
            { id: 'fb-q1s3-2', type: 'annotation', content: '高风险商品鉴定结果与我方排查一致，标注为正确', created_by: '运营A', operator_role: '品质审核组', annotation: '排查结果一致，确认准确', annotation_label: 'correct', coverage_status: 'verified' as FeedbackCoverageStatus, resolved_in_iteration: 'ITER-003', replies: [{ id: 'r2', user: '训练团队-王', user_role: '训练团队', content: '该反馈已在 ITER-003 中验证通过，确认修复', created_at: '2026-05-11' }], created_at: '2026-05-09 12:00' },
          ],
        },
        {
          id: 'q1s4', name: 'LLM: 结果分析', type: 'llm_reason', status: 'success', agent: 'quality_return_defense',
          input: '风险扫描结果: 高2中15低89', output: '高风险商品: P88421(虚假交易 92分, 近7天退货率34.2%), P88435(夸大宣传 87分)。建议: 1)立即下架P88421并启动调查 2)P88435限制流量观察', duration_ms: 650, details: 'LLM结合退货率数据和风险分数综合生成处置建议',
          feedback_entries: [
            { id: 'fb-q1s4-1', type: 'suggestion', content: '处置建议非常具体，但P88421的违规条款引用缺失，建议补充具体违反的平台规则条款号', created_by: '运营B', operator_role: '数据运营组', rating: 4, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 14:00' },
            { id: 'fb-q1s4-2', type: 'rating', content: '分析质量满意', created_by: '运营A', operator_role: '品质审核组', rating: 5, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 12:30' },
          ],
        },
        {
          id: 'q1s5', name: 'SKILL: 告警生成', type: 'skill_call', status: 'success', agent: 'quality_return_defense',
          input: 'alert_generate --high=2 --medium=15 --details="..." --push-to=risk_platform', output: '已生成 2 条高风险告警 (已推送至风险平台), 15 条中风险告警 (标记待处理)', duration_ms: 350,
          feedback_entries: [],
        },
      ],
    },
    {
      id: 'QRD-002', input: '分析美妆类目品退趋势', status: 'completed',
      duration: 2.1, feedback: 1, time: '2026-05-09 09:00',
      steps: [
        { id: 'q2s1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'quality_return_defense', input: '分析美妆类目品退趋势', output: '执行品退趋势分析流程', duration_ms: 200, feedback_entries: [], details: '' },
        { id: 'q2s2', name: 'SKILL: 数据查询', type: 'skill_call', status: 'success', agent: 'quality_return_defense', input: 'data_analysis --query="美妆类目近30天品退率趋势"', output: '美妆类目品退率 2.34%↑，环比上升0.28个百分点', duration_ms: 800, feedback_entries: [{ id: 'fb-q2s2-1', type: 'suggestion', content: '数据维度不够细，建议按子类目（护肤/彩妆/香水）拆分展示', created_by: '运营C', operator_role: '品质审核组', coverage_status: 'in_iteration' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 10:00' }] },
        { id: 'q2s3', name: 'LLM: 趋势分析', type: 'llm_reason', status: 'success', agent: 'quality_return_defense', input: '品退趋势数据', output: '美妆品退率连续3月上升，主要驱动因素是防晒品类(贡献42%增量)', duration_ms: 500, feedback_entries: [] },
      ],
    },
    { id: 'QRD-003', input: '前置拦截高风险商品上架', status: 'completed', duration: 2.8, feedback: 2, time: '2026-05-08 16:20', steps: [{ id: 'q3s1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'quality_return_defense', input: '前置拦截高风险商品上架', output: '执行前置拦截检查', duration_ms: 250, feedback_entries: [], details: '' }, { id: 'q3s2', name: 'SKILL: 商品查询', type: 'skill_call', status: 'success', agent: 'quality_return_defense', input: 'product_scan --status=pending_review --risk=high', output: '查询到 156 件待审核高风险商品', duration_ms: 350, feedback_entries: [] }, { id: 'q3s3', name: 'SKILL: 风险扫描', type: 'skill_call', status: 'success', agent: 'quality_return_defense', input: 'risk_scan --products=156 --threshold=all', output: '高风险12件，建议拦截', duration_ms: 1200, feedback_entries: [{ id: 'fb-q3s3-1', type: 'annotation', content: '拦截建议合理', created_by: '运营A', operator_role: '品质审核组', annotation: '12件高风险商品确实存在违规', annotation_label: 'correct', coverage_status: 'covered' as FeedbackCoverageStatus, resolved_in_iteration: 'ITER-002', replies: [], created_at: '2026-05-09' }] }, { id: 'q3s4', name: 'SKILL: 告警生成', type: 'skill_call', status: 'success', agent: 'quality_return_defense', input: 'alert_generate --high=12 --push-to=intercept', output: '12件高风险商品已拦截', duration_ms: 300, feedback_entries: [{ id: 'fb-q3s4-1', type: 'rating', content: '拦截及时准确', created_by: '运营B', operator_role: '数据运营组', rating: 5, coverage_status: 'verified' as FeedbackCoverageStatus, resolved_in_iteration: 'ITER-002', replies: [], created_at: '2026-05-09' }] }] },
  ],
  risk_water_level: [
    {
      id: 'RWL-001', input: '执行全量风险水位巡检', status: 'completed',
      duration: 2.3, feedback: 1, time: '2026-05-09 08:00',
      steps: [
        { id: 'r1s1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'risk_water_level', input: '执行全量风险水位巡检', output: '启动全域风险水位巡检流程', duration_ms: 200, feedback_entries: [], details: '' },
        { id: 'r1s2', name: 'SKILL: 大盘巡检', type: 'skill_call', status: 'success', agent: 'risk_water_level', input: 'risk_scan --scope=global --metrics=all', output: '156项监控指标，3项异常（虚假交易2.1%↑、退款率0.8%↑、客诉量5.3%↑）', duration_ms: 1500, feedback_entries: [{ id: 'fb-r1s2-1', type: 'suggestion', content: '退款率的涨幅虽然只有0.8%但趋势连续3周了，建议标记为重点关注', created_by: '运营D', operator_role: '风险监控组', coverage_status: 'covered' as FeedbackCoverageStatus, replies: [{ id: 'r3', user: '训练团队-李', user_role: '训练团队', content: '已在巡检规则中增加趋势持续性判断逻辑', created_at: '2026-05-10' }], created_at: '2026-05-09 09:00' }] },
        { id: 'r1s3', name: 'LLM: 异常判定', type: 'llm_reason', status: 'success', agent: 'risk_water_level', input: '巡检结果: 3项异常', output: '虚假交易: 周同比+2.1%达警戒线, 退款率: 连续3周上升, 客诉: 受大促影响波动', duration_ms: 450, feedback_entries: [] },
        { id: 'r1s4', name: 'SKILL: 告警生成', type: 'skill_call', status: 'success', agent: 'risk_water_level', input: 'alert_generate --anomalies=3 --priorities=high', output: '已生成3条异常告警', duration_ms: 280, feedback_entries: [] },
      ],
    },
    { id: 'RWL-002', input: '排查风险指标异常波动', status: 'partial', duration: 1.8, feedback: 2, time: '2026-05-08 22:00', steps: [{ id: 'r2s1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'risk_water_level', input: '排查风险指标异常波动', output: '定位异常指标', duration_ms: 150, feedback_entries: [], details: '' }, { id: 'r2s2', name: 'SKILL: 数据查询', type: 'skill_call', status: 'success', agent: 'risk_water_level', input: 'data_analysis --query="异常指标归因分析"', output: '主要异常来源: 大促活动期间流量波动', duration_ms: 600, feedback_entries: [{ id: 'fb-r2s2-1', type: 'annotation', content: '归因不够深入', created_by: '运营E', operator_role: '风险监控组', annotation: '应该区分自然流量和付费流量的风险差异', annotation_label: 'partial', coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-08' }] }, { id: 'r2s3', name: 'LLM: 排查报告', type: 'llm_reason', status: 'failure', agent: 'risk_water_level', input: '异常归因分析结果', output: '排查报告生成失败: 数据不完整', duration_ms: 800, feedback_entries: [{ id: 'fb-r2s3-1', type: 'correction', content: '步骤执行失败，因为缺少大促历史基线的对比数据', created_by: '运营D', operator_role: '风险监控组', coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-08' }] }] },
  ],
  report_crackdown: [
    {
      id: 'RPC-001', input: '处理虚假宣传举报队列', status: 'completed',
      duration: 3.2, feedback: 5, time: '2026-05-09 11:00',
      steps: [
        { id: 'c1s1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'report_crackdown', input: '处理虚假宣传举报队列', output: '批量处理举报队列', duration_ms: 200, feedback_entries: [], details: '' },
        { id: 'c1s2', name: 'SKILL: 举报处理', type: 'skill_call', status: 'success', agent: 'report_crackdown', input: 'report_process --queue=pending --type=虚假宣传', output: '获取到 234 条待处理举报', duration_ms: 500, feedback_entries: [{ id: 'fb-c1s2-1', type: 'suggestion', content: '建议按店铺信誉分排序优先处理高风险店铺', created_by: '运营F', operator_role: '举报处理组', coverage_status: 'covered' as FeedbackCoverageStatus, resolved_in_iteration: 'ITER-003', replies: [], created_at: '2026-05-09' }] },
        { id: 'c1s3', name: 'SKILL: 泛化识别', type: 'skill_call', status: 'success', agent: 'report_crackdown', input: 'generalize --from=234 --strategy=image_similar,title_match', output: '泛化识别出 1,247 件同类违规商品', duration_ms: 2000, feedback_entries: [{ id: 'fb-c1s3-1', type: 'annotation', content: '泛化覆盖率偏低，漏掉了部分标题变形商品', created_by: '运营G', operator_role: '举报处理组', annotation: '部分使用特殊符号变形的标题未被识别', annotation_label: 'partial', coverage_status: 'in_iteration' as FeedbackCoverageStatus, replies: [{ id: 'r4', user: '训练团队-王', user_role: '训练团队', content: '正在优化标题标准化模块', created_at: '2026-05-10' }], created_at: '2026-05-09' }, { id: 'fb-c1s3-2', type: 'annotation', content: '泛化准确率可以接受', created_by: '运营H', operator_role: '风险治理组', annotation: '匹配逻辑基本准确', annotation_label: 'correct', coverage_status: 'verified' as FeedbackCoverageStatus, resolved_in_iteration: 'ITER-002', replies: [], created_at: '2026-05-09' }] },
        { id: 'c1s4', name: 'SKILL: 打压处置', type: 'skill_call', status: 'success', agent: 'report_crackdown', input: 'crackdown --ids=1247 --action=down', output: '已打压处置 1,247 件，其中删除 892 件、限流 355 件', duration_ms: 800, feedback_entries: [{ id: 'fb-c1s4-1', type: 'rating', content: '处置效率高', created_by: '运营F', operator_role: '举报处理组', rating: 5, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09' }, { id: 'fb-c1s4-2', type: 'suggestion', content: '建议增加处置后的效果追踪环节，监控打压后是否复发', created_by: '运营G', operator_role: '举报处理组', rating: 4, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09' }] },
      ],
    },
    { id: 'RPC-002', input: '泛化识别相似违规商品', status: 'completed', duration: 2.5, feedback: 3, time: '2026-05-09 10:00', steps: [{ id: 'c2s1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'report_crackdown', input: '泛化识别相似违规商品', output: '执行泛化识别流程', duration_ms: 180, feedback_entries: [], details: '' }, { id: 'c2s2', name: 'SKILL: 图片识别', type: 'skill_call', status: 'success', agent: 'report_crackdown', input: 'image_match --seed=SAMPLE-001 --threshold=0.85', output: '识别到 523 件图片相似商品', duration_ms: 1500, feedback_entries: [{ id: 'fb-c2s2-1', type: 'correction', content: '阈值0.85偏高导致漏检，建议调整为0.75', created_by: '运营G', operator_role: '举报处理组', coverage_status: 'in_iteration' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09' }] }, { id: 'c2s3', name: 'LLM: 相似度验证', type: 'llm_reason', status: 'success', agent: 'report_crackdown', input: '图片识别结果: 523件', output: '确认为同款违规商品: 498件，疑似: 25件', duration_ms: 600, feedback_entries: [{ id: 'fb-c2s3-1', type: 'rating', content: '验证结果准确', created_by: '运营H', operator_role: '风险治理组', rating: 4, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09' }] }, { id: 'c2s4', name: 'SKILL: 打压处置', type: 'skill_call', status: 'success', agent: 'report_crackdown', input: 'crackdown --ids=523 --action=down', output: '处置完成 523 件', duration_ms: 400, feedback_entries: [] }] },
  ],
};

const AGENT_CONFIGS: Record<string, {
  display_name: string; icon: React.ReactNode; description: string;
  kpis: Record<string, { label: string; value: number | string; unit: string; color?: string }>;
  outputs: { label: string; description: string; count: number; trend: string }[];
}> = {
  quality_return_defense: {
    display_name: '品退感知智能防控', icon: <SafetyOutlined />,
    description: '基于品质退货数据，智能感知商品质量风险，前置拦截问题商品',
    kpis: { monitor: { label: '监控SKU', value: 125000, unit: '个' }, intercept: { label: '前置拦截', value: 3421, unit: '次', color: '#52c41a' }, reduced: { label: '品退下降', value: 18.5, unit: '%', color: '#1677ff' }, accuracy: { label: '识别准确率', value: 94.7, unit: '%', color: '#ff4d4f' } },
    outputs: [
      { label: '品退预警', description: '识别并推送的高品退风险商品', count: 892, trend: '+8%' },
      { label: '拦截记录', description: '已前置拦截的问题商品清单', count: 3421, trend: '+15%' },
      { label: '品退分析报告', description: '品退归因和趋势分析', count: 12, trend: '+2' },
    ],
  },
  risk_water_level: {
    display_name: '大盘风险水位巡检', icon: <FileSearchOutlined />,
    description: '全域风险水位监控，自动巡检各业务线风险指标，及时发现异常波动',
    kpis: { metrics: { label: '监控指标', value: 156, unit: '项' }, anomalies: { label: '异常发现', value: 234, unit: '次', color: '#ff4d4f' }, coverage: { label: '巡检覆盖率', value: 98.5, unit: '%', color: '#52c41a' }, response: { label: '平均响应', value: 2.3, unit: 'min', color: '#1677ff' } },
    outputs: [
      { label: '水位日报', description: '每日风险水位巡检报告', count: 42, trend: '+0%' },
      { label: '异常告警', description: '水位异常波动的即时告警', count: 234, trend: '-5%' },
      { label: '趋势分析', description: '各业务线风险水位趋势', count: 12, trend: '+1' },
    ],
  },
  report_crackdown: {
    display_name: '举报实时泛化打压', icon: <ThunderboltOutlined />,
    description: '基于用户举报信号，实时泛化识别同类风险，自动化打压处置',
    kpis: { reports: { label: '处理举报', value: 23410, unit: '条' }, generalization: { label: '泛化识别', value: 8920, unit: '条', color: '#52c41a' }, crackdown: { label: '打压处置', value: 5670, unit: '次', color: '#ff4d4f' }, accuracy: { label: '泛化准确率', value: 92.3, unit: '%', color: '#1677ff' } },
    outputs: [
      { label: '举报处理', description: '已处理的用户举报', count: 23410, trend: '+12%' },
      { label: '泛化识别', description: '基于举报泛化识别的同类风险', count: 8920, trend: '+20%' },
      { label: '打压处置', description: '已完成的风险打压处置', count: 5670, trend: '+18%' },
    ],
  },
};

export default function OrgAgentDetail() {
  const { name = 'quality_return_defense' } = useParams();
  const navigate = useNavigate();
  const config = AGENT_CONFIGS[name] || AGENT_CONFIGS['quality_return_defense'];
  const executions = EXECUTIONS_WITH_FEEDBACK[name] || EXECUTIONS_WITH_FEEDBACK['quality_return_defense'];

  const [selectedExec, setSelectedExec] = useState<ExecRecord | null>(null);
  const [feedbackStep, setFeedbackStep] = useState<{ execId: string; stepId: string } | null>(null);
  const [fbType, setFbType] = useState('suggestion');
  const [fbContent, setFbContent] = useState('');
  const [fbRating, setFbRating] = useState(0);
  const [fbRole, setFbRole] = useState('品质审核组');
  const [fbAnnotation, setFbAnnotation] = useState('');
  const [fbAnnotationLabel, setFbAnnotationLabel] = useState<string>('');
  const [fbExpected, setFbExpected] = useState('');

  const execColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 110 },
    { title: '输入', dataIndex: 'input', key: 'input', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => <Tag color={s === 'completed' ? 'green' : 'orange'}>{s === 'completed' ? '成功' : '部分成功'}</Tag> },
    { title: '步骤', dataIndex: 'steps', key: 'steps', width: 60, render: (steps: ExecStepWithFeedback[]) => steps.length },
    { title: '耗时', dataIndex: 'duration', key: 'duration', width: 70, render: (d: number) => `${d}s` },
    { title: '反馈数', dataIndex: 'feedback', key: 'feedback', width: 70, render: (f: number) => f > 0 ? <Badge count={f} size="small" style={{ backgroundColor: '#1677ff' }} /> : '-' },
    {
      title: '反馈覆盖', key: 'coverage', width: 100,
      render: (_: unknown, record: ExecRecord) => {
        const entries = record.steps.flatMap(s => s.feedback_entries);
        const pending = entries.filter(e => e.coverage_status === 'pending').length;
        const inIter = entries.filter(e => e.coverage_status === 'in_iteration').length;
        const covered = entries.filter(e => e.coverage_status === 'covered' || e.coverage_status === 'verified').length;
        return (
          <Space size={2}>
            {pending > 0 && <FeedbackCoverageBadge status="pending" />}
            {inIter > 0 && <FeedbackCoverageBadge status="in_iteration" />}
            {covered > 0 && <FeedbackCoverageBadge status="covered" />}
            {entries.length === 0 && <Typography.Text type="secondary" style={{ fontSize: 11 }}>暂无</Typography.Text>}
          </Space>
        );
      },
    },
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: unknown, record: ExecRecord) => <Button size="small" onClick={() => setSelectedExec(record)}>详情</Button>,
    },
  ];

  // Compute stats for the execution summary
  const totalFeedback = executions.reduce((sum, e) => sum + e.feedback, 0);
  const totalEntries = executions.flatMap(e => e.steps.flatMap(s => s.feedback_entries));
  const pendingCount = totalEntries.filter(e => e.coverage_status === 'pending').length;
  const inIterCount = totalEntries.filter(e => e.coverage_status === 'in_iteration').length;
  const coveredCount = totalEntries.filter(e => e.coverage_status === 'covered' || e.coverage_status === 'verified').length;

  const handleSubmitFeedback = () => {
    if (!fbContent.trim()) {
      message.warning('请输入反馈内容');
      return;
    }
    message.success('反馈提交成功！将会汇聚到训练调试轨');
    setFeedbackStep(null);
    resetFeedbackForm();
  };

  const resetFeedbackForm = () => {
    setFbContent('');
    setFbRating(0);
    setFbAnnotation('');
    setFbAnnotationLabel('');
    setFbExpected('');
    setFbType('suggestion');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/production')} />
          {config.icon}
          <Typography.Title level={4} style={{ margin: 0 }}>{config.display_name}</Typography.Title>
          <Tag color="green">组织 Agent</Tag>
        </Space>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, marginLeft: 64 }}>
          {config.description}
        </Typography.Text>
      </div>

      {/* KPI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {Object.entries(config.kpis).map(([key, kpi]) => (
          <Col span={6} key={key}>
            <Card size="small">
              <Statistic title={kpi.label} value={kpi.value} suffix={kpi.unit} valueStyle={{ color: kpi.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Outputs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {config.outputs.map((output, i) => (
          <Col span={8} key={i}>
            <Card size="small" hoverable>
              <Statistic title={output.label} value={output.count} suffix={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{output.trend}</Typography.Text>} />
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{output.description}</Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Feedback Coverage Summary */}
      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="累计反馈" value={totalFeedback} suffix={<ExperimentOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="待处理" value={pendingCount} valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={6}>
            <Statistic title="迭代中" value={inIterCount} valueStyle={{ color: '#1677ff' }} />
          </Col>
          <Col span={6}>
            <Statistic title="已覆盖/已验证" value={coveredCount} valueStyle={{ color: '#52c41a' }} />
          </Col>
        </Row>
      </Card>

      {/* Execution History */}
      <Card size="small" title={`📋 执行历史 (${executions.length})`}>
        <Table
          dataSource={executions}
          columns={execColumns}
          rowKey="id"
          pagination={false}
          size="middle"
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 0' }}>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>执行步骤快速预览</Typography.Text>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  {record.steps.map((step, i) => (
                    <Tag key={step.id} color={step.status === 'success' ? 'green' : 'red'} style={{ fontSize: 10, lineHeight: '18px' }}>
                      {i + 1}. {step.name} ({step.feedback_entries.length}条反馈)
                    </Tag>
                  ))}
                </div>
              </div>
            ),
            rowExpandable: () => true,
          }}
        />
      </Card>

      {/* Execution Detail Drawer */}
      <Drawer
        title={
          <Space>
            <span>执行详情 — {selectedExec?.id}</span>
            <Tag icon={<LockOutlined />} color="red">只读·不可干预</Tag>
            {selectedExec && (
              <FeedbackCoverageBadge status={
                selectedExec.steps.flatMap(s => s.feedback_entries).some(e => e.coverage_status === 'pending')
                  ? 'pending'
                  : selectedExec.steps.flatMap(s => s.feedback_entries).some(e => e.coverage_status === 'in_iteration')
                    ? 'in_iteration'
                    : 'covered'
              } />
            )}
          </Space>
        }
        placement="right"
        width={800}
        onClose={() => setSelectedExec(null)}
        open={!!selectedExec}
      >
        {selectedExec && (
          <div>
            <Alert
              message="这是组织 Agent 的执行记录，你可以查看完整执行链路和多角色反馈。"
              description="对每个执行步骤提交反馈建议，反馈会汇聚到训练调试轨。不同角色的反馈会独立记录，便于对比分析和迭代优化。"
              type="info" showIcon icon={<LockOutlined />}
              style={{ marginBottom: 16 }}
            />

            {/* Execution Summary */}
            <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="输入" span={2}>{selectedExec.input}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={selectedExec.status === 'completed' ? 'green' : 'orange'}>{selectedExec.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="总耗时">{selectedExec.duration}s</Descriptions.Item>
              <Descriptions.Item label="步骤数">{selectedExec.steps.length}</Descriptions.Item>
              <Descriptions.Item label="反馈数">{selectedExec.steps.flatMap(s => s.feedback_entries).length}</Descriptions.Item>
              <Descriptions.Item label="时间" span={2}>{selectedExec.time}</Descriptions.Item>
            </Descriptions>

            {/* Enhanced Step Timeline */}
            <Typography.Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>执行步骤链路（含多角色反馈）</Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
              每个步骤展示输入/输出、多角色反馈、标注对比、以及反馈的迭代覆盖状态
            </Typography.Text>

            <div>
              {selectedExec.steps.map((step, idx) => (
                <div key={step.id} style={{ position: 'relative', paddingLeft: 28, marginBottom: 8 }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute', left: 0, top: 10,
                    width: 16, height: 16, borderRadius: '50%',
                    background: step.status === 'success' ? '#52c41a' : '#ff4d4f',
                    border: '2px solid #fff', boxShadow: '0 0 0 2px #f0f0f0',
                  }} />
                  {idx < selectedExec.steps.length - 1 && (
                    <div style={{ position: 'absolute', left: 7, top: 28, width: 2, height: 'calc(100% - 8px)', background: '#f0f0f0' }} />
                  )}
                  <StepDetailPanel
                    step={step}
                    execId={selectedExec.id}
                    onFeedbackClick={(execId, stepId) => setFeedbackStep({ execId, stepId })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* Feedback Submission Drawer */}
      <Drawer
        title={
          <Space>
            <span>提交反馈建议</span>
            <Tag color="orange">步骤: {feedbackStep?.stepId}</Tag>
          </Space>
        }
        placement="right"
        width={520}
        onClose={() => { setFeedbackStep(null); resetFeedbackForm(); }}
        open={!!feedbackStep}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="💡 你提交的是「反馈建议」而非直接修改"
            description="组织 Agent 的执行逻辑由训练团队集中管控。你的反馈将被汇聚到训练调试轨，多个运营的相同反馈权重更高。不同角色的标注结果会并排展示供对比。"
            type="warning" showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Role selector */}
          <Typography.Text strong>你的角色</Typography.Text>
          <Select value={fbRole} onChange={setFbRole} style={{ width: '100%' }} options={[
            { value: '品质审核组', label: '👤 品质审核组' },
            { value: '数据运营组', label: '👤 数据运营组' },
            { value: '举报处理组', label: '👤 举报处理组' },
            { value: '风险监控组', label: '👤 风险监控组' },
            { value: '风险治理组', label: '👤 风险治理组' },
          ]} />

          <Typography.Text strong>反馈类型</Typography.Text>
          <Select value={fbType} onChange={setFbType} style={{ width: '100%' }} options={[
            { value: 'suggestion', label: '💡 改进建议 — 建议如何优化执行过程' },
            { value: 'correction', label: '🔧 纠错 — 指出执行中的错误或偏差' },
            { value: 'annotation', label: '📝 结果标注 — 标记输出是否符合预期（将参与多角色标注对比）' },
            { value: 'rating', label: '⭐ 评分 — 对执行质量打分' },
            { value: 'approval', label: '✅ 认可 — 确认执行结果正确' },
          ]} />

          {/* Annotation fields */}
          {fbType === 'annotation' && (
            <>
              <Typography.Text strong>标注判定</Typography.Text>
              <Select value={fbAnnotationLabel} onChange={setFbAnnotationLabel} style={{ width: '100%' }} options={[
                { value: 'correct', label: '✅ 正确 — 输出符合预期' },
                { value: 'incorrect', label: '❌ 不正确 — 输出有误' },
                { value: 'partial', label: '⚠️ 部分正确 — 需要补充' },
                { value: 'uncertain', label: '❓ 不确定 — 无法判定' },
              ]} />
              <Typography.Text strong>标注说明</Typography.Text>
              <Input.TextArea rows={3} value={fbAnnotation} onChange={e => setFbAnnotation(e.target.value)} placeholder="详细说明你的标注理由..." />
            </>
          )}

          {fbType === 'rating' && (
            <>
              <Typography.Text strong>评分</Typography.Text>
              <Rate value={fbRating} onChange={setFbRating} />
            </>
          )}

          <Typography.Text strong>详细反馈内容</Typography.Text>
          <Input.TextArea rows={4} value={fbContent} onChange={e => setFbContent(e.target.value)} placeholder={
            fbType === 'suggestion' ? '请描述你的改进建议...' :
            fbType === 'correction' ? '请描述你认为有误的地方及其原因...' :
            fbType === 'annotation' ? '补充标注说明（可选）' :
            fbType === 'rating' ? '可选补充评分说明...' : '请描述...'
          } />

          <Typography.Text strong>预期输出（可选）</Typography.Text>
          <Input.TextArea rows={2} value={fbExpected} onChange={e => setFbExpected(e.target.value)} placeholder="如果你期望不同的输出，请描述期望结果" />

          <Divider />
          <Button type="primary" icon={<SendOutlined />} block onClick={handleSubmitFeedback}>
            提交反馈 — 将汇聚到训练调试轨
          </Button>
          <Typography.Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
            🎯 每条反馈都在帮助组织 Agent 变得更好
          </Typography.Text>
        </Space>
      </Drawer>
    </div>
  );
}
