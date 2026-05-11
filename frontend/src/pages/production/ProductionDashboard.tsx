import { Card, Row, Col, Typography, Space, Tag, Statistic, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CloudServerOutlined, CheckCircleOutlined, ArrowUpOutlined,
  SafetyOutlined, FileSearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

// ===== 各 Agent 差异化产出 =====
const AGENT_CARDS = [
  {
    name: 'quality_return_defense', display_name: '品退感知智能防控',
    icon: <SafetyOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />,
    color: '#ff4d4f', bg: '#fff2f0',
    kpis: [
      { label: '监控SKU', value: '125,000', unit: '个' },
      { label: '前置拦截', value: 3421, unit: '次', color: '#52c41a' },
      { label: '品退下降', value: '18.5%', unit: '', color: '#1677ff' },
      { label: '准确率', value: '94.7%', color: '#ff4d4f' },
    ],
    outputs: [
      { label: '品退预警', count: 892, trend: '+8%' },
      { label: '拦截记录', count: 3421, trend: '+15%' },
      { label: '分析报告', count: 12, trend: '+2' },
    ],
  },
  {
    name: 'risk_water_level', display_name: '大盘风险水位巡检',
    icon: <FileSearchOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
    color: '#1677ff', bg: '#e6f7ff',
    kpis: [
      { label: '监控指标', value: 156, unit: '项' },
      { label: '异常发现', value: 234, unit: '次', color: '#faad14' },
      { label: '覆盖率', value: '98.5%', color: '#52c41a' },
      { label: '平均响应', value: '2.3', unit: 'min', color: '#1677ff' },
    ],
    outputs: [
      { label: '水位日报', count: 42, trend: '+0%' },
      { label: '异常告警', count: 234, trend: '-5%' },
      { label: '趋势分析', count: 12, trend: '+1' },
    ],
  },
  {
    name: 'report_crackdown', display_name: '举报实时泛化打压',
    icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    color: '#52c41a', bg: '#f6ffed',
    kpis: [
      { label: '处理举报', value: '23,410', unit: '条' },
      { label: '泛化识别', value: 8920, unit: '条', color: '#1677ff' },
      { label: '打压处置', value: 5670, unit: '次', color: '#ff4d4f' },
      { label: '泛化准确率', value: '92.3%', color: '#52c41a' },
    ],
    outputs: [
      { label: '举报处理', count: 23410, trend: '+12%' },
      { label: '泛化识别', count: 8920, trend: '+20%' },
      { label: '打压处置', count: 5670, trend: '+18%' },
    ],
  },
];

export default function ProductionDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>📊 组织 Agent 产出监控</Typography.Title>
        <Typography.Text type="secondary">
          各 Agent 产出独立计量，点击卡片查看执行明细和反馈
        </Typography.Text>
      </div>

      {/* 全局统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={3}><Card size="small"><Statistic title="组织分身" value={3} prefix={<CloudServerOutlined />} /></Card></Col>
        <Col span={3}><Card size="small"><Statistic title="总执行量" value={148760} prefix={<ThunderboltOutlined />} /></Card></Col>
        <Col span={3}><Card size="small"><Statistic title="累计反馈" value={892} prefix={<CloudServerOutlined />} /></Card></Col>
        <Col span={3}><Card size="small"><Statistic title="综合准确率" value={95.2} suffix="%" prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={3}><Card size="small"><Statistic title="进行中训练" value={2} prefix={<CloudServerOutlined />} /></Card></Col>
        <Col span={3}><Card size="small"><Statistic title="反馈待处理" value={47} prefix={<ArrowUpOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={3}><Card size="small"><Statistic title="今日执行" value={156} prefix={<ArrowUpOutlined />} /></Card></Col>
      </Row>

      {/* 各 Agent 差异化卡片 */}
      <Row gutter={[16, 16]}>
        {AGENT_CARDS.map((agent) => (
          <Col span={12} key={agent.name}>
            <Card
              hoverable
              style={{ borderRadius: 8, borderLeft: `4px solid ${agent.color}` }}
              onClick={() => navigate(`/production/agents/${agent.name}`)}
            >
              <Row gutter={16}>
                <Col span={6} style={{ textAlign: 'center' }}>
                  <div style={{ background: agent.bg, borderRadius: 12, padding: 12, display: 'inline-block' }}>
                    {agent.icon}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text strong style={{ fontSize: 14 }}>{agent.display_name}</Typography.Text>
                    <br />
                    <Tag color="green" style={{ fontSize: 9 }}>组织</Tag>
                  </div>
                </Col>
                <Col span={18}>
                  <Row gutter={[8, 8]}>
                    {agent.kpis.map((kpi, i) => (
                      <Col span={6} key={i}>
                        <Statistic title={kpi.label} value={kpi.value} suffix={kpi.unit || ''} valueStyle={{ fontSize: 16, color: kpi.color }} />
                      </Col>
                    ))}
                  </Row>
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                    <Space size={16}>
                      {agent.outputs.map((o, i) => (
                        <Tooltip key={i} title={`${o.label}: ${o.count.toLocaleString()} (${o.trend})`}>
                          <Tag color="blue" style={{ fontSize: 11 }}>
                            {o.label} <strong>{o.count.toLocaleString()}</strong>
                            <Typography.Text style={{ fontSize: 10, marginLeft: 4, color: o.trend.startsWith('+') ? '#52c41a' : '#999' }}>
                              {o.trend}
                            </Typography.Text>
                          </Tag>
                        </Tooltip>
                      ))}
                    </Space>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 提示 */}
      <Card size="small" style={{ marginTop: 16, background: '#f6f8fa' }}>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          💡 每个组织 Agent 的产出指标各不相同。点击卡片可查看完整执行历史、步骤详情和提交反馈。反馈将汇聚到训练调试轨。
        </Typography.Text>
      </Card>
    </div>
  );
}
