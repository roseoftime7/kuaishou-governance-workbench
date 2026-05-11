// ===== Agent 基础 =====
export interface Agent {
  name: string;
  display_name: string;
  description: string;
  capabilities: string[];
  status: 'online' | 'offline' | 'busy' | 'error';
  mode: 'personal' | 'organization';
  version: string;
  owner?: string;
  created_at?: string;
}

// ===== 孵化模式 - Skill & CLI =====
export interface Skill {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  cli_command: string;
  parameters: SkillParam[];
  output_desc: string;
  version: string;
}

export interface SkillParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  required: boolean;
  default?: unknown;
  description: string;
}

export interface AtomicCLI {
  command: string;
  description: string;
  category: string;
  example: string;
  skills: string[]; // 关联的Skill
}

// 模板
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  skills: string[];
  popularity: number;
}

// ===== 执行工作流 =====
export type ExecMode = 'plan' | 'execute' | 'debug';
export type StepStatus = 'pending' | 'running' | 'success' | 'failure' | 'skipped' | 'intervened';
export type InterventionType = 'modify_input' | 'skip' | 'retry' | 'override_output' | 'pause';
export type StepFeedbackType = 'suggestion' | 'correction' | 'approval' | 'annotation' | 'rating';

export interface Execution {
  id: string;
  agent_name: string;
  agent_display_name: string;
  mode: ExecMode;
  status: 'running' | 'paused' | 'completed' | 'failed';
  input: string;
  steps: ExecStep[];
  created_at: string;
  completed_at?: string;
  duration_ms?: number;
}

export interface ExecStep {
  id: string;
  name: string;
  type: 'skill_call' | 'cli_command' | 'llm_reason' | 'decision' | 'tool_use' | 'sub_agent';
  status: StepStatus;
  input: string;
  output: string;
  duration_ms: number;
  agent: string;
  // 可展开详情
  details?: string;
  // 干预记录（仅个人模式）
  intervention?: {
    type: InterventionType;
    content: string;
    timestamp: string;
    operator: string;
  };
  // 反馈（个人模式=直接反馈，组织模式=提交建议）
  feedback?: ExecStepFeedback;
}

export interface ExecStepFeedback {
  type: StepFeedbackType;
  content: string;
  rating?: number;
  target_output?: string;
  created_at: string;
  created_by: string;
}

// ===== 生产模式 - 量化指标 =====
export interface AgentMetrics {
  agent_name: string;
  display_name: string;
  date_range: { from: string; to: string };
  // 通用指标
  cases_processed: number;
  success_rate: number;
  avg_duration_ms: number;
  // 治理专用指标
  effective_recall: number;    // 有效召回数
  rules_summarized: number;    // 总结规则数
  risks_disposed: number;      // 风险处置数
  false_positive_rate: number; // 误报率
  // 趋势
  trend: Array<{ date: string; value: number; metric: string }>;
}

// ===== 生产模式 - Agent核心资产 =====
export interface AgentAssets {
  agent_name: string;
  version: string;
  prompt: {
    system_prompt: string;
    updated_at: string;
  };
  workflow: {
    steps: WorkflowStepDef[];
    updated_at: string;
  };
  knowledge_base: KnowledgeItem[];
  atomic_clis: string[];
  long_term_memory: MemoryItem[];
}

export interface WorkflowStepDef {
  name: string;
  type: string;
  skill: string;
  config: Record<string, unknown>;
  timeout_ms: number;
  retry_count: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'policy' | 'rule' | 'case' | 'reference';
  updated_at: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  type: 'episodic' | 'semantic';
  created_at: string;
}

// ===== 训练迭代 =====
export interface Iteration {
  id: string;
  agent_name: string;
  version: string;
  change_log: string;
  training_data_count: number;
  feedback_count: number;
  metrics: Record<string, number>;
  prev_metrics?: Record<string, number>;
  status: 'training' | 'testing' | 'deployed' | 'rolled_back';
  deployed_at?: string;
  created_at: string;
}

// ===== 对话 =====
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  mode?: 'incubation' | 'production';
  timestamp: Date;
}

// ===== WebSocket =====
export interface StreamMessage {
  type: 'stream_start' | 'stream_chunk' | 'stream_end' | 'error';
  agent?: string;
  content?: string;
  full_content?: string;
}

// ===== CLI =====
export interface CLICommand {
  id: string;
  command: string;
  output: string;
  status: 'running' | 'success' | 'error';
  timestamp: Date;
  duration_ms: number;
}
