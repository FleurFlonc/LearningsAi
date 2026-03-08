# AI Learning Log

Een lokale, privacy-vriendelijke webapplicatie om AI-sessies te loggen, lessen terug te vinden en patronen in je leerproces te herkennen. Alle data blijft lokaal op je apparaat — geen backend, geen account, geen cloud.

## Installatie & lokaal draaien

```bash
npm install
npm run dev
```

Open vervolgens `http://localhost:5173` in je browser.

## Type-checking

```bash
npm run type-check
```

## Bouwen voor deployment

```bash
npm run build
```

De output in de `dist/` map is een statische build die direct naar GitHub Pages of elke andere statische hostingprovider kan worden geüpload.

### GitHub Pages deployment

Zorg dat in `vite.config.ts` de `base` ingesteld staat op `"./"` (dit is al het geval). Push de `dist/` map naar de `gh-pages` branch of gebruik GitHub Actions.

## Fasering

| Fase | Status | Inhoud |
|------|--------|--------|
| A | Gereed | Datamodel, storage layer, services |
| B | Gepland | UI, routing, formulieren, Zustand stores |
| C | Gepland | Statistieken dashboard |
