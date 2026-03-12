import { db } from '@/lib/db/database';
import type { LearningSession, CreateSessionInput, UpdateSessionInput } from '@/models/session';
import type { SessionFilters } from '@/types';
import { generateSessionId, generateTimestamp } from '../utils/sessionUtils';

export async function createSession(input: CreateSessionInput): Promise<LearningSession> {
  const now = generateTimestamp();
  const session: LearningSession = {
    ...input,
    id: generateSessionId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.sessions.add(session);
  return session;
}

export async function updateSession(input: UpdateSessionInput): Promise<LearningSession> {
  const existing = await db.sessions.get(input.id);
  if (!existing) {
    throw new Error(`Sessie met id '${input.id}' niet gevonden`);
  }

  const { id: _id, ...updates } = input;

  const updated: LearningSession = {
    ...existing,
    ...(updates as Partial<LearningSession>),
    updatedAt: generateTimestamp(),
  };

  await db.sessions.put(updated);
  return updated;
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

export async function getSessionById(id: string): Promise<LearningSession | undefined> {
  return db.sessions.get(id);
}

export async function getAllSessions(): Promise<LearningSession[]> {
  return db.sessions.orderBy('createdAt').reverse().toArray();
}

export async function getSessionsPaginated(page: number, limit: number): Promise<LearningSession[]> {
  const offset = Math.max(0, (page - 1) * limit);
  return db.sessions.orderBy('createdAt').reverse().offset(offset).limit(limit).toArray();
}

export async function searchSessions(query: string): Promise<LearningSession[]> {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return getAllSessions();

  const allSessions = await getAllSessions();
  return allSessions.filter(session => {
    const searchable = [
      session.taskDescription,
      session.lessonLearned,
      session.whatWentWrong ?? '',
    ];
    return searchable.some(field => field.toLowerCase().includes(lowerQuery));
  });
}

export async function filterSessions(filters: SessionFilters): Promise<LearningSession[]> {
  const allSessions = await db.sessions.orderBy('createdAt').reverse().toArray();

  return allSessions.filter(session => {
    if (filters.status !== undefined && session.status !== filters.status) return false;
    if (filters.aiTool !== undefined && !(session.aiTools?.includes(filters.aiTool))) return false;
    if (filters.taskType !== undefined && session.taskType !== filters.taskType) return false;
    if (filters.isFavorite !== undefined && session.isFavorite !== filters.isFavorite) return false;
    return true;
  });
}

export async function getFavoriteSessions(): Promise<LearningSession[]> {
  const allSessions = await db.sessions.orderBy('createdAt').reverse().toArray();
  return allSessions.filter(session => session.isFavorite === true);
}

export async function duplicateSession(id: string): Promise<LearningSession> {
  const original = await db.sessions.get(id);
  if (!original) {
    throw new Error(`Sessie met id '${id}' niet gevonden`);
  }

  const now = generateTimestamp();
  const duplicate: LearningSession = {
    ...original,
    id: generateSessionId(),
    createdAt: now,
    updatedAt: now,
  };

  await db.sessions.add(duplicate);
  return duplicate;
}

// Importeert een sessie met origineel id, createdAt en updatedAt behouden.
// Gebruikt put() zodat het gedrag deterministisch is ongeacht of het record al bestaat.
export async function importSession(session: LearningSession): Promise<void> {
  await db.sessions.put(session);
}
