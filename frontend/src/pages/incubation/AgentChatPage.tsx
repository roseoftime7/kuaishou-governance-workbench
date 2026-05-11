import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card, Typography, Space, Input, Button, Tag, Badge, Collapse,
  Divider, Drawer, Rate, Timeline, Tooltip,
} from 'antd';
import {
  SendOutlined, RobotOutlined, UserOutlined,
  EditOutlined, ReloadOutlined, StepForwardOutlined,
  CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined,
  RightSquareOutlined, MessageOutlined,
  BugOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import type { ExecStep, ExecMode } from '../../types';

// Mock agent configs
const AGENT_CONFIG: Record<string, { display_name: string; skills: string[] }> = {
  counterfeit_patrol: { display_name: '假货专项巡检', skills: ['product_scan', 'risk_scan', 'alert_generate', 'report_gen'] },
  sentiment_daily: { display_name: '舆情外溢感知日报', skills: ['product_scan', 'trend_analysis', 'data_analysis'] },
  rule_assistant: { display_name: '禁限售规则助手', skills: ['policy_query', 'data_analysis', 'report_gen'] },
};

const MOCK_STEPS: Record<string, ExecStep[]> = {
  '扫描风险': [
    { id: 's1', name: '意图理解', type: 'llm_reason', status: 'success', agent: '', input: '扫描商品风险', output: '拆解为3步: 查询→扫描→告警', duration_ms: 280, details: '' },
    { id: 's2', name: 'SKILL: 商品查询', type: 'skill_call', status: 'success', agent: '', input: 'product_scan --date=today', output: '2,341 件新增商品', duration_ms: 420, details: '' },
    { id: 's3', name: 'SKILL: 风险扫描', type: 'skill_call', status: 'success', agent: '', input: 'risk_scan threshold=high', output: '高风险 2 件·中风险 15 件', duration_ms: 1800, details: '' },
    { id: 's4', name: 'LLM: 结果分析', type: 'llm_reason', status: 'success', agent: '', input: '分析扫描结果', output: 'P88421(虚假交易92分) P88435(夸大宣传87分) 建议生成告警', duration_ms: 650, details: '' },
    { id: 's5', name: 'SKILL: 告警生成', type: 'skill_call', status: 'success', agent: '', input: 'generate alerts', output: '2条高风险·15条中风险告警已生成', duration_ms: 350, details: '' },
  ],
  '巡检店铺': [
    { id: 'i1', name: '意图理解', type: 'llm_reason', status: 'success', agent: '', input: '巡检店铺资质', output: '执行店铺资质巡检流程', duration_ms: 200, details: '' },
    { id: 'i2', name: 'SKILL: 店铺查询', type: 'skill_call', status: 'success', agent: '', input: 'product_scan type=shop', output: '567 家活跃店铺', duration_ms: 350, details: '' },
    { id: 'i3', name: 'SKILL: 资质核验', type: 'skill_call', status: 'success', agent: '', input: 'review_score items=567', output: '6家过期·12家即将过期', duration_ms: 1200, details: '' },
    { id: 'i4', name: 'LLM: 结果分析', type: 'llm_reason', status: 'success', agent: '', input: '分析资质结果', output: '建议: 发送整改通知·24h限制经营', duration_ms: 500, details: '' },
  ],
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: ExecStep[];
}

export default function AgentChatPage() {
  const { name = 'counterfeit_patrol' } = useParams();
  const config = AGENT_CONFIG[name] || AGENT_CONFIG['risk_watcher'];

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: `你好！我是 **${config.display_name}**。我可以帮你执行风险监控、商品查询等任务。试试输入"扫描风险"或"巡检店铺"来体验执行过程可视化。` },
  ]);
  const [input, setInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<ExecStep[]>([]);
  const [mode, setMode] = useState<ExecMode>('debug');
  const [feedbackStep, setFeedbackStep] = useState<string | null>(null);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || executing) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setInput('');

    // 模拟执行
    setExecuting(true);
    const mockKey = text.includes('风险') || text.includes('扫描') ? '扫描风险' : '巡检店铺';
    const steps = MOCK_STEPS[mockKey] || MOCK_STEPS['扫描风险'];

    // 逐步显示步骤
    setCurrentSteps(steps.map((s) => ({ ...s, status: 'pending' as const })));
    steps.forEach((step, i) => {
      setTimeout(() => {
        setCurrentSteps((prev) => prev.map((_s, j) => j === i ? { ...step, status: 'success' as const } : j < i && prev[j].status === 'pending' ? { ...prev[j], status: 'success' as const } : prev[j]));
      }, (i + 1) * 800);
    });

    // 完成
    setTimeout(() => {
      setExecuting(false);
      const lastStep = steps[steps.length - 1];
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ 执行完成！\n\n**${config.display_name}** 已完成任务，共执行 ${steps.length} 个步骤，耗时 ${steps.reduce((s, st) => s + st.duration_ms, 0)}ms。\n\n📌 **关键输出**: ${lastStep.output}\n\n你可以在右侧查看每个步骤的详细信息，或对特定步骤提交反馈。`,
        steps,
      }]);
      setCurrentSteps([]);
    }, steps.length * 800 + 500);
  }, [input, executing, config]);

  const stepColor = (status: string) => {
    const map: Record<string, string> = { success: 'green', running: 'blue', failure: 'red', intervened: 'orange', skipped: 'gray', pending: 'gray' };
    return map[status] || 'gray';
  };

  const stepIcon = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      success: <CheckCircleOutlined />, running: <LoadingOutlined />, failure: <CloseCircleOutlined />,
      intervened: <EditOutlined />, skipped: <StepForwardOutlined />, pending: <RightSquareOutlined />,
    };
    return map[status] || <RightSquareOutlined />;
  };

  const stepTypeLabel = (type: string) => {
    const map: Record<string, string> = { skill_call: 'Skill', cli_command: 'CLI', llm_reason: 'LLM', decision: '决策' };
    return map[type] || type;
  };

  return (
    <div style={{ height: 'calc(100vh - 104px)', display: 'flex', gap: 12 }}>
      {/* Left: Chat */}
      <Card
        style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 8 }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}
        title={
          <Space>
            <RobotOutlined style={{ color: '#1677ff' }} />
            <Typography.Text strong>{config.display_name}</Typography.Text>
            <Tag color="blue" style={{ fontSize: 10 }}>个人</Tag>
            <Badge status="success" text="在线" />
            <Tag color={mode === 'debug' ? 'orange' : mode === 'execute' ? 'green' : 'blue'}
              style={{ marginLeft: 8, cursor: 'pointer' }}
              onClick={() => setMode(mode === 'debug' ? 'execute' : mode === 'execute' ? 'plan' : 'debug')}>
              {mode === 'debug' ? '🔧 Debug' : mode === 'execute' ? '⚡ Execute' : '📋 Plan'}
            </Tag>
          </Space>
        }
        extra={
          <Space size={4}>
            {config.skills.map(s => <Tag key={s} color="purple" style={{ fontSize: 9 }}>{s}</Tag>)}
          </Space>
        }
      >
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: msg.role === 'user' ? '#1677ff' : '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {msg.role === 'user' ? <UserOutlined style={{ color: '#fff', fontSize: 13 }} /> : <RobotOutlined style={{ color: '#1677ff', fontSize: 13 }} />}
                </div>
                <div style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                  background: msg.role === 'user' ? '#1677ff' : '#f5f5f5',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14, lineHeight: 1.6,
                }}>
                  {msg.content}
                </div>
              </div>
              {/* Show steps inline for assistant messages */}
              {msg.role === 'assistant' && msg.steps && (
                <div style={{ marginLeft: 40, marginTop: 8 }}>
                  <Collapse ghost size="small" items={[{
                    key: 'steps',
                    label: <span style={{ fontSize: 12 }}>查看执行步骤 ({msg.steps.length} 步)</span>,
                    children: (
                      <Timeline
                        items={msg.steps.map(s => ({
                          color: stepColor(s.status),
                          children: (
                            <div style={{ cursor: 'pointer' }} onClick={() => setFeedbackStep(s.id)}>
                              <Space size={4}>
                                <Tag color="purple" style={{ fontSize: 9, lineHeight: '16px' }}>{stepTypeLabel(s.type)}</Tag>
                                <Typography.Text strong style={{ fontSize: 12 }}>{s.name}</Typography.Text>
                                <Typography.Text type="secondary" style={{ fontSize: 11 }}>{s.duration_ms}ms</Typography.Text>
                              </Space>
                              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                                输出: {s.output.substring(0, 50)}
                              </Typography.Text>
                            </div>
                          ),
                        }))}
                      />
                    ),
                  }]} />
                </div>
              )}
            </div>
          ))}
        </div>

        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder={`向 ${config.display_name} 发送消息...`}
            disabled={executing}
            size="large"
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={executing} size="large" />
        </Space.Compact>
      </Card>

      {/* Right: Execution Panel */}
      {(executing || currentSteps.length > 0) && (
        <Card
          size="small"
          title={
            <Space>
              <BugOutlined style={{ color: '#faad14' }} />
              <span>执行调试器</span>
              {mode === 'debug' && <Tag color="orange" style={{ fontSize: 9 }}>可干预</Tag>}
            </Space>
          }
          style={{ width: 360, borderRadius: 8, flexShrink: 0 }}
          bodyStyle={{ overflowY: 'auto' }}
        >
          {/* 步骤时间线 */}
          <Timeline
            items={currentSteps.map((step) => ({
              color: stepColor(step.status),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={4}>
                      <span style={{ color: stepColor(step.status), fontSize: 16 }}>{stepIcon(step.status)}</span>
                      <Typography.Text strong style={{ fontSize: 12 }}>{step.name}</Typography.Text>
                    </Space>
                    {step.status === 'success' && <Typography.Text type="secondary" style={{ fontSize: 11 }}>{step.duration_ms}ms</Typography.Text>}
                  </div>
                  {step.status === 'success' && (
                    <div style={{ marginTop: 4, fontSize: 11, color: '#666' }}>
                      {step.output}
                    </div>
                  )}
                  {step.status === 'success' && mode === 'debug' && (
                    <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
                      <Tooltip title="重试"><Button size="small" type="text" icon={<ReloadOutlined />} /></Tooltip>
                      <Tooltip title="修改输入"><Button size="small" type="text" icon={<EditOutlined />} /></Tooltip>
                      <Tooltip title="反馈"><Button size="small" type="text" icon={<MessageOutlined />} onClick={() => setFeedbackStep(step.id)} /></Tooltip>
                    </div>
                  )}
                </div>
              ),
            }))}
          />

          {/* 控制栏 */}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            {executing ? (
              <>
                <Button size="small" icon={<PauseCircleOutlined />}>暂停</Button>
                <Button size="small" icon={<StepForwardOutlined />}>单步</Button>
              </>
            ) : null}
          </Space>

          {/* Agent 信息 */}
          <Divider style={{ margin: '8px 0' }} />
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>绑定 Skills:</Typography.Text>
          <div style={{ marginTop: 4 }}>
            {config.skills.map(s => <Tag key={s} color="purple" style={{ fontSize: 10 }}>{s}</Tag>)}
          </div>
        </Card>
      )}

      {/* 反馈 Drawer */}
      <Drawer
        title="步骤反馈"
        placement="right"
        width={380}
        onClose={() => setFeedbackStep(null)}
        open={!!feedbackStep}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text strong>反馈类型</Typography.Text>
          <select style={{ width: '100%', padding: 4 }}>
            <option>💡 改进建议</option>
            <option>🔧 纠错</option>
            <option>✅ 认可</option>
            <option>📝 标注说明</option>
            <option>⭐ 评分</option>
          </select>
          <Typography.Text strong>评分</Typography.Text>
          <Rate />
          <Typography.Text strong>内容</Typography.Text>
          <Input.TextArea rows={4} placeholder="详细描述..." />
          <Button type="primary" icon={<SendOutlined />} block>提交反馈</Button>
        </Space>
      </Drawer>
    </div>
  );
}
