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
| T-010 | Veřejné JSON-LD export routes (/data/*.jsonld, manifest, checksums) — dnes JSON-LD jen embedded v HTML. Design hotový: [`docs/adr/dossier-jsonld-provenance-extension.md`](../adr/dossier-jsonld-provenance-extension.md) (content-hash citace, manifest+verify script, invertible vztahový vocab; numeric confidence scoring vědomě odmítnut — rozpor s konstitucí §8) | scripts/dossier/, static/ | – | volný | todo | T-001 | routes reálně generované a nasazené, README aktualizované |
| T-011 | Advanced application shell — informační architektura + secondary-provider datový model. Audit + fázový plán hotový: [`docs/adr/application-shell-rebuild.md`](../adr/application-shell-rebuild.md) (mnohé z §5/§14/§41/§47 už dnes platí — ověřeno auditem, ne předpokládáno). Fáze B z vlastníkova master promptu | data/navigation.toml, scripts/dossier/build-navigation.mjs, nové data/generated/navigation-secondary.json + dossier-catalog.json + entity-explorer.json | – | volný | todo | T-001 | secondary provider schema definované a generované, žádný hardcoded slug |
| T-012 | Advanced application shell — shell primitiva (topbar, primary/secondary sidebar, context panel, mobile drawers/bottom nav). Fáze C | templates/base.html, nové templates/partials/app-shell/** | – | volný | todo | T-011 | 0 horizontální overflow na testovaných viewportech, focus trap/return funkční, no-JS fallback zachován |
| T-013 | Advanced application shell — route layouts (overview/catalog/explorer/registry s advanced table toolbarem/record-detail). Fáze D | nové templates/layouts/**, dossier registry šablony | – | volný | todo | T-012 | registry mají skutečný sort/filter/pagination toolbar, ne jen statická ikona |
| T-014 | Advanced application shell — enhanced interakce (command palette, density modes, Flowbite/Alpine inicializace bez duplicitního řízení stejné komponenty). Fáze F | assets/js/modules/**, templates/base.html | – | volný | todo | T-012 | Cmd/Ctrl+K funguje, žádná komponenta není řízená Flowbite i Alpine současně |
| T-015 | Advanced application shell — Playwright test suite + syntetický 1000-entity scale test (nepublikovat jako reálná data) + build-time validátory (`scripts/navigation/validate-*`, `scripts/ui/validate-*`). Fáze G | nové tests/, scripts/navigation/**, scripts/ui/** | – | volný | todo | T-011..T-014 | `npm run build` + browser testy zelené, scale test bez zamrznutí exploreru |
| T-016 | `[scope-check]` Nový entity dossier: Oto Klempíř — vytvoření souborů + registrace. Autorizace: viz AGENTS.md, „Authorized subject: Oto Klempíř" (2026-07-30). Zdroje ověřeny přímým otevřením (ne snippet); jedna kandidátní položka vyřazena jako Reflex.cz fake-news/satira — viz autorizační záznam | content/dossiers/oto-klempir/**, data/dossiers.toml, data/dossiers/oto-klempir/** | – | volný | todo | T-001 | dossier založen, zdroje/tvrzení dle autorizovaného rozsahu, `npm run build` zelený, JSON-LD generováno stejným registry-driven mechanismem jako ostatní dossiery |

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
