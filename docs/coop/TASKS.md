# Co-op task board

Jediný zdroj pravdy o stavu paralelní práce — viz
`docs/coop/PROTOCOL.md`. **Single-writer:** tento soubor edituje pouze
ORCH, pouze na větvi `master`. Workeři hlásí stav přes sběrnici
(`scripts/coop/coop.sh send …`), nikdy editem tohoto souboru.

Stavy: `todo → claimed → in-progress → review → merged`, kdykoliv
`blocked` (důvod do poznámky). Task s dotykem obsahu o reálné osobě
nese štítek `[scope-check]` a před startem se ověřuje proti
autorizačnímu logu v `AGENTS.md`.

## Aktivní zadání: čtvrté kolo rešerší + provázání grafu (2026-08-02)

Zadání vlastníka: „rozvin každý dossier, provaž" — prohloubit obsah
(nová tvrzení/zdroje) u všech 24 subjektů v rámci již autorizovaného
scope (viz AGENTS.md log) a doplnit relationship graph napříč
dossiery. Navazuje na precedens T-024/025/026 (kola rešerší). Survey
stavu 2026-08-02 (`ls data/dossiers/*/{claims,sources,relations}`):
nejtenčí obsahem jsou jaroslav-faltynek (CLM 8), richard-chlad (8),
petr-pavel (3), petr-vencalek (3), tunde-bartha (13) — pozor, u těchto
pěti je autorizovaný scope úzký (viz AGENTS.md), takže "prohloubení"
= dohledání dalších už-v-mezích-scope zdrojů, nikdy nové téma. REL
(relace) jsou skoro všude na 1–2 kromě andrej-babis (40) a
macinka-turek (33) — to je cíl T-038. Čistě obsahová/datová práce v
mezích už autorizovaných témat; žádné nové autorizace, žádný nový
subjekt. Každé tvrzení musí citovat jmenovaný, datovaný, přímo
otevřený zdroj (AGENTS.md editorial rules 1–8); `1 ZDROJ` vs.
`CORROBORATED` dle validátoru. Per-tvrzení worklist (813 položek, vše
už dříve zmapováno) je v
[`docs/dossier-audit/CLAIM_DEEPENING_TODO.md`](../dossier-audit/CLAIM_DEEPENING_TODO.md)
(guardrail tamtéž shodný s tímto zadáním — použít jako zdroj pravdy pro
T-039…T-043 místo znovuobjevování scope; odškrtávat `[ ]` u položek,
které daný task skutečně dovede na CORROBORATED/ověří). Per-dossier
externí OSINT nástroje (`~/dev/prismatic-platform`, mimo tento repo,
nikdy nezapojen do buildu) jsou v
[`docs/dossier-audit/PRISMATIC_SOURCING_TODO.md`](../dossier-audit/PRISMATIC_SOURCING_TODO.md).

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-038 | `[scope-check]` Provázání grafu napříč dossiery — audit entit/relací a doplnění chybějících relací (Agrofert, ANO, Motoristé sobě, vláda, dárci) čerpaných výhradně z už-citovaných tvrzení v datech (žádný nový výzkum, žádný nový fakt) | `data/dossiers/*/relations/**`, `data/dossiers/*/entities/**`, generátor grafu | task/T-038 | – | todo | – | žádná relace bez odpovídajícího už-existujícího CLM/SRC; `npm run build` zelený; graf viditelně hustší napříč subjekty, ne jen Babiš/macinka-turek |
| T-039 | `[scope-check]` Kolo rešerší, dávka 1 (nejtenčí + úzký scope): jaroslav-faltynek, richard-chlad, petr-pavel, petr-vencalek, tunde-bartha — dohledat a přidat další CLM/SRC striktně v mezích autorizovaného tématu | `data/dossiers/{jaroslav-faltynek,richard-chlad,petr-pavel,petr-vencalek,tunde-bartha}/**` | task/T-039 | – | todo | – | žádné nové téma/subjekt nad rámec AGENTS.md logu; každý zdroj přímo otevřen; `npm run build` zelený |
| T-040 | `[scope-check]` Kolo rešerší, dávka 2: lubomir-metnar, tomio-okamura, boris-stastny, alena-schillerova | `data/dossiers/{lubomir-metnar,tomio-okamura,boris-stastny,alena-schillerova}/**` | task/T-040 | – | todo | T-039 | stejné jako T-039 |
| T-041 | `[scope-check]` Kolo rešerší, dávka 3: ales-juchelka, karel-havlicek, oto-klempir, martin-sebestyan | `data/dossiers/{ales-juchelka,karel-havlicek,oto-klempir,martin-sebestyan}/**` | task/T-041 | – | todo | T-040 | stejné jako T-039 |
| T-042 | `[scope-check]` Kolo rešerší, dávka 4: ivan-bednarik, robert-plaga, jeronym-tejc, jaromir-zuna | `data/dossiers/{ivan-bednarik,robert-plaga,jeronym-tejc,jaromir-zuna}/**` | task/T-042 | – | todo | T-041 | stejné jako T-039 |
| T-043 | `[scope-check]` Kolo rešerší, dávka 5: igor-cerveny, zuzana-mrazova, adam-vojtech, andrej-babis, macinka-turek — poslední dávka, nejvytěženější dossiery, jen nové doplňkové zdroje/CLM | `data/dossiers/{igor-cerveny,zuzana-mrazova,adam-vojtech,andrej-babis,macinka-turek}/**` | task/T-043 | – | todo | T-042 | stejné jako T-039 |

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
| T-019 | Fáze 5 — registry tvrzení/zdrojů/evidence/mezer: dense tabulky s toolbar filtry, URL stav (§ 8), inspector master-detail (§ 7), coverage matrix, source families v registru zdrojů | templates/dossier-*-index.html, entity-dossier-*.html, assets/js/data/**, macros | task/T-019 | – | volný | T-013, T-017 | filtry reprodukovatelné URL; detail bez ztráty kontextu; rozlišení zdroje vs. nezávislé rodiny |
| T-021 | Fáze 8 — Playwright + axe + responsive/screenshot testy (viewporty § 11), density tokeny + lint proti marketingovým mezerám v workbench šablonách, performance budget, docs § 15 | tests/**, scripts/ui/**, static/css/input.css, docs/** | task/T-021 | – | volný | T-012..T-014, T-018, T-019 | build/CI selže na overflow, překrytí, a11y violations; screenshoty jako artefakty; density akceptace § 18 |

## Aktivní zadání: plné fyzické rozpojení entity dossierů (2026-07-29)

Zadání vlastníka: „jednou a provždy decouple macinka–turek — dva
nezávislé dossiery, data driven, JSON-LD from backend, nic hardcoded."
Autorizace: viz AGENTS.md, „Structural change, 2026-07-29 (second)".

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-012 | Advanced application shell — shell primitiva (topbar, primary/secondary sidebar, context panel, mobile drawers/bottom nav). Fáze C | templates/base.html, nové templates/partials/app-shell/** | – | volný | todo | T-011 | 0 horizontální overflow na testovaných viewportech, focus trap/return funkční, no-JS fallback zachován |
| T-013 | Advanced application shell — route layouts (overview/catalog/explorer/registry s advanced table toolbarem/record-detail). Fáze D | nové templates/layouts/**, dossier registry šablony | – | volný | todo | T-012 | registry mají skutečný sort/filter/pagination toolbar, ne jen statická ikona |
| T-014 | Advanced application shell — enhanced interakce (command palette, density modes, Flowbite/Alpine inicializace bez duplicitního řízení stejné komponenty). Fáze F | assets/js/modules/**, templates/base.html | – | volný | todo | T-012 | Cmd/Ctrl+K funguje, žádná komponenta není řízená Flowbite i Alpine současně |
| T-015 | Advanced application shell — Playwright test suite + syntetický 1000-entity scale test (nepublikovat jako reálná data) + build-time validátory (`scripts/navigation/validate-*`, `scripts/ui/validate-*`). Fáze G | nové tests/, scripts/navigation/**, scripts/ui/** | – | volný | todo | T-011..T-014 | `npm run build` + browser testy zelené, scale test bez zamrznutí exploreru |
## Aktivní zadání: JSON/JSON-LD-first datová platforma (2026-08-01)

Zadání vlastníka: obrátit tok dat — `data/dossiers/**/*.json` (JSON
Schema + JSON-LD validované) se stává jediným kanonickým zdrojem pravdy
pro dossiery/entity/tvrzení/zdroje/kauzy/mezery/vztahy/graf/navigaci;
`content/**/*.md` se stává plně generovaným Zola routing adaptérem.
Plný master prompt uložen doslovně v
[`docs/missions/2026-08-01-json-ld-first-data-platform-master-prompt.md`](../missions/2026-08-01-json-ld-first-data-platform-master-prompt.md).
**Absorbuje T-001** (viz jeho řádek výše, `superseded-by-T-028`) —
macinka/turek vlastnictví záznamů se řeší JSON `dossier` polem, ne
přesunem Markdown souborů. Čistě technická migrace (§ 23: žádné nové
subjekty, žádná nová rešerše, žádná změna tvrzení/statusů beze změny
významu); autorizační log v AGENTS.md se nemění. Fáze A (audit,
`docs/migrations/json-first-baseline.md`) povinná před první změnou.

| ID | Titul | Scope (soubory/sekce) | Branch | Owner | Stav | Závislosti | Akceptace |
|----|-------|-----------------------|--------|-------|------|------------|-----------|
| T-028 | `[scope-check]` Fáze A–J — JSON/JSON-LD kanonický datový model (schemas + context), jednotný kompilátor (discover/load/validate/normalize/compile), lossless migrátor Markdown→JSON s parity testy, generované Zola content adaptéry, view modely, přepojení všech generátorů (stats/nav/routes/search/graph/exporty/JSON-LD/DuckDB/Sigma), odstranění starých zdrojů pravdy (dossiers.toml, graph.toml, front matter), contributor tooling (scaffold/import), ADR + finální report | `data/dossiers/**`, `content/**` (generováno), `scripts/data/**`, `schemas/**`, `templates/**`, `static/data/**`, `docs/adr/json-first-canonical-data-model.md`, `docs/contributing/add-dossier-data.md` | – | done (fáze A–J, merge ae3e0c5) | done | – | akceptační kritéria § 24 promptu (Definition of Done); route/export parity se stávajícím webem; `npm run build` + `npm run test` zelené; determinismus (2× stejný build → stejné SHA-256); autorizační log netknutý |

## Archiv

| ID | Titul | Commit | Owner | Stav |
|----|-------|--------|-------|------|
| T-011 | Advanced application shell fáze B — secondary-provider datový model: `navigation-secondary.json` (per-dossier registry subtree), `dossier-catalog.json`, `entity-explorer.json` (server-side facety by type/role/dossier), zapojeno do build pipeline, 7 testů (determinismus, no-hardcoded-slug, facet-sum invariants) | 55f580d | W-9 | merged — data vrstva jen (UI je T-012), plný build 38/38, testy 255/255 |
| T-003 | Přepis architektonických sekcí AGENTS.md + README | satisfied by T-028 Phase I (5ab3c8c) | – | done — AGENTS.md „Canonical data model: JSON-first" sekce + README obojí popisují nový model, append-only log ověřeně nedotčen (byte-diff před/po) |
| T-004 | Integrace, merge, deploy pro T-028 | satisfied by T-028 Phase J (ae3e0c5, board 000aa03) | – | done — merge na master, `npm run build` + testy zelené, push = deploy, CI green (269 e2e) |
| T-001 | Fyzický přesun záznamů + inverze validátorů/šablon | superseded-by-T-028 | – | superseded — cíl (macinka/turek vlastnictví záznamů) dosažen přes JSON `dossier` pole v T-028, ne přesunem Markdown souborů |
| T-037 | `zola serve` po čerstvém klonu/pullu selhávalo nesrozumitelně (generated/* je v .gitignore, klon je nikdy nepřinese) — `scripts/build/require-generated.mjs` (preflight), `npm run preflight`/`serve`, post-checkout/post-merge hooky jen VARUJÍ (negenerují samy), README poznámka | 06816b3 | (worktree T-037) | merged |
| T-034 | Skloňování po číslovce v registrech ("32 zdroje" → "32 zdrojů") — makro `cz::tvar`/`cz::pocet`, oprava projekce seznam i dlaždice, 7 chybných tvarů v `updates.toml`, regex test s unicode hranicí slova | 5b0222c | (worktree T-034-graph) | merged |
| T-027 | Graph workbench fáze B–J — layered data kontrakt + build-time layout, bundle split (graph-app.js), modulární runtime (jedna Sigma instance), interakční model (selection/focus/path finder/URL state), workbench UI, a11y + WebGL fallback, Playwright testy + syntetický 10k-uzlový benchmark, ADR + finální report (`reports/graph-workbench-implementation.md`) | e95368c..ee4b7b0 (5 commitů), merge c296c61 | W-8 | merged |
| T-018 | Fáze 4 — entity dossier overview: view tabs (Přehled/Tvrzení/Zdroje/Kauzy/Entity/Vztahy/Evidence/Mezery), rozšířený metric strip (6 dlaždic), preview otevřených mezer. Directory (`/dossiers/`) byl už hotový (dd::directory) — ověřeno před psaním, ne předpokládáno | 59d60ea, merge 47fe59c | W-9 | merged |
| T-016 | `[scope-check]` Nový entity dossier: Oto Klempíř — vytvoření souborů + registrace. Board byl stale — ve skutečnosti hotovo dřív (třetí dossier). Ověřeno 2026-08-01: `content/dossiers/oto-klempir/` + `data/dossiers/oto-klempir/graph.toml` existují na masteru | 41a4eb9 | (dřívější session) | merged |
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
