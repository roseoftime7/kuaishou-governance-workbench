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

// ===== 组织模式 - 增强反馈生命周期 =====

// 反馈覆盖状态：待处理 → 迭代中 → 已覆盖 → 已验证
export type FeedbackCoverageStatus = 'pending' | 'in_iteration' | 'covered' | 'verified';

// 反馈回复/讨论
export interface FeedbackReply {
  id: string;
  user: string;
  user_role: string;
  content: string;
  created_at: string;
}

// 单条结构化反馈（多角色可对同一步骤分别反馈）
export interface StepFeedbackEntry {
  id: string;
  type: StepFeedbackType;
  content: string;
  rating?: number;
  target_output?: string;
  created_by: string;
  operator_role: string;
  // 标注相关
  annotation?: string;
  annotation_label?: 'correct' | 'incorrect' | 'partial' | 'uncertain';
  // 生命周期
  coverage_status: FeedbackCoverageStatus;
  resolved_in_iteration?: string;
  resolved_at?: string;
  replies: FeedbackReply[];
  created_at: string;
}

// 携带多角色反馈的执行步骤
export interface ExecStepWithFeedback extends ExecStep {
  feedback_entries: StepFeedbackEntry[];
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

// ===== 治理工作流 Pipeline =====

/** 四个标准治理阶段 */
export type WorkflowStageType = 'perception' | 'judgment' | 'mitigation' | 'reinforcement';

export interface WorkflowStageDef {
  type: WorkflowStageType;
  name: string;
  order: number;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

/** 人工交互模式：阻断 / 非阻断 */
export type HumanInteractionMode = 'blocking' | 'non_blocking';

/** 人工交互类型 */
export type HumanInteractionType =
  // === 标注类（不阻断） ===
  | 'annotate_fp_fn'      // 标注误报/漏报（感知阶段）
  | 'annotate_judgment'   // 标注研判结果
  | 'annotate_action'     // 标注处置效果
  | 'rate_quality'        // 评分
  // === 确认类（不阻断，可累积反馈） ===
  | 'confirm_signal'      // 确认风险信号准确性
  | 'confirm_dispatch'    // 确认case分发
  | 'suggest_improvement' // 改进建议
  // === 阻断类（会暂停流程） ===
  | 'return_judgment'     // 人工返回研判结果和原因（阻断流程）
  | 'approve_action'      // 批准处置动作（阻断流程）
  | 'approve_rule';       // 审批规则变更（阻断流程）

/** 分配信息 */
export interface TaskAssignment {
  assignee: string;           // 被分配人
  assigneeRole: string;       // 被分配人角色
  deadline?: string;          // 截止时间
  priority: 'urgent' | 'high' | 'normal';
  instruction?: string;       // 任务说明
}

/** 人工交互配置 */
export interface HumanInteraction {
  type: HumanInteractionType;
  mode: HumanInteractionMode; // 阻断 / 非阻断
  label: string;              // 操作入口标签
  description: string;        // 操作说明
  // 阻断型专用
  blockingConfig?: {
    assignment: TaskAssignment;  // 分配给谁
    actionLabel: string;         // 主操作按钮文案，如"提交研判结论"
    secondaryLabel?: string;     // 次要操作，如"转交他人"
    inputRequired: boolean;      // 是否需要填写文本
    inputLabel?: string;         // 输入框标签
    hasOptions?: { value: string; label: string }[]; // 可选项
    notifyChannels?: string[];   // 通知渠道: 'in_app' | 'email' | 'dingtalk'
  };
  // 非阻断型专用
  nonBlockingConfig?: {
    feedbackType: 'annotation' | 'rating' | 'suggestion' | 'correction';
    quickActions?: { value: string; label: string; icon?: string }[]; // 快捷操作按钮
    showInput?: boolean;       // 是否显示文本输入
    inputPlaceholder?: string;
  };
}

/** 阶段级别指标（按用户要求定制） */
export interface StageMetrics {
  durationMs: number;
  // 感知阶段
  recallCases?: number;           // 召回case量
  strategyEffectiveRate?: number; // 策略有效率
  // 研判阶段
  riskCases?: number;             // 风险case数
  // 处置阶段
  disposedCases?: number;         // 处置case数
  // 策略补防阶段
  iteratedStrategies?: number;    // 迭代策略条数
  newRecalledCases?: number;      // 新增召回审出风险case
  // 通用
  accuracy?: number;
  customLabel?: string;
  customValue?: number | string;
}

/** 工作流子步骤 */
export interface WorkflowSubStep {
  id: string;
  name: string;
  type: 'skill_call' | 'llm_reason' | 'decision' | 'sub_agent';
  status: StepStatus;
  input: string;
  output: string;
  duration_ms: number;
  details?: string;
  humanInteraction: HumanInteraction;
  feedback_entries: StepFeedbackEntry[];
}

/** 一个治理阶段包含的子步骤 */
export interface WorkflowStage {
  stage: WorkflowStageType;
  status: 'pending' | 'running' | 'completed' | 'blocked' | 'needs_approval';
  subSteps: WorkflowSubStep[];
  metrics: StageMetrics;
  needsApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'modified';
  approvalBy?: string;
  approvedAt?: string;
  // 阻断任务列表（阻挡该阶段的阻断型交互）
  blockingTasks: BlockingTask[];
}

/** 阻断任务 */
export interface BlockingTask {
  id: string;
  stepId: string;
  stepName: string;
  interactionType: HumanInteractionType;
  assignment: TaskAssignment;
  description: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'transferred';
  result?: string;
  completedBy?: string;
  completedAt?: string;
}

/** 一次完整的治理执行 */
export interface GovernanceExecution {
  id: string;
  agentName: string;
  input: string;
  status: 'running' | 'completed' | 'failed' | 'awaiting_approval';
  stages: WorkflowStage[];
  totalDurationMs: number;
  createdAt: string;
  completedAt?: string;
  executedBy: string;
  overallMetrics: {
    totalCases: number;
    effectiveRecall: number;
    rulesGenerated: number;
    actionsTaken: number;
  };
}

/** Agent 工作区（一级页面用） */
export interface AgentWorkspace {
  agentName: string;
  displayName: string;
  description: string;
  icon: string;
  kpis: {
    totalExecutions: number;
    successRate: number;
    avgDurationMs: number;
    pendingBlocks: number;      // 待处理的阻断任务数
  };
  latestExecution: GovernanceExecution | null;
  activeBlockingTasks: BlockingTask[];
}
