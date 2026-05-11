import { Layout, Tag, Space, Avatar, Typography, Badge } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store';

const { Header } = Layout;

export default function AppHeader() {
  const agents = useAppStore((s) => s.agents);
  const onlineCount = agents.filter((a) => a.name !== 'main_agent').length;

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        height: 56,
        lineHeight: '56px',
      }}
    >
      <Space>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          治理运营工作台
        </Typography.Text>
        <Tag color="blue" style={{ fontSize: 11 }}>
          {onlineCount} 个 Agent 在线
        </Tag>
        <Tag color="red" style={{ fontSize: 11 }}>
          2 条风险告警
        </Tag>
      </Space>

      <Space size={20}>
        <Badge count={3} size="small">
          <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
        </Badge>
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Typography.Text>治理运营</Typography.Text>
        </Space>
      </Space>
    </Header>
  );
}
