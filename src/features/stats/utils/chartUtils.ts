import type { LearningSession } from '@/models/session';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

const TOOL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  cursor: 'Cursor',
  gemini: 'Gemini',
  copilot: 'Copilot',
  other: 'Overig',
};

/** Sessies per week voor de afgelopen 8 weken (inclusief huidige week). */
export function getWeeklyData(
  sessions: LearningSession[],
): Array<{ week: string; sessions: number }> {
  const now = new Date();

  // Zondag 00:00:00 van de huidige week
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  const result: Array<{ week: string; sessions: number }> = [];

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart.getTime() - i * MS_PER_WEEK);
    const weekEnd = new Date(weekStart.getTime() + MS_PER_WEEK);

    const count = sessions.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    }).length;

    result.push({ week: i === 0 ? 'Nu' : `Wk ${8 - i}`, sessions: count });
  }

  return result;
}

/** Tellingen per status (segmenten met 0 worden weggefilterd). */
export function getStatusData(
  sessions: LearningSession[],
): Array<{ name: string; value: number; color: string }> {
  return [
    { name: 'Gelukt', value: sessions.filter((s) => s.status === 'success').length, color: '#22c55e' },
    { name: 'Gedeeltelijk', value: sessions.filter((s) => s.status === 'partial').length, color: '#f59e0b' },
    { name: 'Mislukt', value: sessions.filter((s) => s.status === 'failed').length, color: '#ef4444' },
  ].filter((d) => d.value > 0);
}

/** Sessietellingen per AI-tool, gesorteerd descending, alleen tools met ≥ 1 sessie. */
export function getToolData(
  sessions: LearningSession[],
): Array<{ tool: string; count: number }> {
  const counts: Record<string, number> = {};

  for (const session of sessions) {
    for (const tool of session.aiTools ?? []) {
      counts[tool] = (counts[tool] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([key, count]) => ({ tool: TOOL_LABELS[key] ?? key, count }))
    .sort((a, b) => b.count - a.count);
}
