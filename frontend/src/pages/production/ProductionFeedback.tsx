import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Typography, Space, Button,
  Drawer, Descriptions, Input, Rate, Select, Row, Col,
  Statistic, Divider, Alert, message,
} from 'antd';
import {
  EyeOutlined, SendOutlined, MessageOutlined,
  FlagOutlined, LockOutlined, FilterOutlined,
} from '@ant-design/icons';
import type { ExecStepWithFeedback, FeedbackCoverageStatus } from '../../types';
import StepDetailPanel from '../../components/production/StepDetailPanel';
import FeedbackCoverageBadge from '../../components/production/FeedbackCoverageBadge';

// ===== Mock: 带多角色反馈的执行日志 =====
const MOCK_EXECUTIONS_WITH_FEEDBACK: Array<{
  id: string; agent_name: string; agent_display_name: string;
  mode: string; status: string; input: string;
  steps: ExecStepWithFeedback[]; created_at: string; duration_ms: number;
}> = [
  {
    id: 'EXEC-001', agent_name: 'risk_agent', agent_display_name: '风险感知 Agent',
    mode: 'execute', status: 'completed', input: '扫描今日新增商品风险',
    steps: [
      {
        id: 'ps1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'risk_agent',
        input: '扫描今日新增商品风险',
        output: '拆解为3个子任务: 商品查询→风险扫描→告警生成',
        duration_ms: 280, details: 'LLM分析用户意图，拆解为顺序执行步骤',
        feedback_entries: [],
      },
      {
        id: 'ps2', name: 'SKILL: 商品查询', type: 'skill_call', status: 'success', agent: 'risk_agent',
        input: 'product_scan --date=today --status=new',
        output: '查询到 2,341 件新增商品',
        duration_ms: 420,
        feedback_entries: [
          { id: 'fb-ps2-1', type: 'suggestion', content: '建议增加按类目维度返回统计数据，方便快速了解分布', created_by: '运营A', operator_role: '品质审核组', coverage_status: 'covered' as FeedbackCoverageStatus, replies: [{ id: 'r1', user: '训练团队-李', user_role: '训练团队', content: '已在下个版本增加类目聚合统计', created_at: '2026-05-10' }], created_at: '2026-05-09 11:00' },
          { id: 'fb-ps2-2', type: 'correction', content: '查询范围缺少status参数，混入了已处理的历史商品', created_by: '运营B', operator_role: '数据运营组', annotation: '应添加 status=new 参数', annotation_label: 'incorrect', coverage_status: 'in_iteration' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 11:30' },
        ],
      },
      {
        id: 'ps3', name: 'SKILL: 风险扫描', type: 'skill_call', status: 'success', agent: 'risk_agent',
        input: 'risk_scan --products=2341 --threshold=high',
        output: '高风险 2 件, 中风险 15 件, 低风险 89 件',
        duration_ms: 1800,
        feedback_entries: [
          { id: 'fb-ps3-1', type: 'correction', content: '风险扫描的阈值设置过高(threshold=high)，导致部分中等风险商品被遗漏。建议将阈值调整为medium以扩大召回', created_by: '运营B', operator_role: '数据运营组', rating: 3, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 11:15' },
          { id: 'fb-ps3-2', type: 'annotation', content: '高风险商品鉴定结果与我方排查一致，确认准确', created_by: '运营A', operator_role: '品质审核组', annotation: '排查结果一致，高风险商品清单准确', annotation_label: 'correct', coverage_status: 'verified' as FeedbackCoverageStatus, resolved_in_iteration: 'ITER-003', replies: [{ id: 'r2', user: '训练团队-王', user_role: '训练团队', content: '该案例已在 ITER-003 中闭环', created_at: '2026-05-11' }], created_at: '2026-05-09 12:00' },
        ],
      },
      {
        id: 'ps4', name: 'LLM: 结果分析', type: 'llm_reason', status: 'success', agent: 'risk_agent',
        input: '风险扫描结果: 高2中15低89',
        output: '高风险商品: P88421(虚假交易 92分), P88435(夸大宣传 87分)。建议生成告警并启动调查',
        duration_ms: 650, details: 'LLM分析风险数据，生成处置建议',
        feedback_entries: [
          { id: 'fb-ps4-1', type: 'suggestion', content: 'LLM结果分析步骤中，对于高风险商品的处置建议不够具体，建议补充：1)具体的违规条款 2)建议的处罚力度 3)历史类似案例参考', created_by: '运营A', operator_role: '品质审核组', rating: 4, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [{ id: 'r3', user: '训练团队-李', user_role: '训练团队', content: '已记录，将在下一迭代优化LLM的分析模板', created_at: '2026-05-09 11:30' }], created_at: '2026-05-09 11:00' },
          { id: 'fb-ps4-2', type: 'rating', content: '分析逻辑基本合理', created_by: '运营C', operator_role: '风险监控组', rating: 4, coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 14:00' },
        ],
      },
      {
        id: 'ps5', name: 'SKILL: 告警生成', type: 'skill_call', status: 'success', agent: 'risk_agent',
        input: 'alert_generate --high=2 --medium=15',
        output: '已生成 2 条高风险告警, 15 条中风险告警',
        duration_ms: 350,
        feedback_entries: [
          { id: 'fb-ps5-1', type: 'rating', content: '告警生成质量满意，内容完整结构清晰', created_by: '运营A', operator_role: '品质审核组', rating: 5, coverage_status: 'verified' as FeedbackCoverageStatus, resolved_in_iteration: 'ITER-002', replies: [], created_at: '2026-05-09 11:05' },
        ],
      },
    ],
    created_at: '2026-05-09 10:30:00', duration_ms: 3500,
  },
  {
    id: 'EXEC-002', agent_name: 'inspection_agent', agent_display_name: '巡检 Agent',
    mode: 'execute', status: 'completed', input: '执行店铺资质巡检',
    steps: [
      { id: 'qs1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'inspection_agent', input: '执行店铺资质巡检', output: '执行店铺资质巡检流程', duration_ms: 200, feedback_entries: [], details: '' },
      { id: 'qs2', name: 'SKILL: 店铺查询', type: 'skill_call', status: 'success', agent: 'inspection_agent', input: 'product_scan --type=shop --status=active', output: '查询到 567 家店铺', duration_ms: 350, feedback_entries: [{ id: 'fb-qs2-1', type: 'suggestion', content: '建议按信誉分排序，高信誉店铺可降低巡检频次', created_by: '运营C', operator_role: '风险监控组', coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-09 10:30' }] },
      { id: 'qs3', name: 'SKILL: 资质核验', type: 'skill_call', status: 'success', agent: 'inspection_agent', input: 'review_score --items=567 --type=qualification', output: '6 家资质过期, 12 家即将过期', duration_ms: 1200, feedback_entries: [{ id: 'fb-qs3-1', type: 'annotation', content: 'OCR识别准确率约92%，模糊证件照识别失败率较高', created_by: '运营C', operator_role: '风险监控组', annotation: 'OCR对模糊证件照识别失败率约15%', annotation_label: 'partial', coverage_status: 'in_iteration' as FeedbackCoverageStatus, replies: [{ id: 'r4', user: '训练团队-王', user_role: '训练团队', content: '已收集相关case加入训练数据集 TD-002', created_at: '2026-05-09 10:30' }], created_at: '2026-05-09 10:00' }] },
      { id: 'qs4', name: 'LLM: 结果分析', type: 'llm_reason', status: 'success', agent: 'inspection_agent', input: '资质核验结果: 6过期12即将过期', output: '过期店铺: XX旗舰店等6家。建议: 发送整改通知, 24h内未处理则限制经营', duration_ms: 500, feedback_entries: [] },
    ],
    created_at: '2026-05-09 09:15:00', duration_ms: 2250,
  },
  {
    id: 'EXEC-003', agent_name: 'risk_agent', agent_display_name: '风险感知 Agent',
    mode: 'execute', status: 'failed', input: '处理异常风险告警',
    steps: [
      { id: 'ts1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'risk_agent', input: '处理异常风险告警', output: '处理风险告警', duration_ms: 150, feedback_entries: [], details: '' },
      { id: 'ts2', name: 'SKILL: 数据查询', type: 'skill_call', status: 'failure', agent: 'risk_agent', input: 'data_analysis --query="告警数据"', output: '查询失败: API超时', duration_ms: 30000, feedback_entries: [{ id: 'fb-ts2-1', type: 'correction', content: '数据源API超时，建议增加重试机制或降级策略', created_by: '运营B', operator_role: '数据运营组', coverage_status: 'pending' as FeedbackCoverageStatus, replies: [], created_at: '2026-05-10 09:00' }] },
    ],
    created_at: '2026-05-10 08:00:00', duration_ms: 30150,
  },
];

export default function ProductionFeedback() {
  const [selectedExec, setSelectedExec] = useState<typeof MOCK_EXECUTIONS_WITH_FEEDBACK[0] | null>(null);
  const [feedbackStep, setFeedbackStep] = useState<{ execId: string; stepId: string } | null>(null);
  const [fbType, setFbType] = useState('suggestion');
  const [fbContent, setFbContent] = useState('');
  const [fbRating, setFbRating] = useState(0);
  const [fbRole, setFbRole] = useState('品质审核组');
  const [fbAnnotation, setFbAnnotation] = useState('');
  const [fbAnnotationLabel, setFbAnnotationLabel] = useState<string>('');
  const [fbExpected, setFbExpected] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');

  const allFeedbackEntries = useMemo(() =>
    MOCK_EXECUTIONS_WITH_FEEDBACK.flatMap(e =>
      e.steps.flatMap(s => s.feedback_entries.map(f => ({ ...f, execId: e.id, stepId: s.id, agentName: e.agent_display_name })))
    ), []);

  const stats = useMemo(() => ({
    total: allFeedbackEntries.length,
    pending: allFeedbackEntries.filter(f => f.coverage_status === 'pending').length,
    inIter: allFeedbackEntries.filter(f => f.coverage_status === 'in_iteration').length,
    covered: allFeedbackEntries.filter(f => f.coverage_status === 'covered' || f.coverage_status === 'verified').length,
  }), [allFeedbackEntries]);

  const filteredExecs = useMemo(() => {
    return MOCK_EXECUTIONS_WITH_FEEDBACK.filter(e => {
      if (filterAgent !== 'all' && e.agent_name !== filterAgent) return false;
      if (filterStatus !== 'all') {
        if (filterStatus === 'has_feedback') return e.steps.some(s => s.feedback_entries.length > 0);
        if (filterStatus === 'pending_feedback') return e.steps.some(s => s.feedback_entries.some(f => f.coverage_status === 'pending'));
      }
      return true;
    });
  }, [filterAgent, filterStatus]);

  const execColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Agent', dataIndex: 'agent_display_name', key: 'agent', width: 130 },
    { title: '输入', dataIndex: 'input', key: 'input', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => <Tag color={s === 'completed' ? 'green' : s === 'failed' ? 'red' : 'orange'}>{s}</Tag>,
    },
    {
      title: '反馈覆盖', key: 'coverage', width: 130,
      render: (_: unknown, record: typeof MOCK_EXECUTIONS_WITH_FEEDBACK[0]) => {
        const entries = record.steps.flatMap(s => s.feedback_entries);
        if (entries.length === 0) return <Typography.Text type="secondary" style={{ fontSize: 11 }}>暂无</Typography.Text>;
        return (
          <Space size={2}>
            {entries.some(e => e.coverage_status === 'pending') && <FeedbackCoverageBadge status="pending" />}
            {entries.some(e => e.coverage_status === 'in_iteration') && <FeedbackCoverageBadge status="in_iteration" />}
            {entries.some(e => e.coverage_status === 'covered' || e.coverage_status === 'verified') && <FeedbackCoverageBadge status="covered" />}
          </Space>
        );
      },
    },
    { title: '耗时', dataIndex: 'duration_ms', key: 'duration', width: 80, render: (ms: number) => `${(ms / 1000).toFixed(1)}s` },
    { title: '时间', dataIndex: 'created_at', key: 'time', width: 160 },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: typeof MOCK_EXECUTIONS_WITH_FEEDBACK[0]) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedExec(record)}>详情</Button>
      ),
    },
  ];

  const handleSubmitFeedback = () => {
    if (!fbContent.trim()) {
      message.warning('请输入反馈内容');
      return;
    }
    message.success('反馈提交成功！将汇聚到训练调试轨');
    setFeedbackStep(null);
    resetForm();
  };

  const resetForm = () => {
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
      <div style={{ marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>🔄 生产反馈轨</Typography.Title>
        <Typography.Text type="secondary">
          查看组织 Agent 执行过程，提交结构化反馈 —
          <Tag color="red" icon={<LockOutlined />}>只读</Tag> 不可直接干预线上执行
        </Typography.Text>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card size="small"><Statistic title="执行总次数" value={MOCK_EXECUTIONS_WITH_FEEDBACK.length} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="累计反馈" value={stats.total} suffix={<MessageOutlined />} /></Card></Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="待处理" value={stats.pending} valueStyle={{ color: '#faad14' }} suffix={<FlagOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="迭代中" value={stats.inIter} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已覆盖" value={stats.covered} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}><Card size="small"><Statistic title="反馈覆盖率" value={stats.total > 0 ? Math.round(stats.covered / stats.total * 100) : 0} suffix="%" valueStyle={{ color: stats.covered / Math.max(stats.total, 1) > 0.5 ? '#52c41a' : '#faad14' }} /></Card></Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <FilterOutlined />
          <Select value={filterAgent} onChange={setFilterAgent} style={{ width: 160 }} options={[
            { value: 'all', label: '全部 Agent' },
            { value: 'risk_agent', label: '风险感知 Agent' },
            { value: 'inspection_agent', label: '巡检 Agent' },
          ]} />
          <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }} options={[
            { value: 'all', label: '全部状态' },
            { value: 'has_feedback', label: '有反馈' },
            { value: 'pending_feedback', label: '有待处理反馈' },
          ]} />
        </Space>
      </Card>

      {/* Execution List */}
      <Card size="small" title="执行日志列表">
        <Table
          dataSource={filteredExecs}
          columns={execColumns}
          rowKey="id"
          size="middle"
          pagination={false}
        />
      </Card>

      {/* Execution Detail Drawer */}
      <Drawer
        title={
          <Space>
            <span>执行详情 — {selectedExec?.id}</span>
            <Tag icon={<LockOutlined />} color="red">只读模式</Tag>
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
              message="这是组织 Agent 的执行记录，你可以在下方查看完整的执行链路和步骤详情。"
              description="你可以对每个执行步骤提交反馈建议。多角色反馈会独立记录，标注结果会并排展示供对比。反馈的覆盖状态反映其在迭代中的处理进度。"
              type="info" showIcon icon={<LockOutlined />}
              style={{ marginBottom: 16 }}
            />

            <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Agent" span={2}>{selectedExec.agent_display_name}</Descriptions.Item>
              <Descriptions.Item label="执行模式"><Tag>{selectedExec.mode}</Tag></Descriptions.Item>
              <Descriptions.Item label="总耗时">{(selectedExec.duration_ms / 1000).toFixed(1)}s</Descriptions.Item>
              <Descriptions.Item label="输入" span={2}>{selectedExec.input}</Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>执行步骤链路</Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
              每个步骤包含输入/输出、多角色反馈、标注对比、迭代覆盖状态
            </Typography.Text>

            <div>
              {selectedExec.steps.map((step, idx) => (
                <div key={step.id} style={{ position: 'relative', paddingLeft: 28, marginBottom: 8 }}>
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
        onClose={() => { setFeedbackStep(null); resetForm(); }}
        open={!!feedbackStep}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="💡 你提交的是「反馈建议」而非直接修改"
            description="组织 Agent 的执行逻辑由训练团队集中管控。你的反馈会被汇聚到训练调试轨。不同角色的相同反馈权重更高，标注结果会并排对比展示。"
            type="warning" showIcon
            style={{ marginBottom: 16 }}
          />

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
            { value: 'annotation', label: '📝 结果标注 — 标记输出是否符合预期（参与多角色标注对比）' },
            { value: 'rating', label: '⭐ 评分 — 对执行质量打分' },
            { value: 'approval', label: '✅ 认可 — 确认执行结果正确' },
          ]} />

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
            fbType === 'correction' ? '请描述你认为有误的地方及原因...' :
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
