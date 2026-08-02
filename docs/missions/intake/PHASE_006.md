# Claude Code Prompt — Phase 6 of N

# GitHub Actions intake workflow, idempotentní report, labely a upozornění vlastníka

Pracuješ v repozitáři:

```text
~/dev/vomaste.cz
```

Toto je **Phase 6** implementace veřejného dossier-intake workflow.

Předchozí fáze měly dodat:

* **Phase 1:** audit repozitáře, ADR, threat model a fázový plán;
* **Phase 2:** intake schemas, parser, manifest, provenance a lokální report;
* **Phase 3:** entity matching, deduplikaci a deterministickou risk classification;
* **Phase 4:** bezpečný URL preflight a SSRF hardening;
* **Phase 5:** finální GitHub Issue Form, versioned form contract a offline end-to-end fixtures.

V této fázi implementuj první produkční GitHub orchestration vrstvu:

```text
veřejná GitHub issue
→ GitHub Actions event
→ bezpečně uložený event payload
→ lokální intake processor
→ manifest a report
→ idempotentní issue komentář
→ deterministické label transitions
→ upozornění vlastníka
→ workflow artifact
→ konec v AWAITING_AUTHORIZATION
```

Tato fáze **nesmí**:

* autorizovat subject;
* zapisovat do `AGENTS.md`;
* zapisovat do autorizačního registru;
* zapisovat do `data/dossiers/`;
* vytvářet entity;
* vytvářet claims;
* vytvářet branch;
* vytvářet pull request;
* commitovat;
* pushovat;
* mergovat;
* deployovat;
* spouštět investigation;
* volat Prismatic;
* používat externí AI.

---

# 0. Mise Phase 6

Implementuj GitHub Actions workflow, který reaguje na veřejné dossier-intake issues a bezpečně provede již existující lokální pipeline.

Cílový produkční tok:

```text
issues.opened
issues.edited
issues.reopened
issues.labeled
        ↓
ověření relevantního template/labelu
        ↓
uložení GitHub event payloadu do souboru
        ↓
omezené načtení a sanitizace eventu
        ↓
intake processor
        ↓
matching
        ↓
risk classification
        ↓
safe URL preflight
        ↓
validovaný manifest
        ↓
Markdown report
        ↓
upload artifactu
        ↓
create-or-update jediného bot komentáře
        ↓
synchronizace stavových labelů
        ↓
ping ownera, pokud je skutečně potřeba
        ↓
authorization_status=pending_owner
publication_status=blocked
```

Workflow končí v jednom z těchto stavů:

```text
triage
needs_information
possible_duplicate
security_review_required
preflight_complete
invalid
```

Nikdy v:

```text
authorized
publishable
published
merged
deployed
```

---

# 1. Nepřekročitelné invarianty

## 1.1 Žádný zápis do obsahu repozitáře

Workflow nesmí mít schopnost zapisovat do Git historie.

Zakázaná permissions:

```yaml
contents: write
pull-requests: write
deployments: write
pages: write
id-token: write
packages: write
actions: write
```

Pokud nějaká oficiální GitHub operace vyžaduje více práv, nejprve prokaž proč.

Výchozí oprávnění:

```yaml
permissions:
  contents: read
  issues: write
```

`actions: read` nebo jiné implicitní read permission použij pouze pokud je skutečně potřeba.

## 1.2 Issue event nesmí spustit deploy

Musí mechanicky platit:

```text
issue event
≠ build deployment
≠ branch creation
≠ pull request
≠ merge
```

Workflow nesmí:

* volat deployment workflow;
* emitovat deployment event;
* používat `workflow_dispatch` do deploy pipeline;
* měnit `master`;
* vytvářet tag;
* používat `repository_dispatch` bez explicitně bezpečného designu.

## 1.3 Issue obsah je nedůvěryhodný

Nikdy nepoužívej:

```yaml
run: node script.mjs "${{ github.event.issue.body }}"
```

Nikdy neinterpoluj do `run:`:

* issue title;
* issue body;
* author login;
* labels;
* URL;
* comment;
* repository name z eventu;
* user-controlled output.

GitHub expressions s uživatelským vstupem smí být použity pouze v bezpečných structured fields GitHub API callu, nikoli v shell scriptu.

## 1.4 Žádné secrets

Issue-triggered workflow nesmí dostat:

* externí API keys;
* Prismatic token;
* SSH key;
* deploy credentials;
* personal access token;
* cloud credentials;
* webhook secret;
* private store credentials.

Použij pouze standardní:

```text
GITHUB_TOKEN
```

s minimálními permissions.

## 1.5 Report není autorizace

Každý report musí obsahovat:

```text
Tento report není autorizace, redakční závěr ani publikovaný dossier.

Rozsah zatím nebyl autorizován.
Publikace zůstává blokována.
```

## 1.6 GitHub issue není anonymní

Report ani workflow komentář nesmí napsat:

* anonymní podání;
* chráněný zdroj;
* důvěrný podnět;
* whistleblower protected;
* bezpečné podání.

Naopak musí být uvedeno:

```text
Toto je veřejná GitHub issue.
```

---

# 2. Preflight

Než začneš:

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git diff --stat
git diff --cached --stat
```

Potom spusť:

```bash
npm ci
npm run intake:validate-form
npm run intake:e2e-fixture
npm run intake:fixture
npm run intake:preflight-fixture
npm run test:intake
npm run build
```

Zaznamenej:

```text
PHASE_05_BASELINE
FORM_VALIDATION
E2E_FIXTURE
INTAKE_TESTS
FULL_BUILD
```

Přečti zejména:

```text
reports/intake/phase-05-implementation-report.md
docs/intake/issue-form-contract.md
docs/intake/public-submission.md
docs/intake/security-boundary.md
.github/ISSUE_TEMPLATE/navrh-dossieru.yml
scripts/intake/**
schemas/intake*.json
```

Pokud Phase 5 není ověřená, neimplementuj workflow proti nestabilnímu formuláři.

---

# 3. Audit existujících workflow

Před přidáním nového workflow znovu projdi:

```text
.github/workflows/**
```

Vytvoř nebo aktualizuj:

```text
reports/intake/phase-06-workflow-audit.md
```

Pro každý workflow zapiš:

| Workflow | Trigger | Permissions | Secrets | Contents write | PR write | Deploy |
| -------- | ------- | ----------- | ------- | -------------: | -------: | -----: |

Ověř:

* zda existuje reusable workflow konvence;
* zda se Actions pinují na commit SHA nebo major tag;
* zda repo používá `concurrency`;
* zda repo používá `timeout-minutes`;
* zda jsou Node/npm verze centralizované;
* zda existují CI utility;
* zda existuje trusted bot-comment helper;
* zda labels spravuje repo nebo GitHub ručně.

Nevytvářej paralelní conventions.

---

# 4. Workflow soubor

Preferovaný název:

```text
.github/workflows/dossier-intake.yml
```

Přesný název přizpůsob repo conventions.

## 4.1 Název

```yaml
name: Public dossier intake
```

## 4.2 Trigger

Preferovaný trigger:

```yaml
on:
  issues:
    types:
      - opened
      - edited
      - reopened
      - labeled
      - unlabeled
      - closed
```

Zahrnutí `unlabeled` a `closed` zvaž podle state synchronization návrhu.

Minimální MVP může používat:

```yaml
opened
edited
reopened
labeled
```

Každý event musí být idempotentní.

## 4.3 Relevant issue gate

Workflow se musí spustit pouze pro odpovídající issue.

Preferované signály:

1. form version marker;
2. template-specific label;
3. title prefix pouze jako pomocný signál.

Nespoléhej pouze na label, protože uživatel nebo maintainer jej může změnit.

Nespoléhej pouze na title.

Použij lokální `detect-form` logiku.

## 4.4 Permissions

Výchozí:

```yaml
permissions:
  contents: read
  issues: write
```

Pokud upload artifact nepotřebuje explicitní permission, nic dalšího nepřidávej.

## 4.5 Timeout

Přidej:

```yaml
timeout-minutes: 10
```

nebo nižší podle měření Phase 4.

Workflow nesmí viset kvůli pomalému URL.

## 4.6 Concurrency

Použij issue-scoped concurrency:

```yaml
concurrency:
  group: dossier-intake-${{ github.repository }}-${{ github.event.issue.number }}
  cancel-in-progress: true
```

Ověř bezpečnost expression.

Issue number je integer metadata, ne raw body.

Cíl:

* editace issue zruší starší běh;
* nevzniknou dva soupeřící komentáře;
* poslední aktuální verze vyhraje.

---

# 5. Checkout a runtime

Použij oficiální Actions ve verzích odpovídajících repo conventions.

Preferovaný tok:

```yaml
- uses: actions/checkout@...
  with:
    persist-credentials: false

- uses: actions/setup-node@...
  with:
    node-version-file: ...
    cache: npm

- run: npm ci
```

## 5.1 Checkout

Použij repository default branch commit asociovaný s workflow runem.

Nikdy necheckoutuj ref z issue body.

`persist-credentials: false` snižuje riziko náhodného Git write.

## 5.2 Node version

Použij:

* `.nvmrc`;
* `.node-version`;
* `package.json engines`;
* nebo stávající workflow konvenci.

Nehardcoduj odlišnou verzi.

## 5.3 Dependencies

Použij:

```bash
npm ci
```

Ne:

```bash
npm install
npm update
npm audit fix
```

---

# 6. Event payload handling

GitHub poskytuje event payload v:

```text
$GITHUB_EVENT_PATH
```

To je jediný vstup do procesoru.

Workflow musí volat například:

```bash
node scripts/intake/process-github-event.mjs \
  --event "$GITHUB_EVENT_PATH" \
  --output-dir "$RUNNER_TEMP/vomaste-intake" \
  --repository-commit "$GITHUB_SHA" \
  --preflight
```

## 6.1 Zakázané

Ne:

```yaml
env:
  ISSUE_BODY: ${{ github.event.issue.body }}
```

Ne:

```yaml
run: echo "${{ github.event.issue.body }}" > issue.txt
```

Ne:

```yaml
run: node ... "${{ github.event.issue.title }}"
```

## 6.2 Event adapter

Pokud Phase 2 používá zmenšený event schema, vytvoř bezpečný adapter:

```text
scripts/intake/adapters/github-event.mjs
```

Adapter:

* načte raw GitHub payload;
* vybere pouze potřebná pole;
* validuje jejich typ;
* vytvoří versioned internal event;
* ignoruje nepotřebná metadata;
* nikdy nevykoná vstup jako instrukci.

## 6.3 Event actions

Podporuj explicitně:

```text
opened
edited
reopened
labeled
unlabeled
closed
```

Neznámá action:

```text
ignored_unsupported_action
```

nikoli crash.

---

# 7. Produkční URL preflight v Actions

Phase 4 umožnila explicitní `--preflight`.

V Actions jej použij pouze po potvrzení:

* timeoutů;
* concurrency limitu;
* max URL count;
* SSRF policy;
* pinned DNS/HTTP transport;
* žádných secrets.

## 7.1 URL limit

Pro workflow doporučeně:

```text
max_urls_attempted = 10
```

nebo Phase 4 limit.

Zbytek:

```text
not_attempted_limit
```

## 7.2 Celkový deadline

Preflight musí respektovat workflow-level deadline.

## 7.3 Failure semantics

Jedna nedostupná URL nesmí shodit celé intake processing.

Výsledek:

```text
preflight partial
```

Bezpečnostní blokace nebo interní error mohou změnit stav na:

```text
security_review_required
```

## 7.4 Build isolation

Produkční network preflight běží pouze v issue workflow.

`npm run build` zůstává offline.

---

# 8. Output structure

Workflow output directory:

```text
$RUNNER_TEMP/vomaste-intake/<intake-id>/
```

Obsah:

```text
manifest.json
report.md
processing-result.json
diagnostics.json
```

`diagnostics.json` nesmí obsahovat secrets ani celé response bodies.

## 8.1 No repository writes

Výstup nesmí být v working tree.

Po zpracování ověř:

```bash
git status --short
```

Workflow musí selhat, pokud procesor změnil tracked soubor.

Přidej explicitní gate:

```bash
test -z "$(git status --porcelain)"
```

Pozor na pre-existing generated changes po `npm ci` nebo jiných scripts. Workflow checkout má být čistý.

---

# 9. Workflow artifact

Uploadni artifact pro audit a troubleshooting.

Preferovaný název:

```text
dossier-intake-<issue-number>-<run-id>
```

Obsah:

* manifest;
* report;
* processing result;
* bezpečné diagnostics.

Neuploaduj:

* raw GitHub event payload;
* celé issue body duplicitně;
* response bodies;
* DNS internals nad nezbytnou míru;
* tokeny;
* environment dump;
* logs s credentials.

## 9.1 Retention

Použij omezenou retenci:

```yaml
retention-days: 14
```

nebo Phase 1 rozhodnutí.

## 9.2 Artifact i při failure

Použij:

```yaml
if: always()
```

pouze pokud artifacts existují a neobsahují raw citlivý vstup.

---

# 10. Idempotentní issue komentář

Workflow musí spravovat právě jeden komentář.

## 10.1 Stabilní marker

Report začíná markerem:

```html
<!-- vomaste-intake-report:v1 -->
```

Marker nesmí pocházet z uživatelského vstupu.

## 10.2 Create-or-update

Algoritmus:

1. načti issue comments;
2. najdi komentáře vytvořené aktuálním GitHub Actions botem;
3. najdi přesně marker;
4. pokud existuje jeden, aktualizuj jej;
5. pokud neexistuje, vytvoř jej;
6. pokud existuje více bot komentářů se stejným markerem:

   * aktualizuj nejstarší nebo nejnovější podle dokumentované policy;
   * ostatní nemaž automaticky bez jasného důvodu;
   * přidej diagnostiku `duplicate_bot_comments`.

## 10.3 Autor komentáře

Nevěř markeru v komentáři jiného uživatele.

Komentář musí splnit:

```text
author is trusted GitHub Actions bot
AND body contains exact root marker
```

## 10.4 Implementace

Preferuj:

* `actions/github-script`;
* nebo malý Node script používající GitHub REST přes `GITHUB_TOKEN`.

Nedělej `curl` s ručně sestaveným JSON.

## 10.5 Body limit

GitHub comment má velikostní limit.

Report renderer musí mít bezpečný maximum, například:

```text
50 KiB
```

Pokud je report větší:

* vytvoř zkrácený issue report;
* plný report zůstane v artifactu;
* comment odkáže na workflow run/artifact nepřímým GitHub kontextem;
* nikdy náhodně neusekni disclaimer.

---

# 11. Report body pro GitHub

Report musí začít:

```markdown
<!-- vomaste-intake-report:v1 -->

## Automatické předzpracování veřejného podnětu

> Tento report není autorizace, redakční závěr ani publikovaný dossier.
> Issue je veřejná. Rozsah zatím nebyl autorizován a publikace zůstává blokována.
```

## 11.1 Status block

```markdown
| Oblast | Stav |
|---|---|
| Intake | Předzpracováno |
| Autorizace | Čeká na vlastníka |
| Publikace | Blokována |
```

## 11.2 Sources disclaimer

```text
Technická dostupnost URL neznamená důvěryhodnost, nezávislost ani potvrzení obsahu.
```

## 11.3 Matching disclaimer

```text
Možná shoda entity není potvrzení identity.
```

## 11.4 Risk disclaimer

```text
Rizikový příznak není skutkový ani právní závěr.
```

## 11.5 Next step

Podle stavu:

### Triage

```text
Podnět čeká na ruční posouzení vlastníkem projektu.
```

### Needs information

```text
Podnět potřebuje doplnit veřejné zdroje nebo přesnější vymezení.
```

### Possible duplicate

```text
Podnět může souviset s existujícím záznamem. Automat nic neslučuje ani nezavírá.
```

### Security review

```text
Automatické zpracování bylo omezeno. Podnět vyžaduje ruční bezpečnostní kontrolu.
```

---

# 12. Owner notification

Vlastník má být upozorněn pouze tehdy, když je potřeba jeho rozhodnutí.

## 12.1 Canonical owner config

Nevkládej `@korczis` do pěti scripts.

Najdi existující config.

Pokud neexistuje, vytvoř minimální config, například:

```text
data/project.toml
```

nebo:

```text
data/maintainers.toml
```

Pouze pokud to odpovídá repo architektuře.

Příklad:

```toml
[intake]
review_owner_github = "korczis"
```

Nepřidávej osobní e-mail.

## 12.2 Ping policy

Pingni ownera když:

```text
intake_status = triage
authorization_status = pending_owner
```

nebo:

```text
security_review_required
```

Nepřidávej ping při každé editaci issue, pokud už owner ping existuje.

## 12.3 Anti-spam

Preferuj ping pouze v bot komentáři.

Při update komentáře nemusí GitHub znovu notifikovat spolehlivě, proto navrhni dokumentovanou policy:

* první validní processing: ping;
* změna do security review: ping;
* běžná editace: bez nového ping;
* návrat z needs-information do triage: ping.

Pokud implementace neumí spolehlivě sledovat předchozí stav, zvol jednodušší bezpečnou politiku a dokumentuj omezení.

## 12.4 User mentions

Všechny mentions z issue textu neutralizuj.

Jediný aktivní mention může být canonical owner.

---

# 13. Label model

Použij minimální, stavově čistý label set.

Preferované labely:

```text
intake:triage
intake:invalid
intake:needs-information
intake:preflight-complete
intake:possible-duplicate
intake:security-review
authorization:pending-owner
publication:blocked
```

## 13.1 Labels versus state

Labely jsou projekce workflow state.

Nejsou source of truth.

Source of truth je aktuální manifest vytvořený z issue.

## 13.2 Mutually exclusive intake labels

Z těchto smí být aktivní právě jeden:

```text
intake:triage
intake:invalid
intake:needs-information
intake:possible-duplicate
intake:security-review
```

`intake:preflight-complete` může být:

* samostatný informational label;
* nebo nahrazen reportem.

Vyber jednu konzistentní policy.

## 13.3 Always-on labels

Pro validní neautorizované intake:

```text
authorization:pending-owner
publication:blocked
```

## 13.4 Zakázané labely

Nevytvářej:

```text
approved
verified
confirmed
authorized
publish
corroborated
guilty
```

## 13.5 Synchronizace

Při každém běhu:

1. načti aktuální labely;
2. zachovej unrelated labely;
3. odeber pouze workflow-owned state labely, které už neodpovídají;
4. přidej požadované;
5. nezasahuj do jiných triage labels.

---

# 14. Label existence

GitHub REST nedokáže přidat neexistující label.

Vyber jednu z možností:

## Varianta A: labels spravované ručně

Workflow při chybějícím labelu:

* neselže celé zpracování;
* přidá diagnostics;
* report zůstane vytvořen;
* status je `partial`.

## Varianta B: repository-managed label bootstrap

Samostatný maintainer workflow nebo script.

Neumožňuj issue-triggered workflow vytvářet nové labely bez potřeby.

Preferuj ruční bootstrap nebo samostatný trusted script.

Přidej dokumentaci:

```text
npm run intake:labels:check
```

Případně:

```text
npm run intake:labels:plan
```

V této fázi můžeš vytvořit plán, ne nutně labels přes API.

---

# 15. Failure handling

Workflow nesmí při chybě zanechat ticho.

## 15.1 Failure classes

Rozliš:

```text
irrelevant_issue
invalid_form
unsupported_form_version
submission_validation_failed
processor_failed
preflight_partial
preflight_security_block
report_publish_failed
label_sync_failed
artifact_upload_failed
internal_workflow_error
```

## 15.2 Invalid form

Pokud issue vypadá jako intake, ale je invalidní:

* vytvoř/update bot komentář;
* nastav `intake:invalid`;
* nastav `publication:blocked`;
* podle modelu nepřidávej `authorization:pending-owner`, dokud není podání validní;
* vysvětli, co chybí;
* nepublikuj stack trace.

## 15.3 Processor internal error

Komentář:

```text
Automatické předzpracování se nezdařilo kvůli interní chybě.
Podnět nebyl autorizován ani publikován.
```

Přidej workflow run ID.

Nezobrazuj interní cestu, stack nebo secrets.

## 15.4 Comment failure

Pokud nelze vytvořit komentář:

* workflow failne;
* artifact zůstane;
* labels se nepokoušejí předstírat úspěch, pokud status report nebyl zveřejněn;
* diagnostics jasně uvedou chybu.

---

# 16. Idempotence

Musí platit:

## 16.1 Stejný event rerun

* stejné intake ID;
* stejný report kromě explicitně volatile run metadata, které raději nepatří do reportu;
* žádný nový komentář;
* žádné duplicate labely;
* nový artifact je povolený, protože patří runu.

## 16.2 Edited issue

* stejné intake ID;
* nový input hash;
* aktualizovaný report;
* stavové labely se synchronizují;
* předchozí report se přepíše;
* publikace zůstává blocked.

## 16.3 Reopened issue

* znovu zpracuj aktuální body;
* nepřebírej starý manifest bez validace;
* update stejného komentáře.

## 16.4 Duplicate delivery

Concurrency a create-or-update musí zabránit duplicitním komentářům.

## 16.5 Out-of-order runs

`cancel-in-progress` pomáhá, ale starší běh může doběhnout těsně před zrušením.

Přidej guard:

* před zápisem komentáře znovu načti issue `updated_at`;
* porovnej s eventem;
* pokud event není aktuální, nepublikuj starší report;
* označ run jako `stale_event_skipped`.

---

# 17. Security review behavior

Pokud risk classifier vrátí:

```text
security_review_required
```

workflow musí omezit veřejný report.

## 17.1 Reduced report

Neopakuj citlivý text.

Zobraz pouze:

* intake ID;
* obecný status;
* kódy risk flags;
* redigované evidence;
* výzvu k ruční kontrole.

## 17.2 Preflight

Pokud input obsahuje claim o neveřejném materiálu nebo credentials:

* zvaž přeskočení všech URL preflightů;
* nebo preflightuj pouze URL z explicitního source field, pokud jsou bezpečné.

Policy musí být deterministická.

## 17.3 No raw artifact expansion

Artifact může obsahovat manifest s raw issue textem pouze pokud Phase 1 artifact strategy to výslovně dovolila.

Pokud risk obsahuje možné osobní údaje, preferuj:

* redacted artifact;
* nebo neuploadovat raw manifest;
* pouze sanitized manifest a diagnostics.

Rozhodnutí aktualizuj v ADR.

---

# 18. Comment publishing helper

Preferovaná struktura:

```text
scripts/intake/github/
  constants.mjs
  find-managed-comment.mjs
  upsert-report-comment.mjs
  sync-labels.mjs
  determine-notification.mjs
  publish-intake-result.mjs
```

Tyto moduly musí být testovatelné s mock GitHub clientem.

## 18.1 GitHub API adapter

Interface například:

```js
getIssue()
listComments()
createComment()
updateComment()
listLabels()
addLabels()
removeLabel()
```

Produkční adapter používá Octokit z `actions/github-script` nebo dostupný balík.

Test adapter je in-memory fake.

## 18.2 Core logic

Core state computation nesmí být uvnitř YAML.

YAML orchestrace má být tenká.

---

# 19. Workflow YAML thinness

Workflow nemá obsahovat stovky řádků shellové logiky.

Preferuj:

```yaml
- name: Process intake
  run: npm run intake:github-event -- ...
```

A:

```yaml
- name: Publish result
  uses: actions/github-script@...
  with:
    script: |
      await require(...)
```

Pokud ESM import v `github-script` není pohodlný, použij samostatný Node entrypoint s `GITHUB_TOKEN`.

Nepřepisuj intake business logic do YAML.

---

# 20. GitHub Token handling

Pokud samostatný Node script používá REST API:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Token:

* nikdy nevypisuj;
* nikdy nevkládej do argumentu CLI;
* nikdy jej neukládej do artifactu;
* nikdy jej nepředávej child processu, který jej nepotřebuje;
* odděl processing step bez tokenu a publishing step s tokenem.

Preferovaný design:

```text
Step A: processor
  token není v env

Step B: publisher
  token je dostupný
  čte pouze sanitized processing result a report
```

To je důležitá privilege separation.

---

# 21. Workflow step isolation

Doporučené kroky:

1. checkout;
2. setup Node;
3. npm ci;
4. validate repository clean;
5. process event bez GitHub tokenu;
6. validate outputs;
7. ensure no tracked changes;
8. upload safe artifact;
9. publish comment s tokenem;
10. sync labels s tokenem;
11. final summary.

Processor step nesmí mít token v environment.

---

# 22. GitHub Step Summary

Přidej technické shrnutí do:

```text
$GITHUB_STEP_SUMMARY
```

Obsah:

* issue number;
* intake ID;
* processing status;
* authorization pending;
* publication blocked;
* count URL;
* count matches;
* count risk flags;
* comment action: created/updated/skipped;
* labels action;
* artifact name.

Nezobrazuj raw submission.

---

# 23. Actions artifact sanitization

Před uploadem spusť validator:

```text
scripts/intake/validate-artifact-safety.mjs
```

Kontroluje:

* žádný GitHub token;
* žádné `Authorization:` headers;
* žádné URL credentials;
* žádné raw response bodies;
* žádný environment dump;
* žádný private key pattern;
* žádný bearer token pattern;
* žádné neočekávané soubory.

False positives řeš cíleně.

---

# 24. Workflow static security tests

Přidej testy, které parsují YAML a ověří:

* trigger je pouze `issues`;
* žádný `pull_request_target`;
* žádný `issue_comment`, pokud není nutný;
* `contents` je pouze `read`;
* `issues` je `write`;
* žádné `pull-requests: write`;
* žádné `pages: write`;
* žádné `deployments: write`;
* žádné `id-token: write`;
* checkout má `persist-credentials: false`;
* workflow má timeout;
* workflow má concurrency;
* issue body není interpolováno v `run`;
* title není interpolováno v `run`;
* žádné secrets kromě `GITHUB_TOKEN`;
* žádný deploy action;
* žádný git commit;
* žádný git push;
* žádný `gh pr create`;
* žádný `repository_dispatch`.

Preferovaná cesta:

```text
scripts/ci/validate-intake-workflow.mjs
```

---

# 25. Unit testy GitHub orchestrace

Použij mock GitHub API.

Testuj:

## Comments

* žádný existující komentář → create;
* jeden trusted managed comment → update;
* marker v user komentáři → ignorovat;
* dva trusted managed comments → deterministic handling;
* report přes limit → condensed report;
* update failure;
* create failure.

## Labels

* žádné labels;
* správné labels;
* starý intake state label;
* unrelated labels;
* missing repository label;
* API failure;
* partial success.

## Notifications

* první validní triage;
* opakovaný rerun;
* přechod needs-information → triage;
* přechod triage → security review;
* edited issue bez změny stavu;
* closed issue.

## Stale events

* issue updated after event timestamp;
* event je aktuální;
* out-of-order run.

---

# 26. Workflow-level testy

GitHub Actions není snadné plně spouštět lokálně bez emulátoru.

Použij kombinaci:

* YAML static validation;
* local event fixture;
* fake GitHub API;
* processor E2E;
* publishing integration test.

Pokud repo používá `act`, můžeš přidat dokumentovaný smoke test, ale nedělej z něj povinnou dependency bez důvodu.

---

# 27. Label bootstrap dokumentace

Vytvoř:

```text
docs/intake/github-labels.md
```

Obsah:

| Label | Význam | Vlastník | Mutually exclusive |
| ----- | ------ | -------- | -----------------: |

Přidej ruční příkazy přes `gh` pouze jako maintainer dokumentaci, ne jako automatickou součást workflow.

Například:

```bash
gh label create "intake:triage" \
  --color "..." \
  --description "..."
```

Barvy nejsou význam stavu. Text je význam.

Nevytvářej labels během testování proti produkčnímu repozitáři.

---

# 28. Workflow observability

## 28.1 Stable logs

Každý log řádek může mít prefix:

```text
[intake]
[preflight]
[publish]
[labels]
```

## 28.2 Correlation fields

Použij:

```text
issue_number
intake_id
run_id
input_hash
```

Nevkládej raw body.

## 28.3 Error summary

Na konci vždy vypiš:

```text
PROCESSING_STATUS
COMMENT_STATUS
LABEL_STATUS
ARTIFACT_STATUS
```

## 28.4 Metrics

V této fázi nevytvářej externí telemetry.

Lze počítat pouze do Step Summary:

* durations;
* URL count;
* match count;
* risk count.

---

# 29. Closed issue behavior

Rozhodni explicitně.

Preferovaná politika:

* při `closed` nemaž report;
* přidej nebo aktualizuj status na closed;
* odeber aktivní intake workflow labels podle potřeby;
* zachovej `publication:blocked`;
* neinterpretuj closed jako rejected nebo authorized;
* pokud maintainer issue uzavřel, důvod zůstává lidský.

Nevytvářej automatický `authorization:rejected`, pokud neexistuje explicitní rozhodnutí.

---

# 30. Invalid edit behavior

Uživatel může po validním podání editovat issue do invalidního stavu.

Nový run musí:

* aktualizovat komentář na invalid;
* aktualizovat label;
* zachovat publication blocked;
* nepoužívat starý validní manifest jako aktuální;
* ownera upozornit pouze podle policy.

---

# 31. Reprocessing marker

Do reportu můžeš přidat technické metadata:

```text
Zpracováno z aktuální revize issue: <updated_at>
Input hash: <short hash>
```

Nevkládej volatile run timestamp, pokud zbytečně rozbíjí idempotentní body.

Pokud report obsahuje čas kontroly URL, je změna reportu očekávaná.

Pro create-or-update to nevadí.

---

# 32. Workflow artifact naming

Název musí být bezpečný a bez user inputu.

Použij pouze:

```text
issue number
run ID
run attempt
```

Například:

```text
dossier-intake-issue-123-run-456789
```

Ne title ani subject.

---

# 33. Security review of GitHub-provided fields

I GitHub fields mohou obsahovat překvapení.

Validuj:

* `repository.full_name` odpovídá očekávanému repu;
* issue number je integer;
* issue URL host je `github.com`;
* event name je `issues`;
* action je podporovaná;
* event repository ID odpovídá očekávání, pokud config existuje.

Workflow nesmí být přenositelný do forku se stejnými write actions bez vědomého rozhodnutí.

## 33.1 Fork behavior

`issues` workflow ve forku pracuje v tom forku.

To může být přijatelné.

Ale owner notification config musí být repo-specific.

Dokumentuj.

---

# 34. Abuse controls

Phase 6 není plný anti-abuse systém, ale musí mít základní limity.

## 34.1 Issue edits

Concurrency ruší staré runs.

GitHub Actions může být stále zahlcen opakovanými editacemi.

Zvaž:

* job condition;
* minimální relevance gate před `npm ci`;
* neprovádět preflight na eventu `labeled`, pokud body nebylo změněno;
* cache dependencies;
* URL count limit.

## 34.2 Repeated invalid issues

Workflow pouze reportuje.

Nezavírá issues automaticky.

## 34.3 Mass submissions

Neimplementuj user reputation score.

Dokumentuj budoucí potřebu:

* rate monitoring;
* maintainer triage;
* abuse labels;
* repository moderation.

## 34.4 External URL targeting

Preflight je technická sonda, ne load tester.

Nízká concurrency a jeden request na URL.

---

# 35. Dokumentace

Aktualizuj nebo vytvoř:

```text
docs/intake/github-actions-workflow.md
docs/intake/github-labels.md
docs/intake/operations.md
docs/intake/security-boundary.md
reports/intake/phase-06-implementation-report.md
```

## 35.1 Workflow dokumentace

Popiš:

* triggers;
* permissions;
* steps;
* token isolation;
* outputs;
* idempotence;
* comment marker;
* label model;
* owner ping;
* failure behavior;
* stale event behavior;
* closed issue behavior.

## 35.2 Operations

Runbook:

### Workflow failed before report

Co kontrolovat.

### Report comment missing

Jak najít artifact.

### Label missing

Jak label vytvořit.

### Duplicate bot comment

Jak bezpečně opravit.

### Security review

Jak ručně zkontrolovat issue bez dalšího kopírování citlivého textu.

### Rerun

Kdy rerun workflow a kdy upravit issue.

## 35.3 ADR

Aktualizuj decision log:

```text
Phase 6 implemented
workflow permissions
artifact strategy
comment policy
label projection
notification policy
known limitations
```

---

# 36. Package scripts

Přidej nebo rozšiř:

```json
{
  "intake:github-event": "...",
  "intake:publish-fixture": "...",
  "intake:validate-workflow": "...",
  "test:intake:github": "..."
}
```

`test:intake` musí zahrnout nové testy.

## 36.1 Publish fixture

`npm run intake:publish-fixture` používá fake GitHub API.

Musí demonstrovat:

* create comment;
* update stejného komentáře;
* label sync;
* owner notification decision;
* žádnou síť;
* žádný GitHub token.

---

# 37. Workflow code ownership

Zvaž rozšíření `CODEOWNERS`, pokud existuje.

Citlivé cesty:

```text
.github/workflows/dossier-intake.yml
scripts/intake/github/**
scripts/intake/preflight/**
schemas/intake*.json
.github/ISSUE_TEMPLATE/navrh-dossieru.yml
```

Nevytvářej CODEOWNERS, pokud repo governance jej nepoužívá, bez ADR rozhodnutí.

Dokumentuj doporučení pro branch protection.

---

# 38. Branch protection recommendations

Phase 6 může zdokumentovat ruční GitHub nastavení:

* workflow změny vyžadují review;
* `master` protected;
* Actions permissions omezené;
* GitHub Actions nesmí create/approve PR;
* required build;
* CODEOWNERS review pro workflows;
* fork pull-request approvals.

Nic z toho nepředstírej jako verzovaně vynucené, pokud skutečně není.

---

# 39. Co Phase 6 neimplementuje

Explicitně neimplementuj:

* contents write;
* commit;
* branch;
* pull request;
* auto-merge;
* deploy;
* authorization;
* owner approval button;
* slash command authorization;
* issue reaction authorization;
* GitHub approval jako authorization log;
* Prismatic;
* investigation;
* source family verification;
* claim generation;
* dossier generation;
* secure whistleblower channel;
* external storage;
* private artifacts;
* Slack/e-mail notification.

---

# 40. Akceptační kritéria

Phase 6 je hotová pouze tehdy, když:

1. Phase 5 baseline projde.
2. Existuje issue-triggered workflow.
3. Workflow používá pouze podporované issue actions.
4. Workflow má `contents: read`.
5. Workflow má `issues: write`.
6. Workflow nemá `contents: write`.
7. Workflow nemá PR write.
8. Workflow nemá deployment write.
9. Workflow nemá Pages write.
10. Workflow nemá OIDC write.
11. Workflow má timeout.
12. Workflow má issue-scoped concurrency.
13. Checkout má `persist-credentials: false`.
14. Runtime verze odpovídá repu.
15. Používá se `npm ci`.
16. Issue body není interpolováno do shellu.
17. Issue title není interpolováno do shellu.
18. Event se načítá z `GITHUB_EVENT_PATH`.
19. Raw event se neuploaduje.
20. Processor step nemá GitHub token.
21. Publishing step má pouze GitHub token.
22. Token se nevypisuje.
23. Token není CLI argument.
24. Workflow zapisuje pouze comment a labels.
25. Workflow nemění tracked files.
26. Existuje clean-tree gate.
27. Výstupní artifact je sanitizovaný.
28. Artifact má omezenou retenci.
29. Artifact neobsahuje raw response bodies.
30. Existuje jeden managed comment marker.
31. Komentář je create-or-update.
32. User-spoofed marker je ignorován.
33. Duplicate bot comments jsou deterministicky řešeny.
34. Report má limit velikosti.
35. Velký report má condensed variantu.
36. Report uvádí veřejnost issue.
37. Report uvádí pending authorization.
38. Report uvádí blocked publication.
39. Report uvádí, že nejde o redakční závěr.
40. Report uvádí, že HTTP dostupnost není ověření.
41. Matching není prezentován jako identita.
42. Risk flag není prezentován jako vina.
43. Owner config je kanonický.
44. Owner není hardcoded na více místech.
45. Owner ping má anti-spam policy.
46. User mentions jsou neutralizovány.
47. Existuje minimální label model.
48. Intake state labels jsou mutually exclusive.
49. `authorization:pending-owner` je projekce stavu.
50. `publication:blocked` je vždy zachována.
51. Unrelated labels jsou zachovány.
52. Chybějící label nezničí celý processing bez diagnostiky.
53. Invalid issue dostane bezpečný report.
54. Internal error nevypíše stack do issue.
55. Edited issue aktualizuje stejný komentář.
56. Edited issue nemění intake ID.
57. Edited issue mění input hash.
58. Stale event nepřepíše novější report.
59. Reopened issue se znovu validuje.
60. Closed issue není automaticky rejected.
61. Security-review report je redukovaný.
62. Security-review artifact je sanitizovaný.
63. Workflow static validator existuje.
64. Validator zakazuje `pull_request_target`.
65. Validator zakazuje deploy actions.
66. Validator zakazuje git push.
67. Validator zakazuje issue-body shell interpolation.
68. Existují mock GitHub API testy.
69. Existují comment create/update testy.
70. Existují label sync testy.
71. Existují stale-event testy.
72. Existují owner-notification testy.
73. Existuje publish fixture.
74. Build nepoužívá veřejnou síť.
75. Testy nepoužívají GitHub API.
76. Autorizační soubory nebyly změněny.
77. Produkční dossier data nebyla změněna.
78. Workflow nevytvořil PR.
79. Workflow nemůže deployovat.
80. `npm run intake:validate-workflow` projde.
81. `npm run intake:publish-fixture` projde.
82. `npm run intake:e2e-fixture` projde.
83. `npm run test:intake` projde.
84. `npm run build` projde.
85. `git diff --check` projde.
86. Dokumentace odpovídá implementaci.
87. Operations runbook existuje.
88. Phase 7 contract je explicitní.
89. Nevznikl commit bez explicitního pokynu.

---

# 41. Doporučené pořadí implementace

## Step 1

Ověř Phase 5 baseline.

## Step 2

Audituj workflow conventions a permissions.

## Step 3

Definuj GitHub event adapter.

## Step 4

Implementuj workflow processing entrypoint.

## Step 5

Implementuj sanitized artifact validator.

## Step 6

Implementuj GitHub API adapter contract.

## Step 7

Implementuj managed comment lookup.

## Step 8

Implementuj create-or-update komentář.

## Step 9

Implementuj report condensation.

## Step 10

Implementuj label projection.

## Step 11

Implementuj label synchronizaci.

## Step 12

Implementuj owner notification policy.

## Step 13

Implementuj stale-event guard.

## Step 14

Implementuj closed/reopened behavior.

## Step 15

Vytvoř workflow YAML s minimálními permissions.

## Step 16

Přidej concurrency a timeout.

## Step 17

Odděl processor step bez tokenu.

## Step 18

Přidej publishing step s tokenem.

## Step 19

Přidej artifact upload.

## Step 20

Přidej Step Summary.

## Step 21

Přidej static workflow validator.

## Step 22

Přidej fake GitHub API test suite.

## Step 23

Přidej publish fixture.

## Step 24

Aktualizuj dokumentaci a runbook.

## Step 25

Aktualizuj ADR.

## Step 26

Spusť kompletní gates.

---

# 42. Phase 7 contract

Na konci definuj přesný kontrakt pro:

```text
Phase 7 — webová CTA, landing vysvětlení a contribution UX
```

Phase 7 dostane:

* funkční Issue Form;
* produkční GitHub intake workflow;
* canonical template URL;
* veřejný safety wording;
* status model;
* žádnou autorizaci ani dossier generation.

Phase 7 musí implementovat:

* CTA na landing page;
* CTA na dossier indexu;
* contribution page;
* public-intake vysvětlení;
* warning před odchodem na GitHub;
* external-link semantics;
* mobile-first UI;
* accessibility;
* data-driven URL;
* tracking bez osobních dat;
* žádný secure-whistleblower claim;
* žádný hardcoded duplicate text;
* E2E link validation.

Neimplementuj Phase 7 nyní.

---

# 43. Průběžný report

Aktualizuj:

```text
reports/intake/phase-06-implementation-report.md
```

Obsah:

* base commit;
* Phase 5 baseline;
* workflow audit;
* permissions decision;
* event actions;
* token isolation;
* comment marker;
* label policy;
* owner notification;
* stale-event strategy;
* artifact strategy;
* security review behavior;
* test matrix;
* workflow validation;
* known limitations;
* Phase 7 contract.

---

# 44. Závěrečný report

Na konci vypiš:

```text
PHASE=06
NAME=GITHUB_ACTIONS_INTAKE_WORKFLOW
STATUS=<VERIFIED|PARTIAL|BLOCKED>

REPOSITORY=<absolute-path>
BRANCH=<branch>
BASE_COMMIT=<sha>
FINAL_COMMIT=<sha-or-UNCHANGED>
WORKTREE_WAS_CLEAN=<true|false>

PHASE_05_BASELINE=<PASS|FAIL|PARTIAL>
WORKFLOW=<path>
WORKFLOW_TRIGGER_COUNT=<number>
WORKFLOW_PERMISSION_COUNT=<number>
COMMENT_MARKER=<marker>
MANAGED_LABEL_COUNT=<number>
GITHUB_TEST_COUNT=<number>

CONTENTS_WRITE=false
PULL_REQUEST_WRITE=false
DEPLOYMENT_WRITE=false
PAGES_WRITE=false
OIDC_WRITE=false
EXTERNAL_SECRETS_USED=false
PROCESSOR_RECEIVED_GITHUB_TOKEN=false

AUTHORIZATION_CHANGED=false
PRODUCTION_DATA_CHANGED=false
BRANCH_CREATED=false
PULL_REQUEST_CREATED=false
DEPLOY_TRIGGERED=false
COMMIT_CREATED=false
PUSH_PERFORMED=false

WORKFLOW_VALIDATION=<PASS|FAIL|NOT_RUN>
PUBLISH_FIXTURE=<PASS|FAIL|NOT_RUN>
E2E_FIXTURE=<PASS|FAIL|NOT_RUN>
INTAKE_TESTS=<PASS|FAIL|NOT_RUN>
FINAL_BUILD=<PASS|FAIL|NOT_RUN>

RECOMMENDED_NEXT_PHASE=07
NEXT_PHASE_NAME=WEB_CTA_LANDING_AND_CONTRIBUTION_UX
```

Potom:

## Implemented

## Workflow architecture

## Permissions

## Token isolation

## Comment idempotence

## Label state projection

## Owner notification

## Failure behavior

## Security guarantees

## Test matrix

## Commands run

## Files changed

## Deviations

## Known limitations

## Phase 7 contract

---

# 45. Finální validace

Spusť minimálně:

```bash
npm run intake:validate-workflow
npm run intake:publish-fixture
npm run intake:e2e-fixture
npm run intake:validate-form
npm run intake:fixture
npm run intake:preflight-fixture
npm run test:intake
npm run build
git diff --check
git status --short
git diff --stat
```

Ověř explicitně:

```bash
git diff -- AGENTS.md
git diff -- data/authorizations.toml
git diff -- data/dossiers
```

Očekávání:

```text
žádná změna
```

Zkontroluj workflow:

```bash
grep -R "contents: write" .github/workflows/dossier-intake.yml
grep -R "pull_request_target" .github/workflows/dossier-intake.yml
grep -R "git push" .github/workflows/dossier-intake.yml
grep -R "github.event.issue.body" .github/workflows/dossier-intake.yml
```

Očekávání:

```text
žádný nebezpečný nález
```

Nespoléhej pouze na grep. Použij YAML validator.

---

# 46. Pracovní styl

GitHub Actions YAML není „jen konfigurace“.

Je to privilegovaný distribuovaný program běžící na základě vstupu z internetu.

Proto:

* nedávej mu write práva „pro budoucnost“;
* nedávej token procesoru, který ho nepotřebuje;
* nedělej business logiku v shellu;
* nepoužívej issue body jako příkaz;
* nevytvářej nový komentář při každém kýchnutí uživatele;
* neinterpretuj label jako autorizaci;
* nepouštěj deployment z issue eventu;
* nevěř markeru napsanému cizím uživatelem.

Výsledkem má být úzký, předvídatelný automat:

```text
veřejný vstup
→ omezené předzpracování
→ bezpečný report
→ stavové labely
→ lidské rozhodnutí
```

Nic víc.

Začni nyní Phase 6. Neimplementuj Phase 7.
