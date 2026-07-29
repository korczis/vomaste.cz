# Co-op task board

Jediný zdroj pravdy o stavu paralelní práce — viz
`docs/coop/PROTOCOL.md`. **Single-writer:** tento soubor edituje pouze
ORCH, pouze na větvi `master`. Workeři hlásí stav přes sběrnici
(`scripts/coop/coop.sh send …`), nikdy editem tohoto souboru.

Stavy: `todo → claimed → in-progress → review → merged`, kdykoliv
`blocked` (důvod do poznámky). Task s dotykem obsahu o reálné osobě
nese štítek `[scope-check]` a před startem se ověřuje proti
autorizačnímu logu v `AGENTS.md`.

## Aktivní zadání: plné fyzické rozpojení entity dossierů (2026-07-29)

Zadání vlastníka: „jednou a provždy decouple macinka–turek — dva
nezávislé dossiery, data driven, JSON-LD from backend, nic hardcoded."
Autorizace: viz AGENTS.md, „Structural change, 2026-07-29 (second)".

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-001 | Fyzický přesun záznamů + inverze validátorů/šablon | `[scope-check]` content/dossiers/**, data/dossiers*, scripts/dossier/**, templates/** | task/T-001 | W-1 (agent) | in-progress | – | migrační skript; každý záznam vlastněn právě jedním entity dossierem dle `subjects`; aliasy na staré URL; agregát bez fyzických záznamů; `npm run build` zelený |
| T-002 | Data-driven JSON-LD z front matter | scripts/dossier/, templates/base.html | task/T-002 | W-2 (agent) | in-progress | – | Person/WebSite/Breadcrumb/Claim generované z dat, žádný hardcoded slug/jméno, žádný reviewRating; build zelený |
| T-003 | Přepis architektonických sekcí AGENTS.md + README | AGENTS.md (mimo append-only log), README.md, docs/ | task/T-003 | ORCH | todo | T-001 | dokumentace popisuje nový model; log nedotčen |
| T-004 | Integrace, merge, deploy + porting mapa pro rozpracované edity `_index.md` | master | ORCH | ORCH | todo | T-001, T-002 | oba branche mergnuté, `npm run build` + `zola check` zelené na masteru, push (= deploy), porting mapa předána |

## Archiv

_(mergnuté tasky se po dokončení zadání přesouvají sem, ať aktivní
tabulka zůstává čitelná)_
