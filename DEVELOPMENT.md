# Entwicklung

Diese Datei richtet sich an Mitwirkende. Installation und Konfiguration für
Home-Assistant-Nutzer stehen ausschließlich in der [README](./README.md).

## Lokale Einrichtung

Voraussetzung ist Node.js ab Version 22.12.

```shell
npm ci
npm run dev
```

Vite zeigt anschließend die lokale Vorschau-URL an. Die Vorschau arbeitet mit
simulierten Home-Assistant-Zuständen und benötigt keine echte Installation.

## Prüfen und bauen

```shell
npm run verify
```

Dieser Befehl führt TypeScript-Prüfung, Tests und Produktionsbuild aus. Das
auslieferbare Modul entsteht als `dist/vacuum-control-card.js`.

Einzelne Befehle:

```shell
npm run check
npm run test
npm run build
```

## Wichtige Verzeichnisse

- `src/`: Karte, visueller Editor, Zustandsmodell und Konfiguration
- `test/`: automatisierte Tests
- `examples/`: neutrale Beispielkonfigurationen
- `dist/`: von HACS ausgeliefertes Produktionsmodul

## Veröffentlichung

Vor einem Commit oder Release `npm run verify` ausführen. Änderungen am
Quellcode und das daraus neu erzeugte `dist/vacuum-control-card.js` werden
gemeinsam veröffentlicht.
