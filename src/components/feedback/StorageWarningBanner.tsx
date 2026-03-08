import { useNavigate } from 'react-router-dom';
import { useStorageWarning } from '@/hooks/useStorageWarning';

export function StorageWarningBanner() {
  const { level, percentage } = useStorageWarning();
  const navigate = useNavigate();

  if (level === 'ok') return null;

  const isCritical = level === 'critical';

  return (
    <div
      role="alert"
      className={`px-4 py-3 border-b flex items-center justify-between gap-4 ${
        isCritical
          ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
          : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
      }`}
    >
      <p className={`text-sm font-medium ${isCritical ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
        {percentage}% opslagruimte in gebruik
        {isCritical ? ' — kritiek niveau' : ''}
      </p>
      <button
        onClick={() => navigate('/settings')}
        className={`text-xs font-semibold shrink-0 underline ${isCritical ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}
      >
        Exporteer data
      </button>
    </div>
  );
}
