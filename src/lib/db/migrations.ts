import { db } from './database';

/**
 * Migratiestrategie
 *
 * Dexie beheert schema-versioning via zijn version() API.
 * Elke versie-upgrade is gedefinieerd in database.ts met:
 *   db.version(N).stores({ ... }).upgrade(tx => { ... })
 *
 * Regels:
 * - Versiegeschiedenis moet volledig en opeenvolgend zijn
 * - Gebruik de upgrade() callback voor datatransformaties
 * - Test migraties op een kopie van productiedata voor deployment
 * - Verhoog altijd het versienummer — nooit verlagen
 *
 * Versiehistorie:
 *   v1 (initieel): sessions + preferences tabellen
 *   v2: aiTool (enkelvoud) → aiTools (array, multi-entry index)
 *
 * Bij het toevoegen van versie 3:
 *   1. Voeg db.version(3).stores(...).upgrade(...) toe in database.ts
 *   2. Verhoog EXPECTED_VERSION hieronder naar 3
 *   3. Documenteer de wijziging in docs/DATA_MODEL.md
 */

const EXPECTED_VERSION = 2;

export async function runMigrations(): Promise<void> {
  // Fase A stub — de structuur is belangrijk, niet de implementatie.
  // Dexie voert de upgrade() callbacks automatisch uit bij het openen van de database.
  const currentVersion = db.verno;

  if (currentVersion !== EXPECTED_VERSION) {
    console.warn(
      `[AILearningLog] Schema-versie mismatch: verwacht ${EXPECTED_VERSION}, gevonden ${currentVersion}. ` +
        'Controleer of alle migraties correct zijn gedefinieerd in database.ts.',
    );
  }
}
