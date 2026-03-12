import type { SessionStatus } from '@/models/enums';
import type { LearningSession } from '@/models/session';

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function generateTimestamp(): string {
  return new Date().toISOString();
}

export function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatSessionTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusLabel(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    success: 'Gelukt',
    partial: 'Gedeeltelijk',
    failed: 'Mislukt',
  };
  return labels[status];
}

export function getStatusColor(status: SessionStatus): string {
  const colors: Record<SessionStatus, string> = {
    success: 'text-green-600',
    partial: 'text-yellow-600',
    failed: 'text-red-600',
  };
  return colors[status];
}

export function truncateLesson(lesson: string, maxLength = 120): string {
  if (lesson.length <= maxLength) return lesson;
  return `${lesson.slice(0, maxLength - 3)}...`;
}

export function isSessionComplete(session: LearningSession): boolean {
  const hasRequired =
    session.taskDescription.trim().length > 0 &&
    session.lessonLearned.trim().length > 0 &&
    session.status !== undefined;

  if (!hasRequired) return false;

  const optionalFields: Array<keyof LearningSession> = [
    'whatWentWrong',
    'resolution',
    'reflectionNotes',
    'aiTools',
    'taskType',
    'problemCategory',
    'resolutionType',
    'learningValue',
    'frustrationLevel',
    'confidenceAfter',
    'durationMinutes',
    'tags',
  ];

  const filledCount = optionalFields.filter(field => {
    const value = session[field];
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length;

  return filledCount >= 3;
}
