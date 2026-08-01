# Archiv migračních nástrojů (T-028 fáze H)

Historické, JEDNORÁZOVÉ nástroje mise T-028 (JSON-first kanonický
datový model). Jejich vstupy už v repozitáři **neexistují** — spustit je
nejde a nemají se spouštět; zůstávají jako auditní stopa toho, JAK
migrace proběhla (viz docs/adr/json-first-canonical-data-model.md a
docs/migrations/json-first-migration-report.md).

| Nástroj | Co udělal | Zaniklý vstup |
|---|---|---|
| `migrate-content-to-json.mjs` (+ test) | fáze D: lossless migrace content front matter → data/dossiers/**/*.json | doménová pole ve front matter content/** |
| `backfill-entity-provenance.mjs` | fáze H krok 1: provenience entit z front matter → entity.provenance | provenienční pole ve front matter content/entities/ |
| `migrate-graph-curation-to-canonical.mjs` | fáze H krok 3: graph.toml → dossier.json `graph` + relation.note | data/dossiers/*/graph.toml |
| `scaffold-entity-dossier.mjs` (+ test) | scaffold nového dossieru do content/** + TOML registrů | data/dossiers.toml, graph.toml, updates.toml, ručně psaný content |
| `lib/legacy-record-tables.mjs` | zamrzlý front-matter parser pro parity kontroly migrátoru | front matter content/** |
| `lib/legacy-graph-toml.mjs` | zamrzlý parser graph.toml pro migrátory | data/dossiers/*/graph.toml |

Testy v tomto adresáři **neběží** v `npm test` (glob pokrývá jen
`scripts/migrations/*.test.mjs`). Parity testy migrace nahradily golden
testy compiled modelu (`scripts/data/compiled-golden.test.mjs`).

Nový workflow tvorby dossieru (fáze I tooling): edituj/založ
`data/dossiers/**/*.json`, autorizuj přes
`scripts/dossier/authorize-entity.mjs`, spusť `npm run data:build`.
