import { useState, useMemo } from 'react';
import {
  Card, Row, Col, Typography, Space, Tag, Button, List, Checkbox,
  Input, Divider, Alert, Empty, Modal, Descriptions, message,
} from 'antd';
import {
  RobotOutlined, DeleteOutlined, ArrowLeftOutlined,
  CloudServerOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// ===== Mock: 个人分身与其 Skill/CLI 能力 =====
const PERSONAL_AGENTS_WITH_SKILLS = [
  {
    name: 'counterfeit_patrol', display_name: '假货专项巡检',
    status: 'online' as const, last_active: '5 分钟前',
    skills: [
      { id: 'risk_scan', name: '风险扫描', category: '风险治理', cli: 'ks governance risk_scan --products {products} --threshold {level}' },
      { id: 'product_scan', name: '商品查询', category: '数据查询', cli: 'ks governance product_scan --date {date} --status {status}' },
      { id: 'alert_generate', name: '告警生成', category: '风险治理', cli: 'ks governance alert_generate --high {h} --medium {m}' },
    ],
  },
  {
    name: 'sentiment_daily', display_name: '舆情外溢感知日报',
    status: 'online' as const, last_active: '30 分钟前',
    skills: [
      { id: 'trend_analysis', name: '趋势分析', category: '数据分析', cli: 'ks governance trend_analysis --days {days}' },
      { id: 'data_analysis', name: '数据分析', category: '数据分析', cli: 'ks governance data_analysis --query {query}' },
      { id: 'report_gen', name: '报告生成', category: '产出管理', cli: 'ks governance report_gen --template {t} --period {p}' },
    ],
  },
  {
    name: 'rule_assistant', display_name: '禁限售规则助手',
    status: 'offline' as const, last_active: '1 小时前',
    skills: [
      { id: 'policy_query', name: '政策查询', category: '知识查询', cli: 'ks governance policy_query --q {query}' },
      { id: 'review_score', name: '审核评分', category: '审核能力', cli: 'ks governance review_score --item {item_id} --type {type}' },
    ],
  },
];

interface SkillItem {
  id: string; name: string; category: string; cli: string;
}

export default function OrgAgentBuilder() {
  const navigate = useNavigate();

  // State
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [importedSkills, setImportedSkills] = useState<SkillItem[]>([]);
  const [agentName, setAgentName] = useState('');
  const [agentDisplayName, setAgentDisplayName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived: all available skills from selected agents
  const availableSkills = useMemo(() => {
    const skills = new Map<string, SkillItem>();
    for (const agent of PERSONAL_AGENTS_WITH_SKILLS) {
      if (selectedAgents.includes(agent.name)) {
        for (const skill of agent.skills) {
          if (!skills.has(skill.id)) {
            skills.set(skill.id, skill);
          }
        }
      }
    }
    return Array.from(skills.values());
  }, [selectedAgents]);

  // Skills that can still be imported
  const pendingSkills = useMemo(() => {
    const importedIds = new Set(importedSkills.map(s => s.id));
    return availableSkills.filter(s => !importedIds.has(s.id));
  }, [availableSkills, importedSkills]);

  const importSkill = (skill: SkillItem) => {
    setImportedSkills(prev => [...prev, skill]);
  };

  const removeSkill = (skillId: string) => {
    setImportedSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const toggleAgent = (agentName: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentName)) {
        // Remove agent + remove its skills from imported
        const agent = PERSONAL_AGENTS_WITH_SKILLS.find(a => a.name === agentName);
        const agentSkillIds = new Set(agent?.skills.map(s => s.id) || []);
        setImportedSkills(prevSkills => prevSkills.filter(s => !agentSkillIds.has(s.id)));
        return prev.filter(n => n !== agentName);
      }
      return [...prev, agentName];
    });
  };

  const handleSubmit = () => {
    if (!agentName.trim()) {
      message.warning('请输入 Agent 标识名');
      return;
    }
    if (importedSkills.length === 0) {
      message.warning('请至少导入一个 Skill 能力');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 800);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/production')} />
          <CloudServerOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>组织分身构建</Typography.Title>
        </Space>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, marginLeft: 60 }}>
          从个人分身中导入 Skill / CLI 能力，组合构建组织 Agent
        </Typography.Text>
      </div>

      <Row gutter={16} style={{ minHeight: 500 }}>
        {/* LEFT: Personal Agent Selector */}
        <Col span={6}>
          <Card size="small" title="选择个人分身" style={{ height: '100%' }}>
            {PERSONAL_AGENTS_WITH_SKILLS.length > 0 ? (
              <List
                size="small"
                dataSource={PERSONAL_AGENTS_WITH_SKILLS}
                renderItem={agent => (
                  <List.Item
                    style={{ padding: '8px 4px', cursor: 'pointer' }}
                    onClick={() => toggleAgent(agent.name)}
                  >
                    <Checkbox checked={selectedAgents.includes(agent.name)} />
                    <List.Item.Meta
                      avatar={<RobotOutlined style={{ fontSize: 18, color: selectedAgents.includes(agent.name) ? '#1677ff' : '#999' }} />}
                      title={
                        <Space size={4}>
                          <Typography.Text style={{ fontSize: 13 }}>{agent.display_name}</Typography.Text>
                          <Tag color={agent.status === 'online' ? 'green' : 'default'} style={{ fontSize: 9, lineHeight: '14px' }}>
                            {agent.status === 'online' ? '在线' : '离线'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                          {agent.skills.length} 个能力 · {agent.last_active}
                        </Typography.Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无个人分身" />
            )}
          </Card>
        </Col>

        {/* CENTER: Skills Composer */}
        <Col span={10}>
          <Card
            size="small"
            title={`已导入的 Skill / CLI 能力 (${importedSkills.length})`}
            extra={
              importedSkills.length > 0 && (
                <Button size="small" type="link" danger onClick={() => setImportedSkills([])}>
                  清空全部
                </Button>
              )
            }
            style={{ height: '100%' }}
          >
            {selectedAgents.length === 0 ? (
              <Empty description="请在左侧选择个人分身以导入能力" />
            ) : (
              <>
                {/* Pending skills */}
                {pendingSkills.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>待导入能力</Typography.Text>
                    <List
                      size="small"
                      dataSource={pendingSkills}
                      renderItem={skill => (
                        <List.Item
                          style={{ padding: '6px 4px' }}
                          actions={[
                            <Button key="import" size="small" type="primary" ghost onClick={() => importSkill(skill)}>
                              导入
                            </Button>,
                          ]}
                        >
                          <div>
                            <Space>
                              <Typography.Text style={{ fontSize: 13 }}>{skill.name}</Typography.Text>
                              <Tag color="purple" style={{ fontSize: 9, lineHeight: '14px' }}>{skill.category}</Tag>
                            </Space>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{skill.id}</div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {/* Imported skills */}
                {importedSkills.length > 0 && (
                  <div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>已导入能力</Typography.Text>
                    <List
                      size="small"
                      dataSource={importedSkills}
                      renderItem={skill => (
                        <List.Item
                          style={{ padding: '6px 4px' }}
                          actions={[
                            <Button key="remove" size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeSkill(skill.id)} />
                          ]}
                        >
                          <div>
                            <Space>
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                              <Typography.Text style={{ fontSize: 13 }}>{skill.name}</Typography.Text>
                              <Tag color="blue" style={{ fontSize: 9, lineHeight: '14px' }}>{skill.id}</Tag>
                            </Space>
                            <div style={{ fontSize: 11, color: '#666', marginTop: 2, fontFamily: 'monospace' }}>
                              {skill.cli}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {availableSkills.length === 0 && (
                  <Empty description="选中的个人分身暂无可用能力" />
                )}

                {pendingSkills.length === 0 && importedSkills.length > 0 && (
                  <Alert message="所有能力已导入" type="success" showIcon style={{ marginTop: 8 }} />
                )}
              </>
            )}
          </Card>
        </Col>

        {/* RIGHT: Configuration & Preview */}
        <Col span={8}>
          <Card
            size="small"
            title="Agent 配置"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div>
                <Typography.Text strong style={{ fontSize: 12 }}>标识名 *</Typography.Text>
                <Input size="small" placeholder="my_org_agent" value={agentName} onChange={e => setAgentName(e.target.value)} style={{ marginTop: 2 }} />
              </div>
              <div>
                <Typography.Text strong style={{ fontSize: 12 }}>显示名称</Typography.Text>
                <Input size="small" placeholder="我的组织 Agent" value={agentDisplayName} onChange={e => setAgentDisplayName(e.target.value)} style={{ marginTop: 2 }} />
              </div>
              <div>
                <Typography.Text strong style={{ fontSize: 12 }}>描述</Typography.Text>
                <Input.TextArea size="small" rows={2} placeholder="Agent 功能描述" value={agentDescription} onChange={e => setAgentDescription(e.target.value)} style={{ marginTop: 2 }} />
              </div>
              <div>
                <Typography.Text strong style={{ fontSize: 12 }}>System Prompt（可选）</Typography.Text>
                <Input.TextArea size="small" rows={3} placeholder="设置 Agent 的系统提示词..." value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} style={{ marginTop: 2 }} />
              </div>
            </Space>

            <Divider style={{ margin: '12px 0' }} />

            {/* Preview */}
            <Typography.Text strong style={{ fontSize: 12, marginBottom: 8 }}>预览</Typography.Text>
            <Descriptions size="small" column={1} style={{ fontSize: 12 }}>
              <Descriptions.Item label="标识名">{agentName || '-'}</Descriptions.Item>
              <Descriptions.Item label="显示名称">{agentDisplayName || '-'}</Descriptions.Item>
              <Descriptions.Item label="能力数">{importedSkills.length} 个</Descriptions.Item>
              <Descriptions.Item label="引用来源">{selectedAgents.length} 个个人分身</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <Button
                type="primary"
                icon={<CloudServerOutlined />}
                block
                size="middle"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={!agentName.trim() || importedSkills.length === 0}
              >
                提交为组织分身
              </Button>
              <Typography.Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block', marginTop: 6 }}>
                组织分身将进入生产环境，由训练团队统一管控
              </Typography.Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal
        title="组织分身提交成功"
        open={showSuccess}
        onOk={() => { setShowSuccess(false); navigate('/production'); }}
        onCancel={() => setShowSuccess(false)}
        okText="前往生产环境"
        cancelText="继续构建"
      >
        <div style={{ textAlign: 'center', padding: 16 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <Typography.Title level={5} style={{ marginTop: 12 }}>组织分身已创建</Typography.Title>
          <Typography.Text type="secondary">
            {agentDisplayName || agentName} 已提交至生产环境，
            <br />可在「组织分身产出监控」中查看运行状态。
          </Typography.Text>
          <Divider />
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="标识名">{agentName}</Descriptions.Item>
            <Descriptions.Item label="已导入能力">{importedSkills.length} 个</Descriptions.Item>
            <Descriptions.Item label="引用个人分身">{selectedAgents.length} 个</Descriptions.Item>
          </Descriptions>
        </div>
      </Modal>
    </div>
  );
}
