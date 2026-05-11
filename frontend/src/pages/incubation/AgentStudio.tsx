import { useState } from 'react';
import {
  Card, Tabs, Row, Col, Typography, Space, Tag, Button, Input,
  List, Badge, Divider, Descriptions, Modal, Select, Form,
} from 'antd';
import {
  ApiOutlined, CodeOutlined, PlusOutlined, SaveOutlined,
  SearchOutlined, PlayCircleOutlined, ToolOutlined,
  ThunderboltOutlined, BranchesOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Skill, AtomicCLI, AgentTemplate } from '../../types';

// ===== Mock Data =====

const SKILLS: Skill[] = [
  { id: 'risk_scan', name: 'risk_scan', display_name: '风险扫描', description: '对商品列表进行风险扫描，按等级输出风险结果', category: '风险治理', cli_command: 'ks governance risk_scan --products {products} --threshold {level}', parameters: [{ name: 'products', type: 'string', required: true, description: '商品ID列表或筛选条件' }, { name: 'threshold', type: 'string', required: false, default: 'high', description: '风险阈值: high/medium/low' }], output_desc: 'JSON格式的风险商品列表', version: 'v2.1.0' },
  { id: 'product_scan', name: 'product_scan', display_name: '商品查询', description: '按条件查询商品列表，支持日期/状态/类目筛选', category: '数据查询', cli_command: 'ks governance product_scan --date {date} --status {status} --category {cat}', parameters: [{ name: 'date', type: 'string', required: true, description: '日期: today/yesterday/YYYY-MM-DD' }, { name: 'status', type: 'string', required: false, default: 'all', description: '商品状态' }], output_desc: '商品列表JSON', version: 'v1.5.0' },
  { id: 'alert_generate', name: 'alert_generate', display_name: '告警生成', description: '基于风险扫描结果生成结构化的告警通知', category: '风险治理', cli_command: 'ks governance alert_generate --high {h} --medium {m} --low {l}', parameters: [{ name: 'high', type: 'number', required: true, description: '高风险数量' }, { name: 'medium', type: 'number', required: false, description: '中风险数量' }], output_desc: '告警消息JSON', version: 'v1.8.0' },
  { id: 'trend_analysis', name: 'trend_analysis', display_name: '趋势分析', description: '对历史风险数据做趋势分析，生成趋势报告', category: '数据分析', cli_command: 'ks governance trend_analysis --days {days} --metric {metric}', parameters: [{ name: 'days', type: 'number', required: true, description: '分析天数' }, { name: 'metric', type: 'string', required: false, default: 'all', description: '分析指标' }], output_desc: '趋势报告JSON', version: 'v1.3.0' },
  { id: 'report_gen', name: 'report_gen', display_name: '报告生成', description: '将分析结果渲染为可视化报告', category: '数据输出', cli_command: 'ks governance report_gen --data {data} --format {format}', parameters: [{ name: 'data', type: 'json', required: true, description: '输入数据' }, { name: 'format', type: 'string', required: false, default: 'html', description: '输出格式' }], output_desc: '报告文件', version: 'v1.2.0' },
  { id: 'review_score', name: 'review_score', display_name: '审核评分', description: '对商品/内容进行审核评分，输出风险等级', category: '审核能力', cli_command: 'ks governance review_score --item {item_id} --type {type}', parameters: [{ name: 'item_id', type: 'string', required: true, description: '待审核商品/内容ID' }, { name: 'type', type: 'string', required: true, description: '审核类型: product/content' }], output_desc: '审核结果JSON', version: 'v3.0.0' },
  { id: 'policy_query', name: 'policy_query', display_name: '政策查询', description: '查询治理政策、规则和处罚标准', category: '知识查询', cli_command: 'ks governance policy_query --q {query} --category {cat}', parameters: [{ name: 'query', type: 'string', required: true, description: '查询内容' }, { name: 'category', type: 'string', required: false, description: '政策分类' }], output_desc: '政策文本', version: 'v1.1.0' },
  { id: 'data_analysis', name: 'data_analysis', display_name: '数据分析', description: '对治理数据进行多维分析，支持聚合、下钻', category: '数据分析', cli_command: 'ks governance data_analysis --query {query} --dimensions {dims}', parameters: [{ name: 'query', type: 'string', required: true, description: '分析查询' }, { name: 'dimensions', type: 'array', required: false, description: '分析维度' }], output_desc: '分析结果JSON', version: 'v1.4.0' },
];

const CLI_COMMANDS: AtomicCLI[] = [
  { command: 'ks governance risk_scan', description: '风险扫描', category: '风险治理', example: 'ks governance risk_scan --products=2341 --threshold=high', skills: ['risk_scan'] },
  { command: 'ks governance product_scan', description: '商品查询', category: '数据查询', example: 'ks governance product_scan --date=today --status=new', skills: ['product_scan'] },
  { command: 'ks governance alert_generate', description: '告警生成', category: '风险治理', example: 'ks governance alert_generate --high=3 --medium=12', skills: ['alert_generate'] },
  { command: 'ks governance trend_analysis', description: '趋势分析', category: '数据分析', example: 'ks governance trend_analysis --days=7 --metric=risk', skills: ['trend_analysis'] },
  { command: 'ks governance report_gen', description: '报告生成', category: '数据输出', example: 'ks governance report_gen --data={...} --format=html', skills: ['report_gen'] },
  { command: 'ks governance review_score', description: '审核评分', category: '审核能力', example: 'ks governance review_score --item=P88421 --type=product', skills: ['review_score'] },
  { command: 'ks governance policy_query', description: '政策查询', category: '知识查询', example: 'ks governance policy_query --q="保健品资质要求"', skills: ['policy_query'] },
  { command: 'ks agent create', description: '创建 Agent', category: 'Agent管理', example: 'ks agent create my_agent --skill risk_scan,alert_generate', skills: [] },
  { command: 'ks agent run', description: '运行 Agent', category: 'Agent管理', example: 'ks agent run my_agent --input "..." --mode debug', skills: [] },
  { command: 'ks agent list', description: '列出 Agent', category: 'Agent管理', example: 'ks agent list', skills: [] },
  { command: 'ks skill list', description: '列出 Skills', category: 'Skill管理', example: 'ks skill list', skills: [] },
  { command: 'ks skill run', description: '运行 Skill', category: 'Skill管理', example: 'ks skill run risk_scan --args "..."', skills: [] },
];

const TEMPLATES: AgentTemplate[] = [
  { id: 'risk_monitor', name: '风险监控 Agent', description: '监控商品风险信号，自动生成告警', category: '风险治理', skills: ['product_scan', 'risk_scan', 'alert_generate', 'trend_analysis'], popularity: 92 },
  { id: 'inspection_bot', name: '巡检机器人', description: '定时执行商品合规巡检并生成报告', category: '巡检', skills: ['product_scan', 'report_gen'], popularity: 78 },
  { id: 'review_assistant', name: '审核助手', description: '辅助PE审核，提供风险评分和政策参考', category: '审核', skills: ['review_score', 'policy_query'], popularity: 85 },
  { id: 'consultant', name: '治理咨询顾问', description: '解答治理政策问题，提供合规建议', category: '咨询', skills: ['policy_query', 'data_analysis'], popularity: 67 },
];

const SKILL_CATEGORIES = ['全部', '风险治理', '数据查询', '数据分析', '审核能力', '知识查询', '数据输出', 'Agent管理', 'Skill管理'];

export default function AgentStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('build');
  const [skillCategory, setSkillCategory] = useState('全部');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null);
  const [agentForm] = Form.useForm();

  const filteredSkills = SKILLS.filter(s => {
    if (skillCategory !== '全部' && s.category !== skillCategory) return false;
    if (skillSearch && !s.name.includes(skillSearch) && !s.display_name.includes(skillSearch)) return false;
    return true;
  });

  const handleAddSkill = (skillId: string) => {
    if (!selectedSkills.includes(skillId)) {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillId));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>🔧 Agent Studio</Typography.Title>
          <Typography.Text type="secondary">
            从丰富的 Skill 库和原子化 CLI 中组合搭建你的专属 Agent
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => { setSelectedSkills([]); agentForm.resetFields(); }}>重置</Button>
          <Button icon={<SaveOutlined />}>保存草稿</Button>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => navigate('/incubation/execute')}>运行调试</Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        // ===== Tab 1: 搭建工作台 =====
        {
          key: 'build',
          label: <span><ToolOutlined /> 搭建工作台</span>,
          children: (
            <Row gutter={16}>
              <Col span={16}>
                <Card size="small" title="📝 Agent 基础配置">
                  <Form form={agentForm} layout="vertical">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Agent 名称" name="name" rules={[{ required: true }]}>
                          <Input placeholder="例: risk_watcher" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="显示名称" name="display_name" rules={[{ required: true }]}>
                          <Input placeholder="例: 风险监控助手" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item label="描述" name="description">
                      <Input.TextArea rows={2} placeholder="描述这个 Agent 的用途..." />
                    </Form.Item>
                    <Form.Item label="系统提示词 (System Prompt)" name="system_prompt">
                      <Input.TextArea rows={4} placeholder="编写 Agent 的行为规则和指令..." />
                    </Form.Item>
                    <Form.Item label="从模板创建">
                      <Select placeholder="选择一个模板快速开始" allowClear options={TEMPLATES.map(t => ({ value: t.id, label: t.name }))} onChange={(val) => {
                        const t = TEMPLATES.find(t => t.id === val);
                        if (t) {
                          agentForm.setFieldsValue({ name: t.id, display_name: t.name, description: t.description });
                          setSelectedSkills(t.skills);
                        }
                      }} />
                    </Form.Item>
                  </Form>
                </Card>

                <Card size="small" title="🧩 已绑定的 Skills" style={{ marginTop: 12 }}
                  extra={<span>{selectedSkills.length} 个 Skill</span>}>
                  {selectedSkills.length > 0 ? (
                    <Space wrap>
                      {selectedSkills.map(sid => {
                        const skill = SKILLS.find(s => s.id === sid);
                        return skill ? (
                          <Tag key={sid} closable onClose={() => handleRemoveSkill(sid)} color="purple" style={{ fontSize: 13, padding: '2px 8px' }}>
                            {skill.display_name}
                            <Typography.Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>
                              {skill.name}
                            </Typography.Text>
                          </Tag>
                        ) : null;
                      })}
                    </Space>
                  ) : (
                    <Typography.Text type="secondary">尚未绑定 Skill，请从 Skill 库中选择</Typography.Text>
                  )}
                </Card>
              </Col>

              <Col span={8}>
                <Card size="small" title="📋 Agent 预览">
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="名称">
                      <Tag>{agentForm.getFieldValue('name') || '-'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="显示名">{agentForm.getFieldValue('display_name') || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Skill 数">{selectedSkills.length}</Descriptions.Item>
                    <Descriptions.Item label="状态"><Tag color="default">草稿</Tag></Descriptions.Item>
                  </Descriptions>
                  <Divider style={{ margin: '8px 0' }} />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block icon={<PlayCircleOutlined />} onClick={() => navigate('/incubation/execute')}>运行调试</Button>
                    <Button block icon={<CodeOutlined />} onClick={() => navigate('/incubation/terminal')}>CLI 终端</Button>
                  </Space>
                  <Divider style={{ margin: '8px 0' }} />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    💡 当 Agent 调试完成后，可在"我的 Agent"中提交升级为组织 Agent
                  </Typography.Text>
                </Card>
              </Col>
            </Row>
          ),
        },

        // ===== Tab 2: Skill 库 =====
        {
          key: 'skills',
          label: <span><ApiOutlined /> Skill 库</span>,
          children: (
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" title="分类" bodyStyle={{ padding: 8 }}>
                  <List
                    dataSource={SKILL_CATEGORIES}
                    renderItem={(cat) => (
                      <List.Item
                        style={{ padding: '6px 12px', cursor: 'pointer', background: cat === skillCategory ? '#e6f7ff' : undefined }}
                        onClick={() => setSkillCategory(cat)}
                      >
                        <Typography.Text strong={cat === skillCategory}>{cat}</Typography.Text>
                        <Tag>{cat === '全部' ? SKILLS.length : SKILLS.filter(s => s.category === cat).length}</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
                <Card size="small" title="CLI 命令索引" style={{ marginTop: 12 }} bodyStyle={{ padding: 8 }}>
                  <List
                    dataSource={CLI_COMMANDS.filter(c => c.category !== 'Agent管理' && c.category !== 'Skill管理')}
                    renderItem={(cli) => (
                      <List.Item style={{ padding: '4px 8px', cursor: 'pointer' }}
                        onClick={() => {
                          setActiveTab('cli');
                        }}>
                        <Space>
                          <CodeOutlined style={{ color: '#52c41a' }} />
                          <Typography.Text code style={{ fontSize: 12 }}>{cli.command}</Typography.Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={16}>
                <div style={{ marginBottom: 12 }}>
                  <Input prefix={<SearchOutlined />} placeholder="搜索 Skill..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} allowClear />
                </div>
                <Row gutter={[12, 12]}>
                  {filteredSkills.map(skill => (
                    <Col span={12} key={skill.id}>
                      <Card
                        size="small"
                        hoverable
                        style={{ borderColor: selectedSkills.includes(skill.id) ? '#1677ff' : undefined }}
                        onClick={() => setPreviewSkill(skill)}
                        extra={
                          selectedSkills.includes(skill.id) ? (
                            <Tag color="blue">已添加</Tag>
                          ) : (
                            <Button size="small" type="link" icon={<PlusOutlined />} onClick={(e) => { e.stopPropagation(); handleAddSkill(skill.id); }} />
                          )
                        }
                        actions={[
                          <Button key="preview" type="link" size="small" onClick={() => setPreviewSkill(skill)}>详情</Button>,
                          <Button key="add" type="link" size="small" disabled={selectedSkills.includes(skill.id)} onClick={() => handleAddSkill(skill.id)}>
                            {selectedSkills.includes(skill.id) ? '已添加' : '添加到Agent'}
                          </Button>,
                          <Button key="cli" type="link" size="small" icon={<CodeOutlined />} onClick={() => navigate('/incubation/terminal')}>CLI</Button>,
                        ]}
                      >
                        <div>
                          <Space>
                            <Badge status="success" />
                            <Typography.Text strong style={{ fontSize: 13 }}>{skill.display_name}</Typography.Text>
                            <Tag style={{ fontSize: 10 }}>{skill.name}</Tag>
                          </Space>
                          <div style={{ marginTop: 4 }}>
                            <Tag color="blue" style={{ fontSize: 10 }}>{skill.category}</Tag>
                            <Tag style={{ fontSize: 10 }}>{skill.version}</Tag>
                          </div>
                          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                            {skill.description}
                          </Typography.Text>
                          <Typography.Text code style={{ fontSize: 11, display: 'block', marginTop: 4, color: '#52c41a' }}>
                            {skill.cli_command.substring(0, 50)}...
                          </Typography.Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          ),
        },

        // ===== Tab 3: CLI 目录 =====
        {
          key: 'cli',
          label: <span><CodeOutlined /> CLI 目录</span>,
          children: (
            <div>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                原子化 CLI 命令，是 Agent 调用的底层能力。每个 Skill 对应一个或多个 CLI 命令。
              </Typography.Text>
              <Row gutter={[12, 12]}>
                {CLI_COMMANDS.map(cli => (
                  <Col span={8} key={cli.command}>
                    <Card size="small" hoverable>
                      <Space>
                        <CodeOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                        <Typography.Text code style={{ fontSize: 13 }}>{cli.command}</Typography.Text>
                      </Space>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="blue" style={{ fontSize: 10 }}>{cli.category}</Tag>
                        {cli.skills.map(s => <Tag key={s} color="purple" style={{ fontSize: 10 }}>{s}</Tag>)}
                      </div>
                      <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        {cli.description}
                      </Typography.Text>
                      <Typography.Text code style={{ fontSize: 11, display: 'block', marginTop: 6, color: '#666', wordBreak: 'break-all' }}>
                        {cli.example}
                      </Typography.Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ),
        },

        // ===== Tab 4: 模板市场 =====
        {
          key: 'templates',
          label: <span><BranchesOutlined /> 模板市场</span>,
          children: (
            <Row gutter={[16, 16]}>
              {TEMPLATES.map(t => (
                <Col span={12} key={t.id}>
                  <Card
                    hoverable
                    size="small"
                    actions={[
                      <Button key="preview" type="link" size="small">预览</Button>,
                      <Button key="use" type="primary" size="small" onClick={() => {
                        setActiveTab('build');
                        agentForm.setFieldsValue({ name: t.id, display_name: t.name, description: t.description });
                        setSelectedSkills(t.skills);
                      }}>使用此模板</Button>,
                    ]}
                  >
                    <Space direction="vertical">
                      <Space>
                        <ThunderboltOutlined style={{ fontSize: 20, color: '#faad14' }} />
                        <Typography.Text strong>{t.name}</Typography.Text>
                        <Tag color="blue" style={{ fontSize: 10 }}>{t.category}</Tag>
                      </Space>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>{t.description}</Typography.Text>
                      <Space>
                        <Typography.Text style={{ fontSize: 12 }}>包含 Skills:</Typography.Text>
                        {t.skills.map(s => {
                          const skill = SKILLS.find(sk => sk.id === s);
                          return <Tag key={s} color="purple" style={{ fontSize: 10 }}>{skill?.display_name || s}</Tag>;
                        })}
                      </Space>
                      <Tag color="orange">🔥 热度 {t.popularity}</Tag>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ),
        },
      ]} />

      {/* Skill 详情 Modal */}
      <Modal
        title={previewSkill?.display_name}
        open={!!previewSkill}
        onCancel={() => setPreviewSkill(null)}
        footer={
          <Space>
            <Button onClick={() => setPreviewSkill(null)}>关闭</Button>
            {previewSkill && (
              <Button type="primary" disabled={selectedSkills.includes(previewSkill.id)} onClick={() => {
                if (previewSkill) handleAddSkill(previewSkill.id);
                setPreviewSkill(null);
              }}>
                {selectedSkills.includes(previewSkill.id) ? '已添加' : '添加到 Agent'}
              </Button>
            )}
          </Space>
        }
      >
        {previewSkill && (
          <div>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="标识">{previewSkill.name}</Descriptions.Item>
              <Descriptions.Item label="分类"><Tag color="blue">{previewSkill.category}</Tag></Descriptions.Item>
              <Descriptions.Item label="版本">{previewSkill.version}</Descriptions.Item>
              <Descriptions.Item label="描述">{previewSkill.description}</Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <Typography.Title level={5} style={{ fontSize: 14 }}>CLI 命令</Typography.Title>
            <div style={{ background: '#1e1e1e', color: '#6a9955', padding: 8, borderRadius: 4, fontSize: 13, fontFamily: 'monospace' }}>
              {previewSkill.cli_command}
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <Typography.Title level={5} style={{ fontSize: 14 }}>参数</Typography.Title>
            {previewSkill.parameters.map(p => (
              <div key={p.name} style={{ marginBottom: 8 }}>
                <Space>
                  <Tag color={p.required ? 'red' : 'default'} style={{ fontSize: 10 }}>
                    {p.required ? '必填' : '可选'}
                  </Tag>
                  <Typography.Text code>{p.name}</Typography.Text>
                  <Tag style={{ fontSize: 10 }}>{p.type}</Tag>
                  {p.default !== undefined && <Typography.Text type="secondary" style={{ fontSize: 12 }}>默认: {String(p.default)}</Typography.Text>}
                </Space>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginLeft: 4 }}>{p.description}</Typography.Text>
              </div>
            ))}
            <Divider style={{ margin: '12px 0' }} />
            <Typography.Title level={5} style={{ fontSize: 14 }}>输出</Typography.Title>
            <Typography.Text type="secondary">{previewSkill.output_desc}</Typography.Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
