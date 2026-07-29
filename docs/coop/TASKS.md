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
| T-001 | Fyzický přesun záznamů + inverze validátorů/šablon | `[scope-check]` content/dossiers/**, data/dossiers*, scripts/dossier/**, templates/** | task/T-001 | W-5 (převzato po 3× API pádu W-1; worktree zachován, 89bff0d) | in-progress | – | migrační skript; každý záznam vlastněn právě jedním entity dossierem dle `subjects`; aliasy na staré URL; agregát bez fyzických záznamů; `npm run build` zelený |
| T-003 | Přepis architektonických sekcí AGENTS.md + README | AGENTS.md (mimo append-only log), README.md, docs/ | task/T-003 | ORCH | todo | T-001 | dokumentace popisuje nový model; log nedotčen |
| T-004 | Integrace, merge, deploy + porting mapa pro rozpracované edity `_index.md` | master | ORCH | ORCH | todo | T-001, T-002 | oba branche mergnuté, `npm run build` + `zola check` zelené na masteru, push (= deploy), porting mapa předána |
| T-010 | Veřejné JSON-LD export routes (/data/*.jsonld, manifest, checksums) — dnes JSON-LD jen embedded v HTML | scripts/dossier/, static/ | – | volný | todo | T-001 | routes reálně generované a nasazené, README aktualizované |

## Archiv

| ID | Titul | Commit | Owner | Stav |
|----|-------|--------|-------|------|
| T-002 | Data-driven JSON-LD z front matter — @graph, Person/Claim/citace, verify:jsonld build gate | 6309019 | W-2 | merged |
| T-006 | README: kanonická rekonstrukce dle exekučního promptu vlastníka — audit proti realitě repa, poctivé mezery, clean-room ověřeno | 4a9ecf9 | W-4 | merged |
| T-005 | Auditní kolo dossieru — procesní přesnost, status-single, doložený CASE-01 | e3c25ea | W-3 | done |
| T-007 | Konstituce Open Intelligence Commons + anti-coupling linter + inventura vazby | be24882 | W-3 | done |
| T-008 | Rozhodnutí o licencích: The Unlicense (public domain) — kód, tooling i původní obsah; práva třetích stran vyhrazena | 61bfe84 | vlastník/W-3 | merged |
| T-009 | Chybějící policy dokumenty: CONTRIBUTING.md, SECURITY.md (private vulnerability reporting přes gh api), README odkazy | f292474 | W-3 | merged |

_(mergnuté tasky se po dokončení zadání přesouvají sem, ať aktivní
tabulka zůstává čitelná)_
