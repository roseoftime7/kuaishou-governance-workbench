import { Typography, Space, Tag, Empty } from 'antd';
import type { StepFeedbackEntry } from '../../types';

interface Props {
  stepOutput: string;
  annotations: StepFeedbackEntry[];
}

const LABEL_COLORS: Record<string, string> = {
  correct: 'green',
  incorrect: 'red',
  partial: 'orange',
  uncertain: 'default',
};

const LABEL_TEXTS: Record<string, string> = {
  correct: '正确',
  incorrect: '不正确',
  partial: '部分正确',
  uncertain: '不确定',
};

export default function AnnotationComparison({ stepOutput, annotations }: Props) {
  if (annotations.length === 0) {
    return <Empty description="暂无多角色标注" />;
  }

  if (annotations.length === 1) {
    const a = annotations[0];
    return (
      <div style={{ background: '#fafafa', borderRadius: 6, padding: 10, marginTop: 8 }}>
        <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>步骤输出</Typography.Text>
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, padding: 8, marginBottom: 8, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
          {stepOutput}
        </div>
        <div style={{ borderTop: '2px solid #1677ff', paddingTop: 8 }}>
          <Space size={4}>
            <Tag color="blue" style={{ fontSize: 9, lineHeight: '14px' }}>{a.operator_role}</Tag>
            <Tag color={LABEL_COLORS[a.annotation_label || ''] || 'default'} style={{ fontSize: 9 }}>{LABEL_TEXTS[a.annotation_label || ''] || a.annotation_label}</Tag>
            <Typography.Text style={{ fontSize: 11, color: '#666' }}>{a.created_by}</Typography.Text>
          </Space>
          <Typography.Text style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{a.annotation || a.content}</Typography.Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fafafa', borderRadius: 6, padding: 10, marginTop: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>步骤输出</Typography.Text>
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4, padding: 8, marginBottom: 8, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
        {stepOutput}
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>多角色标注对比</Typography.Text>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {annotations.map(a => (
          <div
            key={a.id}
            style={{
              flex: '0 0 240px', background: '#fff', border: `2px solid ${a.annotation_label === 'correct' ? '#52c41a' : a.annotation_label === 'incorrect' ? '#ff4d4f' : '#faad14'}`,
              borderRadius: 6, padding: 8,
            }}
          >
            <Space size={4}>
              <Tag color="blue" style={{ fontSize: 9, lineHeight: '14px' }}>{a.operator_role}</Tag>
              <Tag color={LABEL_COLORS[a.annotation_label || '']} style={{ fontSize: 9 }}>{LABEL_TEXTS[a.annotation_label || '']}</Tag>
            </Space>
            <div style={{ fontSize: 11, color: '#999', margin: '2px 0' }}>{a.created_by}</div>
            <Typography.Text style={{ fontSize: 12, display: 'block' }}>{a.annotation || a.content}</Typography.Text>
          </div>
        ))}
      </div>
    </div>
  );
}
