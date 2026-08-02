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
- 2026-08-02 — Fáze 2 implementována (stále **PROPOSED** — tento zápis rozhodnutí vlastníka o
  `ACCEPTED` nenahrazuje). Schema verze `0.1.0` (§23.1 — model stále experimentální, ne `1.0.0`).
  Vytvořeno: `schemas/intake/{intake-event,intake-manifest}.schema.json`, `scripts/intake/*` (event
  loader s file-size/symlink/JSON limity, form detektor pro `vomaste-intake-form:v1`, sekční parser,
  submission validátor, konzervativní normalizace textu i syntaktická URL extrakce/klasifikace bez
  síťového přístupu, deterministický ID/hash/manifest builder, Markdown report renderer s
  fenced-code-block escapingem proti heading/mention/HTML-comment injection, CLI `process-issue.mjs`
  s atomickým zápisem), 27 syntetických fixtures (§19 seznam + starší/neznámá form-verze navíc), 121
  testů (`npm run test:intake`, nyní i součást hlavního `npm run test` → `npm run build`).

  **Odchylky od Fáze 1, s důvodem:**
  1. Enum `workflow.*` ve Fázi-2 schématu je omezen na `intake_status ∈ {triage, invalid,
     needs_information}`, `authorization_status = pending_owner` (const), `publication_status =
     blocked` (const) — přesně dle §15.1 zadání Fáze 2. To je **užší** než Osa 2 státového automatu
     níže, která má i `not_requested` jako počáteční stav před tím, než o autorizaci požádá vlastník.
     Fáze 2 `not_requested` nepoužívá vůbec — každé platné podání jde rovnou do `pending_owner`, protože
     Fáze 2 nemá matching/preflight (Fáze 3/4), tedy žádnou mezikrokovou událost, po které by
     `not_requested → pending_owner` přechod dával smysl. Dopad: neškodné zúžení, ne rozšíření —
     `authorized`/`publishable`/`published` zůstávají ve schématu strukturálně nevyjádřitelné. Rollback:
     přidat `not_requested` jako další povolenou konstantu ve Fázi 3, pokud se ukáže potřebná.
  2. Manifest nese `submission.submitted_source_urls_raw` (string) + `normalization.normalized_source_urls`
     (pole objektů s `syntax_observations`) místo §5.2 návrhu `submission.submitted_source_urls` (pole).
     Důvod: §13.2 (raw preservation) a §14 (jen syntaktická extrakce) vyžadují oddělit, co uživatel
     doslova napsal, od toho, co procesor z toho syntakticky vytěžil — stejné rozlišení už mají
     ostatní textová pole. Dopad: schema shape, ne workflow.
  3. Chybějící `acknowledgements` (§12) řeší tato fáze jako **tvrdé selhání** (žádný manifest
     nevznikne, `SUBMISSION_VALIDATION_FAILED`) — §12 nechávalo na Fázi 2 volbu mezi tím a
     `intake_status=invalid` artifactem s manifestem. Důvod: bez explicitního rozhodnutí vlastníka v
     ADR zvolena bezpečnější fail-closed větev (§1.4). Rollback: pokud Fáze 3+ potřebuje i pro tento
     případ auditovatelný manifest, přepnout na `invalid`-artifact větev je lokální změna
     `scripts/intake/validate-submission.mjs` + `process-issue.mjs`, ne schema-breaking.

  `npm run build` zelený (109 s, 2360 stránek); `git diff -- AGENTS.md data/authorizations.toml
  .github/workflows` prázdný. Fáze 3 kontrakt: `reports/intake/phase-02-implementation-report.md`.
- 2026-08-02 — Fáze 3 implementována (stále **PROPOSED**). Manifest schema `0.2.0` (nový required
  obsah: `matching`, `duplicate_detection`, `risk_classification`, `workflow_decision`;
  `workflow.intake_status` rozšířen o `possible_duplicate`/`security_review_required`, stále bez
  `authorized`/`publishable`/`published`). Vytvořeno: `scripts/intake/build-matching-index.mjs`
  (read-only derived index z `data/dossiers/*/dossier.json` + `_shared/entities/*.json`, 448 záznamů
  k 2026-08-02), `scripts/intake/matching/*` (normalizace jmen/organizací/IČO, explainable scoring,
  candidate retrieval s bucketingem, deterministické řazení, duplicate-intake detektor s fixture
  adaptérem), `scripts/intake/risk/*` (5 detektorů + orchestrátor, 21 flagů dle §13, deterministická
  §14.1 precedence). 244 testů (`npm run test:intake`), reálný matching proti produkčním datům ověřen
  ručně (`Andrej Babiš` → `ambiguous` shoda dvou existujících záznamů `andrej-babis`/`babis` — reálný
  datový nález zaznamenaný v reportu, ne opraven, protože Fáze 3 nesmí měnit produkční data).

  **Zjištění auditu (`reports/intake/phase-03-matching-inventory.md`), s dopadem na interpretaci
  výsledků**: `alternateNames`/`externalIds` má vyplněných 0 z 503 sdílených entit — identifikátorové
  a aliasové matchování je plně implementované a testované (syntetický dataset), ale proti reálným
  datům dnes vrací jen `no_match`, dokud editorial pass tato pole nezačne plnit. Jméno-matching (exact/
  near) je jediná vrstva s reálným signálem dnes.

  **Odchylky od Fáze 1/2, s důvodem:**
  1. `duplicate_status` na top-level je binární `no_duplicate|possible_duplicate` (mapuje přímo na
     §14.2 workflow enum), zatímco jemnější `duplicate_type` (§11.2, šest hodnot) žije per-kandidát v
     `candidates[]`. §11.2 a §11.3 mise samy nejsou stoprocentně konzistentní (§11.3 příklad používá
     `possible_duplicate`, které není v §11.2 seznamu) — zvoleno čtení, které dává smysl vzhledem k
     §14.2 (workflow enum má jen `possible_duplicate`, ne šest jemných hodnot).
  2. `score_components` u `match_type=conflicting_identifier` je vždy `[]` a `score=0` — konflikt
     identifikátoru není "slabší shoda", je to varovný signál; přidání "vysvětlujících" komponent by
     zavádějícím způsobem naznačovalo částečnou shodu. Objeveno a opraveno během implementace (viz
     report — `evaluatePair`'s dřívější verze omylem přidávala `near_name_similarity` komponentu i k
     `exact_identifier` shodám kvůli slabě odlišeným jménům; opraveno na komponenty scoped k
     zvolenému `match_type`).
  3. Bucket-retrieval pro near-name matching foldne diakritiku jen v klíči bucketu (`match-entities.mjs`
     `foldForBucketKey`), ne v samotném porovnání — bez toho by "Jan Testovaci" (chybějící diakritika,
     běžná reálná varianta) vůbec nebyl načten pro near-name scoring. Objeveno a opraveno během
     implementace (ruční test proti syntetickému indexu).

  `npm run build` zelený; `git diff -- AGENTS.md data/authorizations.toml .github/workflows` prázdný.
  Fáze 4 kontrakt: `reports/intake/phase-03-implementation-report.md`.
- 2026-08-02 — Fáze 4 implementována (stále **PROPOSED**). Manifest schema `0.3.0` (nový required
  `source_preflight`; §14.3 `editorial_verification` je schema `const: "not_performed"` — strukturálně
  nevyjádřitelná žádná jiná hodnota). Vytvořeno: `scripts/intake/preflight/*` — čisté funkce
  (`classify-ip.mjs` — IPv4/IPv6 rozsahy z §6.1/§6.2 vč. alternativních zápisů 127.1/2130706433/
  0x7f000001/oktalového zápisu a IPv4-mapped IPv6, `parse-url.mjs`, `classify-hostname.mjs`,
  `validate-destination.mjs`), DNS/HTTP adaptéry (`resolve-hostname.mjs` — produkční `node:dns`;
  `request-once.mjs` — pinned `node:http`/`node:https` transport s custom `lookup`, remote-address
  re-verifikací po connectu, per-fázovými timeouty, stream-based body limitem nedůvěřujícím
  `Content-Length`), `follow-redirects.mjs` (každý hop reviduje celou pipeline od nuly), bounded HTML
  metadata extraktor, orchestrace (`preflight-url.mjs`, `preflight-urls.mjs` — cap 20 URL, concurrency
  3, per-host 1), lokální mock HTTP server + mock DNS adaptér pro testy, `detect-preflight-risk.mjs`
  (mapuje §14 výsledky na §15 risk-flag vokabulář). `--preflight` je explicitní opt-in na
  `process-issue.mjs` (výchozí běh zůstává offline — `offlinePreflightResult`). 143 nových testů (SSRF
  matice §20 v plném rozsahu — IPv4/IPv6 literály vč. alternativních zápisů, DNS-based private/mixed/
  metadata, hostname suffixy, redirecty na private/localhost/metadata/credentials — vše přes lokální
  mock server a mock DNS, nikdy veřejný internet) + statické bezpečnostní brány (§28: žádné
  `rejectUnauthorized: false`, žádné proxy env dědění, žádný `fetch()` mimo schválený transport, žádný
  env bypass private-IP politiky, test-only bypass parametry nikdy nedosažitelné z `process-issue.mjs`).
  425/425 testů celkem (`npm run test:intake`).

  **Dva reálné bugy nalezené a opravené testy během implementace** (obojí by v produkci znamenalo
  bezpečnostní chybu, ne kosmetickou vadu):
  1. `validate-destination.mjs` používalo `result?.category ?? "unclassifiable"` — `??` operátor
     ošetřuje i legitimní `null` (veřejná adresa nemá kategorii), takže KAŽDÁ veřejná adresa byla
     mylně klasifikována jako neklasifikovatelná a tedy blokovaná. Bez testu `validate-destination.test.mjs`
     by preflight nikdy nepustil žádnou veřejnou URL. Opraveno explicitním `result === null` testem.
  2. `classify-ip.mjs` procházelo IPv4 rozsahy v pořadí ze zadání, ne podle specifičnosti prefixu —
     `255.255.255.255/32` (broadcast) spadalo i do `240.0.0.0/4` (reserved) a širší rozsah vyhrával
     první shodou, takže broadcast adresa dostala nesprávnou (byť pořád blokující) kategorii. Opraveno
     seřazením rozsahů podle délky prefixu sestupně před kontrolou.

  **Odchylky od Fáze 1/2/3, s důvodem:**
  1. `limit-response.mjs` ze zadání §3 nevzniklo jako samostatný modul — bounded stream reading je
     zaintegrované přímo v `request-once.mjs` (§21's "oversized"/"chunked-endless" testy ho pokrývají
     integračně přes mock server). Důvod: odděleny by byl umělý řez přes jedinou stavovou proměnnou
     (`bodyBytes`) sdílenou s zbytkem response-handling logiky bez skutečného zisku testovatelnosti.
  2. Test-only bypass pro destination validation (`testAllowedPrivateAddresses`) povoluje jen PŘESNOU
     adresu mock serveru, nikdy celý private rozsah — jinak by "redirect na private IP" test byl
     prázdný (redirect na `10.0.0.1` by prošel stejným blanket bypassem jako loopback mock server).
     Zadání §19.3 samo tuto přesnost nevyžadovalo explicitně, ale bez ní by test negaroval sám sebe.
  3. `npm run intake:preflight-fixture` (§23.2 "s mock transportem") demonstruje `--preflight` cestu
     přes mock DNS adaptér vracející privátní adresu — tedy SSRF politiku, která korektně zablokuje
     všechny URL fixture, ne šťastnou cestu k reálnému serveru. Důvod: happy-path přes produkční
     `validate-destination.mjs` by vyžadoval buď skutečný veřejný cíl (nedeterministické, síťové), nebo
     produkční test-only bypass (zakázáno §19.3) — blokovaný výsledek je deterministický, offline a
     dokazuje totéž (pipeline běží end-to-end a manifest se obohatí).

  `npm run build` zelený (107 s); `git diff -- AGENTS.md data/authorizations.toml .github/workflows`
  prázdný. Fáze 5 kontrakt: `reports/intake/phase-04-implementation-report.md`.
- 2026-08-02 — Fáze 5 implementována (stále **PROPOSED**). Audit (`reports/intake/phase-05-issue-form-audit.md`)
  zjistil, že `.github/ISSUE_TEMPLATE/navrh-dossieru.yml` (zpevněný wordingem misí T-042, GitHub CRITICAL
  audit) nikdy nebyl propojen s parserem z Fáze 2 — chyběl marker, pole neodpovídala `FORM_V1`
  headings, jediný souhrnný checkbox místo tří samostatných. Formulář přestavěn (stejný soubor, stejné
  `labels`, zachovaná bezpečnostní formulace) tak, aby renderoval přesně `FORM_V1` kontrakt; ověřeno
  proti reálnému GitHub renderování (dokumentace + `issue-ops/parser` referenční implementace), ne jen
  předpokládáno — `scripts/intake/render-github-form-body.mjs` renderuje tělo issue ze **skutečného**
  YAML a `scripts/intake/issue-form-compatibility.test.mjs` (9 testů) prochází reálně vyrenderovaným
  tělem přes reálný parser. `scripts/intake/generate-form-fixture.mjs` z něj vygeneroval 19 golden
  `tests/fixtures/intake/e2e-*.json` fixtures (§11); `scripts/intake/run-e2e-fixture.mjs`
  (`npm run intake:e2e-fixture`) je všechny zpracuje plným pipeline offline (mock DNS na privátní
  adresu — stejný vzor jako `intake:preflight-fixture`); `scripts/intake/run-e2e-fixture.test.mjs`
  (6 testů) ověřuje §32 test matrix, edit sémantiku (§22: stabilní intake ID napříč editací, odlišný
  input hash, odebrané potvrzení invaliduje nový běh) a jeden skutečně síťově dosažitelný (mockovaný,
  jen loopback) HTTP round-trip. `scripts/ci/validate-issue-forms.mjs` (nová `js-yaml` dev-závislost —
  repo dosud žádný YAML parser nemělo) strukturálně validuje všechny 4 šablony + `config.yml`. Report
  (`render-intake-report.mjs`) doplněn o §20 povinné formulace ("Zdroj podání: veřejná GitHub issue",
  "Tento report není potvrzením správnosti podnětu.", "Přijaté URL nebyly automaticky uznány jako
  nezávislé ani důvěryhodné zdroje.", "Rozsah nebyl autorizován.", "Publikace zůstává blokována.").
  480 testů celkem (`npm run test:intake` + `test:intake:form` + `test:intake:e2e`).

  **Skutečný bug nalezený a opravený při auditu proti reálnému GitHub renderování** (ne jen kosmetická
  vada): GitHub renderuje nezodpovězené nepovinné pole jako doslovný text `_No response_` pod jeho
  nadpisem — nikdy jako prázdnou sekci. `parse-issue-form.mjs` toto vůbec neošetřoval a Fáze 2 vlastní
  ručně psané fixtures (`tests/fixtures/intake/valid-*.json`) používaly prázdné tělo místo tohoto
  placeholderu, takže mezera zůstala skrytá až do tohoto auditu. Reálné podání by placeholder text
  `"_No response_"` propsalo do manifestu jako by šlo o odeslaný obsah. Opraveno normalizací na prázdný
  řetězec pro každý textový nadpis kromě `acknowledgements` (checkboxes pole, kde se placeholder nikdy
  legitimně neobjeví). Zjištěno navíc: `sourceUrls` je nadpis-povinné, ale GitHub-nepovinné pole (§6.6
  — GitHub neumí podmíněnou required validaci), takže oprava se musela vztahovat i na něj, ne jen na
  tři pole označená "(nepovinné)" v headings — normalizace je tedy univerzální přes všechny textové
  nadpisy, ne jen `FORM_V1.optionalSections`.

  **Bezpečnostní tvrzení posílena, ne jen zdokumentována**: `detect-form.mjs` nyní odmítá i DRUHÝ
  marker-podobný řádek kdekoli v těle (`duplicate_form_marker`) — např. vložený do volného textu popisu
  (§25.1) — dřív byl takový vložený marker neškodně ignorován (parser čte jen první řádek), nově je
  explicitně odmítnut fail-closed, aby podvržený marker nikdy nezůstal tiše v manifestu jako nerozpoznaná
  sekce.

  **Odchylky od zadání, s důvodem:**
  1. `scripts/intake/forms/registry.mjs` + `v1.mjs` (§9's "preferovaná struktura") nevzniklo — `FORM_V1`
     zůstává v `constants.mjs`, kde už plní roli "jeden versioned kontrakt modul" (`SUPPORTED_FORM_VERSIONS`
     je už explicitní registr verzí). Přidat plugin-like adresářovou strukturu pro JEDINOU existující
     verzi by bylo přesně to spekulativní strukturování, které `CLAUDE.md` i mise samotná (§9.1 "žádný
     obří univerzální parser") odmítají — až vznikne skutečná v2, je to malá, izolovaná refaktorizace.
  2. `field_provenance` (§21) nevzniklo jako nové schema pole — mise sama povoluje výjimku ("Nemusí
     hashovat každý text zvlášť, pokud Phase 2 provenance stačí"): existující `provenance.input_sha256`
     (hash celého syrového eventu) plus tento dokumentovaný, verzovaný field↔heading kontrakt
     (`docs/intake/issue-form-contract.md`) dohromady poskytují stejnou dohledatelnost bez rozšíření
     schématu — `schema_version` zůstává `0.3.0`.
  3. Scénář "possible duplicate" z §32 test matrix nemá vlastní e2e fixture — vyžadoval by stavové
     nastavení `--prior-manifests-dir` nad rámec jednoho statického JSON souboru; Fáze 3 vlastní
     `detect-duplicate-intake.test.mjs` tuto logiku už vyčerpávajícím způsobem testuje.
  4. Golden snapshoty (§31) jsou asserce nad skutečným během (stejná konvence jako
     `scripts/data/compiled-golden.test.mjs`), ne opaque commitnuté diff soubory — repo pro to nemá (a
     nezavádí) snapshot-testing knihovnu.

  `npm run build` zelený; `git diff -- AGENTS.md data/authorizations.toml .github/workflows` prázdný —
  jediná změna v `.github/` je `navrh-dossieru.yml` sám, přesně jak §39 očekává. Fáze 6 kontrakt:
  `reports/intake/phase-05-implementation-report.md`.
- 2026-08-02 — Fáze 6 implementována (stále **PROPOSED**). Nový `.github/workflows/dossier-intake.yml`
  — první produkční GitHub orchestrace nad lokálním pipeline z Fáze 2-5. Trigger `issues` (opened/
  edited/reopened/labeled/unlabeled/closed), `permissions: {contents: read, issues: write}` a nic
  víc, `timeout-minutes: 10`, issue-scoped `concurrency` s `cancel-in-progress: true`, checkout
  `persist-credentials: false`. Privilege separation vynucená architekturou, ne konvencí: zpracovací
  krok (`scripts/intake/process-github-event.mjs`) nikdy nemá `GITHUB_TOKEN` v prostředí — čte jen
  `$GITHUB_EVENT_PATH`, nikdy shell-interpoluje `issue.body`/`issue.title`; publikační krok
  (`scripts/intake/publish-github-result.mjs`) je jediné místo s tokenem a čte výhradně už
  sanitizovaný `_status.json`/`manifest.json`, ne syrový event znovu.

  Nové moduly: `scripts/intake/adapters/github-event.mjs` (allowlist adaptér syrového GitHub payloadu
  na interní event schema z Fáze 2 — nikdy passthrough), `scripts/intake/github/` — `production-adapter.mjs`
  (jediný soubor s reálným `fetch()` proti GitHub REST, plain `fetch`, žádná nová závislost jako
  Octokit), `mock-github-adapter.mjs` (in-memory fake, stejný interface), `find-managed-comment.mjs` +
  `upsert-report-comment.mjs` (create-or-update jednoho komentáře; marker + trusted bot author
  vyžadovány OBOJÍ; duplicitní managed komentáře: nejstarší se aktualizuje, ostatní se nikdy nemažou
  automaticky), `sync-labels.mjs` (label je projekce stavu, nikdy zdroj pravdy; chybějící repo label
  degraduje na `partial` s diagnostikou, nikdy neshodí celý běh — Varianta A, ne automatický bootstrap),
  `determine-notification.mjs` (ping stav se čte z AKTUÁLNÍCH labelů issue před syncem — žádná nová
  perzistentní vrstva; ping jen na skutečný přechod DO `triage`/`security_review_required` z jiného
  předchozího stavu), `handle-closed-issue.mjs` (uzavření ≠ zamítnutí ani schválení; report se
  aktualizuje, nikdy nemaže; `publication:blocked` přežívá), `build-safe-reports.mjs` (bezpečné reporty
  pro invalid/internal-error/security-review — nikdy stack trace, nikdy syrový text podání u security
  review), `publish-intake-result.mjs` (orchestrátor: stale-event guard přes znovu-načtené
  `issue.updated_at`, pak ping-rozhodnutí, pak upsert komentáře, pak label sync).

  `scripts/intake/validate-artifact-safety.mjs` brání upload artefaktu s tokenem/Authorization
  hlavičkou/URL credentials/private key patternem/neočekávaným souborem — workflow YAML upload artefaktu
  NENÍ `if: always()` bezpodmínečně, ale podmíněný přímo úspěchem tohoto kroku
  (`steps.safety.outcome == 'success'`) — bezpečnostní bug nalezený a opravený během implementace, viz
  níže. `scripts/ci/validate-intake-workflow.mjs` (+ 17 testů vč. 15 adversarial mutací reálného
  workflow YAML) staticky ověřuje celý §24 seznam (trigger, permissions, persist-credentials, timeout,
  concurrency, žádná interpolace issue.body/title, žádný secret mimo GITHUB_TOKEN, žádný deploy/git
  push/gh pr create). 128 nových testů v `scripts/intake/{adapters,github}/*.test.mjs` +
  `process-github-event.test.mjs` + `publish-github-result.test.mjs` (`npm run test:intake:github`).

  **Skutečný bug nalezený a opravený při psaní samotného workflow YAML** (ne jen testů): první návrh
  uploadu artefaktu měl `if: always()` bez podmínky — to by uploadlo artefakt, i kdyby krok "Validate
  artifact safety" bezprostředně před ním SELHAL (tedy detekoval nebezpečný obsah). `if: always()`
  na GitHub Actions kroku znamená "spusť i po selhání předchozích kroků", ne "spusť jen když předchozí
  uspěly" — tyto dva významy jsou snadno zaměnitelné a přesně tahle záměna by byla reálná bezpečnostní
  díra v produkci. Opraveno na `if: always() && steps.safety.outcome == 'success'` — artefakt se
  uploadne jen když bezpečnostní validace explicitně uspěla, bez ohledu na to, jestli něco dřívějšího
  selhalo. Publikační krok (post komentáře) si ponechává obyčejné `if: always()`, protože §15.3
  vyžaduje, aby i skutečná interní chyba dostala bezpečný komentář — to je záměrná, jiná kategorie
  než artefakt (report text je vždy syntetizovaný z bezpečných šablon, nikdy syrový výstup).

  **Odchylky od zadání, s důvodem:**
  1. Žádný `CODEOWNERS` soubor (§37) — repo dosud governance přes CODEOWNERS nepoužívá a mise sama
     zakazuje ho zavést bez samostatného ADR rozhodnutí. Doporučení branch protection zdokumentována
     v `docs/intake/operations.md` jako doporučení, nikdy netvrzená jako vynucená.
  2. Produkční GitHub API adaptér používá nativní `fetch()` (Node 24), ne Octokit z `actions/
     github-script` ani jako nová závislost — mise obojí výslovně povoluje (§19); `fetch()` zapadá do
     existujícího vzoru "malý Node entrypoint s GITHUB_TOKEN" z Fáze 4 a nepřidává závislost.
  3. Label bootstrap (§14 Varianta B) nevznikl jako automatizovaný script — jen dokumentace
     (`docs/intake/github-labels.md`) s ručními `gh label create` příkazy pro maintainera, přesně jak
     §14 preferuje ("Preferuj ruční bootstrap nebo samostatný trusted script").
  4. `npm run intake:publish-fixture` demonstruje dva běhy (create → update) nad JEDNÍM mock adaptérem
     místo dvou nezávislých ukázek — přesněji odpovídá skutečnému idempotentnímu chování (§16.1), které
     má dokazovat.

  `npm run build` zelený; `git diff -- AGENTS.md data/authorizations.toml data/dossiers` prázdný;
  jediná změna v `.github/` je nový `dossier-intake.yml` samotný. Fáze 7 kontrakt:
  `reports/intake/phase-06-implementation-report.md`.

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
