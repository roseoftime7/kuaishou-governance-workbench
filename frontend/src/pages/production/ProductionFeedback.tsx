import { useState } from 'react';
import {
  Card, Table, Tag, Typography, Space, Button, Badge,
  Drawer, Descriptions, Timeline, Input, Rate, Select, Row, Col,
  Statistic, Divider, Alert,
} from 'antd';
import {
  EyeOutlined, SendOutlined, MessageOutlined,
  FlagOutlined, ArrowUpOutlined, LockOutlined,
} from '@ant-design/icons';
import type { Execution } from '../../types';

// ===== Mock: 只读执行日志 (无干预按钮) =====
const MOCK_EXECUTIONS: Execution[] = [
  {
    id: 'EXEC-001', agent_name: 'risk_agent', agent_display_name: '风险感知 Agent',
    mode: 'execute', status: 'completed', input: '扫描今日新增商品风险',
    steps: [
      { id: 'ps1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'risk_agent', input: '扫描今日新增商品风险', output: '拆解为3个子任务: 商品查询→风险扫描→告警生成', duration_ms: 280, details: 'LLM分析用户意图' },
      { id: 'ps2', name: 'SKILL: 商品查询', type: 'skill_call', status: 'success', agent: 'risk_agent', input: 'product_scan --date=today --status=new', output: '查询到 2,341 件新增商品', duration_ms: 420, details: '' },
      { id: 'ps3', name: 'SKILL: 风险扫描', type: 'skill_call', status: 'success', agent: 'risk_agent', input: 'risk_scan --products=2341 --threshold=high', output: '高风险 2 件, 中风险 15 件', duration_ms: 1800, details: '' },
      { id: 'ps4', name: 'LLM: 结果分析', type: 'llm_reason', status: 'success', agent: 'risk_agent', input: '风险扫描结果: 高2中15', output: '高风险商品: P88421(虚假交易 92分), P88435(夸大宣传 87分)。建议生成告警并启动调查', duration_ms: 650, details: 'LLM分析风险数据' },
      { id: 'ps5', name: 'SKILL: 告警生成', type: 'skill_call', status: 'success', agent: 'risk_agent', input: 'alert_generate --high=2 --medium=15 --details=...', output: '已生成 2 条高风险告警, 15 条中风险告警', duration_ms: 350, details: '' },
    ],
    created_at: '2026-05-09 10:30:00', completed_at: '2026-05-09 10:30:04', duration_ms: 3500,
  },
  {
    id: 'EXEC-002', agent_name: 'inspection_agent', agent_display_name: '巡检 Agent',
    mode: 'execute', status: 'completed', input: '执行店铺资质巡检',
    steps: [
      { id: 'qs1', name: '意图理解', type: 'llm_reason', status: 'success', agent: 'inspection_agent', input: '执行店铺资质巡检', output: '执行店铺资质巡检流程', duration_ms: 200, details: '' },
      { id: 'qs2', name: 'SKILL: 店铺查询', type: 'skill_call', status: 'success', agent: 'inspection_agent', input: 'product_scan --type=shop --status=active', output: '查询到 567 家店铺', duration_ms: 350, details: '' },
      { id: 'qs3', name: 'SKILL: 资质核验', type: 'skill_call', status: 'success', agent: 'inspection_agent', input: 'review_score --items=567 --type=qualification', output: '6 家资质过期, 12 家即将过期', duration_ms: 1200, details: '' },
      { id: 'qs4', name: 'LLM: 结果分析', type: 'llm_reason', status: 'success', agent: 'inspection_agent', input: '资质核验结果: 6过期12即将过期', output: '过期店铺: XX旗舰店等6家。建议: 发送整改通知, 24h内未处理则限制经营', duration_ms: 500, details: '' },
    ],
    created_at: '2026-05-09 09:15:00', completed_at: '2026-05-09 09:15:02', duration_ms: 2250,
  },
];

// ===== Mock: 协同反馈 =====
const MOCK_FEEDBACKS: Array<{ id: string; exec_id: string; step_id: string; agent: string; type: string; content: string; rating?: number; created_by: string; created_at: string; replies: Array<{ user: string; content: string; time: string }> }> = [
  {
    id: 'FB-001', exec_id: 'EXEC-001', step_id: 'ps4', agent: 'risk_agent',
    type: 'suggestion', content: 'LLM结果分析步骤中，对于高风险商品的处置建议不够具体，建议补充：1)具体的违规条款 2)建议的处罚力度 3)历史类似案例参考', rating: 4,
    created_by: '运营A', created_at: '2026-05-09 11:00:00',
    replies: [
      { user: '训练团队-李', content: '已记录，将在下一迭代优化LLM的分析模板', time: '2026-05-09 11:30:00' },
    ],
  },
  {
    id: 'FB-002', exec_id: 'EXEC-001', step_id: 'ps3', agent: 'risk_agent',
    type: 'correction', content: '风险扫描的阈值设置过高(threshold=high)，导致部分中等风险商品被遗漏。建议将阈值调整为 medium 以扩大召回', rating: 3,
    created_by: '运营B', created_at: '2026-05-09 11:15:00',
    replies: [],
  },
  {
    id: 'FB-003', exec_id: 'EXEC-002', step_id: 'qs3', agent: 'inspection_agent',
    type: 'annotation', content: '资质核验步骤中OCR识别准确率约92%，对于模糊证件照识别失败率较高，建议标注这些case用于训练优化', rating: 3,
    created_by: '运营C', created_at: '2026-05-09 10:00:00',
    replies: [
      { user: '训练团队-王', content: '已收集相关case加入训练数据集 TD-002', time: '2026-05-09 10:30:00' },
    ],
  },
  {
    id: 'FB-004', exec_id: 'EXEC-001', step_id: 'ps5', agent: 'risk_agent',
    type: 'rating', content: '告警生成质量满意，内容完整结构清晰', rating: 5,
    created_by: '运营A', created_at: '2026-05-09 11:05:00',
    replies: [],
  },
];

export default function ProductionFeedback() {
  const [selectedExec, setSelectedExec] = useState<Execution | null>(null);
  const [feedbackStep, setFeedbackStep] = useState<{ execId: string; stepId: string } | null>(null);
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);

  const execColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Agent', dataIndex: 'agent_display_name', key: 'agent', width: 130 },
    { title: '输入', dataIndex: 'input', key: 'input', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={s === 'completed' ? 'green' : s === 'failed' ? 'red' : 'orange'}>{s}</Tag> },
    { title: '耗时', dataIndex: 'duration_ms', key: 'duration', width: 80, render: (ms: number) => `${(ms / 1000).toFixed(1)}s` },
    { title: '时间', dataIndex: 'created_at', key: 'time', width: 160 },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: Execution) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedExec(record)}>详情</Button>
          <Button size="small" icon={<MessageOutlined />} onClick={() => setSelectedExec(record)}>反馈</Button>
        </Space>
      ),
    },
  ];



  const handleSubmitFeedback = () => {
    // Mock submit
    setFeedbackStep(null);
    setFeedbackContent('');
    setFeedbackRating(0);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>🔄 生产反馈轨</Typography.Title>
        <Typography.Text type="secondary">
          查看组织 Agent 执行过程，提交结构化反馈 — <Tag color="red" icon={<LockOutlined />}>只读</Tag> 不可直接干预线上执行
        </Typography.Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="执行总次数" value={12847} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="今日执行" value={156} prefix={<ArrowUpOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="累计反馈" value={892} prefix={<MessageOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待处理反馈" value={47} prefix={<FlagOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card size="small" title="执行日志列表">
        <Table dataSource={MOCK_EXECUTIONS} columns={execColumns} rowKey="id" size="middle" pagination={false} />
      </Card>

      {/* 生产反馈的核心：只读执行详情 + 协同反馈 */}
      <Drawer
        title={
          <Space>
            <span>执行详情 — {selectedExec?.id}</span>
            <Tag icon={<LockOutlined />} color="red">只读模式</Tag>
          </Space>
        }
        placement="right"
        width={680}
        onClose={() => setSelectedExec(null)}
        open={!!selectedExec}
      >
        {selectedExec && (
          <div>
            {/* 读取提示 */}
            <Alert
              message="这是组织 Agent 的执行记录，你可以在下方查看完整的执行链路和步骤详情。"
              description="你可以对每个执行步骤提交反馈建议，但不能修改 Agent 的执行逻辑。你的反馈将会汇总到训练调试轨，由训练团队集中处理迭代。"
              type="info" showIcon icon={<LockOutlined />}
              style={{ marginBottom: 16 }}
            />

            {/* 执行概览 */}
            <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Agent" span={2}>{selectedExec.agent_display_name}</Descriptions.Item>
              <Descriptions.Item label="执行模式"><Tag>{selectedExec.mode}</Tag></Descriptions.Item>
              <Descriptions.Item label="总耗时">{(selectedExec.duration_ms! / 1000).toFixed(1)}s</Descriptions.Item>
              <Descriptions.Item label="输入" span={2}>{selectedExec.input}</Descriptions.Item>
            </Descriptions>

            {/* 执行步骤时间线 */}
            <Typography.Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>执行步骤链路</Typography.Title>
            <Timeline
              items={selectedExec.steps.map(step => {
                const stepFeedbacks = MOCK_FEEDBACKS.filter(f => f.exec_id === selectedExec.id && f.step_id === step.id);
                return {
                  color: step.status === 'success' ? 'green' : 'red',
                  children: (
                    <Card size="small" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                          <Typography.Text strong style={{ fontSize: 13 }}>{step.name}</Typography.Text>
                          <Tag color="purple" style={{ fontSize: 10 }}>{step.type}</Tag>
                          <Tag style={{ fontSize: 10 }}>{step.duration_ms}ms</Tag>
                        </Space>
                        <Badge count={stepFeedbacks.length} size="small" />
                      </div>

                      {/* 步骤 IO (只读) */}
                      <div style={{ marginTop: 8, background: '#f5f5f5', padding: 6, borderRadius: 4 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>输入:</Typography.Text>
                        <Typography.Text code style={{ fontSize: 11, display: 'block', wordBreak: 'break-all' }}>{step.input}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>输出:</Typography.Text>
                        <Typography.Text style={{ fontSize: 12, display: 'block' }}>{step.output}</Typography.Text>
                      </div>

                      {/* 已有反馈 */}
                      {stepFeedbacks.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>已有反馈:</Typography.Text>
                          {stepFeedbacks.map(fb => (
                            <div key={fb.id} style={{ background: '#f0f5ff', padding: 6, borderRadius: 4, marginTop: 4 }}>
                              <Space size={4}>
                                <Tag color="blue" style={{ fontSize: 9, lineHeight: '14px' }}>{fb.type}</Tag>
                                <Typography.Text style={{ fontSize: 12 }}>{fb.content.substring(0, 60)}...</Typography.Text>
                                {fb.rating && <Rate disabled value={fb.rating} size="small" />}
                              </Space>
                              <div style={{ fontSize: 11, color: '#999' }}>
                                {fb.created_by} · {fb.created_at}
                                {fb.replies.length > 0 && ` · ${fb.replies.length} 条回复`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 提交反馈按钮 (区别于个人模式的干预按钮) */}
                      <div style={{ marginTop: 8 }}>
                        <Button
                          size="small"
                          icon={<MessageOutlined />}
                          onClick={() => setFeedbackStep({ execId: selectedExec.id, stepId: step.id })}
                        >
                          提交反馈建议
                        </Button>
                      </div>
                    </Card>
                  ),
                };
              })}
            />
          </div>
        )}
      </Drawer>

      {/* 协同反馈 Drawer */}
      <Drawer
        title="提交步反馈建议"
        placement="right"
        width={480}
        onClose={() => { setFeedbackStep(null); setFeedbackContent(''); setFeedbackRating(0); }}
        open={!!feedbackStep}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="💡 你正在提交的是「反馈建议」而非直接修改"
            description="组织 Agent 的执行逻辑由训练团队集中管控。你的反馈会被汇聚到训练调试轨，作为下一次迭代优化的依据。多个运营的相同反馈权重更高。"
            type="warning" showIcon
            style={{ marginBottom: 16 }}
          />

          <Typography.Text strong>反馈类型</Typography.Text>
          <Select value={feedbackType} onChange={setFeedbackType} style={{ width: '100%' }} options={[
            { value: 'suggestion', label: '💡 改进建议 — 建议如何优化执行过程' },
            { value: 'correction', label: '🔧 纠错 — 指出执行中的错误或偏差' },
            { value: 'annotation', label: '📝 结果标注 — 标记输出是否符合预期' },
            { value: 'rating', label: '⭐ 评分 — 对执行质量打分' },
            { value: 'approval', label: '✅ 认可 — 确认执行结果正确' },
          ]} />

          {feedbackType === 'rating' && (
            <>
              <Typography.Text strong>评分</Typography.Text>
              <Rate value={feedbackRating} onChange={setFeedbackRating} />
            </>
          )}

          <Typography.Text strong>详细反馈内容</Typography.Text>
          <Input.TextArea rows={5} value={feedbackContent} onChange={e => setFeedbackContent(e.target.value)} placeholder={
            feedbackType === 'suggestion' ? '请描述你的改进建议...' :
            feedbackType === 'correction' ? '请描述你认为有误的地方，以及期望的正确输出...' :
            feedbackType === 'annotation' ? '请标注此步骤的输出是否符合预期...' :
            feedbackType === 'rating' ? '可选补充评分说明...' : ''
          } />

          <Typography.Text strong>预期输出（可选）</Typography.Text>
          <Input.TextArea rows={3} placeholder="如果你期望看到不同的输出，请描述你期望的结果..." />

          <Divider />
          <Button type="primary" icon={<SendOutlined />} block onClick={handleSubmitFeedback}>
            提交反馈 — 反馈将会汇总到训练调试轨
          </Button>
          <Typography.Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block' }}>
            🎯 你的每条反馈都在帮助组织 Agent 变得更好
          </Typography.Text>
        </Space>
      </Drawer>
    </div>
  );
}
