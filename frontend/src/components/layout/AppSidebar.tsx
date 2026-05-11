import { useMemo } from 'react';
import { Layout, Menu, Typography, Space, Tag } from 'antd';
import {
  HomeOutlined, RobotOutlined, ExperimentOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, PlayCircleOutlined,
  SafetyOutlined, FileSearchOutlined, ThunderboltOutlined,
  PlusOutlined, StarOutlined, CloudServerOutlined, ToolOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';

const { Sider } = Layout;

const HOME_CHILDREN = [
  { key: '/incubation/studio', icon: <PlusOutlined />, label: '创建个人分身' },
  { key: '/incubation', icon: <StarOutlined />, label: '升级个人分身' },
  { key: '/production', icon: <CloudServerOutlined />, label: '组织分身产出监控' },
  { key: '/production/training', icon: <ToolOutlined />, label: '组织分身管理' },
];

const PERSONAL_AGENTS = [
  { name: 'counterfeit_patrol', display_name: '假货专项巡检' },
  { name: 'sentiment_daily', display_name: '舆情外溢感知日报' },
  { name: 'rule_assistant', display_name: '禁限售规则助手' },
];

const ORG_AGENTS = [
  { name: 'quality_return_defense', display_name: '品退感知智能防控', icon: <SafetyOutlined /> },
  { name: 'risk_water_level', display_name: '大盘风险水位巡检', icon: <FileSearchOutlined /> },
  { name: 'report_crackdown', display_name: '举报实时泛化打压', icon: <ThunderboltOutlined /> },
];

function findSelectedKey(pathname: string): string[] {
  // 首页子项
  for (const h of HOME_CHILDREN) {
    if (pathname === h.key) return [h.key];
  }
  // 个人分身
  for (const a of PERSONAL_AGENTS) {
    if (pathname === `/incubation/agents/${a.name}`) return [`/incubation/agents/${a.name}`];
  }
  // 组织分身
  for (const a of ORG_AGENTS) {
    if (pathname === `/production/agents/${a.name}`) return [`/production/agents/${a.name}`];
  }
  return [pathname];
}

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle = useAppStore((s) => s.toggleSidebar);
  const selectedKeys = useMemo(() => findSelectedKey(location.pathname), [location.pathname]);

  const menuItems = useMemo(() => [
    {
      key: 'home-group',
      icon: <HomeOutlined />,
      label: '工作台首页',
      children: HOME_CHILDREN,
    },
    { type: 'divider' as const },
    {
      key: 'personal-group',
      icon: <ExperimentOutlined />,
      label: (
        <Space>
          <span>个人分身</span>
          <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>个人</Tag>
        </Space>
      ),
      children: PERSONAL_AGENTS.map((a) => ({
        key: `/incubation/agents/${a.name}`,
        icon: <PlayCircleOutlined style={{ fontSize: 14 }} />,
        label: a.display_name,
      })),
    },
    { type: 'divider' as const },
    {
      key: 'org-group',
      icon: <RobotOutlined />,
      label: (
        <Space>
          <span>组织分身</span>
          <Tag color="green" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>组织</Tag>
        </Space>
      ),
      children: ORG_AGENTS.map((a) => ({
        key: `/production/agents/${a.name}`,
        icon: a.icon,
        label: a.display_name,
      })),
    },
  ], []);

  const handleClick = ({ key }: { key: string }) => {
    if (['home-group', 'personal-group', 'org-group'].includes(key)) return;
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      style={{ background: '#001529', height: '100vh', position: 'sticky', top: 0, left: 0, overflowY: 'auto' }}
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <RobotOutlined style={{ fontSize: 24, color: '#1677ff' }} />
        {!collapsed && (
          <div>
            <Typography.Text style={{ color: '#fff', fontSize: 15, fontWeight: 600, display: 'block', lineHeight: 1.2 }}>WorkBuddy</Typography.Text>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, display: 'block' }}>治理数字人工作台</Typography.Text>
          </div>
        )}
      </div>

      <Menu
        theme="dark" mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={collapsed ? [] : ['home-group', 'personal-group', 'org-group']}
        items={menuItems}
        onClick={handleClick}
        style={{ marginTop: 4 }}
      />

      <div style={{ position: 'absolute', bottom: 16, width: '100%', textAlign: 'center' }}>
        <Typography.Text onClick={toggle} style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 18 }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Typography.Text>
      </div>
    </Sider>
  );
}
