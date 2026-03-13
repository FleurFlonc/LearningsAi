import type { SessionStatus } from '@/models/enums';
import { getStatusLabel } from '@/features/sessions/utils/sessionUtils';

interface StatusBadgeProps {
  status: SessionStatus;
}

const statusStyles: Record<SessionStatus, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
