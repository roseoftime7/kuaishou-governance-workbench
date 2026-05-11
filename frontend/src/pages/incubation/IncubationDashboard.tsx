import { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, List, Avatar, Badge, Empty } from 'antd';
import {
  PlusOutlined,
  RobotOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
interface MockPersonalAgent {
  name: string; display_name: string; description: string; capabilities: string[];
  status: 'online' | 'offline' | 'busy' | 'error'; mode: string; version: string;
  skills: string[]; config: Record<string, unknown>; last_active: string;
}

const MOCK_AGENTS: MockPersonalAgent[] = [
  {
    name: 'risk_watcher',
    display_name: '风险监控助手',
    description: '监控商品风险信号，自动生成告警',
    capabilities: ['风险监控', '告警生成', '趋势分析'],
    status: 'online',
    mode: 'personal',
    version: 'v0.3.2',
    skills: ['risk_scan', 'alert_generate', 'trend_analysis'],
    config: {},
    last_active: '2 分钟前',
  },
  {
    name: 'inspector_bot',
    display_name: '巡检机器人',
    description: '定时执行商品合规巡检',
    capabilities: ['商品巡检', '报告生成'],
    status: 'busy',
    mode: 'personal',
    version: 'v0.2.1',
    skills: ['product_scan', 'report_gen'],
    config: {},
    last_active: '10 分钟前',
  },
];

export default function IncubationDashboard() {
  const navigate = useNavigate();
  const [agents] = useState<MockPersonalAgent[]>(MOCK_AGENTS);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            👤 个人模式
          </Typography.Title>
          <Typography.Text type="secondary">
            创建、调试和使用个人 Agent，每个 Agent 支持交互式对话执行。成熟后可升级为组织 Agent
          </Typography.Text>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/incubation/studio')}>
            新建 Agent
          </Button>
        </Space>
      </div>

      {/* 快捷操作 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card hoverable onClick={() => navigate('/incubation/studio')}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: 8 }}>
              <PlusOutlined style={{ fontSize: 28, color: '#1677ff' }} />
              <Typography.Text strong>从模板创建</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                使用预置模板快速创建 Agent
              </Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable onClick={() => navigate('/incubation/studio')}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: 8 }}>
              <PlayCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <Typography.Text strong>对话执行</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                通过对话方式交互执行 Agent
              </Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable onClick={() => navigate('/production')}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center', padding: 8 }}>
              <ExperimentOutlined style={{ fontSize: 28, color: '#722ed1' }} />
              <Typography.Text strong>申请升级</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                将个人 Agent 升级为组织 Agent
              </Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 个人 Agent 列表 */}
      <Card
        title={
          <Space>
            <RobotOutlined />
            <span>我的 Agent</span>
            <Tag>{agents.length}</Tag>
          </Space>
        }
        extra={
          <Button type="link" icon={<PlusOutlined />} onClick={() => navigate('/incubation/studio')}>
            新建
          </Button>
        }
      >
        {agents.length > 0 ? (
          <List
            dataSource={agents}
            renderItem={(agent) => (
              <List.Item
                actions={[
                  <Button key="run" type="link" icon={<PlayCircleOutlined />} size="small" onClick={() => navigate(`/incubation/agents/${agent.name}`)}>
                    对话
                  </Button>,
                  <Button key="edit" type="link" icon={<EditOutlined />} size="small">
                    编辑
                  </Button>,
                  <Button key="delete" type="link" danger icon={<DeleteOutlined />} size="small">
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge status={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'processing' : 'default'}>
                      <Avatar icon={<RobotOutlined />} style={{ background: '#1677ff' }} />
                    </Badge>
                  }
                  title={
                    <Space>
                      <span>{agent.display_name}</span>
                      <Tag color="blue" style={{ fontSize: 10 }}>{agent.version}</Tag>
                      <Tag style={{ fontSize: 10 }}>个人</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                        {agent.description}
                      </Typography.Text>
                      <div style={{ marginTop: 4 }}>
                        <Space size={4}>
                          {agent.skills.map((s) => (
                            <Tag key={s} color="purple" style={{ fontSize: 10, lineHeight: '18px' }}>
                              {s}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无个人 Agent，点击右上角新建" />
        )}
      </Card>

      {/* 底部提示 */}
      <Card size="small" style={{ marginTop: 16, background: '#f6f8fa' }}>
        <Space>
          <ExperimentOutlined style={{ color: '#722ed1' }} />
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            💡 提示: 在个人模式中创建的 Agent 经过充分调试后，可提交升级为组织 Agent，
            进入生产反馈模式由团队集中管控。
          </Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
