import { useState } from 'react';
import { Card, Typography, Space, Tag, Button, Badge, Collapse } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import type { ExecStepWithFeedback, StepFeedbackEntry } from '../../types';
import AnnotationComparison from './AnnotationComparison';
import FeedbackCoverageBadge from './FeedbackCoverageBadge';

interface Props {
  step: ExecStepWithFeedback;
  execId: string;
  onFeedbackClick: (execId: string, stepId: string) => void;
}

export default function StepDetailPanel({ step, execId, onFeedbackClick }: Props) {
  const [showRaw, setShowRaw] = useState(false);

  const annotationEntries = step.feedback_entries.filter(
    (f: StepFeedbackEntry) => f.type === 'annotation' || f.annotation
  );

  return (
    <Card
      size="small"
      style={{ marginBottom: 8, borderLeft: `3px solid ${step.status === 'success' ? '#52c41a' : '#ff4d4f'}` }}
      bodyStyle={{ padding: 10 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Typography.Text strong style={{ fontSize: 13 }}>{step.name}</Typography.Text>
          <Tag color="purple" style={{ fontSize: 9, lineHeight: '16px' }}>{step.type}</Tag>
          <Tag style={{ fontSize: 9, lineHeight: '16px' }}>{(step.duration_ms / 1000).toFixed(1)}s</Tag>
          {step.status === 'success' ? (
            <Tag color="green" style={{ fontSize: 9 }}>成功</Tag>
          ) : (
            <Tag color="red" style={{ fontSize: 9 }}>失败</Tag>
          )}
        </Space>
        <Space size={4}>
          {step.feedback_entries.length > 0 && (
            <Badge
              count={step.feedback_entries.length}
              size="small"
              style={{ backgroundColor: '#1677ff' }}
              overflowCount={99}
            />
          )}
          <Button
            size="small"
            type="link"
            style={{ fontSize: 11 }}
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? '收起' : '原始数据'}
          </Button>
        </Space>
      </div>

      {/* Input/Output */}
      <div style={{ marginTop: 6, background: '#f5f5f5', padding: 6, borderRadius: 4 }}>
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>输入:</Typography.Text>
        <Typography.Text code style={{ fontSize: 11, display: 'block', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
          {step.input || 'N/A'}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>输出:</Typography.Text>
        <Typography.Text style={{ fontSize: 12, display: 'block', whiteSpace: 'pre-wrap' }}>
          {step.output || 'N/A'}
        </Typography.Text>
        {step.details && (
          <>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>详情:</Typography.Text>
            <Typography.Text style={{ fontSize: 11, display: 'block', color: '#666' }}>{step.details}</Typography.Text>
          </>
        )}
        {showRaw && (
          <div style={{ marginTop: 4 }}>
            <Typography.Text type="secondary" style={{ fontSize: 10 }}>原始 JSON:</Typography.Text>
            <pre style={{ fontSize: 10, background: '#1e1e1e', color: '#d4d4d4', padding: 6, borderRadius: 4, overflowX: 'auto', maxHeight: 200 }}>
              {JSON.stringify(step, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Annotation Comparison */}
      {annotationEntries.length > 0 && (
        <AnnotationComparison stepOutput={step.output} annotations={annotationEntries} />
      )}

      {/* Multi-Role Feedback */}
      {step.feedback_entries.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Collapse
            ghost
            size="small"
            items={[{
              key: 'feedback',
              label: (
                <Space size={4}>
                  <MessageOutlined style={{ fontSize: 11 }} />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    多角色反馈 ({step.feedback_entries.length})
                  </Typography.Text>
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {step.feedback_entries.map(fb => (
                    <div key={fb.id} style={{ background: '#f0f5ff', borderRadius: 4, padding: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size={4} wrap>
                          <Tag color="blue" style={{ fontSize: 9, lineHeight: '14px' }}>{fb.type}</Tag>
                          <Tag color="orange" style={{ fontSize: 9, lineHeight: '14px' }}>{fb.operator_role}</Tag>
                          <Typography.Text style={{ fontSize: 11, color: '#666' }}>{fb.created_by}</Typography.Text>
                          <FeedbackCoverageBadge status={fb.coverage_status} />
                        </Space>
                        <Typography.Text style={{ fontSize: 10, color: '#999' }}>{fb.created_at}</Typography.Text>
                      </div>
                      <Typography.Text style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{fb.content}</Typography.Text>
                      {fb.rating && (
                        <div style={{ marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: '#666' }}>评分: {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                        </div>
                      )}
                      {fb.replies.length > 0 && (
                        <div style={{ marginTop: 4, paddingLeft: 12, borderLeft: '2px solid #1677ff' }}>
                          {fb.replies.map((r, i) => (
                            <div key={r.id || i} style={{ marginTop: 2 }}>
                              <Space size={4}>
                                <Typography.Text style={{ fontSize: 11, color: '#1677ff' }}>{r.user}</Typography.Text>
                                <Typography.Text style={{ fontSize: 10, color: '#999' }}>{r.created_at}</Typography.Text>
                              </Space>
                              <Typography.Text style={{ fontSize: 11, display: 'block' }}>{r.content}</Typography.Text>
                            </div>
                          ))}
                        </div>
                      )}
                      {fb.resolved_in_iteration && (
                        <div style={{ marginTop: 4, fontSize: 11, color: '#52c41a' }}>
                          已通过迭代 {fb.resolved_in_iteration} 覆盖
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ),
            }]}
          />
        </div>
      )}

      {/* Feedback Button */}
      <div style={{ marginTop: 6 }}>
        <Button
          size="small"
          type="link"
          icon={<MessageOutlined />}
          onClick={() => onFeedbackClick(execId, step.id)}
          style={{ fontSize: 11, padding: 0 }}
        >
          {step.feedback_entries.length > 0 ? '追加反馈' : '提交反馈'}
        </Button>
      </div>
    </Card>
  );
}
