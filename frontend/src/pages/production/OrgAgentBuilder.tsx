import { useState, useMemo } from 'react';
import {
  Card, Row, Col, Typography, Space, Tag, Button, List, Checkbox,
  Input, Divider, Empty, Modal, Descriptions, message, Tabs, Select,
} from 'antd';
import {
  RobotOutlined, DeleteOutlined, ArrowLeftOutlined,
  CloudServerOutlined, CheckCircleOutlined,
  ApiOutlined, SearchOutlined,
  BranchesOutlined, SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Skill, AgentTemplate } from '../../types';

// ===== Mock: Skill 库 =====
const SKILLS: Skill[] = [
  { id: 'risk_scan', name: 'risk_scan', display_name: '风险扫描', description: '对商品列表进行风险扫描，按等级输出风险结果', category: '风险治理', cli_command: 'ks governance risk_scan --products {products} --threshold {level}', parameters: [], output_desc: '风险商品列表JSON', version: 'v2.1.0' },
  { id: 'product_scan', name: 'product_scan', display_name: '商品查询', description: '按条件查询商品列表', category: '数据查询', cli_command: 'ks governance product_scan --date {date} --status {status}', parameters: [], output_desc: '商品列表JSON', version: 'v1.5.0' },
  { id: 'alert_generate', name: 'alert_generate', display_name: '告警生成', description: '基于风险扫描结果生成结构化告警', category: '风险治理', cli_command: 'ks governance alert_generate --high {h} --medium {m}', parameters: [], output_desc: '告警JSON', version: 'v1.8.0' },
  { id: 'trend_analysis', name: 'trend_analysis', display_name: '趋势分析', description: '对历史风险数据做趋势分析', category: '数据分析', cli_command: 'ks governance trend_analysis --days {days}', parameters: [], output_desc: '趋势报告JSON', version: 'v1.3.0' },
  { id: 'report_gen', name: 'report_gen', display_name: '报告生成', description: '将分析结果渲染为可视化报告', category: '数据输出', cli_command: 'ks governance report_gen --data {data} --format {format}', parameters: [], output_desc: '报告文件', version: 'v1.2.0' },
  { id: 'review_score', name: 'review_score', display_name: '审核评分', description: '对商品/内容进行审核评分', category: '审核能力', cli_command: 'ks governance review_score --item {item_id} --type {type}', parameters: [], output_desc: '审核结果JSON', version: 'v3.0.0' },
  { id: 'policy_query', name: 'policy_query', display_name: '政策查询', description: '查询治理政策和规则', category: '知识查询', cli_command: 'ks governance policy_query --q {query}', parameters: [], output_desc: '政策文本', version: 'v1.1.0' },
  { id: 'data_analysis', name: 'data_analysis', display_name: '数据分析', description: '对治理数据进行多维分析', category: '数据分析', cli_command: 'ks governance data_analysis --query {query}', parameters: [], output_desc: '分析结果JSON', version: 'v1.4.0' },
];

const TEMPLATES: AgentTemplate[] = [
  { id: 'risk_monitor', name: '风险监控 Agent', description: '监控商品风险信号，自动生成告警', category: '风险治理', skills: ['product_scan', 'risk_scan', 'alert_generate', 'trend_analysis'], popularity: 92 },
  { id: 'inspection_bot', name: '巡检机器人', description: '定时执行商品合规巡检', category: '巡检', skills: ['product_scan', 'report_gen'], popularity: 78 },
  { id: 'review_assistant', name: '审核助手', description: '辅助审核，提供风险评分和政策参考', category: '审核', skills: ['review_score', 'policy_query'], popularity: 85 },
  { id: 'consultant', name: '治理咨询顾问', description: '解答治理政策问题', category: '咨询', skills: ['policy_query', 'data_analysis'], popularity: 67 },
];

// ===== Mock: 个人分身 =====
const PERSONAL_AGENTS = [
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

interface SkillItem { id: string; name: string; category: string; cli: string; }

const SKILL_CATEGORIES = ['全部', '风险治理', '数据查询', '数据分析', '审核能力', '知识查询', '数据输出'];

export default function OrgAgentBuilder() {
  const navigate = useNavigate();
  const [buildMode, setBuildMode] = useState('scratch'); // 'scratch' | 'import'

  // Shared config
  const [agentName, setAgentName] = useState('');
  const [agentDisplayName, setAgentDisplayName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scratch mode state
  const [skillCategory, setSkillCategory] = useState('全部');
  const [skillSearch, setSkillSearch] = useState('');

  // Import mode state
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [importedSkills, setImportedSkills] = useState<SkillItem[]>([]);

  // ===== Scratch mode =====
  const filteredSkills = SKILLS.filter(s => {
    if (skillCategory !== '全部' && s.category !== skillCategory) return false;
    if (skillSearch && !s.name.includes(skillSearch) && !s.display_name.includes(skillSearch)) return false;
    return true;
  });

  const handleAddSkill = (skillId: string) => {
    if (!selectedSkills.includes(skillId)) {
      setSelectedSkills(prev => [...prev, skillId]);
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skillId));
  };

  const applyTemplate = (t: AgentTemplate) => {
    setAgentName(t.id);
    setAgentDisplayName(t.name);
    setAgentDescription(t.description);
    t.skills.forEach(s => handleAddSkill(s));
    message.success(`已应用模板: ${t.name}`);
  };

  // ===== Import mode =====
  const availableImportSkills = useMemo(() => {
    const skills = new Map<string, SkillItem>();
    for (const agent of PERSONAL_AGENTS) {
      if (selectedAgents.includes(agent.name)) {
        for (const skill of agent.skills) {
          if (!skills.has(skill.id)) skills.set(skill.id, skill);
        }
      }
    }
    return Array.from(skills.values());
  }, [selectedAgents]);

  const pendingSkills = useMemo(() => {
    const importedIds = new Set(importedSkills.map(s => s.id));
    return availableImportSkills.filter(s => !importedIds.has(s.id));
  }, [availableImportSkills, importedSkills]);

  const toggleAgent = (agentName: string) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentName)) {
        const agent = PERSONAL_AGENTS.find(a => a.name === agentName);
        const agentSkillIds = new Set(agent?.skills.map(s => s.id) || []);
        setImportedSkills(prevSkills => prevSkills.filter(s => !agentSkillIds.has(s.id)));
        return prev.filter(n => n !== agentName);
      }
      return [...prev, agentName];
    });
  };

  const importSkill = (skill: SkillItem) => {
    setImportedSkills(prev => [...prev, skill]);
    if (!selectedSkills.includes(skill.id)) {
      setSelectedSkills(prev => [...prev, skill.id]);
    }
  };

  const removeImportedSkill = (skillId: string) => {
    setImportedSkills(prev => prev.filter(s => s.id !== skillId));
    setSelectedSkills(prev => prev.filter(s => s !== skillId));
  };

  // ===== Shared submit =====
  const handleSubmit = () => {
    if (!agentName.trim()) { message.warning('请输入 Agent 标识名'); return; }
    if (selectedSkills.length === 0) { message.warning('请至少选择一个 Skill 能力'); return; }
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setShowSuccess(true); }, 800);
  };

  const selectedSkillObjects = SKILLS.filter(s => selectedSkills.includes(s.id));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/production')} />
          <CloudServerOutlined style={{ fontSize: 22, color: '#1677ff' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>创建组织分身</Typography.Title>
        </Space>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4, marginLeft: 60 }}>
          从 Skill 库构建，或从个人分身导入已有能力
        </Typography.Text>
      </div>

      <Row gutter={16}>
        {/* Left + Center: Builder Area */}
        <Col span={16}>
          <Card
            size="small"
            title={
              <Tabs
                size="small"
                activeKey={buildMode}
                onChange={(key) => setBuildMode(key)}
                tabBarStyle={{ marginBottom: 0 }}
                items={[
                  { key: 'scratch', label: <span><ApiOutlined /> 从 Skill 库构建</span> },
                  { key: 'import', label: <span><RobotOutlined /> 从个人分身导入</span> },
                ]}
              />
            }
            bodyStyle={{ padding: buildMode === 'scratch' ? 12 : 12 }}
          >
            {buildMode === 'scratch' ? (
              <div>
                {/* Template quick select */}
                <div style={{ marginBottom: 12 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>快速从模板开始</Typography.Text>
                  <Space wrap style={{ marginTop: 4 }}>
                    {TEMPLATES.map(t => (
                      <Tag
                        key={t.id}
                        color="blue"
                        style={{ cursor: 'pointer', fontSize: 11, padding: '2px 8px' }}
                        onClick={() => applyTemplate(t)}
                      >
                        <BranchesOutlined /> {t.name}
                      </Tag>
                    ))}
                  </Space>
                </div>

                {/* Search & filter */}
                <Space style={{ marginBottom: 12, width: '100%' }}>
                  <Input
                    prefix={<SearchOutlined />} placeholder="搜索 Skill..."
                    value={skillSearch} onChange={e => setSkillSearch(e.target.value)}
                    allowClear style={{ width: 240 }}
                  />
                  <Select value={skillCategory} onChange={setSkillCategory} size="small" style={{ width: 140 }}
                    options={SKILL_CATEGORIES.map(c => ({ value: c, label: c }))}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    已选 {selectedSkills.length} 个
                  </Typography.Text>
                </Space>

                {/* Skill grid */}
                <Row gutter={[8, 8]}>
                  {filteredSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <Col span={12} key={skill.id}>
                        <Card
                          size="small"
                          hoverable
                          style={{ borderColor: isSelected ? '#1677ff' : undefined, cursor: 'pointer' }}
                          onClick={() => isSelected ? handleRemoveSkill(skill.id) : handleAddSkill(skill.id)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <Space>
                                <Typography.Text strong style={{ fontSize: 13 }}>{skill.display_name}</Typography.Text>
                                <Tag color="purple" style={{ fontSize: 9, lineHeight: '14px' }}>{skill.name}</Tag>
                              </Space>
                              <div style={{ marginTop: 2 }}>
                                <Tag color="blue" style={{ fontSize: 9, lineHeight: '14px' }}>{skill.category}</Tag>
                              </div>
                              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{skill.description}</Typography.Text>
                              <Typography.Text code style={{ fontSize: 10, display: 'block', marginTop: 2, color: '#52c41a' }}>
                                {skill.cli_command.substring(0, 45)}...
                              </Typography.Text>
                            </div>
                            {isSelected && <CheckCircleOutlined style={{ color: '#1677ff', fontSize: 18 }} />}
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                  {filteredSkills.length === 0 && (
                    <Col span={24}><Empty description="无匹配 Skill" /></Col>
                  )}
                </Row>
              </div>
            ) : (
              /* ===== Import Mode ===== */
              <Row gutter={12}>
                <Col span={10}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>选择个人分身</Typography.Text>
                  <List
                    size="small"
                    dataSource={PERSONAL_AGENTS}
                    renderItem={agent => (
                      <List.Item
                        style={{ padding: '6px 4px', cursor: 'pointer' }}
                        onClick={() => toggleAgent(agent.name)}
                      >
                        <Checkbox checked={selectedAgents.includes(agent.name)} />
                        <List.Item.Meta
                          avatar={<RobotOutlined style={{ fontSize: 16, color: selectedAgents.includes(agent.name) ? '#1677ff' : '#999' }} />}
                          title={
                            <Space size={4}>
                              <Typography.Text style={{ fontSize: 12 }}>{agent.display_name}</Typography.Text>
                              <Tag color={agent.status === 'online' ? 'green' : 'default'} style={{ fontSize: 8, lineHeight: '12px' }}>
                                {agent.status === 'online' ? '在线' : '离线'}
                              </Tag>
                            </Space>
                          }
                          description={<Typography.Text style={{ fontSize: 10 }}>{agent.skills.length} 个能力</Typography.Text>}
                        />
                      </List.Item>
                    )}
                  />
                </Col>
                <Col span={14}>
                  {selectedAgents.length === 0 ? (
                    <Empty description="左侧选择个人分身以导入能力" />
                  ) : (
                    <>
                      {pendingSkills.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>待导入能力</Typography.Text>
                          <List size="small" dataSource={pendingSkills} renderItem={skill => (
                            <List.Item style={{ padding: '4px' }} actions={[
                              <Button key="import" size="small" type="primary" ghost onClick={() => importSkill(skill)}>导入</Button>,
                            ]}>
                              <Space size={4}>
                                <Typography.Text style={{ fontSize: 12 }}>{skill.name}</Typography.Text>
                                <Tag color="purple" style={{ fontSize: 8, lineHeight: '12px' }}>{skill.category}</Tag>
                              </Space>
                            </List.Item>
                          )} />
                        </div>
                      )}
                      {importedSkills.length > 0 && (
                        <div>
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>已导入 ({importedSkills.length})</Typography.Text>
                          <List size="small" dataSource={importedSkills} renderItem={skill => (
                            <List.Item style={{ padding: '4px' }} actions={[
                              <Button key="remove" size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeImportedSkill(skill.id)} />
                            ]}>
                              <Space size={4}>
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                                <Typography.Text style={{ fontSize: 12 }}>{skill.name}</Typography.Text>
                                <Tag color="blue" style={{ fontSize: 8, lineHeight: '12px' }}>{skill.id}</Tag>
                              </Space>
                            </List.Item>
                          )} />
                        </div>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            )}
          </Card>

          {/* Selected Skills Bar */}
          <Card size="small" style={{ marginTop: 8 }} bodyStyle={{ padding: '8px 12px' }}>
            <Space style={{ width: '100%' }} size={4}>
              <Typography.Text strong style={{ fontSize: 12 }}>已选能力:</Typography.Text>
              {selectedSkillObjects.length > 0 ? (
                <Space wrap size={4}>
                  {selectedSkillObjects.map(s => (
                    <Tag key={s.id} closable onClose={() => handleRemoveSkill(s.id)} color="purple" style={{ fontSize: 11, lineHeight: '18px' }}>
                      {s.display_name}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>尚未选择任何能力</Typography.Text>
              )}
            </Space>
          </Card>
        </Col>

        {/* Right: Config & Preview */}
        <Col span={8}>
          <Card size="small" title="Agent 配置" style={{ height: '100%' }} bodyStyle={{ display: 'flex', flexDirection: 'column' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <div>
                <Typography.Text strong style={{ fontSize: 11 }}>标识名 *</Typography.Text>
                <Input size="small" placeholder="my_org_agent" value={agentName} onChange={e => setAgentName(e.target.value)} style={{ marginTop: 2 }} />
              </div>
              <div>
                <Typography.Text strong style={{ fontSize: 11 }}>显示名称</Typography.Text>
                <Input size="small" placeholder="我的组织 Agent" value={agentDisplayName} onChange={e => setAgentDisplayName(e.target.value)} style={{ marginTop: 2 }} />
              </div>
              <div>
                <Typography.Text strong style={{ fontSize: 11 }}>描述</Typography.Text>
                <Input.TextArea size="small" rows={2} placeholder="Agent 功能描述" value={agentDescription} onChange={e => setAgentDescription(e.target.value)} style={{ marginTop: 2 }} />
              </div>
              <div>
                <Typography.Text strong style={{ fontSize: 11 }}>System Prompt（可选）</Typography.Text>
                <Input.TextArea size="small" rows={3} placeholder="设置 Agent 的系统提示词..." value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} style={{ marginTop: 2 }} />
              </div>
            </Space>

            <Divider style={{ margin: '10px 0' }} />
            <Typography.Text strong style={{ fontSize: 11, marginBottom: 4 }}>预览</Typography.Text>
            <Descriptions size="small" column={1} style={{ fontSize: 11 }}>
              <Descriptions.Item label="标识名">{agentName || '-'}</Descriptions.Item>
              <Descriptions.Item label="显示名称">{agentDisplayName || '-'}</Descriptions.Item>
              <Descriptions.Item label="能力数">{selectedSkills.length} 个</Descriptions.Item>
              <Descriptions.Item label="构建方式">{buildMode === 'scratch' ? 'Skill 库构建' : `从 ${selectedAgents.length} 个个人分身导入`}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <Space style={{ width: '100%' }} direction="vertical">
                <Button type="primary" icon={<CloudServerOutlined />} block onClick={handleSubmit} loading={isSubmitting}
                  disabled={!agentName.trim() || selectedSkills.length === 0}>
                  提交为组织分身
                </Button>
                <Button block icon={<SaveOutlined />} onClick={() => message.success('草稿已保存')}>保存草稿</Button>
              </Space>
              <Typography.Text type="secondary" style={{ fontSize: 10, textAlign: 'center', display: 'block', marginTop: 4 }}>
                组织分身将进入生产环境，由训练团队统一管控
              </Typography.Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal
        title="组织分身创建成功"
        open={showSuccess}
        onOk={() => { setShowSuccess(false); navigate('/production'); }}
        onCancel={() => setShowSuccess(false)}
        okText="前往生产环境"
        cancelText="继续创建"
      >
        <div style={{ textAlign: 'center', padding: 16 }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <Typography.Title level={5} style={{ marginTop: 12 }}>组织分身已创建</Typography.Title>
          <Typography.Text type="secondary">
            {agentDisplayName || agentName} 已提交至生产环境，可在「组织分身产出监控」中查看运行状态。
          </Typography.Text>
          <Divider />
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="标识名">{agentName}</Descriptions.Item>
            <Descriptions.Item label="能力">{selectedSkills.length} 个 Skill</Descriptions.Item>
            <Descriptions.Item label="构建方式">{buildMode === 'scratch' ? 'Skill 库构建' : '个人分身导入'}</Descriptions.Item>
          </Descriptions>
        </div>
      </Modal>
    </div>
  );
}
