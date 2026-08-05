# Mission: Prismatic Platform integration — master prompt

**Status (2026-08-05, at time of landing)**: governance decision accepted
(`AUTH-2026-08-05-PLATFORM-SCOPE` in `AGENTS.md`;
[ADR](../adr/prismatic-platform-integration.md)). Docs, ADR, `.claude/`
skill stubs and `scripts/prismatic/` script stubs landed. **The pipeline
described below (Fáze 1–4) is not implemented** — every phase, every
`prismatic:*` command and every capability-map/audit artifact mentioned
here is future work, not something already done. This file is the
working brief for that future work, kept verbatim (Czech original) so the
next session doing Fáze 0 onward has the full brief instead of a
paraphrase. See the companion checklist in this directory for a
mechanical done/not-done breakdown.

---

# Master prompt pro Claude Code: integrace Prismatic Platform do vomaste.cz

Pracuješ jako hlavní architekt a implementátor ve dvou lokálních repozitářích:

- primární publikační repo: `~/dev/vomaste.cz`
- upstream analytická platforma: `~/dev/prismatic-platform`

Vlastník obou projektů dne **2026-08-05** rozhodl, že dosavadní zákaz přímé integrace Prismatic Platform a per-subject autorizační gate byly příliš hrubé. Toto rozhodnutí je explicitní, vlastnické a na záznam. Tvým úkolem je bezpečně a důkladně použít skutečné schopnosti `prismatic-platform` pro systematické rozšíření všech existujících dossierů a entit ve `vomaste.cz`, a současně vytvořit dlouhodobě udržitelnou integrační vrstvu.

Neinterpretuj „odstranit zbytečné brzdy“ jako „odstranit důkazní disciplínu“. Zruš per-subject ruční autorizaci a zákaz integrace. Zachovej a zesil následující publikační invarianty:

1. žádný publikovaný fakt bez dohledatelného zdroje nebo přímo citovatelného veřejného registru;
2. Prismatic ani jeho interní databáze nejsou samy o sobě veřejným zdrojem, ale nástrojem pro discovery, extrakci, normalizaci, identity resolution, hledání vazeb a provenance;
3. interní inference, skóre, heuristika, embedding similarity nebo agentí závěr jsou kandidáti, ne publikovaná fakta;
4. procesní výsledek se nikdy nevydává za věcné rozhodnutí o vině nebo pravdivosti;
5. vztah mezi entitami není důkaz koordinace, ovládání, odpovědnosti ani protiprávního jednání;
6. žádné soukromé kontakty, přesné adresy bydliště, neveřejné materiály, zdroj-identifikující data ani zbytečné osobní údaje;
7. každý import, transformace a promotion musí být reprodukovatelný, idempotentní, verzovaný a auditovatelný;
8. veřejný build `vomaste.cz` musí zůstat deterministický a nesmí vyžadovat běžící Prismatic, jeho databázi, credentials ani síť.

## Režim práce

- Nezačínej změnami naslepo. Nejprve proveď audit obou repozitářů a napiš měřený návrh.
- Nic nepředpokládej o příkazech, Mix taskech, API, databázových schématech ani exportérech Prismatic. Ověř vše ze zdrojového kódu, `mix help`, testů, dokumentace a skutečných výstupů.
- Nepoužívej názvy nástrojů jen proto, že se objevují ve starých TODO souborech. Starý dokument je stopa, ne runtime kontrakt.
- Nezahazuj existující necommitnutou práci v žádném repu. Na začátku ukaž `git status --short --branch`, aktuální commit a worktrees obou repozitářů.
- Změny obou repozitářů drž v oddělených větvích a commitech. Nikdy nevytvářej jeden commit, který předstírá atomickou změnu přes dvě Git historie.
- Při dlouhé práci průběžně zapisuj stav do `docs/missions/<date>-prismatic-integration.md` a do existujícího co-op busu, pokud je aktivní.
- Neprohlašuj nic za hotové bez zeleného `npm run build` ve `vomaste.cz` a relevantních testů v `prismatic-platform`.

## Fáze 0: bezpečný audit a baseline

V obou repozitářích proveď:

```bash
cd ~/dev/vomaste.cz
git status --short --branch
git rev-parse HEAD
git worktree list
node -v
zola --version
npm -v

cd ~/dev/prismatic-platform
git status --short --branch
git rev-parse HEAD
git worktree list
elixir --version
mix --version
```

Poté v `vomaste.cz` přečti minimálně:

- `AGENTS.md`
- `CLAUDE.md`
- `PROJECT_INSTRUCTIONS.md`
- `docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`
- `docs/adr/aiad-and-agent-tooling-import.md`
- `docs/adr/dossier-jsonld-provenance-extension.md`
- `docs/missions/2026-07-30-investigate-protocol-vision.md`
- `docs/dossier-audit/PRISMATIC_SOURCING_TODO.md`
- všechna schémata v `schemas/`
- `package.json`
- validátory v `scripts/dossier/`, `scripts/data/`, `scripts/osint/`
- aktuální canonical data, generated data a způsob generování Zola content vrstev.

V `prismatic-platform` vyhledej a skutečně otevři:

- veřejné nebo interní CLI/Mix tasky pro entity, osoby, firmy, PEP, registry, právní události, property, sanctions, sources, provenance a export;
- datové modely pro entity, claim/evidence/source/relation/case/event;
- identity-resolution a deduplication logiku;
- source/provenance model;
- existující JSON, JSONL, NDJSON, JSON-LD, CSV nebo Graph exportéry;
- job orchestration, resumability, rate limiting, cache a audit log;
- testy uvedených capability;
- konfiguraci, secrets boundary a lokální setup.

Použij `rg`, `find`, `mix help`, testy a malé read-only smoke runy. Nespouštěj plošné crawlery, dokud nevíš, co přesně dělají, kam zapisují a jaké mají náklady.

Vytvoř `docs/audits/2026-08-05-prismatic-capability-map.md` s tabulkou:

- capability;
- skutečný entry point;
- vstupy;
- výstupy;
- side effects;
- persistence;
- provenance coverage;
- determinismus/idempotence;
- vhodnost pro vomaste;
- potřebný adapter;
- test coverage;
- rozhodnutí: reuse directly / wrap / extend in Prismatic / reject.

Přidej měřenou baseline `vomaste.cz`: počet dossierů, entit, claims, sources, gaps, cases, relations, source families, orphan records, missing identifiers, missing primary sources a stáří poslední kontroly. Použij skutečná data a existující generátory, ne čísla ze starých markdownů.

## Fáze 1: governance a ADR

### 1.1 AGENTS.md

Nemazej ani neupravuj historické autorizační záznamy. Jsou auditním záznamem tehdejšího stavu.

Proveď dvě změny:

1. Nahraď obecnou procedurální sekci, která stanovuje per-subject autorizaci, novou sekcí „Standing scope authorization and publication gates".
2. Na konec append-only logu přidej datovanou sekci `AUTH-2026-08-05-PLATFORM-SCOPE`, která explicitně zaznamená vlastnické rozhodnutí a superseduje budoucí použití per-subject gate.

Použij návrh z přiloženého `AGENTS_APPEND_2026-08-05.md`, ale přizpůsob odkazy skutečné současné struktuře repa. Historii nemaž.

**Hotovo 2026-08-05** — viz "Standing scope authorization and
publication gates" v `AGENTS.md` a `AUTH-2026-08-05-PLATFORM-SCOPE` na
konci append-only logu.

### 1.2 ADR

Změň status `docs/adr/aiad-and-agent-tooling-import.md` na „superseded in part“ a přidej odkaz na nový ADR. Původní měření a argument proti wholesale copy zachovej jako historicky správné.

Vytvoř `docs/adr/prismatic-platform-integration.md` podle přiloženého návrhu. Rozhodnutí musí být:

- nepřenášet celý `.aiad/` ani `.claude/` strom;
- používat Prismatic přímo jako lokální upstream capability provider;
- vytvořit úzký, verzovaný, machine-readable export contract;
- držet staging odděleně od canonical publikovaných dat;
- nepřidávat runtime/build dependency veřejného webu na Prismatic;
- umožnit dávkové enrichment runy přes všechny existující entity a dossiers;
- umožnit změnu nebo rozšíření adapteru podle skutečně nalezených capability.

**Hotovo 2026-08-05** — obě ADR úpravy landed.

## Fáze 2: integrační architektura

**Stav 2026-08-05: neimplementováno.** Skeleton `scripts/prismatic/*`
a `.claude/skills/prismatic-*` existuje jako honest "not yet
implemented" stub; nic z 2.1–2.8 níže reálně nefunguje.

Implementuj následující hranice. Názvy uprav jen tehdy, když současná struktura repa jasně vyžaduje jiný konvenční název.

### 2.1 Konfigurace

Přidej verzovanou konfiguraci, například:

```text
config/prismatic-integration.toml
```

Konfigurace nesmí obsahovat secrets. Lokální cesta se určuje v tomto pořadí:

1. `PRISMATIC_PLATFORM_PATH`;
2. hodnota v lokálním ignorovaném configu;
3. výchozí sibling path `../prismatic-platform`.

Přidej validaci:

- cesta existuje;
- je to očekávaný Git repo;
- lze načíst commit SHA;
- dostupná export contract version je podporovaná;
- potřebné runtime prerequisites jsou dostupné;
- credentials se pouze detekují, nikdy nelogují.

### 2.2 Exportní kontrakt

Preferuj již existující stabilní machine-readable export z Prismatic. Pokud neexistuje, implementuj v `prismatic-platform` minimální, testovaný exportér určený pro integraci, například Mix task nebo CLI, který zapisuje JSONL/NDJSON bez logů na stdout.

Kontrakt musí mít explicitní verzi a minimálně tyto record types:

- `run_manifest`
- `entity_candidate`
- `identity_assertion`
- `source_candidate`
- `claim_candidate`
- `relation_candidate`
- `case_candidate`
- `event_candidate`
- `gap_candidate`
- `warning`
- `error`

Každý record musí podle relevance nést:

- `contract_version`;
- `record_type`;
- stabilní `record_id`;
- `subject_ref`;
- vstupní query a použitou capability;
- `generated_at`;
- `prismatic_commit`;
- `run_id`;
- source URL nebo primary-record locator;
- source title/outlet/published/retrieved;
- content hash nebo evidence hash, pokud je legálně a technicky dostupný;
- provenance chain;
- extract/citation span, pokud existuje;
- interní confidence pouze jako interní metadata, nikdy jako publikovaný truth score;
- raw provider payload pouze v lokální ignorované run zóně, ne automaticky v Git;
- warnings a unresolved identity collisions.

Přidej JSON Schema pro export contract a contract fixtures. Consumer ve `vomaste.cz` musí odmítnout neznámou major version a nesmí tiše ignorovat neznámá povinná pole.

### 2.3 Zóny dat

Zaveď jednoznačné zóny:

```text
var/prismatic-runs/<run-id>/          # lokální, ignored, raw a citlivější runtime artefakty
data/staging/prismatic/<run-id>/      # sanitizované, reviewable candidates vhodné pro Git podle policy
data/review/prismatic/<run-id>.json   # rozhodnutí k jednotlivým kandidátům
data/imports/prismatic/<run-id>.json  # immutable import manifest / receipt
```

Přesné názvy přizpůsob existující architektuře, ale oddělení raw → staging → review → canonical je povinné.

Canonical data ve `content/`, `data/dossiers*`, `content/entities*` ani generovaných exportech se nesmí měnit během discovery/import kroku.

### 2.4 Adaptéry a CLI ve vomaste.cz

Vytvoř malou integrační vrstvu, například:

```text
scripts/prismatic/
  lib/config.mjs
  lib/process.mjs
  lib/contract.mjs
  lib/identity.mjs
  lib/dedupe.mjs
  lib/provenance.mjs
  status.mjs
  probe.mjs
  plan.mjs
  run.mjs
  import.mjs
  diff.mjs
  review-report.mjs
  promote.mjs
  verify.mjs
```

Požadované npm entry points:

```text
prismatic:status
prismatic:probe
prismatic:plan
prismatic:run
prismatic:import
prismatic:diff
prismatic:review
prismatic:promote
prismatic:verify
prismatic:drift
prismatic:enrich-all
```

Nevymýšlej paralelní framework. Každý příkaz musí mít `--help`, strojově čitelný exit status, structured logging na stderr a machine output na stdout nebo do explicitního souboru.

**Stav 2026-08-05**: adresář a npm scripty existují jako stuby (exit 1,
odkaz na tento dokument); `lib/*` neexistuje vůbec.

### 2.5 Job plan pro všechny entity a dossiers

`prismatic:plan` musí číst canonical registry a vytvořit deterministický plán přes:

- všechny entity;
- všechny entity dossiers;
- aggregate dossiers pouze jako derived view;
- existující gaps;
- zastaralé zdroje nebo claims s `reviewed_at` za definovaným prahem;
- identity bez stabilních externích identifikátorů;
- relations bez dostatečné evidence;
- cases bez primary-source coverage.

Plán nesmí slepě spustit každou capability na každou entitu. Zvol capability podle typu entity, jurisdikce, známých identifikátorů, autorizovaného/public-interest tématu a source coverage. Výsledek musí být vysvětlitelný: u každého jobu uveď proč se spouští a proč se jiné capability nespouští.

Podporuj:

- `--entity <id>`;
- `--dossier <slug>`;
- `--all`;
- `--only <capability>`;
- `--resume <run-id>`;
- `--concurrency <n>` s bezpečným defaultem;
- `--dry-run`;
- `--since <date>`;
- `--changed-since <git-ref>`;
- `--max-records <n>` pro smoke run.

### 2.6 Identity resolution a deduplikace

Nezakládej novou entitu jen podle stejného jména.

Použij dostupné stabilní identifikátory podle typu entity, například veřejné registry, IČO, party/office identifiers, Wikidata nebo jiné již přijaté externí ID, ale pouze pokud je jejich použití v souladu s existující datovou smlouvou.

Každý merge nebo alias musí mít:

- důvod;
- vstupní identifikátory;
- provenance;
- deterministické rozhodnutí nebo explicitní `needs_review`;
- zákaz automatického merge při kolizi identity.

### 2.7 Evidence a source families

Importér musí rozlišit:

- Prismatic jako transport/processor;
- původní veřejný zdroj;
- primary registry/official document;
- media article;
- syndikovaný článek;
- stejného vydavatele/source family;
- sekundární článek citující primární dokument.

`CORROBORATED` nesmí vzniknout jen proto, že dva URL z téhož publisher family opakují totéž. Pokud to současný validator neumí, rozšiř model a validator source families.

### 2.8 Promotion

`prismatic:promote` smí zapisovat canonical data pouze z review manifestu. Promotion musí být:

- idempotentní;
- transakční na úrovni pracovního stromu, nebo bezpečně rollbackovatelná;
- schopná vytvořit diff bez zápisu;
- schopná přijmout jednotlivé kandidáty i dávku;
- schopná zaznamenat `reviewed_by`, `reviewed_at`, `run_id`, `prismatic_commit`, contract version a evidence hashes;
- schopná odmítnout kandidáta bez zdroje, s identity collision, bez public-interest basis nebo s nekompatibilním procesním framingem;
- nesmí přímo commitovat ani pushovat.

Review je nově **run-level nebo batch-level gate**, nikoli per-subject autorizační ceremonie. U každého promoted recordu však musí zůstat konkrétní evidence a provenance.

## Fáze 3: rozšíření všech dossierů a entit

**Stav 2026-08-05: neprovedeno.** Fáze 2 musí být skutečně implementovaná
a otestovaná dřív, než tahle fáze začne — žádný smoke run ani all-entity
run zatím neproběhl.

Po implementaci a unit/integration testech proveď nejprve smoke run na 1 dossieru a 2 různých typech entit. Vyber reprezentativní, již existující záznamy. Nevybírej pouze nejjednodušší happy path.

Po zeleném smoke runu spusť plán pro všechny canonical entity a dossiers.

Pro každý subjekt vytvoř pouze kandidáty v stagingu. Následně vytvoř souhrnný review report s těmito sekcemi:

- nové identity/aliases;
- nové nebo opravené veřejné role;
- nové firmy/instituce a registry vazby;
- nové source candidates;
- nové claims;
- aktualizace procesního stavu;
- relations;
- timeline/events;
- nové gaps;
- konflikty se stávajícími daty;
- identity collisions;
- unsupported/failed capabilities;
- records s chybějící primary source;
- records, které se nemají publikovat.

Pak proveď promoci pouze těch kandidátů, které splní všechny publikační invarianty. Lze provést dávkově přes schválený review manifest. Nepoužívej automatické „accept all“ bez generated diffu a explicitního reviewed manifestu.

Každý canonical zápis musí respektovat skutečný datový model repa, obousměrné vazby, generated pages, JSON-LD, route manifests a validátory. Neobcházej současné generátory ručními hardcoded kopiemi.

## Fáze 4: dlouhodobá údržba

**Stav 2026-08-05**: body 1, 2, 3, 4, 5 částečně existují jako stuby
(skills a scripty vznikly, ale bez funkční logiky). Body 6–10 neexistují.

Přidej:

1. `.claude/skills/prismatic-bootstrap/`
2. `.claude/skills/prismatic-enrich-all/`
3. `.claude/skills/prismatic-promote/`
4. `.claude/skills/prismatic-drift-audit/`
5. `.claude/README.md`
6. SessionStart status hook, který pouze informuje o dostupnosti sibling repa, jeho commit SHA, contract version a posledním importu; nic automaticky nespouští.
7. CI test export contract fixtures a consumer schemas bez nutnosti mít Prismatic v CI.
8. lokální optional integration test, který se spustí jen pokud je `PRISMATIC_PLATFORM_PATH` dostupný.
9. drift report při změně Prismatic commit/interface.
10. dokumentaci recovery, rollbacku, rerunu, rate limits, secrets a troubleshootingu.

Nevkládej `settings.local.json` do Gitu. Do verzovaného `.claude/settings.json` patří jen portable hooks. Lokální permissions se dokumentují, necommitují.

## Povinné testy

Minimálně:

- config resolution a chybové stavy;
- contract schema validation;
- unknown major version rejection;
- structured stdout/stderr separation;
- malformed/partial JSONL;
- interrupted run + resume;
- duplicate records;
- identity collision;
- same-source-family false corroboration;
- candidate without source;
- candidate whose original URL is missing;
- procedural-outcome wording gate;
- raw payload redaction;
- idempotent import;
- idempotent promotion;
- dry-run produces no changes;
- rollback/failed promotion leaves no half-written canonical state;
- aggregate dossier remains derived, not a second source of truth;
- build succeeds with Prismatic absent;
- local integration smoke succeeds with Prismatic present.

Použij synthetic fixtures. Nevkládej do testů reálné citlivé osobní údaje.

## Dokumentace a DX

Aktualizuj minimálně:

- `README.md`
- `CONTRIBUTING.md`
- `AGENTS.md`
- `CLAUDE.md`
- `PROJECT_INSTRUCTIONS.md`, pokud je stále authoritative
- `docs/data-contract.md`
- `docs/entity-discovery.md`
- nový ADR
- troubleshooting a runbook
- npm scripts v `package.json`
- `.gitignore`
- sample config
- `.claude/README.md` a skills.

Dokumentace musí jasně vysvětlit:

- co je canonical;
- co je staging;
- co je generated;
- co je raw a ignored;
- co je citable source;
- co je pouze Prismatic inference;
- jak probíhá review a promotion;
- jak se reprodukuje run;
- jak se zjistí platform commit a contract version;
- jak se přidá nová capability bez rozbití consumeru;
- jak se pracuje bez lokálního Prismatic repa.

## Definition of done

Neprohlašuj úkol za dokončený, dokud nejsou splněny všechny body:

1. audit obou repozitářů existuje a uvádí skutečné, ověřené entry pointy;
2. governance amendment je zapsaný bez mazání historického logu;
3. starý ADR je označen jako částečně superseded a nový ADR je přidán;
4. export contract je verzovaný, schema-validovaný a testovaný;
5. Prismatic může být lokálně spuštěn z vomaste přes úzký adapter;
6. veřejný build vomaste funguje bez Prismatic;
7. staging/import/review/promotion jsou oddělené;
8. batch plán pokrývá všechny současné entity a dossiers;
9. smoke run a následný all-entities run vytvořily auditovatelné reporty;
10. promoted canonical změny mají skutečné externí zdroje a provenance;
11. žádný interní Prismatic inference nebyl vydáván za fakt;
12. všechny testy a `npm run build` ve `vomaste.cz` jsou zelené;
13. relevantní testy v `prismatic-platform` jsou zelené;
14. `git diff` obou repozitářů je přehledně shrnut po souborech;
15. finální report uvádí: co bylo integrováno, co bylo obohaceno, co zůstalo ve stagingu, co bylo odmítnuto, co selhalo a proč.

**Stav 2026-08-05: body 2 a 3 hotové (governance + ADR). Body 1, 4–15
nehotové** — zbytek je budoucí práce, ne dokončený stav.

## Finální výstup Claude Code

Na konci vrať stručný, ale přesný report:

- aktuální commit/branch obou repozitářů;
- vytvořené/změněné soubory;
- skutečné Prismatic capability použité v běhu;
- počet plánovaných, dokončených, přeskočených a neúspěšných jobů;
- počet nových/změněných entity, claim, source, relation, case, event a gap records;
- počet kandidátů ve stagingu, promoted, rejected a needs-review;
- výsledky testů a buildů;
- známá omezení;
- přesné další kroky seřazené podle dopadu.

Nevytvářej marketingové tvrzení o „plně autonomním OSINT“. Implementuj skutečný, testovatelný pipeline. Lidstvo už má dost systémů, které se jmenují autonomní jen proto, že mají cron a sebevědomý README.
