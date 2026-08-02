# Claude Code Prompt — Phase 5 of N

# GitHub Issue Form a lokální end-to-end intake fixture

Pracuješ v repozitáři:

```text
~/dev/vomaste.cz
```

Toto je **Phase 5** implementace veřejného dossier-intake workflow.

Předchozí fáze měly dodat:

* Phase 1: audit, ADR, threat model a implementační plán;
* Phase 2: versioned intake schemas, lokální parser a manifest;
* Phase 3: entity matching, deduplikaci a risk classification;
* Phase 4: bezpečný URL preflight a SSRF hardening.

V této fázi implementuj:

1. finální veřejný GitHub Issue Form;
2. verzovaný kontrakt mezi formulářem a parserem;
3. lokální fixtures odpovídající skutečnému GitHub-generated Markdown body;
4. úplný lokální end-to-end průchod od formulářového eventu po report;
5. veřejnou a technickou dokumentaci podání.

Neimplementuj ještě:

* GitHub Actions;
* GitHub API;
* automatické komentáře;
* automatické labelování;
* owner ping;
* webové CTA;
* autorizaci;
* investigation;
* branch creation;
* pull request;
* merge;
* deploy.

---

# 0. Mise Phase 5

Cílem je odstranit rozdíl mezi:

```text
„parser podle našich představ“
```

a:

```text
„parser, který skutečně rozumí přesnému Markdown body vytvořenému GitHub Issue Forms“
```

Cílový tok:

```text
.github/ISSUE_TEMPLATE/navrh-dossieru.yml
→ syntetický GitHub issue event
→ parser
→ validace acknowledgements
→ normalizace
→ entity matching
→ risk classification
→ volitelný mock URL preflight
→ intake manifest
→ veřejný Markdown report
```

Celý tok musí být lokálně reprodukovatelný bez GitHub API.

---

# 1. Nepřekročitelné invarianty

## 1.1 Formulář není autorizace

Formulář nikdy nesmí tvrdit ani implikovat:

* že podáním vznikne dossier;
* že systém automaticky autorizuje subjekt;
* že AI rozhodne o zveřejnění;
* že podnět bude určitě zpracován;
* že podnět bude automaticky publikován;
* že počet reakcí nebo hlasů ovlivní pravdivost;
* že navrhovatel schvaluje rozsah projektu.

Viditelný kontrakt:

```text
Podnět je vstup k posouzení.
Nevzniká jím veřejný dossier.
Rozsah musí ručně autorizovat vlastník projektu.
Publikace vždy vyžaduje další lidskou kontrolu.
```

## 1.2 GitHub je veřejný

Formulář musí před odesláním jasně uvést:

```text
Tato issue bude veřejná a dlouhodobě dohledatelná.
```

A:

```text
Neposílejte neveřejné dokumenty, identitu oznamovatele,
osobní kontaktní údaje, citlivé osobní informace ani materiály,
jejichž zveřejnění by mohlo někoho ohrozit.
```

## 1.3 Nejde o whistleblower kanál

Nepoužívej formulace:

* anonymní podání;
* bezpečný whistleblower formulář;
* chráněné oznámení;
* důvěrné podání;
* secure intake;
* bezpečné předání dokumentů.

Použij:

```text
Veřejný podnět založený na veřejných informacích a veřejných zdrojích
```

## 1.4 Unstructured input ano, nekontrolovaný chaos ne

Uživatel smí popsat podnět volným textem.

Formulář ale musí dodat stabilní strojově parsovatelný rámec:

* version marker;
* submission type;
* subject field;
* description;
* public interest;
* source URLs;
* acknowledgements.

## 1.5 Parser nesmí hádat

Při změně headingu, markeru nebo struktury formuláře:

```text
fail closed
```

Neznámá form version:

```text
unsupported_form_version
```

Chybějící marker:

```text
unsupported_or_unversioned_form
```

Duplicitní sekce:

```text
duplicate_section
```

---

# 2. Preflight

Spusť:

```bash
pwd
git rev-parse --show-toplevel
git branch --show-current
git rev-parse HEAD
git status --short
git diff --stat
git diff --cached --stat
```

Potom:

```bash
npm ci
npm run intake:fixture
npm run intake:preflight-fixture
npm run test:intake
npm run build
```

Zaznamenej:

```text
PHASE_04_BASELINE
INTAKE_FIXTURE
PREFLIGHT_FIXTURE
INTAKE_TESTS
FULL_BUILD
```

Najdi a přečti skutečné výstupy Phase 4.

Preferované cesty:

```text
reports/intake/phase-04-implementation-report.md
docs/intake/url-preflight.md
docs/intake/security-boundary.md
schemas/intake*.json
scripts/intake/**
tests/intake/**
```

Pokud Phase 4 není ověřena, neimplementuj Phase 5 na neznámém kontraktu.

---

# 3. Audit současných Issue Forms

Prostuduj celé:

```text
.github/ISSUE_TEMPLATE/**
.github/ISSUE_TEMPLATE/config.yml
```

Pro každý template zaznamenej:

* filename;
* `name`;
* `description`;
* `title`;
* labels;
* assignees;
* typy polí;
* field IDs;
* headings vytvořené GitHubem;
* required status;
* checkbox syntax;
* bezpečnostní upozornění;
* parsovatelnost;
* vazbu na existující parser.

Vytvoř nebo aktualizuj:

```text
reports/intake/phase-05-issue-form-audit.md
```

Tabulka:

| Template | Účel | Parser support | Public warning | Versioned | Zachovat |
| -------- | ---- | -------------: | -------------: | --------: | -------: |

Neodstraňuj unrelated templates.

---

# 4. Finální typologie podání

Použij Phase 2 schválené interní enumy.

Preferovaný rozsah:

```text
new_dossier
new_entity
new_topic_for_existing_dossier
link_existing_entities
```

České labels:

```text
Nový dossier
Nová entita
Nové téma existujícího dossieru
Propojení existujících entit
```

## 4.1 Významy

### `new_dossier`

Uživatel navrhuje veřejně činný subjekt nebo jasně vymezený předmět k vytvoření dossieru.

### `new_entity`

Uživatel navrhuje doplnění entity do grafu nebo registru, aniž by automaticky požadoval samostatný dossier.

### `new_topic_for_existing_dossier`

Uživatel navrhuje rozšíření konkrétního již existujícího dossieru o přesně vymezené téma.

### `link_existing_entities`

Uživatel navrhuje vztah nebo propojení mezi již evidovanými entitami.

## 4.2 Nepřidávej generické `other`

Generické `other` často znamená:

```text
obejdi schema a napiš cokoliv
```

Pokud jej skutečně potřebuješ, musí vést na:

```text
needs_information
```

a nesmí automaticky spustit další workflow.

---

# 5. Issue Form struktura

Preferovaný soubor:

```text
.github/ISSUE_TEMPLATE/navrh-dossieru.yml
```

Pokud současný repo název nebo konvence vyžaduje jinou cestu, dodrž ji.

## 5.1 Metadata

Příklad:

```yaml
name: Navrhnout dossier nebo entitu
description: Veřejný podnět založený na veřejných informacích a zdrojích
title: "[Podnět] "
labels:
  - navrh-rozsahu
assignees: []
```

Použij existující label convention.

Nevytvářej label automaticky v této fázi.

Pokud label v repozitáři není deklarován a existuje jen na GitHubu, dokumentuj ruční krok.

## 5.2 Version marker

GitHub Issue Forms neumožňují libovolný hidden field jako HTML formulář.

Zaveď stabilní marker přes Markdown element:

```yaml
- type: markdown
  attributes:
    value: |
      <!-- vomaste-intake-form:v1 -->
```

Ověř, zda GitHub tento HTML komentář skutečně zachová v issue body.

Pokud ne, použij stabilní viditelný marker:

```text
Formulář: vomaste-intake-form:v1
```

Preferuj mechanismus prokazatelně zachovaný GitHubem.

Nespoléhej na nedokumentované chování.

## 5.3 Intro warning

První viditelný blok musí vysvětlit:

```text
Tento formulář vytvoří veřejnou GitHub issue.

Podnět je určen pouze pro veřejně dostupné informace a veřejné zdroje.
Neposílejte neveřejné dokumenty, identitu oznamovatele, osobní kontaktní
údaje ani citlivý materiál.

Podáním nevzniká dossier ani publikované tvrzení.
Každý nový rozsah musí ručně autorizovat vlastník projektu.
```

Warning nesmí být schovaný pouze na konci.

---

# 6. Pole formuláře

## 6.1 Typ podnětu

Použij dropdown.

```yaml
- type: dropdown
  id: submission_type
  attributes:
    label: Typ podnětu
    options:
      - Nový dossier
      - Nová entita
      - Nové téma existujícího dossieru
      - Propojení existujících entit
  validations:
    required: true
```

Parser mapuje české labely na interní enumy explicitní mapou.

Neodvozuj enum přes slugování labelu.

## 6.2 Subject

```yaml
- type: input
  id: subject
  attributes:
    label: Koho nebo čeho se podnět týká?
    description: Uveďte jméno osoby, organizace, instituce nebo existujícího dossieru.
    placeholder: Například osoba, firma, instituce nebo dossier
  validations:
    required: true
```

Nežádej zbytečně datum narození ani jiné osobní identifikátory.

## 6.3 Identifikátory

Volitelné samostatné pole:

```yaml
- type: textarea
  id: identifiers
  attributes:
    label: Veřejné identifikátory
    description: Pokud je znáte, uveďte například IČO, datovou schránku nebo odkaz na veřejný registr.
```

Nevyžaduj rodné číslo.

Výslovně napiš:

```text
Neuvádějte rodná čísla, osobní adresy ani neveřejné identifikátory.
```

## 6.4 Popis

```yaml
- type: textarea
  id: description
  attributes:
    label: Co by mělo být prověřeno?
    description: Popište vlastními slovy konkrétní otázku, událost nebo vztah.
    placeholder: Co je potřeba prověřit, co už víte a co naopak nevíte?
  validations:
    required: true
```

Popis může být unstructured.

Nesmí uživatele navádět, aby napsal hotové obvinění.

Preferuj otázkový framing:

```text
Co by mělo být prověřeno?
```

nikoli:

```text
Jakého provinění se subjekt dopustil?
```

## 6.5 Veřejný zájem

```yaml
- type: textarea
  id: public_interest
  attributes:
    label: Proč je téma ve veřejném zájmu?
    description: Popište vztah k veřejné funkci, veřejným prostředkům, rozhodování nebo jiné veřejně relevantní činnosti.
  validations:
    required: true
```

Formulář nemá předvyplnit, že veřejný zájem existuje.

## 6.6 Veřejné zdroje

```yaml
- type: textarea
  id: source_urls
  attributes:
    label: Veřejné zdroje
    description: Uveďte jednu veřejnou URL na řádek. Dostupnost ani důvěryhodnost zdroje nejsou automaticky potvrzeny.
    placeholder: |
      https://example.cz/clanek
      https://example.cz/verejny-registr
```

Rozhodni podle Phase 2 policy, zda je pole required.

Preferovaná politika:

* pro `new_dossier`: alespoň jedna URL;
* pro `new_entity`: URL může být volitelná;
* pro ostatní typy podle kontraktu.

GitHub Issue Forms neumí podmíněnou required validaci podle dropdownu.

Proto:

* formulář může mít source field volitelné;
* parser a risk classifier nastaví `missing_source_urls`;
* případně `needs_information`.

Nevytvářej falešný dojem, že GitHub form umí něco, co neumí.

## 6.7 Co již bylo ověřeno

Volitelné pole:

```yaml
- type: textarea
  id: known_unknowns
  attributes:
    label: Co je podle vás známé a co nejisté?
    description: Oddělte doložené veřejné informace od otázek nebo nejistot.
```

To pomáhá zachovat epistemickou hranici.

## 6.8 Existing references

Volitelné:

```yaml
- type: textarea
  id: existing_references
  attributes:
    label: Související záznamy na vomaste.cz
    description: Uveďte odkazy nebo ID již existujících entit, dossierů či tvrzení.
```

Parser pouze syntakticky zpracuje odkazy nebo IDs.

Nevěř, že zadané ID existuje, dokud jej matcher neověří.

---

# 7. Povinná potvrzení

Použij checkboxes.

Minimálně:

```yaml
- type: checkboxes
  id: acknowledgements
  attributes:
    label: Povinná potvrzení
    options:
      - label: Rozumím, že tato issue bude veřejná a dlouhodobě dohledatelná.
        required: true
      - label: Neposílám neveřejné dokumenty, identitu oznamovatele ani citlivé osobní údaje.
        required: true
      - label: Rozumím, že podáním nevzniká dossier, autorizace ani publikované tvrzení.
        required: true
      - label: Uvedené zdroje jsou veřejně přístupné nebo veřejně dohledatelné.
        required: true
```

## 7.1 Parser mapování

Parser nesmí mapovat acknowledgements pouze podle pořadí.

Použij stabilní přesný label nebo jiný verzovaný mechanismus.

Pokud se label změní, form version se musí zvýšit nebo parser musí mít explicitní compatibility mapu.

## 7.2 Checkbox spoofing

Otestuj:

* ručně editované `[x]`;
* změněný text;
* duplicate acknowledgement;
* chybějící acknowledgement;
* falešný acknowledgement vložený do description.

Parser musí číst pouze sekci `Povinná potvrzení`.

---

# 8. Headings contract

GitHub vytvoří Markdown headings z field labels.

Vytvoř explicitní tabulku:

| Form field ID | Generated heading | Parser key | Required |
| ------------- | ----------------- | ---------- | -------: |

Například:

```text
submission_type → Typ podnětu → submission_type
subject → Koho nebo čeho se podnět týká? → subject_text
description → Co by mělo být prověřeno? → description_text
public_interest → Proč je téma ve veřejném zájmu? → public_interest_text
source_urls → Veřejné zdroje → submitted_source_urls
```

Tato tabulka musí být:

* v dokumentaci;
* v parser constants;
* v compatibility tests.

Neduplikuj mapping na více místech ručně.

Preferuj jeden versioned contract module:

```text
scripts/intake/forms/v1.mjs
```

---

# 9. Versioned form adapter

Preferovaná struktura:

```text
scripts/intake/forms/
  registry.mjs
  v1.mjs
```

`registry.mjs` mapuje:

```text
vomaste-intake-form:v1
→ parser contract v1
```

`v1.mjs` obsahuje:

* marker;
* field headings;
* type label mapping;
* acknowledgement labels;
* required sections;
* optional sections;
* normalization rules;
* report labels.

## 9.1 Žádný obří univerzální parser

Nepřidávej plugin framework.

Stačí explicitní registry verzí.

## 9.2 Future compatibility

Nová verze formuláře musí být nový adapter:

```text
v2.mjs
```

Nikoli série výjimek uvnitř `v1`.

---

# 10. Fixture generátor

Vytvoř nástroj, který z versioned form contractu vytvoří realistické issue body fixtures.

Preferovaný soubor:

```text
scripts/intake/generate-form-fixture.mjs
```

Nesmí předstírat, že YAML template sám přesně renderuje GitHub body bez ověření.

Použij jednu z cest:

## Varianta A

Ručně udržované golden fixtures zachycené podle skutečného GitHub output formátu.

## Varianta B

Omezený renderer přesně kopírující dokumentovaný GitHub format.

## Varianta C

Kombinace:

* golden fixture jako source of truth;
* generator pro test variants.

Preferuj golden fixture pro kompatibilitu.

---

# 11. Povinné end-to-end fixtures

Vytvoř realistické syntetické GitHub event payloads.

Minimálně:

```text
e2e-valid-new-dossier.json
e2e-valid-new-entity.json
e2e-valid-new-topic.json
e2e-valid-link-entities.json

e2e-valid-no-source-url.json
e2e-valid-markdown-in-description.json
e2e-valid-czech-diacritics.json
e2e-valid-long-description.json
e2e-valid-edited-issue.json

e2e-invalid-missing-marker.json
e2e-invalid-unknown-version.json
e2e-invalid-changed-heading.json
e2e-invalid-duplicate-heading.json
e2e-invalid-missing-acknowledgement.json
e2e-invalid-edited-acknowledgement.json
e2e-invalid-spoofed-acknowledgement.json
e2e-invalid-unknown-submission-type.json
e2e-invalid-confidential-material.json
```

Použij pouze fiktivní subjekty.

---

# 12. End-to-end runner

Přidej příkaz:

```bash
npm run intake:e2e-fixture
```

Musí:

1. načíst realistický GitHub event fixture;
2. detekovat form version;
3. parsovat headings;
4. mapovat submission type;
5. validovat acknowledgements;
6. vytvořit base manifest;
7. provést matching nad syntetickým nebo repo indexem;
8. provést risk classification;
9. provést mock URL preflight;
10. vytvořit finální manifest;
11. vytvořit report;
12. validovat schemas;
13. porovnat snapshots;
14. nic neposlat do GitHubu;
15. nic nezapsat do produkčních dossier dat.

Výstup do:

```text
.tmp/intake-e2e/
```

nebo repo-native temp adresáře.

---

# 13. Mock versus production preflight

`npm run intake:e2e-fixture` nesmí používat veřejný internet.

Použij:

* mock DNS adapter;
* mock HTTP transport;
* pevný clock;
* pevný commit;
* syntetický entity index;
* syntetické previous-intake artifacts.

Celý výstup musí být byte-deterministic.

---

# 14. Parser compatibility tests

Přidej samostatné testy:

## 14.1 Template-to-parser field coverage

Každé form field ID musí mít parser mapping nebo být explicitně ignored.

Test selže, pokud se do YAML přidá nové pole bez parser změny.

## 14.2 Parser-required heading coverage

Každý required parser heading musí existovat ve formuláři.

Test selže, pokud designer přejmenuje label.

## 14.3 Submission type mapping

Každá dropdown option musí mít interní enum.

Žádný enum nesmí být nedosažitelný.

## 14.4 Acknowledgement mapping

Každý required checkbox musí mít parser mapping.

Parser nesmí očekávat checkbox, který formulář nevytváří.

## 14.5 Version marker

Formulář marker a parser marker musí být shodné.

## 14.6 Labels

Pokud workflow později bude záviset na labelu, testuj přesnou label value.

---

# 15. YAML validace

Validuj `.github/ISSUE_TEMPLATE/*.yml`.

Použij existující YAML parser dependency, pokud existuje.

Ověř:

* validní YAML;
* podporované GitHub Issue Form types;
* unique field IDs;
* required labels;
* dropdown options;
* checkboxes;
* žádné duplicate IDs;
* žádné prázdné descriptions;
* žádný unsupported attribute;
* žádné tabs;
* správné booleans.

Pokud možno přidej repo-native validator:

```text
scripts/ci/validate-issue-forms.mjs
```

Neimplementuj celý GitHub schema validator, pokud lze použít existující nástroj.

---

# 16. Public wording review

Veškerý text formuláře musí být:

* česky;
* neutrální;
* věcný;
* bez emotivních výrazů;
* bez předpokladu viny;
* bez slibu výsledku;
* bez marketingového přehánění;
* s jasným upozorněním na veřejnost podání.

## 16.1 Zakázané framingy

Nepoužívej:

```text
Nahlaste pachatele
Odhalte korupci
Pošlete důkaz
Anonymně oznamte
Zveřejníme váš případ
AI vše vyšetří
```

Použij:

```text
Navrhněte téma k prověření
Popište, co by mělo být prověřeno
Uveďte veřejné zdroje, které znáte
```

---

# 17. Issue config a citlivé podněty

Zkontroluj:

```text
.github/ISSUE_TEMPLATE/config.yml
```

## 17.1 Blank issues

Vyhodnoť, zda `blank_issues_enabled` umožňuje obejít bezpečnostní warning.

Pokud blank issues zůstávají povolené kvůli jiným use cases:

* nepřepisuj je bezdůvodně;
* přidej jasný contact link nebo dokumentaci;
* dokumentuj riziko.

## 17.2 Contact link pro security

Pokud repo má security policy, může existovat odkaz:

```text
Bezpečnostní problém v projektu
```

To není totéž jako whistleblower intake.

Neodkazuj citlivé dossier materiály do security vulnerability channelu, pokud to `SECURITY.md` nepovoluje.

## 17.3 Explicitní absence secure channelu

Pokud bezpečný kanál neexistuje, napiš to poctivě.

Nevytvářej fiktivní e-mail nebo endpoint.

---

# 18. UI labels a budoucí CTA contract

Phase 5 neimplementuje webové CTA, ale musí vytvořit přesný contract pro Phase 7.

Definuj:

```text
Primary CTA: Navrhnout dossier nebo entitu
Secondary text: Veřejný podnět založený na veřejných informacích a zdrojích
Target: GitHub Issue Form URL
External link: ano
Warning before navigation: stručné veřejné upozornění
```

Urči přesnou GitHub URL pattern:

```text
https://github.com/korczis/vomaste.cz/issues/new?template=navrh-dossieru.yml
```

Ověř název repozitáře a template.

Nevkládej CTA do webu v této fázi.

---

# 19. Form URL tests

Přidej test nebo helper, který ověří:

* repository slug;
* template filename;
* URL encoding;
* target URL konzistenci;
* žádný hardcoded duplicate URL na více místech.

Preferuj jeden canonical config field pro budoucí CTA.

Pokud repo již má GitHub repository URL v configu, odvoď URL z něj.

---

# 20. Report wording

Aktualizuj report tak, aby odrážel skutečný formulář.

Povinné:

```text
Zdroj podání: veřejná GitHub issue
Verze formuláře: ...
```

A:

```text
Tento report není potvrzením správnosti podnětu.
```

A:

```text
Přijaté URL nebyly automaticky uznány jako nezávislé ani důvěryhodné zdroje.
```

A:

```text
Rozsah nebyl autorizován.
Publikace zůstává blokována.
```

---

# 21. Form-field provenance

Manifest musí u každého významného submission fieldu umět doložit:

```text
form_version
form_field_id
generated_heading
source_text_hash
```

Nemusí hashovat každý text zvlášť, pokud Phase 2 provenance stačí.

Ale musí být možné určit, z jakého pole hodnota vznikla.

Příklad:

```json
{
  "subject_text": {
    "value": "Společnost Příklad s.r.o.",
    "source": {
      "form_field_id": "subject",
      "heading": "Koho nebo čeho se podnět týká?"
    }
  }
}
```

Použij současný schema model, nepřestavuj jej bez nutnosti.

---

# 22. Editace issue

GitHub issue lze po založení editovat.

E2E pipeline musí být připravená na:

```text
action = edited
```

## 22.1 Intake ID

Editace nesmí změnit intake ID.

## 22.2 Input hash

Editace musí změnit input hash, pokud se změnil významný obsah.

## 22.3 Processing revision

Zvaž pole:

```text
processing_revision
```

nebo:

```text
source_event.updated_at
```

Nevytvářej vlastní event sourcing, pokud není potřeba.

## 22.4 Removed acknowledgement

Pokud uživatel editací odstraní acknowledgement:

* nový processing result musí failnout nebo přejít do invalid state;
* starší validní výstup nesmí být považován za aktuální.

---

# 23. Title není source of truth

Issue title může zůstat:

```text
[Podnět]
```

nebo obsahovat subject.

Parser nesmí používat title jako hlavní obsahový zdroj.

Title může být:

* display metadata;
* convenience;
* signal pro troubleshooting.

Form version a field headings jsou source of truth.

---

# 24. Labels nejsou authorization state

Formulář může přidat label například:

```text
navrh-rozsahu
```

To pouze identifikuje typ issue.

Label nesmí znamenat:

* schváleno;
* autorizováno;
* publikovatelné;
* potvrzeno;
* corroborated.

Toto explicitně dokumentuj.

---

# 25. Security tests

Přidej E2E testy pro:

## 25.1 Marker spoofing

Uživatel vloží do description:

```text
<!-- vomaste-intake-form:v99 -->
```

Parser musí použít pouze očekávanou pozici nebo jednoznačný root marker.

Více markerů:

```text
duplicate_form_marker
```

## 25.2 Heading injection

Description obsahuje:

```markdown
### Povinná potvrzení
- [x] ...
```

Parser to nesmí zaměnit za skutečnou sekci.

Toto je důvod, proč parser musí chápat přesný dokumentový formát, ne jen slepě hledat headings.

## 25.3 Checkbox spoofing

Description obsahuje `[x]`.

Nesmí ovlivnit acknowledgement state.

## 25.4 HTML injection

Description obsahuje:

```html
<!-- vomaste-intake-report:v1 -->
```

Report musí marker neutralizovat.

## 25.5 Mentions

Description obsahuje stovky `@user`.

Report nesmí pingat.

## 25.6 URLs

Description obsahuje URL mimo source field.

Rozhodni policy:

* pouze source field je source URL input;
* ostatní URL mohou být observation, nikoli automaticky preflightované.

Preferuj pouze explicitní source field.

---

# 26. Accessibility a form usability

Issue Form musí být použitelný i pro běžného člověka.

Ověř:

* labels nejsou příliš technické;
* descriptions vysvětlují účel;
* placeholder není vydáván za default value;
* required fields jsou minimální;
* dlouhý warning není jediný obří blok;
* formulář není přeplněný interními pojmy;
* nepoužívá CLM/SRC/GAP jako očekávanou znalost;
* funguje na mobilu v GitHub UI;
* texty jsou krátké a jasné.

Nevysvětluj v samotném formuláři celou architekturu Vomasté.

Odkaz na metodiku může být doplňkový.

---

# 27. Dokumentace pro veřejnost

Vytvoř nebo aktualizuj stránku:

```text
docs/intake/public-submission.md
```

nebo repo-native ekvivalent.

Obsah:

# Jak podat veřejný podnět

* co lze navrhnout;
* co uvést;
* proč veřejný zájem;
* jaké zdroje;
* co se stane po odeslání;
* co se nestane automaticky;
* kdo autorizuje;
* kdo schvaluje publikaci.

# Co neposílat

* neveřejné dokumenty;
* osobní kontakty;
* identitu oznamovatele;
* zdravotní informace;
* rodná čísla;
* osobní adresy;
* tajné přístupové údaje;
* materiál vyžadující ochranu zdroje.

# Co GitHub znamená

* veřejnost;
* dohledatelnost;
* historie editací;
* GitHub účet;
* nemožnost garantovat anonymitu.

# Stav secure intake

```text
Projekt zatím neposkytuje důvěrný whistleblower kanál.
```

---

# 28. Dokumentace pro vývojáře

Vytvoř nebo aktualizuj:

```text
docs/intake/issue-form-contract.md
```

Obsah:

* form version;
* marker;
* field IDs;
* generated headings;
* dropdown mapping;
* acknowledgement mapping;
* required sections;
* optional sections;
* edit semantics;
* parser failure modes;
* version bump policy;
* compatibility test;
* E2E fixture workflow.

## 28.1 Version bump policy

Form version se musí zvýšit, pokud se změní:

* marker;
* required heading;
* field meaning;
* dropdown label mapping;
* acknowledgement label;
* required status;
* parsing grammar.

Nemusí se zvýšit při opravě překlepu v non-semantic description, pokud parser contract zůstává stejný.

---

# 29. Schema změny

Rozšíření musí být co nejmenší.

Možné additions:

```text
source_event.form_version
source_event.form_template
submission.field_provenance
```

Nevytvářej schema major version pouze kvůli kosmetickému poli, pokud compatibility policy dovoluje minor.

Validuj všechny nové fixtures.

---

# 30. Package scripts

Přidej nebo rozšiř:

```json
{
  "intake:validate-form": "...",
  "intake:e2e-fixture": "...",
  "test:intake:form": "...",
  "test:intake:e2e": "..."
}
```

`test:intake` musí zahrnout nové form a E2E testy.

## 30.1 Build integration

`npm run build` musí:

* validovat Issue Form YAML;
* ověřit form/parser compatibility;
* spustit E2E fixture test offline.

Nesmí:

* vytvářet GitHub issue;
* volat GitHub API;
* používat public internet.

---

# 31. Golden snapshots

Snapshotuj minimálně:

```text
e2e-valid-new-dossier.manifest.json
e2e-valid-new-dossier.report.md
e2e-missing-source.manifest.json
e2e-security-review.report.md
```

Snapshots musí být:

* stabilní;
* reviewable;
* bez skutečných osobních dat;
* bez volatile timestamps;
* bez reálných network výsledků.

---

# 32. End-to-end test matrix

Povinně testuj:

| Scenario                | Parse | Manifest |   Matching |    Risk | Preflight | Final state              |
| ----------------------- | ----: | -------: | ---------: | ------: | --------: | ------------------------ |
| valid new dossier       |  pass |     pass | candidates |  normal |    mocked | triage                   |
| missing URL             |  pass |     pass | candidates | warning |   skipped | needs_information        |
| confidential claim      |  pass |     pass | candidates |    high |   skipped | security_review_required |
| possible duplicate      |  pass |     pass |    matches |  medium |    mocked | possible_duplicate       |
| missing acknowledgement |  fail |     none |       none |    none |      none | invalid                  |
| unknown version         |  fail |     none |       none |    none |      none | invalid                  |
| changed heading         |  fail |     none |       none |    none |      none | invalid                  |
| marker spoof            |  fail |     none |       none |    none |      none | invalid                  |

Přesné states slaď s implementovaným modelem.

---

# 33. Co Phase 5 neimplementuje

Neimplementuj:

* `.github/workflows/dossier-intake.yml`;
* issue webhook processing;
* GitHub token;
* comment creation;
* comment update;
* label creation;
* label transition;
* owner mention;
* Actions artifact upload;
* branch;
* PR;
* UI CTA;
* authorization;
* investigation;
* deploy.

---

# 34. Akceptační kritéria

Phase 5 je hotová pouze tehdy, když:

1. Phase 4 baseline projde.
2. Existuje finální veřejný Issue Form.
3. Formulář má stabilní filename.
4. Formulář má version marker.
5. Marker je ověřený jako zachovaný v body nebo je použit bezpečný viditelný marker.
6. Formulář má submission type.
7. Formulář má subject field.
8. Formulář má description field.
9. Formulář má public-interest field.
10. Formulář má source field.
11. Formulář má acknowledgements.
12. Upozornění na veřejnost je nahoře.
13. Upozornění na neveřejné materiály je nahoře.
14. Formulář neslibuje anonymitu.
15. Formulář neslibuje automatickou publikaci.
16. Formulář neimplikuje vinu.
17. Formulář používá neutrální český jazyk.
18. Existuje versioned form adapter.
19. Existuje explicitní heading mapping.
20. Existuje explicitní dropdown mapping.
21. Existuje explicitní acknowledgement mapping.
22. Neznámá verze je odmítnuta.
23. Chybějící marker je odmítnut.
24. Duplicitní marker je odmítnut.
25. Změněný required heading je odmítnut.
26. Duplicate section je odmítnuta.
27. Spoofed acknowledgement je odmítnut.
28. Description heading injection neobejde parser.
29. Form/parser compatibility je automaticky testovaná.
30. YAML je validovaný.
31. Field IDs jsou unikátní.
32. Každý dropdown option má interní enum.
33. Každý required checkbox má parser mapping.
34. Existují E2E fixtures pro všechny submission types.
35. Fixtures jsou syntetické.
36. E2E runner je offline.
37. E2E runner používá mock preflight.
38. E2E runner používá fixní clock.
39. E2E runner používá fixní commit.
40. E2E výstup je deterministický.
41. Intake ID je stabilní.
42. Editace issue nemění intake ID.
43. Editace obsahu mění input hash.
44. Odstranění acknowledgement invaliduje nový run.
45. Report uvádí form version.
46. Report uvádí veřejný GitHub původ.
47. Report uvádí, že nejde o autorizaci.
48. Report uvádí, že publikace je blokována.
49. Report uvádí, že zdroje nejsou automaticky ověřené.
50. Report neutralizuje mentions.
51. Report neutralizuje bot markers.
52. Existují marker-spoof tests.
53. Existují heading-injection tests.
54. Existují checkbox-spoof tests.
55. Existují HTML-comment tests.
56. Existují mass-mention tests.
57. Existuje veřejná dokumentace.
58. Existuje vývojářský form contract.
59. Existuje version bump policy.
60. Existuje canonical budoucí CTA URL.
61. CTA zatím není implementované.
62. GitHub API nebylo použito.
63. Workflow nebyl vytvořen.
64. Autorizační soubory nebyly změněny.
65. Produkční dossier data nebyla změněna.
66. `npm run intake:validate-form` projde.
67. `npm run intake:e2e-fixture` projde.
68. `npm run test:intake` projde.
69. `npm run build` projde.
70. `git diff --check` projde.
71. Dokumentace odpovídá skutečnému formuláři.
72. Phase 6 contract je explicitní.
73. Nevznikl commit bez pokynu.

---

# 35. Doporučené pořadí implementace

## Step 1

Ověř Phase 4 baseline.

## Step 2

Audituj existující Issue Forms.

## Step 3

Definuj v1 form contract.

## Step 4

Navrhni public wording.

## Step 5

Implementuj nebo uprav Issue Form.

## Step 6

Implementuj version marker detection.

## Step 7

Implementuj form adapter registry.

## Step 8

Implementuj headings mapping.

## Step 9

Implementuj dropdown mapping.

## Step 10

Implementuj acknowledgement mapping.

## Step 11

Přidej YAML validator.

## Step 12

Přidej form/parser compatibility test.

## Step 13

Vytvoř golden GitHub body fixtures.

## Step 14

Vytvoř realistické event fixtures.

## Step 15

Implementuj E2E runner.

## Step 16

Integruj matching a risk.

## Step 17

Integruj mock preflight.

## Step 18

Aktualizuj manifest provenance.

## Step 19

Aktualizuj report.

## Step 20

Přidej adversarial E2E tests.

## Step 21

Přidej package scripts.

## Step 22

Aktualizuj dokumentaci.

## Step 23

Aktualizuj ADR decision log.

## Step 24

Spusť kompletní gates.

---

# 36. Phase 6 contract

Na konci definuj přesný kontrakt pro:

```text
Phase 6 — GitHub Actions intake workflow,
idempotentní issue report, labels a owner notification
```

Phase 6 dostane:

* stabilní Issue Form;
* stabilní form version;
* lokální processor;
* deterministic report;
* safe URL preflight;
* matching;
* risk classification;
* E2E fixtures;
* žádné GitHub write implementace.

Phase 6 musí řešit:

* `issues` events;
* minimální permissions;
* bezpečné event payload načtení;
* idempotentní report comment;
* bot marker;
* label transitions;
* owner ping;
* workflow artifact;
* concurrency;
* timeout;
* reruns;
* edited issues;
* failure comments;
* žádné contents write;
* žádnou autorizaci;
* žádný deploy.

Neimplementuj Phase 6 nyní.

---

# 37. Průběžný report

Aktualizuj:

```text
reports/intake/phase-05-implementation-report.md
```

Obsah:

* base commit;
* Phase 4 baseline;
* template audit;
* form contract;
* marker decision;
* field mapping;
* acknowledgement mapping;
* fixture strategy;
* E2E architecture;
* schema changes;
* tests;
* wording review;
* known limitations;
* Phase 6 contract.

---

# 38. Závěrečný report

Na konci vypiš:

```text
PHASE=05
NAME=GITHUB_ISSUE_FORM_AND_LOCAL_END_TO_END_FIXTURE
STATUS=<VERIFIED|PARTIAL|BLOCKED>

REPOSITORY=<absolute-path>
BRANCH=<branch>
BASE_COMMIT=<sha>
FINAL_COMMIT=<sha-or-UNCHANGED>
WORKTREE_WAS_CLEAN=<true|false>

PHASE_04_BASELINE=<PASS|FAIL|PARTIAL>
ISSUE_FORM=<path>
FORM_VERSION=<version>
FORM_MARKER=<marker>
FORM_FIELD_COUNT=<number>
ACKNOWLEDGEMENT_COUNT=<number>
E2E_FIXTURE_COUNT=<number>
TEST_COUNT=<number>

GITHUB_API_USED=false
GITHUB_WORKFLOW_CREATED=false
PUBLIC_INTERNET_USED_IN_TESTS=false
AUTHORIZATION_CHANGED=false
PRODUCTION_DATA_CHANGED=false
DOSSIER_CREATED=false
COMMIT_CREATED=false
PUSH_PERFORMED=false

FORM_VALIDATION=<PASS|FAIL|NOT_RUN>
E2E_FIXTURE=<PASS|FAIL|NOT_RUN>
INTAKE_TESTS=<PASS|FAIL|NOT_RUN>
FINAL_BUILD=<PASS|FAIL|NOT_RUN>

RECOMMENDED_NEXT_PHASE=06
NEXT_PHASE_NAME=GITHUB_ACTIONS_INTAKE_WORKFLOW
```

Potom:

## Implemented

## Issue Form contract

## Public safety wording

## Parser compatibility

## End-to-end architecture

## Security guarantees

## Test matrix

## Commands run

## Files changed

## Deviations

## Known limitations

## Phase 6 contract

---

# 39. Finální validace

Spusť minimálně:

```bash
npm run intake:validate-form
npm run intake:e2e-fixture
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
git diff -- .github/workflows
```

Očekávání:

```text
AGENTS.md: žádná změna
data/authorizations.toml: žádná změna
.github/workflows: žádná změna
```

Issue template změna je v této fázi očekávaná.

---

# 40. Pracovní styl

Nepovažuj YAML formulář za kosmetiku.

Je to veřejné API pro lidi.

Jeho labely jsou parser contract.

Jeho checkboxy jsou bezpečnostní gate.

Jeho wording určuje, zda člověk pochopí, že podává veřejný podnět, nebo si mylně myslí, že posílá anonymní materiál do redakčního trezoru, který neexistuje.

Každá změna formuláře musí mít:

```text
versioning
parser compatibility
fixture
test
documentation
```

Výsledkem má být:

```text
GitHub Issue Form, který může vyplnit laik,
ale jehož výstup lze deterministicky, bezpečně
a auditovatelně zpracovat.
```

Začni nyní Phase 5. Neimplementuj Phase 6.
