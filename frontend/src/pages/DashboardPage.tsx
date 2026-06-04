import { Card, Row, Col, Typography, Space, Tag, Button, Statistic, List, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ExperimentOutlined, RobotOutlined, PlusOutlined,
  ArrowUpOutlined, SafetyOutlined, FileSearchOutlined,
  ThunderboltOutlined, PlayCircleOutlined, CloudServerOutlined,
  BookOutlined, RightCircleOutlined, StarOutlined,
} from '@ant-design/icons';

const PERSONAL_AGENTS = [
  { name: 'counterfeit_patrol', display_name: '假货专项巡检', skills: 4, execs: 128, last_active: '5 分钟前', status: 'online' as const },
  { name: 'sentiment_daily', display_name: '舆情外溢感知日报', skills: 3, execs: 67, last_active: '30 分钟前', status: 'online' as const },
  { name: 'rule_assistant', display_name: '禁限售规则助手', skills: 3, execs: 45, last_active: '1 小时前', status: 'offline' as const },
];

const ORG_AGENTS = [
  { name: 'quality_return_defense', display_name: '品退感知智能防控', icon: <SafetyOutlined />, color: '#ff4d4f', cases: 125000, recall: 3421, accuracy: 94.7 },
  { name: 'risk_water_level', display_name: '大盘风险水位巡检', icon: <FileSearchOutlined />, color: '#1677ff', cases: 156, anomalies: 234, coverage: 98.5 },
  { name: 'report_crackdown', display_name: '举报实时泛化打压', icon: <ThunderboltOutlined />, color: '#52c41a', cases: 23410, generalization: 8920, crackdown: 5670 },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>🏠 个人和组织分身运转概览</Typography.Title>
        <Typography.Text type="secondary">司衡/Themis——电商治理WorkBuddy · 创建·执行·监控·迭代 完整闭环</Typography.Text>
      </div>

      {/* 四大快捷入口 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card hoverable style={{ borderRadius: 8, borderLeft: '4px solid #1677ff' }} onClick={() => navigate('/incubation/studio')}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
              <PlusOutlined style={{ fontSize: 28, color: '#1677ff' }} />
              <Typography.Text strong>创建个人分身</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>从 Skill 库和模板创建个人 Agent</Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable style={{ borderRadius: 8, borderLeft: '4px solid #722ed1' }}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
              <StarOutlined style={{ fontSize: 28, color: '#722ed1' }} />
              <Typography.Text strong>升级个人分身</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>将调试完成的 Agent 升级为组织 Agent</Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable style={{ borderRadius: 8, borderLeft: '4px solid #52c41a' }} onClick={() => navigate('/production')}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
              <CloudServerOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <Typography.Text strong>组织分身产出监控</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>查看各组织 Agent 量化产出</Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable style={{ borderRadius: 8, borderLeft: '4px solid #fa8c16' }} onClick={() => navigate('/production/training')}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
              <BookOutlined style={{ fontSize: 28, color: '#fa8c16' }} />
              <Typography.Text strong>训练调试轨</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>反馈收敛、资产管理、版本迭代</Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 个人分身概览 */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <ExperimentOutlined style={{ color: '#1677ff' }} />
                <span>个人分身</span>
                <Tag color="blue" style={{ fontSize: 10 }}>{PERSONAL_AGENTS.length} 个</Tag>
              </Space>
            }
            extra={<Button type="link" size="small" icon={<PlusOutlined />} onClick={() => navigate('/incubation/studio')}>创建</Button>}
            size="small"
          >
            <List
              dataSource={PERSONAL_AGENTS}
              renderItem={(agent) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/incubation/agents/${agent.name}`)}
                  actions={[
                    <Button key="run" type="link" size="small" icon={<PlayCircleOutlined />}>对话</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Badge status={agent.status === 'online' ? 'success' : 'default'} />}
                    title={<Space><span>{agent.display_name}</span><Tag style={{ fontSize: 9 }}>{agent.skills} Skills</Tag></Space>}
                    description={
                      <Space size={12}>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>执行 {agent.execs} 次</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>{agent.last_active}</Typography.Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 组织分身产出概览 */}
        <Col span={12}>
          <Card
            title={
              <Space>
                <RobotOutlined style={{ color: '#52c41a' }} />
                <span>组织分身产出监控</span>
                <Tag color="green" style={{ fontSize: 10 }}>{ORG_AGENTS.length} 个</Tag>
              </Space>
            }
            extra={<Button type="link" size="small" onClick={() => navigate('/production')}>查看全部</Button>}
            size="small"
          >
            <List
              dataSource={ORG_AGENTS}
              renderItem={(agent) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/production/agents/${agent.name}`)}
                  actions={[
                    <Button key="view" type="link" size="small" icon={<RightCircleOutlined />}>详情</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<div style={{ fontSize: 24, color: agent.color }}>{agent.icon}</div>}
                    title={<Space><span style={{ fontWeight: 600 }}>{agent.display_name}</span><Tag color="green" style={{ fontSize: 9 }}>组织</Tag></Space>}
                    description={
                      <Space size={12}>
                        <Statistic title="监控量" value={agent.cases >= 10000 ? `${(agent.cases / 10000).toFixed(1)}万` : agent.cases} valueStyle={{ fontSize: 14 }} groupSeparator="" />
                        {agent.recall !== undefined && <Statistic title="拦截/召回" value={agent.recall} valueStyle={{ fontSize: 14, color: '#52c41a' }} groupSeparator="" />}
                        {agent.anomalies !== undefined && <Statistic title="异常发现" value={agent.anomalies} valueStyle={{ fontSize: 14, color: '#faad14' }} groupSeparator="" />}
                        {agent.crackdown !== undefined && <Statistic title="打压处置" value={agent.crackdown} valueStyle={{ fontSize: 14, color: '#ff4d4f' }} groupSeparator="" />}
                        {agent.coverage !== undefined && <Statistic title="覆盖率" value={`${agent.coverage}%`} valueStyle={{ fontSize: 14 }} groupSeparator="" />}
                        <Statistic title="准确率" value={`${agent.accuracy}%`} valueStyle={{ fontSize: 14 }} groupSeparator="" />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 全局数据 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={4}><Card size="small"><Statistic title="个人分身" value={3} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="组织分身" value={3} prefix={<RobotOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="总执行次数" value={148760} prefix={<ArrowUpOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="累计反馈" value={892} prefix={<CloudServerOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="训练数据" value={1247} prefix={<BookOutlined />} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="综合准确率" value={94.5} suffix="%" valueStyle={{ color: '#52c41a' }} prefix={<ArrowUpOutlined />} /></Card></Col>
      </Row>
    </div>
  );
}
