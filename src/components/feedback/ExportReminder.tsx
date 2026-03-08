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
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950/30 dark:border-amber-800">
      <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
        Je hebt 10 nieuwe sessies gelogd.
      </p>
      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
        Overweeg een backup te maken.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleExport}
          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Exporteer nu
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition-colors dark:bg-amber-900/40 dark:text-amber-300"
        >
          Later herinneren
        </button>
      </div>
    </div>
  );
}
