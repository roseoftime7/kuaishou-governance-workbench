import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Space, Tag, Button, Statistic,
  Table, Timeline, Descriptions, Drawer, Input, Rate, Divider,
  Alert, Badge, Select,
} from 'antd';
import {
  MessageOutlined, SendOutlined, LockOutlined,
  FileSearchOutlined, SafetyOutlined, ThunderboltOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

// ===== Agent 配置和差异化产出 =====
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

const EXECUTION_HISTORY: Record<string, any[]> = {
  quality_return_defense: [
    { id: 'QRD-001', input: '扫描今日高品退风险SKU', status: 'completed', steps: 5, duration: 3.5, feedback: 3, time: '2026-05-09 10:30' },
    { id: 'QRD-002', input: '分析美妆类目品退趋势', status: 'completed', steps: 3, duration: 2.1, feedback: 1, time: '2026-05-09 09:00' },
    { id: 'QRD-003', input: '前置拦截高风险商品上架', status: 'completed', steps: 4, duration: 2.8, feedback: 2, time: '2026-05-08 16:20' },
  ],
  risk_water_level: [
    { id: 'RWL-001', input: '执行全量风险水位巡检', status: 'completed', steps: 4, duration: 2.3, feedback: 1, time: '2026-05-09 08:00' },
    { id: 'RWL-002', input: '排查风险指标异常波动', status: 'partial', steps: 3, duration: 1.8, feedback: 2, time: '2026-05-08 22:00' },
  ],
  report_crackdown: [
    { id: 'RPC-001', input: '处理虚假宣传举报队列', status: 'completed', steps: 4, duration: 3.2, feedback: 5, time: '2026-05-09 11:00' },
    { id: 'RPC-002', input: '泛化识别相似违规商品', status: 'completed', steps: 3, duration: 2.5, feedback: 3, time: '2026-05-09 10:00' },
  ],
};

export default function OrgAgentDetail() {
  const { name = 'quality_return_defense' } = useParams();
  const navigate = useNavigate();
  const config = AGENT_CONFIGS[name] || AGENT_CONFIGS['quality_return_defense'];
  const executions = EXECUTION_HISTORY[name] || EXECUTION_HISTORY['quality_return_defense'];

  const [selectedExec, setSelectedExec] = useState<any>(null);
  const [feedbackDrawer, setFeedbackDrawer] = useState(false);

  const execColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 110 },
    { title: '输入', dataIndex: 'input', key: 'input', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (s: string) => <Tag color={s === 'completed' ? 'green' : 'orange'}>{s === 'completed' ? '成功' : '部分成功'}</Tag> },
    { title: '步骤', dataIndex: 'steps', key: 'steps', width: 60 },
    { title: '耗时', dataIndex: 'duration', key: 'duration', width: 70, render: (d: number) => `${d}s` },
    { title: '反馈', dataIndex: 'feedback', key: 'feedback', width: 60, render: (f: number) => f > 0 ? <Badge count={f} size="small" /> : '-' },
    { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: any, record: any) => <Button size="small" onClick={() => setSelectedExec(record)}>详情</Button>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/production')} style={{ marginRight: 8 }} />
          {config.icon}
          <Typography.Title level={4} style={{ margin: 0 }}>{config.display_name}</Typography.Title>
          <Tag color="green">组织 Agent</Tag>
        </Space>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, marginLeft: 64 }}>
          {config.description}
        </Typography.Text>
      </div>

      {/* 差异化 KPI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {Object.entries(config.kpis).map(([key, kpi]) => (
          <Col span={6} key={key}>
            <Card size="small">
              <Statistic title={kpi.label} value={kpi.value} suffix={kpi.unit} valueStyle={{ color: kpi.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 差异化产出物 */}
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

      {/* 执行历史 */}
      <Card size="small" title={`📋 执行历史 (${executions.length})`}>
        <Table dataSource={executions} columns={execColumns} rowKey="id" pagination={false} size="middle" />
      </Card>

      {/* 执行详情 Drawer */}
      <Drawer
        title={
          <Space>
            <span>执行详情 — {selectedExec?.id}</span>
            <Tag icon={<LockOutlined />} color="red">只读·不可干预</Tag>
          </Space>
        }
        placement="right"
        width={560}
        onClose={() => setSelectedExec(null)}
        open={!!selectedExec}
      >
        {selectedExec && (
          <div>
            <Alert message="这是组织 Agent 的执行记录，你可以查看完整执行链路。如需调整执行逻辑，请在训练调试轨提交迭代方案。" type="info" showIcon icon={<LockOutlined />} style={{ marginBottom: 16 }} />

            <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="输入">{selectedExec.input}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={selectedExec.status === 'completed' ? 'green' : 'orange'}>{selectedExec.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="步骤数">{selectedExec.steps}</Descriptions.Item>
              <Descriptions.Item label="耗时">{selectedExec.duration}s</Descriptions.Item>
              <Descriptions.Item label="时间">{selectedExec.time}</Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>执行步骤</Typography.Title>
            <Timeline
              items={[
                { color: 'green', children: <div><Typography.Text strong>意图理解</Typography.Text><Tag style={{ marginLeft: 8 }}>280ms</Tag><div style={{ fontSize: 12, color: '#666' }}>LLM 分析用户输入，拆解子任务</div></div> },
                { color: 'green', children: <div><Typography.Text strong>SKILL: 商品查询</Typography.Text><Tag style={{ marginLeft: 8 }}>420ms</Tag><div style={{ fontSize: 12, color: '#666' }}>查询到 2,341 件新增商品</div></div> },
                { color: 'green', children: <div><Typography.Text strong>SKILL: 风险扫描</Typography.Text><Tag style={{ marginLeft: 8 }}>1.8s</Tag><div style={{ fontSize: 12, color: '#666' }}>高风险 2 件·中风险 15 件</div></div> },
                { color: 'green', children: <div><Typography.Text strong>LLM: 结果分析</Typography.Text><Tag style={{ marginLeft: 8 }}>650ms</Tag><div style={{ fontSize: 12, color: '#666' }}>分析扫描结果，生成处置建议</div></div> },
                { color: 'green', children: <div><Typography.Text strong>SKILL: 告警生成</Typography.Text><Tag style={{ marginLeft: 8 }}>350ms</Tag><div style={{ fontSize: 12, color: '#666' }}>已生成 2 条高风险告警</div></div> },
              ]}
            />

            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<MessageOutlined />} block onClick={() => setFeedbackDrawer(true)}>
                对此次执行提交反馈建议
              </Button>
              <Typography.Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
                💡 你的反馈会汇聚到训练调试轨，帮助 Agent 迭代优化
              </Typography.Text>
            </Space>
          </div>
        )}
      </Drawer>

      {/* 反馈 Drawer */}
      <Drawer title="提交执行反馈" placement="right" width={400} onClose={() => setFeedbackDrawer(false)} open={feedbackDrawer}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="这是组织 Agent 的反馈通道" description="你的反馈将被汇聚到训练调试轨，由训练团队集中处理。你可提交建议、纠错、标注或评分。" type="warning" showIcon />
          <Typography.Text strong>反馈类型</Typography.Text>
          <Select style={{ width: '100%' }} options={[
            { value: 'suggestion', label: '💡 改进建议' },
            { value: 'correction', label: '🔧 纠错' },
            { value: 'annotation', label: '📝 结果标注' },
            { value: 'rating', label: '⭐ 评分' },
          ]} />
          <Typography.Text strong>评分</Typography.Text>
          <Rate />
          <Typography.Text strong>详细内容</Typography.Text>
          <Input.TextArea rows={5} placeholder="描述你的反馈..." />
          <Button type="primary" icon={<SendOutlined />} block>提交反馈</Button>
        </Space>
      </Drawer>
    </div>
  );
}
