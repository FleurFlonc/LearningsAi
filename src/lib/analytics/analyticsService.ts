// Stateless analytics berekeningen.
// Deze service ontvangt data als parameter — geen directe DB-calls.
// Ophalen van data is de verantwoordelijkheid van de aanroepende laag (store/hook).

import type { LearningSession } from '@/models/session';
import type { AIToolType, TaskType } from '@/models/enums';
import type { DerivedAnalytics } from '@/models/analytics';

export function calculateAnalytics(sessions: LearningSession[]): DerivedAnalytics {
  const total = sessions.length;

  const now = new Date();

  // Begin van huidige week (zondag 00:00:00)
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  // Begin van vorige week
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  return {
    totalSessions: total,
    successRate: calculateSuccessRate(sessions),
    partialRate: total > 0 ? (sessions.filter(s => s.status === 'partial').length / total) * 100 : 0,
    failureRate: total > 0 ? (sessions.filter(s => s.status === 'failed').length / total) * 100 : 0,
    mostUsedAITool: getMostUsedTool(sessions),
    topTaskType: getTopTaskType(sessions),
    averageLearningValue: getAverageLearningValue(sessions),
    averageFrustration: getAverageFrustration(sessions),
    sessionsThisWeek: getSessionsInDateRange(sessions, startOfThisWeek, now).length,
    sessionsLastWeek: getSessionsInDateRange(sessions, startOfLastWeek, startOfThisWeek).length,
  };
}

export function calculateSuccessRate(sessions: LearningSession[]): number {
  if (sessions.length === 0) return 0;
  const successCount = sessions.filter(s => s.status === 'success').length;
  return (successCount / sessions.length) * 100;
}

export function getMostUsedTool(sessions: LearningSession[]): AIToolType | null {
  const withTool = sessions.filter(s => s.aiTool !== undefined);
  if (withTool.length === 0) return null;

  const counts = withTool.reduce<Record<string, number>>((acc, s) => {
    const tool = s.aiTool as string;
    acc[tool] = (acc[tool] ?? 0) + 1;
    return acc;
  }, {});

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return topEntry ? (topEntry[0] as AIToolType) : null;
}

export function getTopTaskType(sessions: LearningSession[]): TaskType | null {
  const withType = sessions.filter(s => s.taskType !== undefined);
  if (withType.length === 0) return null;

  const counts = withType.reduce<Record<string, number>>((acc, s) => {
    const type = s.taskType as string;
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return topEntry ? (topEntry[0] as TaskType) : null;
}

export function getSessionsInDateRange(
  sessions: LearningSession[],
  from: Date,
  to: Date,
): LearningSession[] {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return sessions.filter(s => {
    const t = new Date(s.createdAt).getTime();
    return t >= fromTime && t <= toTime;
  });
}

export function getAverageLearningValue(sessions: LearningSession[]): number | null {
  const withValue = sessions.filter(s => s.learningValue !== undefined);
  if (withValue.length === 0) return null;
  const sum = withValue.reduce((acc, s) => acc + (s.learningValue as number), 0);
  return sum / withValue.length;
}

function getAverageFrustration(sessions: LearningSession[]): number | null {
  const withValue = sessions.filter(s => s.frustrationLevel !== undefined);
  if (withValue.length === 0) return null;
  const sum = withValue.reduce((acc, s) => acc + (s.frustrationLevel as number), 0);
  return sum / withValue.length;
}
