import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload } from 'lucide-react';
import { usePreferenceStore } from '@/features/settings/store/preferenceStore';
import { useSessionStore } from '@/features/sessions/store/sessionStore';
import { useStorageWarning } from '@/hooks/useStorageWarning';
import { downloadJSON, validateImportFile } from '@/features/export/exportService';
import { getSessionById, importSession } from '@/features/sessions/services/sessionService';
import { resetSessionCount } from '@/features/settings/services/preferenceService';
import type { ThemeMode } from '@/models/enums';
import type { LearningSession } from '@/models/session';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Licht' },
  { value: 'dark', label: 'Donker' },
  { value: 'system', label: 'Systeem' },
];

type ImportState = 'idle' | 'preview' | 'importing' | 'done';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = usePreferenceStore();
  const loadSessions = useSessionStore((state) => state.loadSessions);
  const { percentage } = useStorageWarning();

  // Export state
  const [exportStatus, setExportStatus] = useState<'idle' | 'success'>('idle');
  const [exportFilename, setExportFilename] = useState('');

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importPreview, setImportPreview] = useState<{
    sessionCount: number;
    dateRange: string;
    sessions: LearningSession[];
  } | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = async () => {
    const date = new Date().toISOString().split('T')[0];
    const filename = `ai-learning-log-${date}.json`;
    await downloadJSON(filename);
    await resetSessionCount();
    setExportFilename(filename);
    setExportStatus('success');
    setTimeout(() => setExportStatus('idle'), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const validation = validateImportFile(text);

      if (!validation.valid) {
        setImportError(validation.errors[0] ?? 'Ongeldig bestand');
        setImportState('idle');
        return;
      }

      const data = JSON.parse(text) as { sessions: LearningSession[] };
      const sessions = data.sessions;

      const dates = sessions.map((s) => s.createdAt).sort();
      const dateRange =
        dates.length > 0 ? `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}` : '';

      setImportPreview({ sessionCount: validation.sessionCount, dateRange, sessions });
      setImportState('preview');
      setImportError(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!importPreview) return;
    setImportState('importing');

    let imported = 0;
    let skipped = 0;

    for (const session of importPreview.sessions) {
      const existing = await getSessionById(session.id);
      if (existing) {
        skipped++;
      } else {
        await importSession(session);
        imported++;
      }
    }

    await loadSessions();
    setImportResult({ imported, skipped });
    setImportState('done');
  };

  const resetImport = () => {
    setImportState('idle');
    setImportPreview(null);
    setImportResult(null);
    setImportError(null);
  };

  if (!preferences) return null;

  const SectionTitle = ({ children }: { children: string }) => (
    <h2 className="text-xs font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Instellingen</h1>

      {/* Theme */}
      <section className="mb-8">
        <SectionTitle>Weergave</SectionTitle>
        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">Thema</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updatePreferences({ themeMode: value })}
                aria-pressed={preferences.themeMode === value}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  preferences.themeMode === value
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data & backup */}
      <section className="mb-8">
        <SectionTitle>Data & backup</SectionTitle>
        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
          {/* Storage usage */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Opslaggebruik</p>
              <span className="text-xs text-stone-500 dark:text-slate-400">{percentage}%</span>
            </div>
            <div className="h-2 bg-stone-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentage >= 80 ? 'bg-red-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${percentage}% van beschikbare opslag in gebruik`}
              />
            </div>
            <p className="mt-1 text-xs text-stone-400 dark:text-slate-500">
              {percentage}% van beschikbare opslag in gebruik
            </p>
          </div>

          {/* Export button */}
          <div>
            <button
              onClick={handleExport}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Exporteer naar JSON
            </button>
            {exportStatus === 'success' && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>Backup opgeslagen als <span className="font-semibold">{exportFilename}</span></span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Herstel vanuit backup */}
      <section className="mb-8">
        <SectionTitle>Herstel vanuit backup</SectionTitle>
        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-sm text-stone-500 dark:text-slate-400">
            Importeer een eerder geëxporteerd JSON-bestand om je sessies te herstellen. Bestaande sessies worden niet overschreven.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Error */}
          {importError && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {importError}
            </p>
          )}

          {/* Idle: select file button */}
          {importState === 'idle' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-stone-300 dark:border-slate-600 hover:border-amber-400 dark:hover:border-amber-500 text-stone-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              Kies een backup-bestand
            </button>
          )}

          {/* Preview */}
          {importState === 'preview' && importPreview && (
            <div className="space-y-3">
              <div className="bg-stone-50 dark:bg-slate-700/50 rounded-lg px-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {importPreview.sessionCount} sessies gevonden
                </p>
                {importPreview.dateRange && (
                  <p className="text-xs text-stone-500 dark:text-slate-400">{importPreview.dateRange}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  Importeer
                </button>
                <button
                  onClick={resetImport}
                  className="px-4 py-2.5 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-600 font-semibold text-sm rounded-xl transition-colors"
                >
                  Annuleer
                </button>
              </div>
            </div>
          )}

          {/* Importing */}
          {importState === 'importing' && (
            <p className="text-sm text-stone-500 dark:text-slate-400 text-center py-2">
              Bezig met importeren…
            </p>
          )}

          {/* Done */}
          {importState === 'done' && importResult && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <span className="font-semibold">{importResult.imported} sessies geïmporteerd</span>
                  {importResult.skipped > 0 && (
                    <>, {importResult.skipped} overgeslagen (al aanwezig)</>
                  )}
                </span>
              </div>
              <button
                onClick={resetImport}
                className="w-full py-2.5 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-600 font-semibold text-sm rounded-xl transition-colors"
              >
                Nog een bestand importeren
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Onboarding */}
      <section className="mb-8">
        <SectionTitle>Onboarding</SectionTitle>
        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4">
          <button
            onClick={() => navigate('/onboarding')}
            className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
          >
            Bekijk introductie opnieuw
          </button>
        </div>
      </section>

      {/* Over */}
      <section>
        <SectionTitle>Over</SectionTitle>
        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            AI Learning Log <span className="font-normal text-stone-400 dark:text-slate-500">v0.1.0</span>
          </p>
          <p className="text-xs text-stone-500 dark:text-slate-400 leading-relaxed">
            Alle data wordt lokaal opgeslagen op dit apparaat. Er wordt niets verstuurd naar externe servers.
          </p>
        </div>
      </section>
    </div>
  );
}
