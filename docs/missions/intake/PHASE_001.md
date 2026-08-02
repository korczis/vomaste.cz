# Claude Code Prompt — Phase 1 of N

# Forenzní audit a závazný návrh veřejného dossier-intake workflow

Pracuješ v repozitáři:

```text
~/dev/vomaste.cz
```

Toto je **Phase 1** implementace veřejného intake workflow pro návrh nového dossieru, entity, tématu nebo propojení.

V této fázi **neimplementuj produkční intake pipeline**.

Nezaváděj ještě:

* nový GitHub Actions workflow;
* produkční parser issue formuláře;
* nové intake JSON Schema;
* automatickou tvorbu manifestů;
* automatickou kontrolu URL;
* nové CTA na veřejném webu;
* změny autorizačního nástroje;
* automatické spouštění `/investigate`;
* tvorbu skutečného dossieru;
* nové entity, claims, cases, sources, gaps nebo relations;
* skutečnou autorizaci jakéhokoliv subjektu;
* commit ani push, pokud k tomu nedostaneš explicitní aktuální pokyn.

Cílem této fáze je vytvořit **repo-grounded, evidence-backed a implementačně závazný návrh**, který přesně stanoví, co už existuje, co lze znovu použít, co chybí, kde jsou bezpečnostní hranice a jak budou následující fáze rozděleny.

Neprojektuj systém z paměti ani z předchozího promptu. Všechny závěry odvozuj ze skutečného obsahu současného repozitáře.

---

# 0. Mise

Navrhujeme tento cílový tok:

```text
veřejný uživatel
→ klikne na „Navrhnout dossier“
→ otevře veřejný GitHub Issue Form
→ zadá i poměrně nestrukturovaný podnět
→ automat provede bezpečné, omezené předzpracování
→ vytvoří strukturovaný návrh a auditní report
→ upozorní vlastníka
→ vlastník ručně autorizuje přesný rozsah
→ až po autorizaci lze spustit investigation tooling
→ vznikne draft pull request
→ vlastník provede publikační kontrolu
→ merge
→ existující build a deploy
```

Základní kontrakt:

```text
Kdokoliv může podat podnět.
Systém jej může strukturovat a technicky předběžně prověřit.
Pouze vlastník může autorizovat rozsah.
Automat nesmí sám publikovat nový dossier.
Publikace vždy vyžaduje další lidské schválení.
```

Toto není crowdsourcované obviňování.

Toto není anonymní whistleblower kanál.

Toto není automatický generátor veřejných tvrzení o lidech.

Je to veřejný vstup do řízeného, auditovatelného a human-in-the-loop procesu.

---

# 1. Nepřekročitelné invarianty

Tyto body považuj za nadřazené pohodlí, rychlosti i případným existujícím zkratkám.

## 1.1 Rozsah pokrytí

Výchozí stav každého nového subjektu nebo tématu je:

```text
NEAUTORIZOVÁNO
```

Nový předmět, osoba, organizace nebo nová konkrétní kauza nesmí být veřejně zpracována, dokud vlastník projektu nevytvoří explicitní, datovaný a auditovatelný autorizační záznam podle současných pravidel repozitáře.

Samotný podnět:

* není autorizace;
* není claim;
* není source verification;
* není zjištění;
* není kauza;
* není povolení ke zveřejnění;
* není podklad pro automatické rozšíření scope.

Platformní nebo technická změna nikdy sama nerozšiřuje obsahový scope.

## 1.2 Autorizační log

Existující autorizační záznamy:

* neupravuj;
* nemaž;
* nepřepisuj;
* nepřeskládávej;
* „nečisti“;
* nepřeváděj na novou strukturu;
* nepovažuj za obyčejnou dokumentaci.

Jsou append-only auditním záznamem.

V této fázi do autorizačního logu nic nepřidávej.

## 1.3 Human-in-the-loop

Automat nikdy nesmí:

* autorizovat subject;
* autorizovat kauzu;
* autorizovat scope;
* simulovat potvrzení vlastníka;
* změnit `context` entitu na autorizovaný subject;
* nastavit publikační stav na povolený;
* mergovat obsah;
* deployovat nový dossier;
* vydávat své hodnocení za redakční závěr.

## 1.4 GitHub není důvěrný kanál

GitHub Issue Form je:

* veřejný;
* dohledatelný;
* dlouhodobě archivovaný;
* navázaný na GitHub účet;
* nevhodný pro neveřejné dokumenty;
* nevhodný pro identitu oznamovatele;
* nevhodný pro citlivé osobní údaje;
* nevhodný pro tajné či potenciálně nelegálně získané materiály.

V návrhu nesmí být veřejný GitHub intake označen jako:

* anonymní;
* důvěrný;
* chráněný;
* bezpečný whistleblower kanál;
* secure drop;
* privátní podání.

Přesný navrhovaný termín:

```text
Veřejný podnět založený na veřejných informacích a veřejných zdrojích
```

Skutečný důvěrný whistleblower intake je samostatný budoucí projekt a musí zůstat mimo scope této fáze.

## 1.5 Vstup je nedůvěryhodný

Veškerý obsah issue považuj za nepřátelský vstup:

* title;
* body;
* URL;
* Markdown;
* HTML;
* komentáře;
* GitHub username;
* labely;
* přílohy;
* text instrukcí;
* prompt injection;
* shell metacharacters;
* Unicode triky;
* extrémní délku;
* odkazy na interní síť;
* redirecty;
* tvrzení o tom, co má agent udělat.

Návrh musí fail-closed.

---

# 2. Operační pravidla před auditem

Než začneš analyzovat architekturu:

## 2.1 Pracovní strom

Spusť a zaznamenej:

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git diff --stat
git diff --cached --stat
git log -10 --oneline --decorate
```

Pokud je strom dirty:

* nic nemaž;
* nic neobnovuj;
* nepoužívej `git reset`;
* nepoužívej `git restore`;
* nepoužívej `git clean`;
* nepřepínej bezdůvodně branch;
* přesně zapiš, které změny existovaly před zahájením tvé práce;
* odliš je od vlastních změn.

Pokud repo používá worktree nebo co-op protokol, zjisti to z dokumentace a dodrž jej.

## 2.2 Repo-native bootstrap

Zjisti, zda existuje:

* `/bootstrap` skill;
* `.claude/commands/bootstrap.md`;
* `.claude/skills/bootstrap/`;
* `scripts/coop/coop.sh`;
* worktree tooling;
* session registry;
* repo injection mechanismus;
* povinný preflight.

Pokud existuje a je bezpečný, spusť jej podle dokumentace.

Nevymýšlej vlastní paralelní bootstrap.

## 2.3 Instalace

Neprováděj destruktivní aktualizaci dependencies.

Použij existující lockfile a standardní příkaz projektu, typicky:

```bash
npm ci
```

Neprováděj:

```bash
npm update
npm audit fix
npm audit fix --force
```

Dependency audit můžeš zaznamenat, ale nesmíš jej v této fázi řešit mimo scope.

---

# 3. Povinná četba

Přečti celé soubory, ne pouze nadpisy nebo úryvky.

Minimálně:

```text
AGENTS.md
CLAUDE.md
PROJECT_INSTRUCTIONS.md
README.md
CONTRIBUTING.md
SECURITY.md
package.json
config.toml
```

Pokud existují:

```text
docs/constitution/OPEN_INTELLIGENCE_COMMONS.md
docs/coop/PROTOCOL.md
docs/architecture/**
docs/adr/**
docs/governance/**
docs/security/**
docs/contributing/**
docs/methodology/**
```

Dále rekurzivně zmapuj:

```text
.github/ISSUE_TEMPLATE/**
.github/workflows/**
.github/CODEOWNERS
.github/pull_request_template*
.claude/commands/**
.claude/skills/**
scripts/dossier/**
scripts/osint/**
scripts/ci/**
scripts/build/**
scripts/coop/**
schemas/**
data/**
content/**
templates/**
static/**
tests/**
test/**
```

Nepředpokládej, že uvedené cesty existují.

Pokud neexistují, zaznamenej to.

---

# 4. Povinný baseline build

Zjisti skutečnou produkční sekvenci z `package.json`, workflow a dokumentace.

Potom spusť minimálně:

```bash
npm run build
```

Pokud existují levnější povinné gates, spusť je předtím.

Například pouze pokud skutečně existují:

```bash
npm test
npm run lint
npm run validate
npm run check
npm run precommit
```

Nevymýšlej příkazy.

## 4.1 Výsledek baseline

Zaznamenej:

* přesný příkaz;
* exit code;
* dobu běhu;
* počet testů;
* warnings;
* první relevantní chybu;
* zda chyba existovala před tvými změnami;
* zda build něco generuje nebo mění ve working tree;
* zda je build deterministický při opakovaném běhu.

Pokud baseline build selže:

1. Neopravuj automaticky vše, co vidíš.
2. Urči, zda chyba blokuje audit.
3. Zapiš ji jako:

   * `BASELINE_BLOCKER`,
   * `BASELINE_DEFECT`,
   * `NON_BLOCKING_WARNING`.
4. Pokračuj v auditu všude, kde je to možné.
5. Neprohlašuj baseline za prošlý.

---

# 5. Inventář současného systému

Vytvoř strojově ověřitelný a lidsky čitelný inventář.

## 5.1 Repo snapshot

Zaznamenej minimálně:

* commit SHA;
* branch;
* Node.js verzi;
* npm verzi;
* Zola verzi;
* OS/platformu;
* počet tracked files;
* počet souborů v `data/`;
* počet souborů v `content/`;
* počet schemas;
* počet GitHub workflows;
* počet issue templates;
* počet Claude skills;
* počet dossier scripts;
* počet validačních scripts;
* počet test files.

Používej skripty nebo standardní shell nástroje tak, aby se počty daly zopakovat.

## 5.2 Datové domény

Zjisti skutečné umístění a zdroje pravdy pro:

* dossiers;
* entities;
* claims;
* sources;
* source families;
* cases;
* gaps;
* relations;
* authorizations;
* navigation;
* generated content;
* JSON-LD;
* audit history;
* provenance;
* build manifests.

Pro každou doménu vytvoř tabulku:

| Doména | Kanonický zdroj | Generovaný výstup | Schema | Validátor | Renderer | Test |
| ------ | --------------- | ----------------- | ------ | --------- | -------- | ---- |

Nepředpokládej, že `content/**/*.md` je stále kanonický zdroj. Ověř skutečný stav.

## 5.3 Generované versus ručně spravované soubory

Identifikuj:

* soubory generované při buildu;
* soubory generované explicitním příkazem;
* soubory, které se nesmí editovat ručně;
* soubory, jejichž status je nejasný;
* dvojí zdroje pravdy;
* stale generované výstupy;
* ručně duplikovaná data.

U každého důležitého adresáře určete:

```text
canonical
generated
derived
cache
fixture
documentation
unknown
```

Jakýkoliv `unknown` musí být v reportu.

---

# 6. Audit governance a autorizace

Tato sekce je kritická.

## 6.1 Mapování autorizačního modelu

Zjisti a dolož:

* kde je kanonický autorizační log;
* zda existuje paralelní strojově čitelný autorizační registr;
* jak se ověřuje jejich konzistence;
* zda je autorizační log skutečně append-only mechanicky vynucen;
* jak se přidává nový subject;
* jak se rozšiřuje scope existujícího subjectu;
* jak se odlišuje subject a context entity;
* jak se značí neautorizovaná entita;
* jak se značí autorizovaný dossier;
* zda lze mít autorizovaný subject bez dossieru;
* zda lze mít dossier bez subject authorization;
* jak se řeší aggregate dossier;
* jak se řeší third parties;
* jak se řeší research candidate;
* jak se řeší revokace nebo oprava chyby bez mazání historie.

## 6.2 Autorizační nástroje

Prostuduj všechny relevantní skripty, zejména pokud existují:

```text
scripts/dossier/authorize-entity.mjs
scripts/dossier/scaffold-entity-dossier.mjs
scripts/dossier/validate-authorization.mjs
scripts/dossier/verify-authorization-log-append-only.mjs
scripts/dossier/generate-authorization-candidates.mjs
```

Pro každý vytvoř kartu:

```text
Název:
Účel:
Inputs:
Outputs:
Side effects:
TTY requirement:
CI allowed:
Files written:
Validation:
Failure mode:
Idempotence:
Security assumptions:
Known bypass possibility:
Relevant tests:
```

## 6.3 Anti-bypass audit

Explicitně hledej:

* `--yes`;
* `--force`;
* env bypass;
* CI bypass;
* test-only bypass dostupný v production path;
* možnost přepsat autorizační status ručně bez gate;
* workflow s write permissions;
* skript, který přímo mění subject state;
* generátor, který obchází append-only log;
* nekontrolovaný front matter field;
* implicitní autorizaci přes existenci souboru;
* implicitní autorizaci přes label;
* implicitní autorizaci přes merge.

Každý nález klasifikuj:

```text
SAFE
EXPECTED_MANUAL_PATH
WEAKLY_ENFORCED
BYPASSABLE
CRITICAL
UNKNOWN
```

Nic neopravuj v této fázi. Navrhni remediation pro pozdější fázi.

## 6.4 Závazný invariant pro budoucí intake

Navrhni přesné mechanické pravidlo:

```text
intake artifact
≠ authorization record
≠ dossier
≠ claim
≠ publication approval
```

Urči, kde bude toto pravidlo v budoucnu vynuceno:

* schema;
* validator;
* workflow permissions;
* file path boundaries;
* state machine;
* tests;
* CODEOWNERS;
* branch protection;
* runtime checks.

---

# 7. Audit současného GitHub intake

## 7.1 Issue templates

Pro každý soubor v `.github/ISSUE_TEMPLATE/` zmapuj:

* název;
* účel;
* labels;
* title prefix;
* required fields;
* textarea headings;
* checkboxes;
* disclaimer;
* target users;
* zda může nést unstructured input;
* zda lze deterministicky parsovat;
* zda obsahuje bezpečnostní varování;
* zda tvrdí nebo implikuje anonymitu;
* zda rozlišuje nový subject versus nové téma;
* zda odlišuje veřejné zdroje od neveřejných materiálů.

Pokud existuje `navrh-dossieru.yml` nebo podobný formulář, proveď field-by-field audit.

Výstup:

| Pole | Povinné | Strojově parsovatelné | Riziko | Zachovat | Změnit | Důvod |
| ---- | ------: | --------------------: | ------ | -------- | ------ | ----- |

## 7.2 Issue config

Zkontroluj:

```text
.github/ISSUE_TEMPLATE/config.yml
```

Zjisti:

* zda jsou blank issues povoleny;
* zda existují contact links;
* zda by citlivý podnět mohl omylem skončit ve veřejné issue;
* zda lze vhodně přidat bezpečnostní varování bez slibu secure intake.

## 7.3 Labels

Zjisti, zda jsou labely deklarovány v repu nebo pouze v GitHub nastavení.

Zmapuj současné label names používané ve workflows a dokumentaci.

Navrhni minimální stavovou sadu, ale v této fázi ji nevytvářej.

Preferovaný koncept k posouzení:

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

Ověř, zda nekoliduje se současnými konvencemi.

---

# 8. Audit GitHub Actions

Prostuduj každý workflow v `.github/workflows/`.

Pro každý vytvoř tabulku:

| Workflow | Trigger | Permissions | Writes repo | Creates PR | Deploys | Uses secrets | Untrusted input |
| -------- | ------- | ----------- | ----------: | ---------: | ------: | -----------: | --------------: |

## 8.1 Bezpečnostní audit

Hledej:

* `pull_request_target`;
* `issues` trigger;
* `issue_comment` trigger;
* write permissions;
* broad `contents: write`;
* `actions/checkout` s nedůvěryhodným ref;
* shell interpolation `${{ github.event.issue.body }}`;
* interpolaci title nebo username;
* nepinned third-party actions;
* secrets v issue-triggered workflows;
* artifacts s citlivým obsahem;
* příliš dlouhou retention;
* automatický commit;
* automatický merge;
* deploy navázaný na nekontrolovaný event;
* `workflow_run` privilege escalation;
* reusable workflow s implicitními permissions;
* GitHub Script bez escaping;
* komentáře, které se nekontrolovaně duplikují;
* absence concurrency;
* absence timeout;
* absence rate limiting;
* absence idempotence.

Každý nález klasifikuj:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

Uveď konkrétní soubor a řádky.

## 8.2 Deployment

Zjisti přesně:

* co spouští deploy;
* z jaké branche;
* po jakých gates;
* zda lze deploy spustit mimo merge do `master`;
* zda build znovu validuje dossier integrity;
* zda deploy používá OIDC;
* zda používá secrets;
* zda intake workflow může být od deploymentu bezpečně izolován.

V návrhu musí platit:

```text
issue event
→ nikdy přímo nespouští deploy
```

---

# 9. Audit `/investigate` a Prismatic handoff

## 9.1 Existing skill

Najdi všechny varianty:

```text
.claude/skills/investigate/**
.claude/commands/investigate*
scripts/**/investigate*
```

Přečti celý workflow.

Zjisti:

* očekávaný vstup;
* jak identifikuje subject;
* jak kontroluje authorization;
* jak vytváří branch;
* co generuje;
* zda zapisuje do `data/`;
* zda zapisuje do `content/`;
* zda volá externí tooling;
* zda používá `~/dev/prismatic-platform`;
* zda vyžaduje síť;
* zda otevírá zdroje;
* zda odlišuje search snippets a otevřené zdroje;
* zda pracuje se source families;
* zda umí vytvořit draft PR;
* zda commitne;
* zda pushne;
* zda merguje;
* jak reportuje partial failure;
* zda je deterministický;
* zda lze navázat provenance na issue.

## 9.2 Prismatic boundary

Zjisti pouze ze skutečné dokumentace a kódu:

* zda existuje stabilní Prismatic CLI;
* zda existuje MCP;
* zda existuje API;
* zda existuje manifest contract;
* zda jde pouze o lidský koncept bez funkčního adapteru;
* zda je integrace lokální a neveřejná;
* zda lze bezpečně mockovat;
* jaké credentials by vyžadovala;
* zda by její použití v GitHub Actions bylo vůbec přípustné.

Nefabuluj integraci.

Pokud funkční rozhraní neexistuje, závěr musí být:

```text
Prismatic integration: DESIGN-ONLY / NOT IMPLEMENTED
```

## 9.3 Budoucí handoff contract

Navrhni canonical contract mezi intake a investigation, například:

```json
{
  "schema_version": "1.0.0",
  "intake_id": "INTAKE-...",
  "issue_reference": {},
  "authorization_reference": {},
  "allowed_subjects": [],
  "allowed_topics": [],
  "excluded_topics": [],
  "seed_sources": [],
  "risk_flags": [],
  "publication_mode": "draft_pr_only"
}
```

V Phase 1 jej pouze navrhni.

Nevytvářej produkční schema.

---

# 10. Audit datových modelů a schemas

Prostuduj všechny schemas a jejich validátory.

## 10.1 Schema registry

Vytvoř tabulku:

| Schema | Version | Používáno kým | Validátor | Fixtures | Backward compatibility |
| ------ | ------- | ------------- | --------- | -------- | ---------------------- |

Zjisti:

* zda existuje centrální schema registry;
* zda schemas používají JSON Schema Draft 7, 2019-09, 2020-12 nebo vlastní formát;
* zda schema IDs mají stabilní URI;
* zda se validují `additionalProperties`;
* zda jsou data versioned;
* jak se provádí migrace;
* zda existuje canonical serialization;
* zda existuje hashování;
* zda se validuje provenance.

## 10.2 Návrh intake modelu

Navrhni pouze v ADR:

* raw submission layer;
* normalized layer;
* candidate matching layer;
* source preflight layer;
* risk flags;
* proposed scope;
* workflow state;
* provenance;
* generator metadata;
* hashes;
* publication block.

Vyřeš explicitně:

### Raw versus normalized

Původní text uživatele nesmí být přepsán tak, že změní význam.

Normalizovaný výstup nesmí být prezentován jako citace uživatele.

### User assertion versus system observation

Například:

```json
{
  "kind": "user_assertion",
  "text": "..."
}
```

versus:

```json
{
  "kind": "system_match",
  "entity_id": "...",
  "reason": "normalized_name_match"
}
```

### Machine draft versus human decision

Například:

```json
{
  "proposed_authorization_scope": {
    "decision_class": "machine_draft_only",
    "authorization_effect": "none"
  }
}
```

### Publication block

Každý intake artifact musí mít fail-closed stav:

```json
{
  "publication_status": "blocked",
  "authorization_status": "pending_owner"
}
```

---

# 11. Audit entity matching a deduplikace

Zjisti, co už repo používá pro:

* entity IDs;
* slugy;
* aliases;
* IČO;
* data box;
* company registration identifiers;
* person name normalization;
* diakritiku;
* academic titles;
* birth dates;
* organization suffixes;
* cross-dossier entity references;
* relationship graph IDs.

## 11.1 Existující dedupe tooling

Najdi:

* duplicate validators;
* orphan detectors;
* ID collision checks;
* alias indexes;
* search indexes;
* Meilisearch exports;
* graph indexes;
* generated registries.

Zmapuj, co lze znovu použít pro intake candidate matching.

## 11.2 Matching policy proposal

Navrhni vysvětlitelné pořadí:

1. exact canonical ID;
2. exact official identifier;
3. exact normalized name;
4. exact alias;
5. constrained similarity;
6. unresolved multiple candidates.

Každý match musí mít:

```text
score
reasons
matched_fields
confidence_class
manual_review_required
```

Nepoužívej fuzzy matching jako magickou odpověď.

Navrhni thresholdy pouze jako návrh. Pokud repo nemá data pro kalibraci, označ je jako `UNVALIDATED`.

---

# 12. Audit URL a source tooling

Najdi všechny existující části, které:

* otevírají URL;
* validují URL;
* načítají metadata;
* stahují zdroje;
* ukládají source snapshots;
* počítají source families;
* kontrolují dostupnost;
* kontrolují robots/licence;
* deduplikují URL;
* normalizují query parametry;
* odstraňují tracking parametry;
* blokují private network.

## 12.1 SSRF threat model

Navrhni úplný threat model pro budoucí preflight:

* localhost;
* `127.0.0.0/8`;
* RFC1918;
* carrier-grade NAT;
* link-local;
* multicast;
* reserved ranges;
* IPv6 loopback;
* IPv6 unique local;
* IPv4-mapped IPv6;
* DNS rebinding;
* redirect na private IP;
* redirect chains;
* IDN homographs;
* credentials in URL;
* non-HTTP protocols;
* oversized response;
* compressed bomb;
* slow response;
* infinite stream;
* attachment download;
* executable content;
* cloud metadata endpoints;
* localhost hostname variants;
* decimal/hex/octal IP representations.

V Phase 1 neimplementuj HTTP client.

Navrhni bezpečné limity:

* timeout;
* maximum redirectů;
* maximum bytes;
* povolené methods;
* user-agent;
* content types;
* DNS/IP check před každým requestem;
* DNS/IP check po každém redirectu;
* žádné cookies;
* žádná autentizace;
* žádný JavaScript;
* žádné ukládání celého body.

## 12.2 Editorial limitation

Do návrhu explicitně vlož:

```text
HTTP 200 ≠ důvěryhodný zdroj
reachable ≠ nezávislý zdroj
metadata extracted ≠ článek přečten
URL submitted ≠ tvrzení ověřeno
```

---

# 13. Audit UI a informační architektury

Zjisti:

* kde je landing page;
* kde je dossier index;
* kde je contribution sekce;
* zda CTA vycházejí z `data/navigation.toml`;
* zda existuje reusable button/link macro;
* zda se navigace generuje;
* jak se řeší external links;
* jak se řeší mobile bottom nav;
* jak se řeší desktop sidebar;
* jak se řeší accessibility;
* jak se řeší analytics;
* jak se řeší outbound GitHub URL;
* jak se generují OG metadata.

## 13.1 CTA placement proposal

Navrhni přesná umístění:

* landing page;
* dossier index;
* entity index;
* contribution page;
* footer;
* empty-state registry.

Pro každé:

```text
umístění
uživatelský záměr
primární text
sekundární text
riziko záměny
mobilní chování
desktop chování
source of truth
component reuse
```

## 13.2 Landing copy proposal

Navrhni stručný obsah, ale v Phase 1 jej ještě neimplementuj.

Musí vysvětlit:

* kdokoliv může navrhnout;
* podnět je veřejný;
* podnět není automatické zveřejnění;
* scope schvaluje člověk;
* výsledek prochází další lidskou kontrolou;
* citlivý materiál se neposílá přes GitHub.

---

# 14. Threat model celého workflow

Vytvoř systematický threat model.

Použij minimálně tyto kategorie:

## 14.1 Abuse of people

* falešné obvinění;
* harassment;
* brigading;
* reputační útok;
* koordinované zakládání issues;
* doxxing;
* zveřejnění citlivých osobních údajů;
* pojmenování neanonymizované třetí osoby;
* vydírání;
* zneužití platformy ve sporu;
* zahlcení jednoho subjectu;
* SEO poisoning.

## 14.2 Abuse of automation

* prompt injection;
* shell injection;
* path traversal;
* Markdown injection;
* log injection;
* GitHub mention abuse;
* label manipulation;
* issue edit race;
* replay;
* duplicate processing;
* workflow privilege escalation;
* artifact poisoning;
* malicious URL;
* SSRF;
* dependency compromise;
* action supply-chain risk.

## 14.3 Editorial failure

* issue text změněný na claim;
* machine summary prezentované jako fact;
* jedna source family počítaná vícekrát;
* snippet vydávaný za otevřený zdroj;
* procesní výsledek vydávaný za věcný závěr;
* autorizace subjectu vydávaná za autorizaci všech kauz;
* context entity povýšená bez záznamu;
* chybějící uncertainty state;
* AI confidence vydávaná za source corroboration.

## 14.4 Governance failure

* autorizační bypass;
* auto-merge;
* auto-deploy;
* neauditovatelná změna scope;
* editace append-only historie;
* jeden obecný `approved` status;
* rozpor mezi machine registry a AGENTS logem;
* role owner hardcoded na více místech;
* nejasná odpovědnost za rejection.

## 14.5 Privacy and security failure

* zveřejnění identity oznamovatele;
* EXIF nebo document metadata;
* neveřejná příloha;
* token v URL;
* osobní e-mail;
* telefon;
* adresa;
* zdravotní údaje;
* rodinné údaje;
* secrets v artifacts;
* dlouhá artifact retention.

Pro každou hrozbu vytvoř:

| Threat | Entry point | Impact | Likelihood | Existing control | Missing control | Phase |
| ------ | ----------- | ------ | ---------- | ---------------- | --------------- | ----- |

---

# 15. Stavový automat

Navrhni explicitní stavový automat, který nebude používat jeden vágní status.

Minimálně tři osy:

## 15.1 Intake status

```text
submitted
triage
invalid
needs_information
possible_duplicate
security_review_required
preflight_complete
closed
```

## 15.2 Authorization status

```text
not_requested
pending_owner
authorized
rejected
superseded
```

Nepoužívej `revoked` bez ověření, jak projekt append-only eviduje změnu rozhodnutí.

## 15.3 Publication status

```text
blocked
research
draft
editorial_review
publishable
published
rejected
```

## 15.4 Povolené přechody

Vytvoř tabulku:

| From | Event | Actor | Guard | To | Side effect |
| ---- | ----- | ----- | ----- | -- | ----------- |

Klíčové pravidlo:

```text
Žádná machine actor transition nesmí skončit v authorization_status=authorized.
```

A:

```text
Žádná issue-triggered transition nesmí skončit v publication_status=published.
```

## 15.5 Idempotence

Popiš chování pro:

* issue opened;
* issue edited;
* issue reopened;
* label added;
* workflow rerun;
* duplicate webhook;
* out-of-order event;
* deleted comment;
* changed bot marker;
* closed issue;
* authorization po delší době;
* změněný scope po prvotní autorizaci.

---

# 16. Návrh artifact strategy

Porovnej minimálně čtyři varianty:

## Varianta A: pouze issue komentář

Výhody, nevýhody, auditability, machine readability.

## Varianta B: GitHub Actions artifact

Výhody, nevýhody, retention, dostupnost, provenance.

## Varianta C: automatický commit do `data/intake/`

Výhody, nevýhody, Git permanence, reputační riziko, write permissions.

## Varianta D: externí neveřejný store

Výhody, nevýhody, forkability, secrets, závislost na infrastruktuře.

Vyber výchozí MVP variantu podle skutečné architektury repa.

Preferuj řešení s nejmenšími write permissions a nejmenším reputačním dopadem.

Pokud doporučíš kombinaci, přesně popiš:

```text
co je veřejné
co je ephemeral
co je kanonické
co je auditní
co je pouze cache
```

---

# 17. Návrh GitHub permissions

Navrhni nejmenší potřebná oprávnění pro budoucí workflow.

Pro každou budoucí operaci uveď potřebné permission:

| Operace | Permission | Read/Write | Nutné v MVP |
| ------- | ---------- | ---------- | ----------: |

Například:

* checkout;
* read issue;
* comment issue;
* add label;
* upload artifact;
* read repository;
* create branch;
* create pull request.

Intake MVP by ideálně neměl mít:

```yaml
contents: write
pull-requests: write
deployments: write
pages: write
id-token: write
```

Pokud některé potřebuje, musí být v ADR konkrétně zdůvodněné.

---

# 18. Návrh fází celé implementace

Na základě skutečného repa navrhni další fáze.

Výchozí rámec, který smíš změnit pouze s odůvodněním:

## Phase 1

Forenzní audit a závazný návrh.

## Phase 2

Intake schema, fixtures, parser a stavový model bez GitHub Actions.

## Phase 3

Entity matching, deduplikace a risk classification.

## Phase 4

Bezpečný URL preflight a SSRF hardening.

## Phase 5

GitHub Issue Form a lokální end-to-end fixture.

## Phase 6

GitHub Actions intake workflow, idempotentní report a labels.

## Phase 7

Webová CTA, landing vysvětlení a contribution UX.

## Phase 8

Human authorization handoff.

## Phase 9

Authorized investigation adapter a Prismatic contract.

## Phase 10

Draft PR orchestrace, review gates a provenance.

## Phase 11

Operational hardening, abuse controls, observability a runbooks.

## Phase 12

Pilot na syntetickém subjectu, ne na nové reálné osobě.

Pro každou fázi uveď:

* cíl;
* inputs;
* outputs;
* soubory;
* testy;
* acceptance criteria;
* dependencies;
* security boundary;
* rollback;
* explicitní non-goals;
* co vyžaduje lidský zásah;
* co nesmí být automatizováno.

---

# 19. ADR

Vytvoř nebo aktualizuj jeden hlavní návrhový dokument.

Preferovaná cesta:

```text
docs/adr/ADR-public-dossier-intake.md
```

Pokud repo používá jinou ADR konvenci, dodrž ji.

ADR musí obsahovat minimálně:

1. Název.
2. Stav: `PROPOSED`.
3. Datum.
4. Autoři/decision owner podle repo conventions.
5. Kontext.
6. Problém.
7. Cíle.
8. Non-goals.
9. Governance constraints.
10. Editorial constraints.
11. Privacy boundary.
12. Threat model.
13. Existing-system inventory.
14. Candidate architectures.
15. Rozhodnutí.
16. Důvody.
17. Data flow.
18. State machine.
19. Artifact strategy.
20. Permissions model.
21. Authorization boundary.
22. Publication boundary.
23. Prismatic boundary.
24. Schema proposal.
25. Parser proposal.
26. Matching proposal.
27. URL preflight proposal.
28. Workflow proposal.
29. UI proposal.
30. Testing strategy.
31. Rollout.
32. Rollback.
33. Observability.
34. Operational ownership.
35. Abuse handling.
36. Open questions.
37. Phase plan.
38. Acceptance criteria.
39. Known limitations.
40. Decision log.

Každý významný závěr musí uvést repo evidence:

```text
soubor
sekce nebo řádek
pozorované chování
dopad na návrh
```

---

# 20. Další povinné výstupy

Kromě ADR vytvoř:

## 20.1 Audit report

```text
reports/intake/phase-01-repository-audit.md
```

Obsah:

* executive summary;
* snapshot;
* baseline build;
* governance findings;
* authorization findings;
* GitHub findings;
* data-model findings;
* investigate findings;
* UI findings;
* security findings;
* gaps;
* doporučení;
* evidence index.

## 20.2 Architecture inventory

```text
reports/intake/phase-01-architecture-inventory.md
```

Obsahuje tabulky zdrojů pravdy, generátorů, validátorů, rendererů a testů.

## 20.3 Threat model

```text
reports/intake/phase-01-threat-model.md
```

## 20.4 Phase plan

```text
reports/intake/phase-01-implementation-plan.md
```

Každá další fáze musí být detailní a samostatně spustitelná.

## 20.5 Machine-readable findings

Vytvoř pouze tehdy, pokud repo přijímá reportová JSON data:

```text
reports/intake/phase-01-findings.json
```

Musí mít schema nebo být jasně označeno jako report artifact, nikoli nový produkční zdroj pravdy.

Nevytvářej nový datový standard jen kvůli jednomu reportu.

---

# 21. Dokumentační změny v Phase 1

Můžeš provést pouze minimální dokumentační změny nutné k zaznamenání návrhu.

Neupravuj zatím marketingový text webu.

Neupravuj veřejnou contribution flow.

Neupravuj existující autorizační záznamy.

Pokud je třeba přidat odkaz na ADR do dokumentačního indexu, udělej pouze tuto malou navigační změnu.

---

# 22. Testování Phase 1

Tato fáze je převážně analytická, ale stále musí být ověřená.

## 22.1 Markdown a links

Spusť existující dokumentační validátory.

Ověř:

* broken internal links;
* neexistující cesty;
* neplatné anchors;
* duplicate headings, pokud je projekt kontroluje;
* formatting podle repo conventions.

## 22.2 Build

Po vytvoření reportů znovu spusť plný:

```bash
npm run build
```

Build musí projít, nebo musí být výsledek poctivě označen jako neprošlý.

## 22.3 Working tree

Na konci spusť:

```bash
git status --short
git diff --stat
git diff --check
```

Zkontroluj:

* žádné generované smetí;
* žádné náhodné lockfile změny;
* žádné změny v autorizačním logu;
* žádná produkční entity data;
* žádný skutečný dossier;
* žádný workflow s write permissions;
* žádný commit.

---

# 23. Zakázané změny v Phase 1

Nesmíš:

* vytvořit `.github/workflows/dossier-intake.yml`;
* měnit produkční issue form;
* přidat nové produkční schema;
* měnit package dependencies;
* měnit autorizační tool;
* zavádět CI bypass;
* přidat `--yes`;
* přidat `--force`;
* přidat auto-merge;
* měnit deployment;
* vytvořit skutečný intake issue;
* kontaktovat externí osoby;
* vytvářet GitHub issue přes `gh`;
* vytvářet PR;
* pushovat;
* commitovat bez explicitního pokynu;
* přidat skutečnou osobu;
* rozšířit scope dossieru;
* spustit rešerši nové reálné osoby;
* ukládat citlivá data;
* odesílat repo obsah externím AI službám;
* editovat `AGENTS.md` autorizační část;
* předstírat Prismatic integraci, pokud ji repo nedokládá.

---

# 24. Acceptance criteria Phase 1

Phase 1 je hotová pouze tehdy, když:

1. Byl přečten skutečný governance a technický kontext.
2. Byl zaznamenán commit SHA a stav working tree.
3. Byl spuštěn baseline build.
4. Byl spuštěn finální build.
5. Je zmapován skutečný zdroj pravdy všech dossierových domén.
6. Je zmapován autorizační tok.
7. Je zmapován anti-bypass model.
8. Je zmapována hranice context entity versus subject.
9. Jsou zanalyzovány všechny issue templates.
10. Jsou zanalyzovány všechny GitHub workflows.
11. Jsou zaznamenány workflow permissions.
12. Je zanalyzován deploy trigger.
13. Je zanalyzován `/investigate` skill.
14. Je poctivě popsána skutečná dostupnost Prismatic integrace.
15. Je zmapována současná deduplikace.
16. Je zmapováno současné URL/source tooling.
17. Existuje úplný threat model.
18. Existuje explicitní state machine.
19. Existuje porovnání artifact strategií.
20. Je vybrána doporučená MVP architektura.
21. Existuje minimální permissions model.
22. Existuje návrh schema boundaries.
23. Existuje návrh raw versus normalized dat.
24. Existuje návrh user assertion versus system observation.
25. Existuje návrh machine draft versus human decision.
26. Je explicitně blokována publikace před autorizací.
27. Je explicitně blokována automatická autorizace.
28. GitHub není označen jako anonymní kanál.
29. Je navržen bezpečný handoff k lidské autorizaci.
30. Je navržen handoff k investigation tooling.
31. Jsou navrženy další fáze s dependencies.
32. Každá fáze má acceptance criteria.
33. Každá fáze má rollback.
34. Každá fáze má non-goals.
35. V této fázi nebyl implementován produkční workflow.
36. Nevznikl žádný skutečný dossier.
37. Nevznikla žádná skutečná autorizace.
38. Nebyla změněna žádná existující authorization history.
39. Nebyl vytvořen commit ani push bez pokynu.
40. Závěrečný report poctivě rozlišuje `VERIFIED`, `PARTIAL`, `NOT VERIFIED` a `BLOCKED`.

---

# 25. Požadovaný závěrečný terminálový report

Na konci vypiš přesně strukturovaný report:

```text
PHASE=01
NAME=PUBLIC_DOSSIER_INTAKE_AUDIT_AND_ARCHITECTURE
STATUS=<VERIFIED|PARTIAL|BLOCKED>

REPOSITORY=<absolute-path>
BRANCH=<branch>
BASE_COMMIT=<sha>
WORKTREE_WAS_CLEAN=<true|false>

BASELINE_BUILD=<PASS|FAIL|NOT_RUN>
FINAL_BUILD=<PASS|FAIL|NOT_RUN>

AUTHORIZATION_MODEL=<VERIFIED|PARTIAL|BLOCKED>
ISSUE_TEMPLATES_AUDITED=<count>
WORKFLOWS_AUDITED=<count>
SCHEMAS_AUDITED=<count>
INVESTIGATE_SKILL=<VERIFIED|PARTIAL|NOT_FOUND>
PRISMATIC_INTEGRATION=<IMPLEMENTED|PARTIAL|DESIGN_ONLY|NOT_FOUND>

PRODUCTION_WORKFLOW_CREATED=false
AUTHORIZATION_CHANGED=false
REAL_SUBJECT_CREATED=false
DOSSIER_CREATED=false
COMMIT_CREATED=false
PUSH_PERFORMED=false

PRIMARY_ADR=<path>
AUDIT_REPORT=<path>
THREAT_MODEL=<path>
IMPLEMENTATION_PLAN=<path>

RECOMMENDED_NEXT_PHASE=02
NEXT_PHASE_NAME=INTAKE_SCHEMA_FIXTURES_AND_LOCAL_PROCESSOR
```

Potom přidej lidsky čitelné sekce:

## Mission completed

Co bylo skutečně provedeno.

## Most important findings

Maximálně deset nejdůležitějších zjištění, seřazených podle dopadu.

## Existing capabilities to reuse

Konkrétní skripty, schemas, skills, komponenty a workflows.

## Blocking gaps

Co brání bezpečné implementaci.

## Security conclusions

Zejména:

* autorizační hranice;
* GitHub public boundary;
* write permissions;
* SSRF;
* prompt injection;
* publication isolation.

## Files created or modified

Přesný seznam.

## Commands run

Příkazy a výsledky.

## Validation

Co prošlo, co neprošlo a proč.

## Phase 2 contract

Přesné inputs, outputs a acceptance criteria následující fáze.

---

# 26. Pracovní styl

Postupuj systematicky.

Po každém větším bloku auditu aktualizuj pracovní report, aby při přerušení nezmizela zjištění.

Nezahlcuj terminál nekonečným dumpem. Ukládej strukturované závěry do reportů.

Nevyvozuj vlastnosti podle názvu souboru. Čti implementaci.

Nevěř dokumentaci, pokud jí odporuje kód. Rozpor zaznamenej.

Nevěř kódu, pokud produkční workflow používá jinou cestu. Rozpor zaznamenej.

Nevěř tomu, že validátor něco vynucuje, dokud nezjistíš, že jej skutečně spouští build nebo CI.

Nevěř tomu, že pole je kanonické, dokud nezjistíš:

* kdo jej zapisuje;
* kdo jej čte;
* kdo jej validuje;
* kdo jej renderuje;
* kdo jej testuje.

Pole, které nikdo nečte, není feature.

Pravidlo, které nikdo nevynucuje, není gate.

Workflow, který má zbytečná write permissions, není „připravený do budoucna“, ale bezpečnostní dluh v YAML.

Začni nyní Phase 1. Neimplementuj Phase 2.
