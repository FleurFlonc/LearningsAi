import { db } from '@/lib/db/database';
import { getPreferences } from '@/features/settings/services/preferenceService';
import type { ExportData, ImportValidationResult } from '@/types';

export async function exportToJSON(): Promise<string> {
  const [sessions, preferences] = await Promise.all([
    db.sessions.orderBy('createdAt').toArray(),
    getPreferences(),
  ]);

  const exportData: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    preferences,
  };

  return JSON.stringify(exportData, null, 2);
}

export async function downloadJSON(filename?: string): Promise<void> {
  const json = await exportToJSON();
  const date = new Date().toISOString().split('T')[0];
  const resolvedFilename = filename ?? `ai-learning-log-${date}.json`;

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = resolvedFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function validateImportFile(json: string): ImportValidationResult {
  // Fase A stub — volledige validatie (inclusief sessie-schema checks) komt in Fase C.
  try {
    const data = JSON.parse(json) as unknown;

    if (typeof data !== 'object' || data === null) {
      return { valid: false, sessionCount: 0, errors: ['Ongeldig JSON-formaat'] };
    }

    const parsed = data as Record<string, unknown>;

    if (parsed['version'] !== 1) {
      return {
        valid: false,
        sessionCount: 0,
        errors: [`Onbekende exportversie: ${String(parsed['version'])}`],
      };
    }

    if (!Array.isArray(parsed['sessions'])) {
      return {
        valid: false,
        sessionCount: 0,
        errors: ['Geen sessies gevonden in exportbestand'],
      };
    }

    return {
      valid: true,
      sessionCount: (parsed['sessions'] as unknown[]).length,
      errors: [],
    };
  } catch {
    return { valid: false, sessionCount: 0, errors: ['JSON kon niet worden geparsed'] };
  }
}
