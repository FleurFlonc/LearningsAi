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
    <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl dark:bg-teal-950/30 dark:border-teal-800">
      <p className="text-sm text-teal-900 dark:text-teal-200 font-medium">
        Je hebt 10 nieuwe sessies gelogd.
      </p>
      <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">
        Overweeg een backup te maken.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleExport}
          className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors dark:bg-teal-700 dark:hover:bg-teal-600"
        >
          Exporteer nu
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-800 text-xs font-semibold rounded-lg transition-colors dark:bg-teal-900/40 dark:text-teal-300"
        >
          Later herinneren
        </button>
      </div>
    </div>
  );
}
