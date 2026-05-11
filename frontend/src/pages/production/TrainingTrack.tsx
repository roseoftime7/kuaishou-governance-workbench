import { useState } from 'react';
import {
  Card, Row, Col, Typography, Space, Tag, Button, Tabs, Badge,
  Statistic, Descriptions, Collapse, Divider,
  Select, Modal, Progress, List, Alert, Rate,
} from 'antd';
import {
  BookOutlined, ExperimentOutlined, CheckCircleOutlined,
  ArrowUpOutlined, FileTextOutlined, ApiOutlined,
  CodeOutlined, DatabaseOutlined, BulbOutlined,
  SwapOutlined, ThunderboltOutlined, EyeOutlined,
} from '@ant-design/icons';
import type { AgentAssets, Iteration } from '../../types';

// ===== Agent 核心资产 =====
const AGENT_ASSETS: Record<string, AgentAssets> = {
  risk_agent: {
    agent_name: 'risk_agent', version: 'v2.1.0',
    prompt: {
      system_prompt: '你是快手电商风险感知助手。你的职责：\n1. 接收商品查询结果\n2. 调用 risk_scan skill 进行风险扫描\n3. 调用 trend_analysis 分析趋势\n4. 调用 alert_generate 生成结构化告警\n5. 输出Markdown格式的风险报告',
      updated_at: '2026-05-01',
    },
    workflow: {
      steps: [
        { name: '意图理解', type: 'llm_reason', skill: '', config: { model: 'claude-sonnet-4' }, timeout_ms: 5000, retry_count: 1 },
        { name: '商品查询', type: 'skill_call', skill: 'product_scan', config: { date: 'today' }, timeout_ms: 10000, retry_count: 2 },
        { name: '风险扫描', type: 'skill_call', skill: 'risk_scan', config: { threshold: 'high' }, timeout_ms: 30000, retry_count: 2 },
        { name: '结果分析', type: 'llm_reason', skill: '', config: { model: 'claude-sonnet-4', temperature: 0.1 }, timeout_ms: 10000, retry_count: 1 },
        { name: '告警生成', type: 'skill_call', skill: 'alert_generate', config: {}, timeout_ms: 5000, retry_count: 1 },
      ],
      updated_at: '2026-05-01',
    },
    knowledge_base: [
      { id: 'kb1', title: '商品合规政策 V3.2', content: '商品发布规范、禁售规则...', type: 'policy', updated_at: '2026-04-15' },
      { id: 'kb2', title: '广告法合规要点', content: '广告法第十七条...', type: 'policy', updated_at: '2026-04-10' },
      { id: 'kb3', title: '保健品违规案例库', content: '典型保健品违规案例 50 例...', type: 'case', updated_at: '2026-05-01' },
      { id: 'kb4', title: '处罚规则速查表', content: '扣分项速查...', type: 'reference', updated_at: '2026-03-20' },
    ],
    atomic_clis: ['ks governance risk_scan', 'ks governance product_scan', 'ks governance alert_generate', 'ks governance trend_analysis'],
    long_term_memory: [
      { id: 'mem1', key: '高频风险类型', value: '虚假交易(32%), 夸大宣传(28%), 资质不符(18%)', type: 'semantic', created_at: '2026-04-01' },
      { id: 'mem2', key: '近期重要事件', value: '2026-04-28: 保健品新规生效, 违规处罚升级', type: 'episodic', created_at: '2026-04-28' },
      { id: 'mem3', key: '用户偏好', value: '用户倾向于接收分级告警(Markdown格式)', type: 'semantic', created_at: '2026-03-15' },
    ],
  },
};

// ===== 迭代版本 =====
const MOCK_ITERATIONS: Iteration[] = [
  {
    id: 'ITER-002', agent_name: 'risk_agent', version: 'v2.1.0',
    change_log: '增强虚假交易识别能力，新增3个风险特征，优化LLM分析模板',
    training_data_count: 892, feedback_count: 156,
    metrics: { accuracy: 96.8, precision: 95.3, recall: 97.1, f1_score: 96.2 },
    prev_metrics: { accuracy: 94.2, precision: 92.1, recall: 95.3, f1_score: 93.7 },
    status: 'deployed', deployed_at: '2026-05-01 10:00:00', created_at: '2026-04-15',
  },
  {
    id: 'ITER-001', agent_name: 'risk_agent', version: 'v2.0.0',
    change_log: '初始版本，基础风险扫描和告警能力',
    training_data_count: 347, feedback_count: 89,
    metrics: { accuracy: 94.2, precision: 92.1, recall: 95.3, f1_score: 93.7 },
    status: 'rolled_back', created_at: '2026-03-20',
  },
];

// ===== 汇总反馈 =====
const CONSOLIDATED_FEEDBACKS = [
  { id: 'FB-001', agent: 'risk_agent', count: 12, top_issue: 'LLM分析不够具体', avg_rating: 3.8, status: 'planned' as const },
  { id: 'FB-002', agent: 'risk_agent', count: 8, top_issue: '风险扫描阈值偏高', avg_rating: 3.2, status: 'in_progress' as const },
  { id: 'FB-003', agent: 'inspection_agent', count: 15, top_issue: 'OCR识别准确率不足', avg_rating: 3.5, status: 'planned' as const },
  { id: 'FB-004', agent: 'review_agent', count: 20, top_issue: '保健品审核规则需优化', avg_rating: 4.1, status: 'completed' as const },
];

export default function TrainingTrack() {
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedAgent, setSelectedAgent] = useState('risk_agent');
  const [compareModal, setCompareModal] = useState<{ open: boolean; v1: Iteration | null; v2: Iteration | null }>({ open: false, v1: null, v2: null });

  const assets = AGENT_ASSETS[selectedAgent];
  const agentIterations = MOCK_ITERATIONS.filter(i => i.agent_name === selectedAgent);

  const metricCompare = (current: number, prev?: number) => {
    if (prev === undefined) return null;
    const diff = current - prev;
    return (
      <span style={{ color: diff >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 12, marginLeft: 4 }}>
        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>📚 训练调试轨</Typography.Title>
          <Typography.Text type="secondary">Agent 核心资产管理 + 集中迭代训练 + 版本效果对比</Typography.Text>
        </div>
        <Space>
          <Select value={selectedAgent} onChange={setSelectedAgent} style={{ width: 200 }} options={[
            { value: 'risk_agent', label: '风险感知 Agent' },
            { value: 'inspection_agent', label: '巡检 Agent' },
            { value: 'review_agent', label: 'PE审核 Agent' },
            { value: 'consultation_agent', label: '治理咨询 Agent' },
          ]} />
          <Button type="primary" icon={<ExperimentOutlined />}>启动训练</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card size="small"><Statistic title="训练数据" value={1247} prefix={<BookOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="待标注" value={234} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="累计反馈" value={892} prefix={<EyeOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="反馈收敛方案" value={12} prefix={<ThunderboltOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="已部署版本" value={agentIterations.filter(i => i.status === 'deployed').length} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="综合准确率" value={96.8} suffix="%" prefix={<ArrowUpOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        // ===== Tab 1: Agent 核心资产 =====
        {
          key: 'assets',
          label: <span><DatabaseOutlined /> 核心资产</span>,
          children: (
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="📝 系统提示词" style={{ marginBottom: 12 }}>
                  <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 4, fontSize: 13, fontFamily: 'monospace', whiteSpace: 'pre-wrap', minHeight: 120 }}>
                    {assets?.prompt.system_prompt}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>最后更新: {assets?.prompt.updated_at}</Typography.Text>
                    <Button size="small" style={{ marginLeft: 8 }} icon={<FileTextOutlined />}>编辑</Button>
                  </div>
                </Card>

                <Card size="small" title="📋 Workflow 定义" style={{ marginBottom: 12 }}>
                  <Collapse
                    items={assets?.workflow.steps.map((step, i) => ({
                      key: String(i),
                      label: <Space><Tag color="purple" style={{ fontSize: 10 }}>{step.type}</Tag><span>{step.name}</span></Space>,
                      children: (
                        <Descriptions size="small" column={1}>
                          <Descriptions.Item label="Skill">{step.skill || '-'}</Descriptions.Item>
                          <Descriptions.Item label="超时">{step.timeout_ms}ms</Descriptions.Item>
                          <Descriptions.Item label="重试">{step.retry_count} 次</Descriptions.Item>
                          <Descriptions.Item label="配置">{JSON.stringify(step.config)}</Descriptions.Item>
                        </Descriptions>
                      ),
                    })) || []}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>最后更新: {assets?.workflow.updated_at}</Typography.Text>
                    <Button size="small" style={{ marginLeft: 8 }} icon={<ApiOutlined />}>编辑流程</Button>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small" title="📚 知识库" style={{ marginBottom: 12 }}>
                  <List
                    dataSource={assets?.knowledge_base || []}
                    renderItem={item => (
                      <List.Item
                        actions={[<Button key="edit" size="small" type="link">编辑</Button>]}
                      >
                        <List.Item.Meta
                          title={<Space><Tag color={item.type === 'policy' ? 'blue' : item.type === 'case' ? 'green' : 'default'} style={{ fontSize: 10 }}>{item.type}</Tag>{item.title}</Space>}
                          description={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.content.substring(0, 50)}...</Typography.Text>}
                        />
                      </List.Item>
                    )}
                  />
                  <Button type="dashed" block icon={<FileTextOutlined />}>添加知识</Button>
                </Card>

                <Card size="small" title="⚡ 原子化 CLI" style={{ marginBottom: 12 }}>
                  <List
                    dataSource={assets?.atomic_clis || []}
                    renderItem={cli => (
                      <List.Item>
                        <Space>
                          <CodeOutlined style={{ color: '#52c41a' }} />
                          <Typography.Text code>{cli}</Typography.Text>
                        </Space>
                        <Button size="small" type="link">查看</Button>
                      </List.Item>
                    )}
                  />
                </Card>

                <Card size="small" title="🧠 长期记忆">
                  <List
                    dataSource={assets?.long_term_memory || []}
                    renderItem={mem => (
                      <List.Item
                        actions={[<Button key="edit" size="small" type="link">编辑</Button>]}
                      >
                        <List.Item.Meta
                          title={<Space><BulbOutlined style={{ color: '#722ed1' }} /><Typography.Text strong>{mem.key}</Typography.Text><Tag style={{ fontSize: 10 }}>{mem.type}</Tag></Space>}
                          description={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{mem.value}</Typography.Text>}
                        />
                      </List.Item>
                    )}
                  />
                  <Button type="dashed" block icon={<BulbOutlined />}>添加记忆</Button>
                </Card>
              </Col>
            </Row>
          ),
        },

        // ===== Tab 2: 迭代管理 =====
        {
          key: 'iterations',
          label: <span><ExperimentOutlined /> 迭代管理</span>,
          children: (
            <div>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                {agentIterations.map(iter => (
                  <Col span={12} key={iter.id}>
                    <Card size="small" hoverable actions={[
                      <Button key="compare" type="link" icon={<SwapOutlined />} onClick={() => setCompareModal({ open: true, v1: iter, v2: agentIterations.find(i => i.id !== iter.id) || null })}>版本对比</Button>,
                      iter.status === 'deployed' ? <Button key="rollback" type="link" danger>回滚</Button> : <Button key="deploy" type="link">部署</Button>,
                    ]}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>{iter.version}</Tag>
                          <Badge status={iter.status === 'deployed' ? 'success' : iter.status === 'testing' ? 'processing' : iter.status === 'training' ? 'processing' : 'error'}
                            text={iter.status === 'deployed' ? '已部署' : iter.status === 'testing' ? '测试中' : iter.status === 'training' ? '训练中' : '已回滚'} />
                          {iter.deployed_at && <Typography.Text type="secondary" style={{ fontSize: 11 }}>部署于 {iter.deployed_at}</Typography.Text>}
                        </Space>

                        <Typography.Text style={{ fontSize: 13 }}>{iter.change_log}</Typography.Text>

                        <Space>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>训练数据: {iter.training_data_count} 条</Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>反馈: {iter.feedback_count} 条</Typography.Text>
                        </Space>

                        <Divider style={{ margin: '4px 0' }} />

                        <Typography.Text strong style={{ fontSize: 13 }}>效果指标</Typography.Text>
                        <Row gutter={8}>
                          {Object.entries(iter.metrics).map(([key, val]) => (
                            <Col span={6} key={key}>
                              <Typography.Text style={{ fontSize: 12 }}>{key}: <strong>{val}%</strong></Typography.Text>
                              {iter.prev_metrics && metricCompare(val, iter.prev_metrics[key])}
                            </Col>
                          ))}
                        </Row>

                        {iter.prev_metrics && (
                          <Progress
                            percent={iter.metrics.accuracy}
                            success={{ percent: iter.prev_metrics.accuracy, strokeColor: '#d9d9d9' }}
                            size="small"
                            style={{ marginTop: 4 }}
                          />
                        )}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ),
        },

        // ===== Tab 3: 反馈汇总 =====
        {
          key: 'feedback',
          label: <span><EyeOutlined /> 反馈收敛方案</span>,
          children: (
            <div>
              <Alert
                message="来自生产反馈轨的反馈已自动汇聚"
                description="以下是从运营人员提交的执行反馈中归纳出的待优化项，训练团队可基于这些方案进行集中迭代。相同问题反馈次数越多，优先级越高。"
                type="info" showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={[16, 16]}>
                {CONSOLIDATED_FEEDBACKS.map(fb => (
                  <Col span={12} key={fb.id}>
                    <Card size="small" hoverable actions={[
                      <Button key="detail" type="link">查看原始反馈</Button>,
                      <Button key="plan" type="primary" size="small">纳入迭代方案</Button>,
                    ]}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tag color="blue">{fb.agent}</Tag>
                          <Badge status={fb.status === 'completed' ? 'success' : fb.status === 'in_progress' ? 'processing' : 'default'}
                            text={fb.status === 'completed' ? '已解决' : fb.status === 'in_progress' ? '优化中' : '待规划'} />
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{fb.count} 人提及</Typography.Text>
                        </Space>
                        <Typography.Text strong>{fb.top_issue}</Typography.Text>
                        <Space>
                          <Rate disabled value={Math.round(fb.avg_rating)} size="small" />
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{fb.avg_rating} 分平均</Typography.Text>
                        </Space>
                        <Progress percent={fb.status === 'completed' ? 100 : fb.status === 'in_progress' ? 60 : 0} size="small" />
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ),
        },
      ]} />

      {/* 版本对比 Modal */}
      <Modal
        title="版本效果对比"
        open={compareModal.open}
        onCancel={() => setCompareModal({ open: false, v1: null, v2: null })}
        width={600}
        footer={null}
      >
        {compareModal.v1 && compareModal.v2 && (
          <div>
            <Row gutter={16}>
              {[compareModal.v1, compareModal.v2].map((v, i) => (
                <Col span={12} key={i}>
                  <Card size="small" title={<Tag color={i === 0 ? 'blue' : 'green'}>{v.version}</Tag>}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>状态: {v.status}</Typography.Text>
                    <Divider style={{ margin: '8px 0' }} />
                    <Typography.Text strong style={{ fontSize: 13 }}>效果指标</Typography.Text>
                    {Object.entries(v.metrics).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <Typography.Text style={{ fontSize: 12 }}>{key}</Typography.Text>
                        <Typography.Text strong style={{ fontSize: 13 }}>{val}%</Typography.Text>
                      </div>
                    ))}
                    <Divider style={{ margin: '8px 0' }} />
                    <Typography.Text style={{ fontSize: 12 }}>训练数据: {v.training_data_count} 条</Typography.Text>
                    <br />
                    <Typography.Text style={{ fontSize: 12 }}>反馈: {v.feedback_count} 条</Typography.Text>
                  </Card>
                </Col>
              ))}
            </Row>
            <Divider />
            <Typography.Title level={5} style={{ fontSize: 14 }}>差异分析</Typography.Title>
            {Object.keys(compareModal.v1.metrics).map(key => {
              const v1 = compareModal.v1!.metrics[key];
              const v2 = compareModal.v2!.metrics[key];
              const diff = v1 - v2;
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <Typography.Text style={{ fontSize: 13 }}>{key}</Typography.Text>
                  <Space>
                    <Tag color="blue">{compareModal.v1!.version}: {v1}%</Tag>
                    <Tag color="green">{compareModal.v2!.version}: {v2}%</Tag>
                    <span style={{ color: diff >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                    </span>
                  </Space>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
