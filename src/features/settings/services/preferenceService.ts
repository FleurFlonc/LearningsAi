import { db } from '@/lib/db/database';
import type { UserPreference } from '@/models/preferences';

const DEFAULT_PREFERENCES: UserPreference = {
  id: 1,
  themeMode: 'system',
  defaultView: 'lessons',
  exportFormat: 'json',
  onboardingCompleted: false,
  sessionCountSinceLastExport: 0,
};

export async function getPreferences(): Promise<UserPreference> {
  const prefs = await db.preferences.get(1);
  return prefs ?? { ...DEFAULT_PREFERENCES };
}

export async function updatePreferences(
  updates: Partial<Omit<UserPreference, 'id'>>,
): Promise<UserPreference> {
  const current = await getPreferences();
  const updated: UserPreference = { ...current, ...updates };
  await db.preferences.put(updated);
  return updated;
}

export async function resetPreferences(): Promise<UserPreference> {
  const defaults = { ...DEFAULT_PREFERENCES };
  await db.preferences.put(defaults);
  return defaults;
}

export async function incrementSessionCount(): Promise<void> {
  const prefs = await getPreferences();
  await db.preferences.put({
    ...prefs,
    sessionCountSinceLastExport: prefs.sessionCountSinceLastExport + 1,
  });
}

export async function resetSessionCount(): Promise<void> {
  const prefs = await getPreferences();
  await db.preferences.put({ ...prefs, sessionCountSinceLastExport: 0 });
}

export async function shouldShowExportReminder(): Promise<boolean> {
  const prefs = await getPreferences();
  return prefs.sessionCountSinceLastExport >= 10;
}
