import { Tag } from 'antd';
import type { FeedbackCoverageStatus } from '../../types';

const STATUS_MAP: Record<FeedbackCoverageStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'default' },
  in_iteration: { label: '迭代中', color: 'blue' },
  covered: { label: '已覆盖', color: 'green' },
  verified: { label: '已验证', color: 'purple' },
};

export default function FeedbackCoverageBadge({ status }: { status: FeedbackCoverageStatus }) {
  const cfg = STATUS_MAP[status] || { label: status, color: 'default' };
  return <Tag color={cfg.color} style={{ fontSize: 10, lineHeight: '18px' }}>{cfg.label}</Tag>;
}
