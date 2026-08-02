# Phase 1 — Implementační plán veřejného dossier-intake workflow

**Datum**: 2026-08-02 · **Stav**: PROPOSED (Fáze 1 = audit, žádná implementace)
**Mise**: [docs/missions/intake/](../../docs/missions/intake/README.md) · **ADR**: [docs/adr/ADR-public-dossier-intake.md](../../docs/adr/ADR-public-dossier-intake.md)
**Base commit**: `20f048b9154b44abfcaf9e96ab86be8353520bbd` (master)

Plán navazuje na rámec §18 zadání PHASE_001.md a na detailní zadání PHASE_002–006
(stažena v `docs/missions/intake/`). Fáze 7–12 jsou plánovány podle rámce mise;
detailní prompt pro ně zatím neexistuje.

Globální invarianty platné pro VŠECHNY fáze:

```text
intake artifact ≠ authorization record ≠ dossier ≠ claim ≠ publication approval
machine actor nikdy nenastaví authorization_status=authorized
issue event nikdy nespustí deploy ani publication_status=published
každý intake artifact vzniká s publication_status=blocked (fail-closed)
GitHub intake není anonymní/důvěrný kanál a nesmí tak být označen
```

---

## Fáze 2 — Intake schema, fixtures a lokální deterministický procesor

- **Cíl**: Lokální, deterministická vrstva: fixture GitHub issue eventu → validovaný
  raw submission → normalizovaný intake manifest → explicitní stav → Markdown report.
- **Inputs**: ADR + reporty Fáze 1; `docs/missions/intake/PHASE_002.md`; existující
  validátorová architektura `scripts/data/` (Ajv vzory, golden testy) jako referenční styl.
- **Outputs**: intake schémata (event input + intake manifest) v odděleném namespace
  (návrh: `schemas/intake/` — mimo produkční `schemas/*.schema.json` registr),
  `scripts/intake/` procesor (CLI: soubor → soubor, žádná síť), syntetické fixtures
  (`tests/fixtures/intake/` nebo `scripts/intake/fixtures/` dle repo konvence),
  snapshot testy.
- **Soubory**: pouze nové cesty pod `schemas/intake/`, `scripts/intake/`, fixtures a testy.
  ŽÁDNÁ změna `scripts/data/validate.mjs`, `scripts/dossier/*`, `data/**`.
- **Testy**: node:test snapshot/golden testy (repo vzor `scripts/data/compiled-golden.test.mjs`);
  determinismus (2 běhy = identický výstup až na explicitně injektovaný clock); malformed
  input testy (fail-closed).
- **Acceptance**: `npm test` zelený; procesor odmítá neznámý formát; manifest má
  `publication_status: "blocked"`, `authorization_status: "pending_owner"` (resp.
  `not_requested`), `decision_class: "machine_draft_only"`; raw text bajtově zachován;
  žádný síťový přístup (test bez network).
- **Dependencies**: Fáze 1 (tento plán + ADR).
- **Security boundary**: žádná síť, žádné GitHub API, žádný zápis mimo výstupní adresář;
  vstup ošetřen proti path traversal a oversized input (limit velikosti souboru).
- **Rollback**: smazání nových adresářů (`schemas/intake/`, `scripts/intake/`, fixtures);
  produkční pipeline nedotčena — žádný produkční skript na nové soubory neodkazuje.
- **Non-goals**: GitHub Actions, HTTP, entity matching, labely, CTA, komentáře, reálné issue.
- **Lidský zásah**: review schémat vlastníkem (schema = budoucí veřejný kontrakt).
- **Nesmí být automatizováno**: nic z této fáze se nenapojuje na produkční build (`npm run build` ji nevolá).

## Fáze 3 — Entity matching, deduplikace a risk classification

- **Cíl**: Deterministický, vysvětlitelný candidate matching intake podnětu proti
  kanonickému datasetu (503 entit, 24 dossierů) + risk flagy; bez fuzzy magie.
- **Inputs**: manifest z Fáze 2; `data/dossiers/**` + `data/entities/**` (read-only);
  existující dedupe logika (`scripts/osint/entity-dedupe.test.mjs`, normalizační utility
  ve `scripts/data/lib/`, `scripts/osint/lib/`); `docs/missions/intake/PHASE_003.md`.
- **Outputs**: matching index builder (read-only nad `data/`), matching modul se scoringem
  (`score`, `reasons`, `matched_fields`, `confidence_class`, `manual_review_required`),
  duplicate-intake detekce, risk classifier, redakční redaction vrstva pro reporty.
- **Testy**: fixture entity (syntetické!), pořadí match tříd (exact ID → official identifier →
  normalized name → alias → constrained similarity → unresolved), thresholdy označené
  `UNVALIDATED` dokud nejsou kalibrovány.
- **Acceptance**: matching nikdy nemění `data/**`; každý match nese vysvětlení; kolizní
  případy končí `manual_review_required: true`; risk flagy pro self-report, third-party
  naming, PII.
- **Dependencies**: Fáze 2.
- **Security boundary**: čistě lokální, read-only nad kanonickými daty.
- **Rollback**: odstranění matching modulů; manifest schema z Fáze 2 zpětně kompatibilní
  (matching sekce optional).
- **Non-goals**: síť, ARES lookup (existující `scripts/osint/ares-lookup.mjs` se NEvolá
  automaticky z intake), autorizační doporučení s právním účinkem.
- **Nesmí být automatizováno**: povýšení match na „potvrzenou identitu" — vždy jen kandidát.

## Fáze 4 — Bezpečný URL preflight a SSRF hardening

- **Cíl**: Izolovaná síťová vrstva pro technický preflight URL ze submissionu
  (syntax → IP klasifikace → DNS policy → omezený HEAD/GET → metadata) s úplným
  SSRF modelem dle `reports/intake/phase-01-threat-model.md`.
- **Inputs**: threat model Fáze 1 (§SSRF), `docs/missions/intake/PHASE_004.md`; manifest Fáze 2.
- **Outputs**: adapter contract (mock + real), URL syntax policy, IP/DNS klasifikátor
  (blokace loopback/RFC1918/link-local/CGNAT/multicast/reserved/IPv6 variant/metadata
  endpointů, dec/hex/octal reprezentací), redirect policy s re-checkem po každém hopu,
  limity (timeout, max redirecty, max bytes, content-type whitelist, žádné cookies/auth/JS).
- **Testy**: tabulkové testy IP klasifikace, redirect chain testy s mockem, DNS rebinding
  scénář (mock), limity velikosti/času. E2E s reálnou sítí pouze opt-in, nikdy v CI defaultně.
- **Acceptance**: default-deny; každý výsledek nese `HTTP 200 ≠ důvěryhodný zdroj`
  sémantiku (technický stav, ne redakční hodnocení); mock adapter plně pokrývá Fázi 5.
- **Dependencies**: Fáze 2 (manifest), Fáze 3 (risk integrace).
- **Security boundary**: jediné místo celého intake systému, které smí na síť; explicitní
  User-Agent; rate limiting; žádné ukládání celých body.
- **Rollback**: preflight je optional stage — vypnutí vrací manifest s `preflight: skipped`.
- **Non-goals**: stahování příloh, snapshoty zdrojů, hodnocení důvěryhodnosti.
- **Nesmí být automatizováno**: klasifikace zdroje jako „ověřeného" — preflight je jen
  technická dostupnost.

## Fáze 5 — GitHub Issue Form a lokální end-to-end fixture

- **Cíl**: Nový/aktualizovaný issue form pro intake + verzovaný parser adapter + kompletní
  lokální e2e (fixture event → report) bez GitHub Actions.
- **Inputs**: field-by-field audit `navrh-dossieru.yml` z Fáze 1; parser Fáze 2; mock
  preflight Fáze 4; `docs/missions/intake/PHASE_005.md`.
- **Outputs**: návrh nového formuláře (verzovaný `form_version` marker, deterministické
  headings contract), fixture generátor, povinná potvrzení (veřejné zdroje, ne-anonymita,
  žádný citlivý materiál), public wording review, úprava `config.yml` (varování bez slibu
  secure intake).
- **Testy**: parser compatibility testy proti všem fixture verzím; YAML validace formu;
  e2e runner.
- **Acceptance**: form nikde netvrdí anonymitu/důvěrnost; každé pole má definované
  parsování; e2e projde na všech povinných fixtures (valid, malformed, injection, oversized,
  duplicate).
- **Dependencies**: Fáze 2, 3, 4 (mock).
- **Security boundary**: změna produkčního formu až po explicitním schválení vlastníkem
  (do té doby paralelní draft soubor mimo `.github/ISSUE_TEMPLATE/`).
- **Rollback**: revert formu = ztráta nových podání v novém formátu, parser adapter musí
  umět starou verzi (verzování formu je proto povinné).
- **Non-goals**: GitHub Actions, komentáře, labely v GitHub nastavení.
- **Lidský zásah**: schválení textace formu (veřejná komunikace projektu).

## Fáze 6 — GitHub Actions intake workflow

- **Cíl**: `issues`-triggered workflow: parse → match → preflight → idempotentní komentář
  s reportem + labely + owner notifikace. Minimální permissions, plná izolace od deploye.
- **Inputs**: Fáze 2–5; permissions model z ADR §17; `docs/missions/intake/PHASE_006.md`.
- **Outputs**: `.github/workflows/dossier-intake.yml` (vzniká AŽ zde), label model
  (`intake:*`, `authorization:pending-owner`, `publication:blocked`), idempotentní bot
  marker pro komentáře, failure handling, concurrency + timeout.
- **Testy**: workflow lint (actionlint), event payload fixtures, idempotence (rerun,
  edited, reopened), zero-interpolation audit (žádné `${{ github.event.issue.body }}`
  v shellu — payload výhradně přes soubor/env s quotingem).
- **Acceptance**: permissions přesně `issues: write` + `contents: read` (nic víc —
  žádné `contents: write`, `pull-requests: write`, `id-token: write`); pinned actions na
  SHA; concurrency group per issue; deploy workflow nedotčen; žádný secret v issue kontextu.
- **Dependencies**: Fáze 5.
- **Security boundary**: untrusted input nikdy neinterpolován do shellu; artifact retention
  krátká; workflow nikdy nezapisuje do repa.
- **Rollback**: smazání workflow souboru — intake se vrací na plně manuální triage,
  formulář zůstává funkční.
- **Non-goals**: autorizace, PR tvorba, investigace, deploy.
- **Nesmí být automatizováno**: jakýkoli zápis do `data/**`, `AGENTS.md`, merge, deploy.

## Fáze 7 — Webová CTA a contribution UX

- **Cíl**: „Navrhnout dossier" CTA na webu (landing, dossier index, contribution stránka,
  footer) s poctivou textací (veřejný podnět, human-gated, žádná anonymita).
- **Inputs**: UI audit Fáze 1 (§13), navigační source of truth, komponentové makro vrstvy.
- **Outputs**: CTA přes existující navigační/komponentní systém (žádná duplikace komponent),
  landing copy dle §13.2, prefilled URL na issue form.
- **Acceptance**: texty schváleny vlastníkem; lint komponentové duplikace
  (`lint:component-reuse`) zelený; build zelený.
- **Dependencies**: Fáze 5 (form existuje), 6 (proces funguje).
- **Rollback**: revert content/template změn; datová vrstva nedotčena.
- **Non-goals**: change marketingového tónu webu nad rámec CTA.

## Fáze 8 — Human authorization handoff

- **Cíl**: Definovaný manuální most: intake report → rozhodnutí vlastníka → existující
  autorizační tooling (`npm run authorize:entity`) → zpětná vazba do issue.
- **Outputs**: runbook pro vlastníka; šablona autorizačního rozhodnutí odkazující
  `intake_id`; propojení provenance (issue # ↔ autorizační záznam v AGENTS.md logu).
- **Acceptance**: autorizace probíhá VÝHRADNĚ existujícím nástrojem a append-only logem;
  intake systém autorizační stav pouze ČTE; žádná změna `authorize-entity.mjs` bez
  samostatného review.
- **Rollback**: runbook je dokumentace — revert bez dopadu.
- **Nesmí být automatizováno**: celý krok. Machine actor sem nesmí.

## Fáze 9 — Authorized investigation adapter (Prismatic contract)

- **Cíl**: Handoff contract intake → `/investigate` skill; Prismatic zůstává lokální,
  neveřejná, volitelná vrstva (viz ADR §23 — Prismatic boundary).
- **Outputs**: handoff manifest schema (`allowed_subjects`, `excluded_topics`,
  `seed_sources`, `publication_mode: "draft_pr_only"`); guard: adapter odmítne subject bez
  platného autorizačního záznamu.
- **Acceptance**: investigace lze spustit jen lokálně, jen člověkem, jen na autorizovaný
  scope; Prismatic credentials nikdy v GitHub Actions.
- **Nesmí být automatizováno**: spuštění investigace z issue eventu.

## Fáze 10 — Draft PR orchestrace a provenance

- **Cíl**: Výstup investigace jako draft PR s provenance řetězem intake → autorizace →
  investigace → PR; publikační review gates.
- **Acceptance**: PR nese odkazy na intake_id + autorizační záznam; merge jen člověkem;
  build gates (validate, golden, lint) beze změny.
- **Nesmí být automatizováno**: merge, publikace.

## Fáze 11 — Operational hardening

- **Cíl**: abuse controls (rate limiting, brigading detekce, duplicate flood), observabilita,
  runbooks (rejection, security incident, takedown request), artifact retention policy.
- **Acceptance**: runbook pro každý terminální stav stavového automatu; definovaná
  odpovědnost za rejection.

## Fáze 12 — Pilot na syntetickém subjectu

- **Cíl**: End-to-end průchod celým tokem na SYNTETICKÉM subjektu (nikdy nová reálná
  osoba); zpětná korekce dokumentace.
- **Acceptance**: kompletní auditní stopa; syntetický dossier NIKDY nepublikován na
  produkci (publication_status končí na `editorial_review`); závěrečná zpráva.

---

## Pořadí a závislosti

```text
1 (audit) → 2 (schema+procesor) → 3 (matching) → 4 (preflight) → 5 (form+e2e)
→ 6 (Actions) → 7 (CTA) → 8 (human authz) → 9 (investigate adapter)
→ 10 (draft PR) → 11 (hardening) → 12 (pilot)
```

Fáze 3 a 4 lze po dokončení Fáze 2 vyvíjet paralelně (nezávislé moduly, mock rozhraní).
Fáze 7 je nezávislá na 6 (CTA může odkazovat na form + manuální triage), ale doporučené
pořadí ji řadí až za automatizaci, aby CTA nepřineslo objem podnětů bez podpory.
