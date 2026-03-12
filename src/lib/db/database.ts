import Dexie, { type Table } from 'dexie';
import type { LearningSession } from '@/models/session';
import type { UserPreference } from '@/models/preferences';

/**
 * AILearningLogDB — Dexie database class
 *
 * Schema-versie regels:
 * - Verwijder nooit velden zonder migratiepad
 * - Hernoem nooit een veld zonder migratiepad
 * - Verhoog het versienummer bij elke structuurwijziging
 * - Gebruik de Dexie upgrade() functie voor datamigraties
 *
 * Huidig versienummer: 2
 */
export class AILearningLogDB extends Dexie {
  sessions!: Table<LearningSession, string>;
  preferences!: Table<UserPreference, number>;

  constructor() {
    super('AILearningLogDB');

    // Versie 1 — initieel schema
    // sessions: primary key = id, indexes op createdAt, status, aiTool, taskType, isFavorite
    // preferences: primary key = id (altijd 1)
    this.version(1).stores({
      sessions: 'id, createdAt, status, aiTool, taskType, isFavorite',
      preferences: 'id',
    });

    // Versie 2 — aiTool (enkelvoud) vervangen door aiTools (array, multi-entry index)
    // *aiTools = multi-entry index: Dexie indexeert elk element afzonderlijk
    this.version(2).stores({
      sessions: 'id, createdAt, status, *aiTools, taskType, isFavorite',
      preferences: 'id',
    }).upgrade(async (tx) => {
      await tx.table('sessions').toCollection().modify((session: any) => {
        if (session.aiTool !== undefined) {
          session.aiTools = [session.aiTool];
        }
        delete session.aiTool;
      });
    });
  }
}

// Singleton instantie — gebruik deze in alle services
export const db = new AILearningLogDB();
