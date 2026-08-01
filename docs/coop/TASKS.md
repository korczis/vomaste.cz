# Co-op task board

Jediný zdroj pravdy o stavu paralelní práce — viz
`docs/coop/PROTOCOL.md`. **Single-writer:** tento soubor edituje pouze
ORCH, pouze na větvi `master`. Workeři hlásí stav přes sběrnici
(`scripts/coop/coop.sh send …`), nikdy editem tohoto souboru.

Stavy: `todo → claimed → in-progress → review → merged`, kdykoliv
`blocked` (důvod do poznámky). Task s dotykem obsahu o reálné osobě
nese štítek `[scope-check]` a před startem se ověřuje proti
autorizačnímu logu v `AGENTS.md`.

## Aktivní zadání: workbench redesign (2026-07-30)

Zadání vlastníka: přestavět vomaste.cz z řídkého katalogu na hustý,
data-driven investigativní workbench — plný master prompt uložen
doslovně v
[`docs/missions/2026-07-30-workbench-master-prompt.md`](../missions/2026-07-30-workbench-master-prompt.md),
povinný baseline audit v
[`docs/audits/information-architecture-baseline.md`](../audits/information-architecture-baseline.md).
Čistě technická mise (§ 1.2: žádný nový obsahový scope, autorizační log
netknutý). Navazuje na
[`docs/adr/application-shell-rebuild.md`](../adr/application-shell-rebuild.md) —
tasky T-011…T-015 níže zůstávají v platnosti a mapují se na fáze 2/3/6/8;
nové tasky T-017…T-021 pokrývají zbytek. Pozn.: prompt jmenuje
Cytoscape.js, repo používá Sigma.js — zachovává se Sigma (audit § 8).

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-018 | Fáze 4 — `/dossiers/` directory jako hustá sortable tabulka + dossier overview: kompaktní header, metric strip, view tabs, syntéza místo kopie registru | templates/dossiers-index.html, templates/entity-dossier.html, templates/dossier.html, macros | task/T-018 | – | volný | T-012, T-017 | akceptační kritéria § 18 promptu pro directory/overview |
| T-019 | Fáze 5 — registry tvrzení/zdrojů/evidence/mezer: dense tabulky s toolbar filtry, URL stav (§ 8), inspector master-detail (§ 7), coverage matrix, source families v registru zdrojů | templates/dossier-*-index.html, entity-dossier-*.html, assets/js/data/**, macros | task/T-019 | – | volný | T-013, T-017 | filtry reprodukovatelné URL; detail bez ztráty kontextu; rozlišení zdroje vs. nezávislé rodiny |
| T-021 | Fáze 8 — Playwright + axe + responsive/screenshot testy (viewporty § 11), density tokeny + lint proti marketingovým mezerám v workbench šablonách, performance budget, docs § 15 | tests/**, scripts/ui/**, static/css/input.css, docs/** | task/T-021 | – | volný | T-012..T-014, T-018, T-019 | build/CI selže na overflow, překrytí, a11y violations; screenshoty jako artefakty; density akceptace § 18 |

## Aktivní zadání: plné fyzické rozpojení entity dossierů (2026-07-29)

Zadání vlastníka: „jednou a provždy decouple macinka–turek — dva
nezávislé dossiery, data driven, JSON-LD from backend, nic hardcoded."
Autorizace: viz AGENTS.md, „Structural change, 2026-07-29 (second)".

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-001 | Fyzický přesun záznamů + inverze validátorů/šablon | `[scope-check]` content/dossiers/**, data/dossiers*, scripts/dossier/**, templates/** | task/T-001 | W-5 (převzato po 3× API pádu W-1; worktree zachován, 89bff0d) | in-progress | – | migrační skript; každý záznam vlastněn právě jedním entity dossierem dle `subjects`; aliasy na staré URL; agregát bez fyzických záznamů; `npm run build` zelený |
| T-003 | Přepis architektonických sekcí AGENTS.md + README | AGENTS.md (mimo append-only log), README.md, docs/ | task/T-003 | ORCH | todo | T-001 | dokumentace popisuje nový model; log nedotčen |
| T-004 | Integrace, merge, deploy + porting mapa pro rozpracované edity `_index.md` | master | ORCH | ORCH | todo | T-001, T-002 | oba branche mergnuté, `npm run build` + `zola check` zelené na masteru, push (= deploy), porting mapa předána |
| T-011 | Advanced application shell — informační architektura + secondary-provider datový model. Audit + fázový plán hotový: [`docs/adr/application-shell-rebuild.md`](../adr/application-shell-rebuild.md) (mnohé z §5/§14/§41/§47 už dnes platí — ověřeno auditem, ne předpokládáno). Fáze B z vlastníkova master promptu | data/navigation.toml, scripts/dossier/build-navigation.mjs, nové data/generated/navigation-secondary.json + dossier-catalog.json + entity-explorer.json | – | volný | todo | T-001 | secondary provider schema definované a generované, žádný hardcoded slug |
| T-012 | Advanced application shell — shell primitiva (topbar, primary/secondary sidebar, context panel, mobile drawers/bottom nav). Fáze C | templates/base.html, nové templates/partials/app-shell/** | – | volný | todo | T-011 | 0 horizontální overflow na testovaných viewportech, focus trap/return funkční, no-JS fallback zachován |
| T-013 | Advanced application shell — route layouts (overview/catalog/explorer/registry s advanced table toolbarem/record-detail). Fáze D | nové templates/layouts/**, dossier registry šablony | – | volný | todo | T-012 | registry mají skutečný sort/filter/pagination toolbar, ne jen statická ikona |
| T-014 | Advanced application shell — enhanced interakce (command palette, density modes, Flowbite/Alpine inicializace bez duplicitního řízení stejné komponenty). Fáze F | assets/js/modules/**, templates/base.html | – | volný | todo | T-012 | Cmd/Ctrl+K funguje, žádná komponenta není řízená Flowbite i Alpine současně |
| T-015 | Advanced application shell — Playwright test suite + syntetický 1000-entity scale test (nepublikovat jako reálná data) + build-time validátory (`scripts/navigation/validate-*`, `scripts/ui/validate-*`). Fáze G | nové tests/, scripts/navigation/**, scripts/ui/** | – | volný | todo | T-011..T-014 | `npm run build` + browser testy zelené, scale test bez zamrznutí exploreru |
| T-016 | `[scope-check]` Nový entity dossier: Oto Klempíř — vytvoření souborů + registrace. Autorizace: viz AGENTS.md, „Authorized subject: Oto Klempíř" (2026-07-30). Zdroje ověřeny přímým otevřením (ne snippet); jedna kandidátní položka vyřazena jako Reflex.cz fake-news/satira — viz autorizační záznam | content/dossiers/oto-klempir/**, data/dossiers.toml, data/dossiers/oto-klempir/** | – | volný | todo | T-001 | dossier založen, zdroje/tvrzení dle autorizovaného rozsahu, `npm run build` zelený, JSON-LD generováno stejným registry-driven mechanismem jako ostatní dossiery |

## Archiv

| ID | Titul | Commit | Owner | Stav |
|----|-------|--------|-------|------|
| T-027 | Graph workbench fáze B–J — layered data kontrakt + build-time layout, bundle split (graph-app.js), modulární runtime (jedna Sigma instance), interakční model (selection/focus/path finder/URL state), workbench UI, a11y + WebGL fallback, Playwright testy + syntetický 10k-uzlový benchmark, ADR + finální report (`reports/graph-workbench-implementation.md`) | e95368c..ee4b7b0 (5 commitů), merge c296c61 | W-8 | merged |
| T-026 | Oprava CI driftu — deploy workflow volá `npm run build` (JSON-LD routy v produkci 404 kvůli ručně vypisovaným krokům) + check:workflow-parity; třetí kolo rešerší (+189 tvrzení do 6 dossierů) | 73ff4e7, bdfab28 | W-7 | merged |
| T-025 | Druhé kolo rešerší (+155 tvrzení do 5 nejméně vytěžených dossierů) + lint:source-outlets (brána proti falešnému CORROBORATED přes alias vydavatele) | b0e63d3 | W-7 | merged |
| T-024 | Fanout rešerší — +166 tvrzení z 96 otevřených zdrojů napříč 10 dossiery, 42 mezer, oprava 55 stale TODO v registrech | 910046e | W-7 | merged |
| T-023 | Autorizace AUTH-2026-07-30-M…T (8 zbývajících členů vlády, per subjekt on the record) + skeletony dossierů Havlíček/Zůna/Tejc/Mrázová/Vojtěch/Červený/Plaga/Šebestyán — kabinet kompletně pokryt (16/16) | c1e2664 | W-7 | merged |
| T-020 | Globální command bar — search-core.js (diakritika, AND tokeny, ID-first ranking, skupiny), zkratky / a Cmd/Ctrl+K, seskupený listbox se zvýrazněním a aria-live, 8 testů | (viz git log task/T-020) | W-7 | merged |
| T-022 | Skeletony dossierů Juchelka/Bednárik/Šťastný (AUTH-2026-07-30-B) — CLM-01/SRC-01 z otevřených oficiálních profilů, HOLDS_ROLE, entity pages subject/developing, OG karty + 2 fixy scaffolderu (evidence template, chybějící registr entit) | f753dab | W-7 | merged |
| T-017 | Fáze 1 workbench mise — 8 JSON Schemas + validate:schemas (AJV) v build gate, fix build-global-graph (self-canonical entity grafy v globální mapě), verify:export resolvuje @id proti routes.json, docs/data-contract.md | 80c0a67 | W-7 | merged |
| T-010 | Veřejné JSON-LD export routes — /data/dossiers/<slug>.jsonld + /data/graph.jsonld (max-depth @graph), jsonld-manifest s sha256, verify-export offline gate, citační otisky v exportu i embedded HTML, sdílený record-tables/jsonld-shared lib; dle ADR dossier-jsonld-provenance-extension (numeric confidence odmítnut, supersedes rezervováno neemitováno) | d482f2e | ORCH | merged |
| T-002 | Data-driven JSON-LD z front matter — @graph, Person/Claim/citace, verify:jsonld build gate | 6309019 | W-2 | merged |
| T-006 | README: kanonická rekonstrukce dle exekučního promptu vlastníka — audit proti realitě repa, poctivé mezery, clean-room ověřeno | 4a9ecf9 | W-4 | merged |
| T-005 | Auditní kolo dossieru — procesní přesnost, status-single, doložený CASE-01 | e3c25ea | W-3 | done |
| T-007 | Konstituce Open Intelligence Commons + anti-coupling linter + inventura vazby | be24882 | W-3 | done |
| T-008 | Rozhodnutí o licencích: The Unlicense (public domain) — kód, tooling i původní obsah; práva třetích stran vyhrazena | 61bfe84 | vlastník/W-3 | merged |
| T-009 | Chybějící policy dokumenty: CONTRIBUTING.md, SECURITY.md (private vulnerability reporting přes gh api), README odkazy | f292474 | W-3 | merged |

_(mergnuté tasky se po dokončení zadání přesouvají sem, ať aktivní
tabulka zůstává čitelná)_
