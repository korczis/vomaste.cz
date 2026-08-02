# Phase 1 — Repository audit: veřejný dossier-intake workflow

**Datum**: 2026-08-02 · **Stav**: VERIFIED (audit) / PROPOSED (návrh)
**Mise**: [docs/missions/intake/](../../docs/missions/intake/README.md) · **ADR**: [docs/adr/ADR-public-dossier-intake.md](../../docs/adr/ADR-public-dossier-intake.md)
**Base commit**: `20f048b9154b44abfcaf9e96ab86be8353520bbd` (větev `master`; během auditu se HEAD posunul přes `cfbe8461` na `5376dad8` — v repu paralelně pracují jiné coop session, viz worktrees T-012, T-039c)
**Metoda**: read-only; pět paralelních auditních průchodů (governance, GitHub, investigate/Prismatic, schemas/matching, UI/docs) + přímé spuštění levných validátorů. Žádný `npm run build` (delegováno orchestrátorovi — souběžný race dvou buildů jiných sessions).

---

## 1. Executive summary

Repozitář vomaste.cz je statický Zola web s **JSON-first kanonickým datovým modelem** (po misi
T-028): jediný zdroj pravdy je `data/dossiers/**/*.json`, `content/**` je generovaný routing
adapter. Governance stojí na **append-only autorizačním logu** v `AGENTS.md` a jeho strojové
transkripci `data/authorizations.toml`. Výchozí stav pokrytí je „nikoho nepokrývat"; nový subjekt
či kauza vyžaduje explicitní, datovanou, lidsky psanou autorizaci vlastníka.

**Klíčový závěr pro intake**: repozitář má **výjimečně dobře postavené datové a redakční
základy k reuse** (validace, dedupe, source families, autorizační brána v CI), ale **žádný intake
kanál neexistuje** a repo to samo přiznává. Zároveň audit odhalil **tři CRITICAL slabiny ve
vynucení governance** (append-only check je v CI fakticky no-op; regex míjí 3 reálné záznamy logu;
strojový registr `authorizations.toml` není chráněn ani porovnáván s AGENTS.md) a **jeden CRITICAL
nález v GitHub vrstvě** (`blank_issues_enabled: true` + návrhový formulář bez varování/checkboxu =
nejsnazší cesta, jak citlivý podnět skončí trvale veřejně). Tyto nálezy jsou **předpoklady** pro
bezpečnou implementaci intake, nikoli jeho součást — proto jsou zde zaznamenány, ale ve Fázi 1
neopravovány (§23 zadání).

**Prismatic integrace**: `NOT_FOUND` (357 zmínek v dokumentaci, 0 řádků integračního kódu; adopce
formálně odmítnuta ADR z 2026-07-30). `/investigate` skill: `DESIGN-ONLY` (adresář
`data/investigations/` neexistuje, manifest nemá schéma, nikdy nedoběhl).

---

## 2. Repo snapshot (§5.1)

| Metrika | Hodnota | Zdroj |
|---|---|---|
| Commit SHA (start) | `20f048b9154b44abfcaf9e96ab86be8353520bbd` | `git rev-parse HEAD` |
| Branch | `master` | `git branch --show-current` |
| Node.js | v24.8.0 | `node --version` |
| npm | 11.6.0 | `npm --version` |
| Zola | 0.22.1 | `zola --version` |
| OS/platforma | Darwin x86_64 | `uname -sm` |
| Tracked files | 5323 | `git ls-files \| wc -l` |
| Soubory v `data/` | 7362 (z toho 4885 `.json`; 4883 kanonických záznamů) | `find data -type f` |
| Soubory v `content/` | 2562 | `find content -type f` |
| Schemas | 11 (9 canonical + 2 graf export) + 8 plochých exportních + README | `ls schemas` |
| GitHub workflows | 1 (`deploy.yml`) | `ls .github/workflows` |
| Issue templates | 4 + `config.yml` | `ls .github/ISSUE_TEMPLATE` |
| Claude skills | 5 (bootstrap, dossier-entry, investigate, adr, commit) | `ls .claude/skills` |
| Dossier scripts | ~35 (`scripts/dossier/`) | `ls scripts/dossier` |
| Data scripts | ~40 (`scripts/data/`) | `ls scripts/data` |
| Test files | 34 (`node --test` glob) | `package.json:9` |
| Dirty na startu | 1 soubor: `docs/entity-discovery.md` (cizí session, NEMĚNĚNO) | `git status --porcelain` |

Kanonické počty záznamů (golden snapshot): claims 860 · sources 542 · cases 88 · gaps 188 ·
relations 142 · updates 47 · dossier.json 24 · entities 503.

## 3. Baseline build (§4)

**BASELINE = DELEGATED.** `npm run build` nebyl spuštěn — v checkoutu probíhá race dvou souběžných
buildů jiných sessions (pokyn orchestrátora). Výsledek plného buildu doplní orchestrátor.

Levné validátory a testy spuštěny přímo:

| Příkaz | Výsledek | Poznámka |
|---|---|---|
| `npm run data:validate` | **PASS** (exit 0, 1.5 s) | 24 dossierů, 1891 balíčkových záznamů, 503 entit; shape+reference+sémantika+JSON-LD OK. 11 WARNING (duplicitní kanonické URL, 2× context-only mrtvá stránka) — advisory, ne blokující |
| `npm run validate:authorization` | **PASS** (exit 0) | 24 dossierů referencuje platné autorizační záznamy; 503 entit ověřeno na subject/context konzistenci |
| `npm run verify:authorization-log` | **PASS** (exit 0) | „OK (23 prior entries intact)" — pozor: v CI je tato kontrola fakticky no-op, viz §5 B-1 |
| `npm test` | **FAIL** (exit 1) | 255 testů, 254 pass, **1 fail**: `compiled-golden.test.mjs` — `source` count 542 (actual) vs 543 (expected snapshot). Klasifikace: **BASELINE_DEFECT / NON_BLOCKING** pro tento audit — jde o stale golden snapshot po cizí T-039/T-040 změně (odebrán duplicitní zdroj `richard-chlad CLM-07`), ne o defekt intake návrhu. Existovalo před mou prací. |

Baseline **NELZE prohlásit za prošlý** (golden test červený + build delegován). Pro účely
analytické Fáze 1 je to non-blocking: datová integrita (`data:validate`) i autorizační brána prošly.

## 4. Datové domény — zdroje pravdy (§5.2)

Kanonický zdroj je JSON pod `data/dossiers/**` — ověřeno v kódu, ne jen dle dokumentace. `content/**`
je generovaný adapter, vynucený **třemi nezávislými bránami**: `check-generated.mjs` (C1–C6, byte
compare staging↔content + orphan detekce), `lint-generated-content.mjs` (L1–L3, whitelist front
matter), `compiled-golden.test.mjs` (snapshot). Ruční editace `content/dossiers/**` selže build.
TOML zdroje `data/dossiers.toml`/`graph.toml`/`updates.toml`/`stats.toml` po T-028 **fyzicky
neexistují**. Plná tabulka domén viz [phase-01-architecture-inventory.md](phase-01-architecture-inventory.md).

## 5. Governance & authorization findings (§6)

Model má **čtyři autorizační vrstvy**: (1) `AGENTS.md` „Content about real parties" (ř. 461,
kanonický prozaický append-only log, 26 datovaných záznamů = 22 grantů + 3 strukturální + 1
zamítnutí); (2) `data/authorizations.toml` (22× `[[authorizations]]`, strojová transkripce, „AGENTS.md
wins"); (3) entity JSON pole `publicationRole`/`dossierStatus`/`dossierEnabled`/`coverageState`;
(4) `AUTHORIZATION.md` + `authorization.json` v rootu (ruční triage tracker — **žádný skill je
nezmiňuje**, kandidát na nesynchronizovanou vrstvu).

Datová brána je dvojitě jištěná a bez grandfatheringu: `validate-authorization.mjs` + pravidla
S5/S6 v `validate-semantics.mjs` (S5/S6 nelze baseline-ovat, `:295`). `authorize-entity.mjs` je
TTY-only (odmítá neinteraktivní běh, `:45-53`), jediná zamýšlená cesta k `dossierStatus:"authorized"`.

**Anti-bypass nálezy (klasifikováno SAFE…CRITICAL):**

| # | Nález | Klasifikace | Evidence |
|---|---|---|---|
| B-1 | Append-only check porovnává jen s `git show HEAD:AGENTS.md`. V CI (`checkout` = HEAD) vždy no-op; po jednom commitu se editace stane novým baseline. `--no-verify` (dokumentován v pre-commit:51) to zpermanentní. | **CRITICAL** | `verify-authorization-log-append-only.mjs:62`, `deploy.yml:21-22` |
| B-2 | Regex nadpisu `/^### (Authorized subject\|Scope extension\|Structural change)\b/` míjí 3 reálné záznamy: `Rozšíření rozsahu` (ř. 695, celá finanční vrstva Macinka+Turek), plurál `Authorized subjects` (ř. 834, **5 z 23 subjektů**), `Not authorized` (ř. 1320, jediné zamítnutí). Ty lze editovat/smazat a check projde. | **CRITICAL** | `verify-…mjs:31` vs `AGENTS.md:695,834,1320` |
| B-3 | `data/authorizations.toml` je faktický registr, který build reálně čte. Nemá append-only ochranu ani cross-check proti AGENTS.md (`validate-authorization.mjs:8-9` to přiznává). Ručně přidaný blok projde celý build+CI. | **CRITICAL** | `validate-authorization.mjs:8-9,54-67` |
| B-11 | `reports/authorization-candidates.md` (175 KB, stovky kontextových entit vč. 11 osob z představenstva Agrofertu) je **trackovaný v gitu**, ačkoli generátor tvrdí „reports/ jsou gitignored". `.gitignore` `reports/` neobsahuje. | **WEAKLY_ENFORCED** (+ rozpor dok/realita) | `generate-…mjs:26-27` vs `git ls-files reports/` |
| B-4 | `investigate` skill povoluje agentovi psát scope extension přímo do AGENTS.md logu (`SKILL.md:56-61`), v rozporu s CLAUDE.md:50-52 („authorize-entity.mjs is the only thing that writes"). | **WEAKLY_ENFORCED** | `investigate/SKILL.md:56-61` |
| B-8 | Brána je jednosměrná: entita `subject`+`authorized`+`dossierEnabled:true` bez dossieru a bez záznamu v TOML projde validací. | **BYPASSABLE** | `validate-authorization.mjs:88-90` |
| B-9 | CI neběží na pull requestech (`on: push:[master]` + dispatch). PR checkbox „build prochází" je nevynucená sebe-deklarace. | **WEAKLY_ENFORCED** | `deploy.yml:3-6` |
| B-6 | TTY brána `authorize-entity.mjs` obejitelná pseudoterminálem (`script`/`expect`/`node-pty`). | **BYPASSABLE** | `authorize-entity.mjs:45` |
| — | **Revokace autorizace neexistuje** v žádné vrstvě (grep `revok`/`revoc` = 0). Odebrání by znamenalo buď smazat záznam (porušení append-only), nebo přidat záznam, který nic strojově nevypne. | **UNKNOWN (mezera)** | grep |
| B-12/13/14 | Žádné env/`--yes`/`--force` bypassy v autorizační cestě; scaffold fail-closed; CI↔lokál parita hlídaná. | **SAFE** | `scripts/dossier/**` |

**Závazný invariant pro budoucí intake (§6.4):** `intake artifact ≠ authorization record ≠
dossier ≠ claim ≠ publication approval`. Kde bude vynucen: samostatný schema namespace
(`schemas/intake/`, jiný `recordType`), stavový automat (machine actor nikdy →authorized), file-path
boundaries (`data/intake/` odděleno od `data/dossiers/`), workflow permissions (bez `contents: write`),
CODEOWNERS (dnes chybí — HIGH). Podrobně v ADR §21.

## 6. GitHub findings (§7–8)

**Issue templates (4):** `oprava-faktu.yml` je referenční vzor (varování ×2 + povinný checkbox +
částečně parsovatelný). `mrtvy-zdroj.yml` je jediný plně strojově parsovatelný (dropdown).
**`navrh-dossieru.yml` — nejrizikovější a nejslabší:** jediný obsahový template **bez varování o
veřejnosti a bez potvrzovacího checkboxu**; slučuje „nový subjekt / kauza / téma" do jednoho volného
pole `scope` (nelze strojově určit, zda je nutná autorizace); pole `sources` neodděluje veřejné
zdroje od neveřejných. `reakce-subjektu.yml` povinným polem `identity` aktivně vylučuje anonymitu
(trvale veřejná deklarace vztahu k subjektu). Parsování všech formů se musí chytat na český text
labelu (`id` se do těla issue nepropisuje) a žádný textarea nemá `render:` → volný markdown umí
rozbít sekce.

**`config.yml`:** `blank_issues_enabled: true` — **CRITICAL**: prázdná issue obchází labely, varování,
checkbox i typování. Dva contact_links (security advisory = správně; varování o citlivých podkladech
= poctivé, ale volitelné, ne blokující).

**Labely:** 4 ploché (`navrh-rozsahu`, `oprava-faktu`, `zdroje`, `pravo-na-odpoved`), **nikde v repu
deklarované** — neexistující label se z formu tiše neaplikuje → issue vypadne z triage. Navrhované
`intake:*`/`authorization:*`/`publication:*` s nimi doslovně nekolidují (jsou stavové vs typové).

**`deploy.yml`:** čistý v klíčových bodech — nulová interpolace event dat do `run:` (jediné `${{ }}`
je `environment.url`), žádné secrets (OIDC místo PAT), explicitní least-privilege permissions
(`contents: read`, `pages: write`, `id-token: write`). Autorizační a datové gates reálně běží v CI
před publikací (`npm run build` → `pipeline.mjs:52-53`), `deploy` má `needs: build`. **Slabiny:**
žádný SHA pinning actions (`taiki-e/install-action@v2` = 3rd party na mutable tagu, MEDIUM), chybí
`timeout-minutes` (MEDIUM), `workflow_dispatch` bez omezení větve umožňuje deploy mimo master
(MEDIUM, obchází review ne data-gates), chybí `CODEOWNERS` (HIGH) a `dependabot.yml` (MEDIUM).

**Deploy trigger (§8.2):** issue event **NEMŮŽE** spustit deploy (žádný `issues`/`pull_request_target`
trigger). To je pro intake klíčová vlastnost, kterou návrh zachovává jako invariant: `issue event →
nikdy nespouští deploy`.

## 7. Investigate & Prismatic findings (§9)

`/investigate` skill (`.claude/skills/investigate/SKILL.md`) je **prompt, ne kód** — tvrdý scope-gate
(Step 0, bez override) čte autorizaci z AGENTS.md; nový subjekt nesmí psát sám (deleguje na TTY
`authorize-entity`), scope extension si připsat smí (B-4). Zapisuje do `data/investigations/*.toml`
(adresář **neexistuje**, žádné schéma, nikdy nedoběhl). Nevolá síť ani externí tooling sám; končí u
reviewable PR (merge/push je věc člověka/ORCH). **INVESTIGATE_SKILL = DESIGN-ONLY.**

**Prismatic = NOT_FOUND:** 0 řádků integračního kódu (žádný adapter/CLI/MCP/API klient/manifest
contract). `scripts/osint/ares-lookup.mjs:12-18` dokumentuje **vědomou reimplementaci** ARES místo
závislosti na Prismaticu (forkability invariant). Adopce formálně odmítnuta v
`docs/adr/aiad-and-agent-tooling-import.md:4,75-79`. Handoff contract intake→investigace je v ADR
navržen jen jako design (§ADR 23).

## 8. Data-model findings (§10–11)

**Schemas:** 19 schémat, všechna JSON Schema **2020-12**, všechna `additionalProperties:false`
(i vnořené objekty). Kanonická vrstva má `schemaVersion` const 1 na každém záznamu; grafové exporty
`schema_version`; **7 z 9 plochých exportních schémat nemá verzi vůbec** (nález). Schema `$id` URI
(`https://vomaste.cz/schemas/...`) i `@context` se **nikde nepublikují** (`public/schemas` a
`public/context` neexistují), ačkoli 4 dokumenty tvrdí opak → externí JSON-LD konzument dostane 404.

**Entity matching (§11):** dedupe modul `scripts/osint/lib/entity-dedupe.mjs` je čistý, testovaný
(vč. negativních testů „Mráz vs Mrázová"), reusovatelný. **Ale:** `externalIds` (IČO) a
`alternateNames` mají schéma a **0 dat** — IČO žije jen jako volný text v markdown blocích, negrepovatelně.
To je největší strukturální mezera pro intake candidate matching. Matching dnes: příjmení-only
(celotoken, ne substring), bez křestního jména, bez skóre, O(n) sken. Reference integrity je silná:
R4 znemožňuje cross-dossier záměnu ID **konstrukčně**.

**URL/source tooling (§12):** jediné `fetch()` v repu míří na `ares.gov.cz` (2 místa, obě mimo build,
bez retry/rate-limit/timeout/User-Agent). **Žádná URL normalizace/kanonizace, žádný dead-link checker
nad `source.url`, žádné SSRF/private-network blokování, žádné source snapshots.** `mrtvy-zdroj.yml`
issue nemá automatický protějšek. Source families jsou plně implementované a testované (S1/S2/S4 +
`lint:source-outlets` outlet aliasing — ten ale **neběží v `BUILD_STEPS`**, jen v `check`, nález).

## 9. UI findings (§13)

**Zásadní mezera:** 4 hotové Issue Forms existují od 2026-07-30, ale **web na ně nikde nevede** —
všech 7 výskytů `issues/new` v templates/content míří na **generický** formulář. Mise VOMASTE.md
přesně specifikuje zamýšlené CTA „Navrhnout dossier", ale je neimplementované. Neexistuje reusable
button/link macro (3 nekonzistentní inline varianty tlačítek), ačkoli `lint:component-reuse` vynucuje
použití `macros/ui.html`. Navigace (source of truth `data/navigation.toml`) nemá položku pro
přispění. Globální patička `ui::site_footer` (`macros/ui.html:124-169`) je jediné site-wide místo
pro CTA. Web nemá analytics ani cookies (veřejný slib, `index.html:399-400`); OG/JSON-LD centralizované
v `base.html`; accessibility má doktrínu (Flowbite F1-F7) + Playwright axe testy (ty ale **nejsou
v build gate**).

## 10. Security findings (souhrn — plný threat model samostatně)

Viz [phase-01-threat-model.md](phase-01-threat-model.md). Nejzávažnější kombinovaný scénář dneška
(bez intake automatu): `blank_issues_enabled: true` + `navrh-dossieru.yml` bez varování/checkboxu =
nejpravděpodobnější cesta citlivého podnětu (obvinění + PII + neveřejný materiál) vede kanálem s
nulovou obranou a trvalou veřejnou publikací (GitHub issue rozešle e-maily watcherům okamžitě).
Automatizační rizika (prompt/shell injection, SSRF, privilege escalation) vzniknou až s Fázemi 4/6
a návrh je řeší fail-closed konstrukcí, minimálními permissions a determinismem parseru.

## 11. Gaps (blokující bezpečnou implementaci)

1. **Žádná URL/SSRF ochranná vrstva** — nutná před jakýmkoli automatickým preflightem (Fáze 4).
2. **`externalIds`/`alternateNames` bez dat** — candidate matching stojí na volném textu (Fáze 3).
3. **Governance vynucení má 3 CRITICAL díry** (B-1/B-2/B-3) — intake nesmí stavět na kotvě, která
   sama neplatí; doporučeno adresovat před Fází 8 (human authorization handoff).
4. **`blank_issues_enabled: true` + slabý návrhový formulář** — nutná oprava ve Fázi 5, nezávisle
   na automatizaci.
5. **Chybí CODEOWNERS** — nic nevynucuje, kdo schvaluje změny autorizačního logu.
6. **CI neběží na PR** — intake PR by se validoval až po merge.

## 12. Doporučení (bez provedení — Fáze 1 je audit)

MVP intake architektura: **issue-triggered workflow (Fáze 6) → deterministický parser (Fáze 2) →
report jako idempotentní issue komentář + krátkodobý artefakt**, permissions **jen `issues: write`
+ `contents: read`**, žádný zápis do repa, plná izolace od deploye. Autorizace zůstává výhradně
manuální přes existující `authorize-entity` + AGENTS.md log. Detailní fázový plán viz
[phase-01-implementation-plan.md](phase-01-implementation-plan.md), rozhodnutí a zdůvodnění v ADR.

## 13. Evidence index

- Governance: `AGENTS.md:418-466,461,695,834,1320`, `scripts/dossier/{authorize-entity,validate-authorization,verify-authorization-log-append-only,generate-authorization-candidates}.mjs`, `data/authorizations.toml`, `AUTHORIZATION.md`, `authorization.json`
- GitHub: `.github/ISSUE_TEMPLATE/{config,navrh-dossieru,oprava-faktu,mrtvy-zdroj,reakce-subjektu}.yml`, `.github/workflows/deploy.yml`, `.github/PULL_REQUEST_TEMPLATE.md`
- Investigate/Prismatic: `.claude/skills/{investigate,dossier-entry,bootstrap}/SKILL.md`, `docs/coop/PROTOCOL.md`, `scripts/coop/coop.sh`, `scripts/osint/{expand-entity,ares-lookup}.mjs`, `docs/adr/aiad-and-agent-tooling-import.md`
- Data model: `schemas/canonical/*.schema.json`, `schemas/*.schema.json`, `scripts/data/{validate-shape,validate-references,validate-semantics,validate-registry-table,check-generated}.mjs`, `scripts/osint/lib/entity-dedupe.mjs`, `docs/adr/json-first-canonical-data-model.md`, `docs/data-contract.md`
- Build/CI: `scripts/build/pipeline.mjs`, `.githooks/pre-commit`, `package.json`
- UI: `templates/macros/ui.html`, `templates/base.html`, `templates/index.html`, `data/navigation.toml`
