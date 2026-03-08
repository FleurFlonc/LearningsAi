# Data Model

## Entiteiten

### LearningSession (`src/models/session.ts`)

De kernentiteit van de applicatie.

| Veld | Type | Verplicht | Beschrijving |
|------|------|-----------|--------------|
| `id` | `string` (UUID) | Ja | Automatisch gegenereerd via `crypto.randomUUID()` |
| `createdAt` | `string` (ISO datetime) | Ja | Aanmaaktijdstip |
| `updatedAt` | `string` (ISO datetime) | Ja | Laatste wijzigingstijdstip |
| `taskDescription` | `string` | Ja | Wat probeerde de gebruiker te doen? (3–500 tekens) |
| `status` | `SessionStatus` | Ja | success / partial / failed |
| `lessonLearned` | `string` | Ja | De belangrijkste les (5–1000 tekens) |
| `whatWentWrong` | `string?` | Nee | Beschrijving van het probleem |
| `resolution` | `string?` | Nee | Hoe is het opgelost? |
| `reflectionNotes` | `string?` | Nee | Vrije reflectie |
| `aiTool` | `AIToolType?` | Nee | Welke AI-tool werd gebruikt |
| `taskType` | `TaskType?` | Nee | Soort taak |
| `problemCategory` | `ProblemCategory?` | Nee | Categorie van het probleem |
| `resolutionType` | `ResolutionType?` | Nee | Hoe is het opgelost |
| `learningValue` | `number?` (1–5) | Nee | Hoeveel heb je geleerd? |
| `frustrationLevel` | `number?` (1–5) | Nee | Hoe frustrerend was het? |
| `confidenceAfter` | `number?` (1–5) | Nee | Zelfvertrouwen na de sessie |
| `durationMinutes` | `number?` (0–600) | Nee | Tijdsduur in minuten |
| `tags` | `string[]?` | Nee | Vrije tags (max 30 tekens per tag) |
| `isFavorite` | `boolean?` | Nee | Gemarkeerd als favoriet |

### UserPreference (`src/models/preferences.ts`)

Singleton record — altijd één rij met `id = 1`.

| Veld | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| `id` | `1` | 1 | Vaste primary key |
| `themeMode` | `ThemeMode` | `'system'` | Kleurthema voorkeur |
| `defaultView` | `'lessons' \| 'stats'` | `'lessons'` | Standaard startpagina |
| `exportFormat` | `ExportFormat` | `'json'` | Exportformaat (alleen JSON in Fase A) |
| `onboardingCompleted` | `boolean` | `false` | Is onboarding doorlopen? |
| `sessionCountSinceLastExport` | `number` | `0` | Teller voor export-herinnering |

### DerivedAnalytics (`src/models/analytics.ts`)

Berekend view-model — wordt **niet** opgeslagen in de database. Gegenereerd door `analyticsService.calculateAnalytics()`.

## Dexie Schema-versioning

### Huidig schema (versie 1)

```typescript
sessions: 'id, createdAt, status, aiTool, taskType, isFavorite'
preferences: 'id'
```

### Versie-upgrade regels

1. **Verhoog altijd** het versienummer bij structuurwijzigingen
2. **Verwijder nooit** velden zonder migratiepad
3. **Hernoem nooit** een veld zonder migratiepad
4. Gebruik de Dexie `upgrade()` callback voor datamigraties
5. Documenteer elke versiewijziging in dit bestand

### Voorbeeld toekomstige migratie

```typescript
db.version(2).stores({
  sessions: 'id, createdAt, status, aiTool, taskType, isFavorite, newIndexField',
  preferences: 'id',
}).upgrade(async (tx) => {
  await tx.table('sessions').toCollection().modify((session) => {
    session.newField = 'defaultValue';
  });
});
```

## Opslagbeperkingen

### IndexedDB quota

| Browser | Globale limiet | Per origin |
|---------|---------------|-----------|
| Chrome | ~80% schijfruimte | ~60% globale limiet |
| Firefox | ~10% schijfruimte | Variabel |
| Safari | ~1 GB | Variabel |

De `storageMonitor` service bewaakt het gebruik en geeft waarschuwingen:
- `'warning'`: ≥ 60% gebruikt
- `'critical'`: ≥ 80% gebruikt

### Private browsing

In incognito/private modus kan IndexedDB beperkt of niet beschikbaar zijn. De `isPrivateBrowsing()` functie detecteert dit en de app toont een waarschuwing.

## Export/import formaat

### JSON exportstructuur (versie 1)

```json
{
  "version": 1,
  "exportedAt": "2026-03-07T14:32:00.000Z",
  "sessions": [
    {
      "id": "uuid",
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:05:00.000Z",
      "taskDescription": "...",
      "status": "success",
      "lessonLearned": "..."
    }
  ],
  "preferences": {
    "id": 1,
    "themeMode": "system",
    "defaultView": "lessons",
    "exportFormat": "json",
    "onboardingCompleted": true,
    "sessionCountSinceLastExport": 0
  }
}
```

Bestandsnaamformaat: `ai-learning-log-YYYY-MM-DD.json`

### Importvalidatie (Fase A stub)

`validateImportFile()` controleert:
- Geldig JSON formaat
- `version === 1`
- `sessions` is een array

Volledige schema-validatie (Zod) wordt toegevoegd in Fase C.
