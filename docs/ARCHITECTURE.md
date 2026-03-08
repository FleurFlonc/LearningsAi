# Architectuur

## Principes

- **Client-side only**: Alle logica draait in de browser. Er is geen backend-server, geen API-aanroepen naar externe diensten.
- **Privacy by design**: Data verlaat het apparaat nooit. Geen analytics, geen telemetrie, geen cloud sync.
- **Lokale opslag**: Alle data wordt opgeslagen in IndexedDB via Dexie.js.
- **Statische build**: De app wordt gebouwd als een set statische bestanden (HTML/CSS/JS) die op GitHub Pages gehost worden.

## Mappenstructuur

```
src/
├── app/            Root component, routing config, en providers (Fase B)
├── components/     Herbruikbare UI-componenten (Fase B)
│   ├── cards/      Kaarten voor sessies en lessen
│   ├── charts/     Recharts-grafieken voor statistieken
│   ├── forms/      Formuliercomponenten met React Hook Form
│   ├── layout/     AppShell, Header, Sidebar, navigatie
│   └── feedback/   Toast, EmptyState, LoadingSpinner
├── features/       Feature modules — elk feature is zelfstandig
│   ├── sessions/   Sessie CRUD (service + schema + utils gebouwd in Fase A)
│   ├── lessons/    Lessen-overzicht (Fase B)
│   ├── stats/      Statistieken dashboard (Fase C)
│   ├── settings/   Gebruikersvoorkeuren (service gebouwd in Fase A)
│   ├── onboarding/ Welkomstscherm (Fase B)
│   └── export/     JSON export/import (service gebouwd in Fase A)
├── lib/            Kern library-code
│   ├── db/         Dexie database instantie en migraties
│   ├── analytics/  Stateless berekeningen (geen directe DB-calls)
│   └── storage/    IndexedDB quota monitoring
├── models/         TypeScript interfaces en type definities
├── hooks/          Custom React hooks (Fase B)
├── styles/         Globale CSS met Tailwind imports
└── types/          Gedeelde utility types
```

## Servicelaag

Elke feature heeft een `services/` map met de bedrijfslogica:

| Service | Verantwoordelijkheid |
|---------|---------------------|
| `sessionService` | CRUD operaties voor leersessies |
| `preferenceService` | Singleton gebruikersvoorkeuren |
| `analyticsService` | Stateless berekeningen op sessie-arrays |
| `exportService` | JSON export/import via Blob download |
| `storageMonitor` | IndexedDB quota bewaking |

### Ontwerpkeuze: analyticsService is stateless

`analyticsService` ontvangt data als parameter in plaats van direct de database te bevragen. Dit maakt de berekeningsfuncties:
- Makkelijk testbaar (geen DB mock nodig)
- Herbruikbaar met gefilterde datasets
- Ontkoppeld van de Dexie-laag

## Data flow

```
UI-component
    │
    ▼
Feature Service (sessionService, preferenceService, ...)
    │
    ▼
Dexie db singleton (src/lib/db/database.ts)
    │
    ▼
IndexedDB (browser native storage)
```

Voor analytics:
```
UI/Store haalt sessies op via sessionService
    │
    ▼
analyticsService.calculateAnalytics(sessions)
    │
    ▼
DerivedAnalytics object → UI charts/stats
```

## Toestandsbeheer (Fase B)

Zustand stores per feature bundelen:
- De gecachte data (sessies, preferences)
- UI-state (filters, zoekquery, paginering, modals)
- Acties die services aanroepen en state bijwerken
