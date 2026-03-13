import { downloadJSON } from '@/features/export/exportService';
import { resetSessionCount } from '@/features/settings/services/preferenceService';

interface ExportReminderProps {
  onDismiss: () => void;
}

export function ExportReminder({ onDismiss }: ExportReminderProps) {
  const handleExport = async () => {
    await downloadJSON();
    await resetSessionCount();
    onDismiss();
  };

  return (
    <div className="mt-4 p-4 bg-sage-subtle border border-sage/20 rounded-xl dark:bg-sage/10 dark:border-sage/20">
      <p className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
        Je hebt 10 nieuwe sessies gelogd.
      </p>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
        Overweeg een backup te maken.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleExport}
          className="px-4 py-1.5 bg-sage hover:bg-sage-hover text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Exporteer nu
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors dark:bg-neutral-700/50 dark:text-neutral-300"
        >
          Later herinneren
        </button>
      </div>
    </div>
  );
}
