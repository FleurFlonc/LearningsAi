import type { ThemeMode, ExportFormat } from './enums';

export interface UserPreference {
  id: 1;                              // Altijd 1 — singleton record
  themeMode: ThemeMode;
  defaultView: 'lessons' | 'stats';
  exportFormat: ExportFormat;
  onboardingCompleted: boolean;
  sessionCountSinceLastExport: number; // Teller voor export-herinnering (elke 10 sessies)
}
