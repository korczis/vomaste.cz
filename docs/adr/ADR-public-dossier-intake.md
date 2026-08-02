# ADR: Veřejný dossier-intake workflow (human-gated vznik dossieru)

**Status**: PROPOSED
**Date**: 2026-08-02
**Decision owner**: site owner (Tomáš Korcak / korczis) — per `AGENTS.md:461` „Content about real parties" a `AUTHORIZATION.md:4-35`
**Mission**: [docs/missions/intake/](../missions/intake/README.md) (VOMASTE.md master prompt, PHASE_001–006)
**Reports**: [phase-01-repository-audit](../../reports/intake/phase-01-repository-audit.md) · [architecture-inventory](../../reports/intake/phase-01-architecture-inventory.md) · [threat-model](../../reports/intake/phase-01-threat-model.md) · [implementation-plan](../../reports/intake/phase-01-implementation-plan.md)

> Toto je návrhový (PROPOSED) dokument Fáze 1. Nezavádí žádný produkční kód. Každý závěr je
> podložen repo evidencí (soubor:řádek/sekce). Konvence ADR tohoto repa je `docs/adr/<slug>.md`
> bez číslování; struktura dle `.claude/skills/adr/SKILL.md` je zde rozšířena o 40 sekcí požadovaných
> misí (§19), protože jde o bezpečnostně citlivý governance návrh, ne běžné technické rozhodnutí.

---

## 1. Název

Veřejný dossier-intake workflow — řízený, auditovatelný, human-in-the-loop vstup pro návrh nového
dossieru, entity, tématu nebo propojení.

## 2. Status

`PROPOSED`. Žádná fáze implementace nebyla ve Fázi 1 provedena.

## 3. Datum

2026-08-02.

## 4. Decision owner

Site owner (korczis). Autorizace rozsahu je výhradně jeho pravomoc (`AGENTS.md:420` „The default is
to cover no one"; `CLAUDE.md:41-49`).

## 5. Kontext

Repozitář vomaste.cz je statický Zola web s JSON-first kanonickým datovým modelem (mise T-028): zdroj
pravdy = `data/dossiers/**/*.json` (4883 záznamů: 860 claims, 542 sources, 88 cases, 188 gaps, 142
relations, 47 updates, 24 dossierů, 503 entit), `content/**` je generovaný adapter. Governance stojí
na append-only autorizačním logu (`AGENTS.md:461`) + jeho strojové transkripci
(`data/authorizations.toml`, 22 grantů). Publikace jde přes GitHub Pages (OIDC, `deploy.yml`) na
`push:master`.

Vlastník chce **veřejný vstupní bod**: kdokoli může navrhnout dossier/entitu/téma/propojení přes
GitHub Issue Form; automat provede bezpečné omezené předzpracování a strukturovaný audit report;
vlastník ručně autorizuje přesný rozsah; teprve po autorizaci lze spustit investigation tooling;
vznikne draft PR; vlastník provede publikační kontrolu; merge → existující build/deploy.

**Měřený současný stav** (§13): 4 hotové Issue Forms existují od 2026-07-30, ale web na ně nikde
nevede (všech 7 `issues/new` odkazů míří na generický formulář); žádný intake automat neexistuje a
repo to samo přiznává (`.claude/skills/investigate/SKILL.md:142`, `OPEN_INTELLIGENCE_COMMONS.md §11`).

## 6. Problém

Jak umožnit veřejný podnět, aniž by:
- podnět sám cokoli autorizoval, publikoval nebo rozšířil scope;
- automat obešel lidské rozhodnutí vlastníka;
- veřejný GitHub kanál byl vydáván za důvěrný/anonymní;
- nedůvěryhodný vstup (prompt injection, SSRF, PII, path traversal) prolomil bezpečnostní hranice;
- vznikla neauditovatelná změna governance.

## 7. Cíle

1. Veřejný, nízkoprahový vstup (Issue Form) pro podnět.
2. Bezpečné, deterministické, omezené předzpracování (parse → match → volitelný URL preflight → report).
3. Explicitní, datovaný, auditovatelný handoff k **lidské** autorizaci.
4. Fail-closed: každý intake artefakt vzniká jako `publication_status: blocked`, `authorization_status: pending_owner`.
5. Plná izolace intake od deploye a od zápisu do produkčních dat.
6. Reuse existující datové/redakční infrastruktury, žádná duplikace.

## 8. Non-goals

Anonymní/důvěrný whistleblower kanál (samostatný budoucí projekt, `AGENTS.md:604-611`); crowdsourcované
obviňování; automatický generátor tvrzení o lidech; automatická autorizace; automatický merge/deploy;
změna autorizačního nástroje či logu; nové produkční schema ve Fázi 1; HTTP klient ve Fázi 1.

## 9. Governance constraints

- Výchozí stav subjektu = **NEAUTORIZOVÁNO** (`AGENTS.md:420`).
- Autorizace = explicitní, datovaný, append-only záznam vlastníka (`AGENTS.md:455-459`).
- `authorize-entity.mjs` je TTY-only, jediná zamýšlená cesta k `dossierStatus:authorized`
  (`CLAUDE.md:50-52`, `authorize-entity.mjs:45-53`).
- Kontextová entita se nikdy sama nepovýší na subjekt (rule S6, `validate-semantics.mjs:204-215`,
  negrandfatherovatelné `:295`).
- **Zjištěné slabiny vynucení** (audit §5, nutno adresovat před Fází 8, ne součást intake):
  B-1 append-only check je v CI no-op (`verify-authorization-log-append-only.mjs:62`); B-2 regex míjí
  3 reálné záznamy (`AGENTS.md:695,834,1320`); B-3 `authorizations.toml` bez ochrany a cross-checku
  (`validate-authorization.mjs:8-9`). Revokace autorizace neexistuje v žádné vrstvě.

## 10. Editorial constraints

`HTTP 200 ≠ důvěryhodný zdroj`; `reachable ≠ nezávislý zdroj`; `metadata extracted ≠ článek přečten`;
`URL submitted ≠ tvrzení ověřeno` (§12.2 zadání). Machine summary nikdy neprezentováno jako fakt.
Procesní výsledek (odloženo/promlčeno) ≠ zjištění o vině (`dossier-entry/SKILL.md:73-75`). Source
family se nesmí počítat vícekrát (S2). Snippet ≠ otevřený zdroj (`dossier-entry/SKILL.md:29-30`).

## 11. Privacy boundary

GitHub Issue Form je veřejný, dohledatelný, trvalý, vázaný na GitHub účet — **nevhodný** pro
neveřejné dokumenty, identitu oznamovatele, citlivé osobní údaje (§1.4 zadání, `SECURITY.md:22-27`).
Návrh nesmí kanál označit jako anonymní/důvěrný/bezpečný. Přesný termín: „Veřejný podnět založený na
veřejných informacích a veřejných zdrojích". Vzor redakce PII v kódu už existuje:
`stripPersonalData()` (`expand-entity.mjs:113-135`, nikdy nečte datum narození/adresu).

## 12. Threat model

Plný v [phase-01-threat-model.md](../../reports/intake/phase-01-threat-model.md) — 5 kategorií (abuse
of people / automation / editorial / governance / privacy-security) + kompletní SSRF model.
Nejzávažnější dnešní scénář: `blank_issues_enabled: true` (`config.yml:1`) + `navrh-dossieru.yml` bez
varování a checkboxu = citlivý podnět (obvinění + PII + neveřejný materiál) trvale veřejně, kanálem s
nulovou obranou.

## 13. Existing-system inventory

Plný v [architecture-inventory](../../reports/intake/phase-01-architecture-inventory.md). Zkráceně:
kanonický JSON model + 19 schémat (2020-12, `additionalProperties:false`); dvojitá autorizační brána
v CI (`validate-authorization` + S5/S6); dedupe modul s negativními testy; source families S1/S2/S4;
co-op bus (append-only NDJSON, single-writer). Chybí: intake kanál, URL/SSRF vrstva, strukturované
`externalIds`/`alternateNames` (schéma ano, 0 dat), CODEOWNERS.

## 14. Candidate architectures (artifact strategy, §16)

| Varianta | Popis | + | − | Audit | Machine-readable |
|---|---|---|---|---|---|
| **A** issue komentář | report jen jako bot komentář | nulové write permissions, okamžitě viditelné | efemérní, nestrojové, jde přepsat | slabý | ne |
| **B** Actions artifact | report jako workflow artifact | strojové, mimo git | retention limit, stažitelné u public repa, nezaindexováno | střední | ano |
| **C** commit do `data/intake/` | automat commituje manifest | git permanence, plný audit | vyžaduje `contents: write` (riziko!), reputační stopa navždy v gitu | silný | ano |
| **D** externí neveřejný store | mimo repo | soukromí | závislost na infra, secrets, láme forkability | silný | ano |

## 15. Rozhodnutí

**MVP = A + B kombinace, nikdy C ani D:**
- **Veřejné + kanonické-per-issue**: idempotentní **issue komentář** (varianta A) s lidsky čitelným
  reportem — hlavička „strojové předzpracování, ne redakční závěr".
- **Ephemeral + machine-readable**: **Actions artifact** (varianta B) s JSON manifestem, krátká
  retention, bez raw body, bez PII.
- **Kanonické governance data zůstávají výhradně v existujícím autorizačním logu** (AGENTS.md +
  authorizations.toml), měněné jen člověkem — intake do nich nikdy nezapisuje.
- Varianta C (`contents: write`) **zamítnuta**: reputační permanence + write permissions jsou přesně
  ta rizika, kterým se vyhýbáme; navíc by intake artefakt v gitu byl kvazi-publikací neautorizovaného
  podnětu (viz nález B-11, kde už `reports/authorization-candidates.md` nechtěně žije ve veřejném gitu).
- Varianta D **zamítnuta**: láme forkability invariant (`docs/adr/aiad-and-agent-tooling-import.md`).

## 16. Důvody

Preferujeme nejmenší write permissions a nejmenší reputační dopad (§16 zadání). A+B nevyžaduje žádný
zápis do repa (`issues: write` stačí pro komentář i label; artifact upload nepotřebuje `contents:
write`). Deploy zůstává izolován (`deploy.yml` issue eventy nekonzumuje — audit §8.2). Kanonická
governance data se nedotknou automatu, čímž B-3 riziko intake nezhoršuje.

## 17. Data flow

```
veřejný uživatel → Issue Form (Fáze 5)
  → issues-triggered workflow (Fáze 6, permissions: issues:write + contents:read)
    → deterministický parser (Fáze 2): label→id mapa, fail-closed
    → candidate matching (Fáze 3): read-only nad data/, score+reasons+manual_review
    → volitelný URL preflight (Fáze 4): SSRF-hardened, mock v CI
    → intake manifest (publication_status=blocked, authorization_status=pending_owner)
  → idempotentní issue komentář (report) + artifact (manifest) + labely (intake:*, authorization:pending-owner)
  → owner notifikace
[LIDSKÁ HRANICE]
  → vlastník čte report → rozhodne → authorize-entity.mjs (TTY) + AGENTS.md append (Fáze 8)
  → autorizovaná investigace (Fáze 9, lokálně, člověkem) → handoff contract
  → draft PR (Fáze 10) → publikační review → merge → existující build/deploy
```

## 18. State machine

Tři oddělené osy (nikdy jeden vágní `approved`). Plná tabulka přechodů níže (§ „State machine detail").
Klíčová pravidla: **žádná machine-actor transition nekončí v `authorization_status=authorized`**;
**žádná issue-triggered transition nekončí v `publication_status=published`**.

## 19. Artifact strategy

Viz §14–15. Veřejné = issue komentář; ephemeral = artifact; kanonické = existující autorizační log
(člověkem); auditní = artifact manifest + issue historie; cache = nic trvalého.

## 20. Permissions model

| Operace | Permission | R/W | Nutné v MVP |
|---|---|---|---|
| checkout | `contents` | read | ano |
| read issue | `issues` | read | ano |
| comment issue | `issues` | write | ano |
| add label | `issues` | write | ano |
| upload artifact | (actions default) | — | ano |
| create branch | `contents` | write | **NE** (až Fáze 10, mimo intake) |
| create PR | `pull-requests` | write | **NE** (až Fáze 10) |

Intake MVP **nesmí** mít `contents: write`, `pull-requests: write`, `deployments: write`,
`pages: write`, `id-token: write`. Actions třetí strany pinovat na SHA (nález: `taiki-e/install-action@v2`
je dnes na mutable tagu). Žádná interpolace `github.event.issue.*` do `run:` (dnešní `deploy.yml` to
splňuje — audit §4.5).

## 21. Authorization boundary

`intake artifact ≠ authorization record ≠ dossier ≠ claim ≠ publication approval`. Vynuceno:
- **schema**: intake manifest v `schemas/intake/` (oddělený namespace, jiný `recordType`), bez polí
  převoditelných na claim/authorization;
- **file-path**: `data/intake/` (pokud vůbec, jen jako fixtures/tests) striktně oddělen od
  `data/dossiers/` a `AGENTS.md`;
- **workflow permissions**: intake workflow bez `contents: write` → nemůže zapsat do logu;
- **state machine**: machine actor nikdy →authorized;
- **tests**: fixture prokazující, že manifest s `authorization_status:pending_owner` nelze automatem
  posunout na authorized;
- **CODEOWNERS** (nutno doplnit): `AGENTS.md`, `data/authorizations.toml`, `.github/**`.

## 22. Publication boundary

Každý intake artefakt: `publication_status: "blocked"`. Issue event nikdy nevede k `published`.
Deploy zůstává výhradně `push:master` po lidském merge. Publikace vyžaduje samostatné lidské
schválení i po autorizaci (`AGENTS.md` invariant; `investigate/SKILL.md:148-155` — skill končí u PR).

## 23. Prismatic boundary

**PRISMATIC_INTEGRATION = NOT_FOUND** (audit §7): 0 řádků integračního kódu, adopce formálně odmítnuta
(`docs/adr/aiad-and-agent-tooling-import.md:4,75-79`), ARES vědomě reimplementován kvůli forkability
(`ares-lookup.mjs:12-18`). Handoff k investigaci (Fáze 9) je navržen jako **lokální, neveřejná,
volitelná** vrstva; Prismatic credentials nikdy v GitHub Actions. Contract je jen návrh (§24).

## 24. Schema proposal (jen návrh, žádné produkční schema ve Fázi 1)

Vrstvy intake manifestu:
- **raw submission**: bajtově zachovaný původní text (nikdy přepsaný tak, že mění význam);
- **normalized**: strukturovaný výstup, nikdy prezentovaný jako citace uživatele;
- **user_assertion vs system_observation**: `{kind:"user_assertion",text}` vs
  `{kind:"system_match",entity_id,reason}`;
- **machine_draft vs human_decision**: `proposed_authorization_scope.decision_class:"machine_draft_only"`,
  `authorization_effect:"none"`;
- **fail-closed**: `publication_status:"blocked"`, `authorization_status:"pending_owner"`.

Handoff contract intake→investigace (návrh):
```json
{ "schema_version":"1.0.0", "intake_id":"INTAKE-...", "issue_reference":{},
  "authorization_reference":{}, "allowed_subjects":[], "allowed_topics":[],
  "excluded_topics":[], "seed_sources":[], "risk_flags":[], "publication_mode":"draft_pr_only" }
```

## 25. Parser proposal

Deterministický (ne LLM). Label→id mapa verzovaná v repu + fixture testy (nutné, protože GitHub Issue
Forms nepropisují `id` do těla — parser se dnes musí chytat na český text labelu, audit §1). Fail-closed
na neznámý form/version. File size limit, path-traversal sanitizace, žádná síť.

## 26. Matching proposal

Vysvětlitelné pořadí: (1) exact canonical ID → (2) exact official identifier (IČO) → (3) exact
normalized name → (4) exact alias → (5) constrained similarity → (6) unresolved multiple candidates.
Každý match: `score`, `reasons`, `matched_fields`, `confidence_class`, `manual_review_required`.
Thresholdy `UNVALIDATED` (repo nemá kalibrační data). Reuse `entity-dedupe.mjs`, `outletKey()`.
**Předpoklad:** doplnit strukturované `externalIds`/`alternateNames` (dnes 0 dat) — jinak IČO matching
stojí na volném textu (audit §8).

## 27. URL preflight proposal

Jen návrh, žádný HTTP klient ve Fázi 1. Plný SSRF model + limity v
[threat-model §6](../../reports/intake/phase-01-threat-model.md). Default-deny, re-check DNS/IP po
každém redirectu, max bytes/timeout/redirecty, žádné cookies/auth/JS, content-type whitelist.

## 28. Workflow proposal

Fáze 6: `.github/workflows/dossier-intake.yml` (vzniká až tam), `on: issues`, permissions
`issues:write`+`contents:read`, concurrency per issue, timeout, pinned actions, idempotentní bot
marker. Izolován od `deploy.yml`.

## 29. UI proposal

CTA „Navrhnout dossier" přes existující navigační/komponentní systém (reuse `macros/ui.html`
`site_footer`; doplnit chybějící button/link macro místo 3 inline variant). Umístění: landing, dossier
index, entity index, contribution page, footer, empty-state. Landing copy: kdokoli může navrhnout ·
podnět je veřejný · není automatické zveřejnění · scope schvaluje člověk · výsledek prochází další
kontrolou · citlivý materiál neposílat přes GitHub. Fáze 7, neimplementováno ve Fázi 1.

## 30. Testing strategy

Node `node:test` snapshot/golden (repo vzor `compiled-golden.test.mjs`); fixtures syntetické (nikdy
reálný subjekt); malformed/injection/oversized/duplicate vstupy; determinismus (2 běhy = identický
výstup); IP klasifikace tabulkové testy (Fáze 4); actionlint + zero-interpolation (Fáze 6). Intake
testy oddělené od produkční sady.

## 31. Rollout

Fázově 2→12 (viz [implementation-plan](../../reports/intake/phase-01-implementation-plan.md)). Fáze 3
a 4 paralelizovatelné po Fázi 2. Nejdřív čistě lokální (2–5), pak Actions (6), pak UI (7), pak lidský
handoff a investigace (8–10), pak hardening a pilot (11–12).

## 32. Rollback

Každá fáze má rollback = smazání nových cest; produkční pipeline nedotčena, protože žádný produkční
skript na intake soubory neodkazuje až do Fáze 6, a i tam je workflow samostatný soubor. Fáze 5 (změna
formu) vyžaduje verzování formu (parser umí starou verzi).

## 33. Observability

Intake report + artifact manifest + issue historie tvoří audit stopu. Fáze 11: runbooky pro každý
terminální stav, rate-limiting, abuse detekce. Pro důkazní trvalost (na rozdíl od efemérního co-op
busu) použít commitovaný append-only log dle vzoru `data/discovery-log.jsonl` — ale bez PII.

## 34. Operational ownership

Vlastník rozhoduje o autorizaci a publikaci; odpovědnost za rejection musí být v runbooku explicitní
(Fáze 11). Single-writer vzor existuje v co-op protokolu (`PROTOCOL.md:38-41`).

## 35. Abuse handling

Rate limiting, duplicate-intake detekce (`intake:possible-duplicate`), `intake:invalid` fast-close,
`intake:security-review` pro PII/injection, brigading detekce. Fáze 6/11.

## 36. Open questions

1. Sjednotit/odstranit `AUTHORIZATION.md` + `authorization.json` (root) vs `authorizations.toml` —
   3./4. autorizační vrstva, kterou skilly nezmiňují (audit §5).
2. Vyřešit rozpor gitignore statusu `reports/` (dokumentace vs realita, B-11).
3. Model revokace autorizace bez mazání append-only historie (dnes neexistuje).
4. Zda a jak doplnit strukturované `externalIds`/`alternateNames` do 503 existujících entit.
5. Publikovat schema/`@context` URI (dnes 404), nebo dokumentaci opravit.
6. Adresovat B-1/B-2/B-3 (governance vynucení) — samostatná mise před Fází 8.

## 37. Phase plan

Viz [implementation-plan](../../reports/intake/phase-01-implementation-plan.md) — 12 fází, každá s
cílem/inputs/outputs/acceptance/rollback/non-goals/dependencies/security-boundary.

## 38. Acceptance criteria

Fáze 1 hotová dle §24 zadání (40 bodů) — viz terminálový report. MVP intake (Fáze 6) přijat, když:
issue event → idempotentní report + labely, žádný zápis do repa, permissions jen `issues:write`+
`contents:read`, deploy izolován, manifest fail-closed, žádná machine-actor autorizace.

## 39. Known limitations

Governance kotva má 3 CRITICAL slabiny (B-1/B-2/B-3) nezávislé na intake; matching bez strukturovaných
identifikátorů; GitHub není a nesmí být důvěrný kanál (skutečný whistleblower intake mimo scope);
Prismatic není a nebude tvrdou závislostí.

## 40. Decision log

- 2026-08-02 — PROPOSED. Fáze 1 audit dokončen (5 paralelních auditních průchodů + levné validátory;
  `npm run build` delegován orchestrátorovi kvůli souběžnému buildu). Vybrána MVP architektura A+B,
  zamítnuty C a D. Zaznamenány governance nálezy B-1…B-16 a GitHub nálezy (CRITICAL:
  `blank_issues_enabled`). Žádný produkční kód, žádná autorizace, žádný commit ve Fázi 1.

---

## State machine detail (§18)

### Osa 1 — Intake status
`submitted → triage → {invalid | needs_information | possible_duplicate | security_review_required | preflight_complete} → closed`

### Osa 2 — Authorization status
`not_requested → pending_owner → {authorized | rejected | superseded}`
(`revoked` nepoužit — repo nemá append-only model revokace, viz §36.3)

### Osa 3 — Publication status
`blocked → research → draft → editorial_review → publishable → published` (+ `rejected`)

### Povolené přechody (výběr klíčových)

| From | Event | Actor | Guard | To | Side effect |
|---|---|---|---|---|---|
| — | issue opened | machine | valid form+version | intake=submitted, publication=blocked, authorization=not_requested | komentář + artifact |
| submitted | parse+match+preflight OK | machine | fail-closed prošel | intake=preflight_complete | idempotentní report |
| submitted | PII/injection detekován | machine | risk flag | intake=security_review_required | label `intake:security-review` |
| preflight_complete | owner požádá o autorizaci | human | — | authorization=pending_owner | label `authorization:pending-owner` |
| pending_owner | `authorize-entity` (TTY) + AGENTS.md append | **human** | TTY + explicit | authorization=authorized | append-only log |
| authorized | investigace | human | lokálně | publication=research→draft | draft PR |
| draft | review | human | — | publication=editorial_review→publishable | — |
| publishable | merge do master | human | — | publication=published | build+deploy |

**Invarianty (vynucené):** machine actor nikdy nedosáhne `authorization=authorized`; issue-triggered
transition nikdy nedosáhne `publication=published`. Idempotence: issue edited/reopened/rerun/duplicate
webhook → re-derivace stavu z artifactu (ne z labelu), bot marker + input hash zabrání dvojímu
zpracování.
