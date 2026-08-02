# Claude Code Prompt — Phase 3 of N

# Entity matching, deduplikace a deterministická risk classification

Pracuješ v repozitáři:

```text
~/dev/vomaste.cz
```

Toto je **Phase 3** implementace veřejného dossier-intake workflow.

Phase 2 měla dodat:

* versioned event input schema;
* versioned intake manifest schema;
* syntetické fixtures;
* lokální offline procesor;
* bezpečný parser issue formuláře;
* normalizovaný intake manifest;
* deterministické ID a provenance;
* Markdown report;
* test suite;
* package scripts;
* Phase 2 implementation report.

Než začneš implementovat, najdi a přečti skutečné výstupy předchozích fází.

Preferované cesty:

```text
docs/adr/ADR-public-dossier-intake.md
reports/intake/phase-01-repository-audit.md
reports/intake/phase-01-architecture-inventory.md
reports/intake/phase-01-threat-model.md
reports/intake/phase-01-implementation-plan.md
reports/intake/phase-02-implementation-report.md
schemas/intake-event.schema.json
schemas/intake.schema.json
scripts/intake/**
tests/intake/**
```

Použij skutečné názvy a cesty repozitáře.

Pokud Phase 2 není dokončena nebo neprojde:

```bash
npm run intake:fixture
npm run test:intake
npm run build
```

neimplementuj Phase 3 na rozbitém základu.

Nejdřív přesně popiš blocker a oprav pouze chyby Phase 2, které přímo brání této fázi.

---

# 0. Mise Phase 3

Rozšiř lokální intake procesor o dvě oddělené deterministické vrstvy:

1. **candidate matching a deduplikaci**
2. **risk classification**

Cílový tok:

```text
validovaný intake manifest
→ načtení kanonického entity/dossier indexu
→ extrakce identifikátorů a kandidátních jmen
→ deterministická normalizace
→ přesné a omezené podobnostní porovnání
→ vysvětlitelné candidate matches
→ duplicate intake detection
→ deterministická risk classification
→ rozšířený manifest
→ aktualizovaný report
→ testy
```

Výstup nesmí rozhodnout:

* že jde o stejnou osobu;
* že jde o nový subject;
* že je podnět pravdivý;
* že je osoba vinná;
* že je téma autorizované;
* že je dossier publikovatelný.

Výstup smí pouze říct:

```text
možná shoda
pravděpodobná duplicita
konflikt identifikátorů
vyžaduje lidské posouzení
obsahuje určitý typ rizikového vstupu
```

---

# 1. Nepřekročitelné invarianty

## 1.1 Matching není identifikace

Žádný match nesmí být prezentován jako definitivní identita bez jednoznačného oficiálního identifikátoru.

Například:

```text
stejné IČO
```

může být strong exact match organizace.

Ale:

```text
stejné jméno
```

není důkaz, že jde o stejnou fyzickou osobu.

Každý match musí mít:

```text
match_type
score
confidence_class
matched_fields
conflicting_fields
reasons
manual_review_required
```

## 1.2 Risk flag není skutkový závěr

Risk classifier nesmí tvrdit:

```text
podání je nepravdivé
uživatel lže
došlo k trestnému činu
osoba je pachatel
zdroj je nedůvěryhodný
```

Smí tvrdit pouze:

```text
text obsahuje formulaci trestního obvinění
text obsahuje možné osobní údaje
podání neobsahuje žádnou veřejnou URL
text zmiňuje anonymní zdroj
podání vyžaduje security review
```

## 1.3 Fail-closed

Nejasné identity neslučuj.

Pokud existuje více podobně silných kandidátů:

```text
resolution_status = ambiguous
manual_review_required = true
```

Pokud se identifikátory rozcházejí:

```text
resolution_status = conflicting_identifiers
```

Nikdy nevybírej kandidáta jen proto, že má nejvyšší skóre o několik setin.

## 1.4 Žádná síť

Phase 3 musí být plně offline.

Nesmí:

* otevírat URL;
* dotazovat registry;
* volat Meilisearch server;
* používat externí API;
* používat LLM;
* používat Prismatic;
* používat GitHub API.

Může číst pouze lokální kanonická nebo generovaná data repozitáře.

## 1.5 Žádné produkční změny

Procesor nesmí:

* vytvořit entitu;
* změnit entitu;
* vytvořit alias;
* změnit dossier;
* vytvořit claim;
* vytvořit relation;
* zapisovat do autorizačních registrů;
* měnit produkční JSON-LD;
* automaticky opravovat duplicity datasetu.

Pouze reportuje kandidáty.

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
npm run test:intake
npm run build
```

Zaznamenej:

```text
PHASE_02_BASELINE
INTAKE_FIXTURE
INTAKE_TESTS
FULL_BUILD
```

Pokud working tree obsahuje změny z předchozí fáze:

* nemaž je;
* nerozlišuj je podle odhadu;
* použij `git diff`;
* zaznamenej skutečný base state;
* nedotýkej se unrelated souborů.

---

# 3. Audit existujících entity dat

Než vytvoříš matcher, zjisti skutečný datový model.

Zmapuj minimálně:

* entity ID;
* entity type;
* canonical name;
* aliases;
* previous names;
* organization names;
* IČO;
* datová schránka;
* LEI;
* VAT ID;
* birth date, pokud dataset legitimně používá;
* role/title;
* organization affiliation;
* dossier IDs;
* routes/slugs;
* JSON-LD identifiers;
* external registry identifiers;
* source provenance.

Vytvoř nebo aktualizuj dokument:

```text
reports/intake/phase-03-matching-inventory.md
```

Tabulka:

| Field | Path | Entity types | Unique | Validated | Safe for matching | Weight |
| ----- | ---- | ------------ | -----: | --------: | ----------------: | -----: |

Nevěř názvu pole.

Zjisti:

* kdo jej zapisuje;
* kdo jej validuje;
* zda je skutečně vyplněné;
* kolik záznamů jej používá;
* zda obsahuje historické nebo nekanonické hodnoty.

---

# 4. Canonical matching index

Nevytvářej matcher, který při každém podnětu chaoticky prochází celý strom souborů a pokaždé jiným způsobem.

Použij jednu z variant podle architektury repa:

## Varianta A

Znovu použij existující generovaný entity index.

## Varianta B

Vytvoř read-only index builder:

```text
scripts/intake/build-matching-index.mjs
```

Výstup musí být derived artifact, nikoli nový zdroj pravdy.

Preferovaný model:

```json
{
  "schema_version": "1.0.0",
  "generated_from_commit": "...",
  "entities": [
    {
      "entity_id": "example-person",
      "entity_type": "person",
      "canonical_name": "Jan Testovací",
      "normalized_name": "jan testovaci",
      "aliases": [],
      "normalized_aliases": [],
      "identifiers": {
        "ico": null,
        "databox": null,
        "lei": null
      },
      "dossier_ids": [],
      "publication_role": "context",
      "dossier_status": "not_authorized"
    }
  ]
}
```

## 4.1 Index požadavky

Index musí být:

* deterministický;
* stabilně řazený;
* validovaný;
* bez nepotřebných narativních textů;
* bez claims;
* bez source body;
* bez citlivých údajů, které matching nepotřebuje;
* read-only;
* reprodukovatelný z kanonických dat;
* vhodný pro unit tests.

## 4.2 Index nesmí

* měnit source data;
* opravovat aliases;
* slučovat entity;
* vytvářet nové IDs;
* přepisovat dataset;
* používat síť.

---

# 5. Normalizace identit

Implementuj jednotlivé normalizace jako malé čisté funkce.

Preferovaná struktura:

```text
scripts/intake/matching/
  normalize-person-name.mjs
  normalize-organization-name.mjs
  normalize-identifier.mjs
  tokenize-name.mjs
  compare-identifiers.mjs
  score-name-match.mjs
  rank-candidates.mjs
  match-entities.mjs
```

## 5.1 Obecné zásady

Normalizace musí být:

* deterministická;
* vysvětlitelná;
* reverzibilně auditovatelná;
* oddělená od raw hodnot;
* testovaná na češtinu;
* konzervativní.

Raw hodnotu nikdy nepřepisuj.

## 5.2 Unicode

Použij dokumentovanou Unicode normalizaci, typicky NFC nebo NFKC pouze s jasným důvodem.

Otestuj:

* českou diakritiku;
* složené a rozložené znaky;
* non-breaking space;
* zero-width characters;
* různé druhy apostrofů;
* spojovníky;
* en dash;
* em dash;
* bidi controls;
* homoglyphs.

Bidi controls a zero-width znaky neodstraňuj potichu.

Přidej observation nebo risk flag.

## 5.3 Osobní jména

Normalizace může:

* trimovat;
* zkolabovat whitespace;
* převést case;
* oddělit akademické tituly;
* normalizovat interpunkci;
* vytvořit variantu bez diakritiky pro comparison;
* zachovat původní jméno;
* rozlišit pořadí jméno/příjmení pouze jako variantu.

Nesmí automaticky:

* určit gender;
* určit národnost;
* určit rodné příjmení;
* slučovat podobná příjmení;
* opravovat překlep bez evidence.

## 5.4 Tituly

Vytvoř explicitní seznam běžných titulů pouze pokud repo takový seznam již nemá.

Například:

```text
Bc.
Mgr.
Ing.
JUDr.
MUDr.
Ph.D.
CSc.
doc.
prof.
```

Titul ignoruj pro základní name match, ale zachovej jej jako observation.

Neuděluj bonus za stejný titul vyšší než za shodu identity.

## 5.5 Organizace

Normalizace organizací může oddělit právní suffixy:

```text
s.r.o.
a.s.
z.s.
o.p.s.
SE
v.o.s.
k.s.
```

Raw jméno zachovej.

Vytvoř:

```text
canonical_comparison_name
legal_form
```

Neignoruj automaticky suffix, pokud by to vytvářelo kolize.

Například:

```text
Příklad, a.s.
Příklad, s.r.o.
```

mohou být dvě různé entity.

## 5.6 IČO

Implementuj:

* odstranění mezer;
* zachování leading zero;
* přesně osm číslic;
* kontrolu českého IČO checksumu;
* valid/invalid observation.

Neplatné IČO nesmí být použito jako exact identity match.

## 5.7 Datová schránka a další IDs

Používej pouze identifikátory skutečně přítomné v datasetu.

Pro každý definuj:

* syntax normalization;
* case policy;
* validity;
* uniqueness expectation;
* conflict behavior.

Nevymýšlej podporu identifikátoru, který nikdo nepoužívá.

---

# 6. Match classes

Definuj explicitní třídy shod.

Preferovaný model:

```text
EXACT_IDENTIFIER
EXACT_CANONICAL_NAME
EXACT_ALIAS
NORMALIZED_NAME
TOKEN_EQUIVALENT
NEAR_NAME
CONFLICTING_IDENTIFIER
AMBIGUOUS
NO_MATCH
```

## 6.1 Exact identifier

Příklady:

* stejné validní IČO;
* stejná datová schránka;
* stejný stabilní externí identifier.

Výstup:

```json
{
  "match_type": "exact_identifier",
  "confidence_class": "very_high",
  "manual_review_required": true
}
```

I exact identifier stále vyžaduje lidské review v intake flow.

## 6.2 Exact canonical name

Stejné normalizované jméno bez dalšího identifikátoru.

Pro osoby:

```text
confidence_class = medium
```

Pro organizace záleží na právní formě a identifikátorech.

## 6.3 Alias match

Alias musí být skutečně kanonicky uložený alias.

Nesmí vzniknout tím, že parser sám odhadl přezdívku.

## 6.4 Near-name match

Použij pouze jako candidate retrieval.

Nikdy jako automatic resolution.

Musí vždy:

```text
manual_review_required = true
```

## 6.5 Identifier conflict

Pokud jméno silně odpovídá, ale validní identifikátor se liší:

```text
match_type = conflicting_identifier
confidence_class = conflict
```

Takový kandidát nesmí být prezentován jako pravděpodobná shoda.

---

# 7. Scoring model

Nepoužívej neprůhledné skóre bez vysvětlení.

Každé skóre musí být složené z pojmenovaných komponent.

Například:

```json
{
  "total_score": 0.92,
  "components": [
    {
      "rule": "normalized_canonical_name_equal",
      "weight": 0.55,
      "value": 1.0,
      "contribution": 0.55
    },
    {
      "rule": "legal_form_equal",
      "weight": 0.10,
      "value": 1.0,
      "contribution": 0.10
    },
    {
      "rule": "identifier_equal",
      "weight": 0.35,
      "value": 0.78,
      "contribution": 0.27
    }
  ]
}
```

## 7.1 Doporučené pořadí důkazní síly

1. validní jednoznačný identifier;
2. více konzistentních identifiers;
3. canonical name + identifier;
4. exact alias;
5. exact normalized name;
6. token-equivalent name;
7. near-name similarity.

## 7.2 Zakázané score signals

Nepoužívej:

* počet claims;
* počet kauz;
* medializaci;
* počet relations;
* authorization status jako identity evidence;
* popularity;
* search rank;
* dossier completeness.

To, že je někdo slavný, neznamená, že je každý člověk stejného jména právě on. Překvapivě.

## 7.3 Thresholdy

Pokud Phase 1 neposkytla kalibraci, označ thresholdy:

```text
UNVALIDATED_HEURISTIC
```

Použij je pouze pro:

```text
candidate ranking
```

nikoli pro automatic merge.

---

# 8. String similarity

Nejdřív ověř, zda repo již používá knihovnu nebo algoritmus.

Pokud ne:

* preferuj malou vlastní implementaci;
* nebo existující lehkou dependency, pokud je již instalována;
* nepřidávej velký fuzzy-search framework.

Možné metriky:

* normalized Levenshtein;
* Jaro-Winkler;
* token set similarity.

Použij nejvýše jednu nebo dvě, ne algoritmický bufet.

## 8.1 Požadavky

Similarity musí být:

* bounded 0–1;
* deterministická;
* testovaná;
* bez catastrophic complexity;
* omezená maximální délkou vstupu;
* používána až po levnějších exact checks;
* oddělená pro person a organization.

## 8.2 Short names

U krátkých jmen nesmí malá edit distance automaticky znamenat vysokou důvěru.

Příklad:

```text
Novák
Novotný
```

musí být penalizován podle délky a token structure.

## 8.3 Token order

Pro osobní jména můžeš porovnat:

```text
Jan Novák
Novák Jan
```

jako token-equivalent variantu.

Ale:

```text
Jan Pavel Novák
Jan Novák
```

je stále pouze candidate match.

---

# 9. Candidate extraction z intake

Phase 2 má `subject_text` a případně další pole.

Implementuj omezenou deterministickou extrakci kandidátů.

## 9.1 Bez AI

Phase 3 nesmí používat NER model ani LLM.

Podporuj pouze:

* explicitní subject field;
* explicitní organization identifier field, pokud existuje;
* explicitní IČO pattern;
* explicitní seznam subjektů, pokud formát existuje.

Nevytahuj automaticky každé velké písmeno z popisu jako osobu.

## 9.2 Candidate model

```json
{
  "candidate_id": "candidate-001",
  "candidate_type": "unknown",
  "raw_label": "Společnost Příklad s.r.o.",
  "normalized_label": "spolecnost priklad",
  "extracted_identifiers": {
    "ico": "01234567"
  },
  "source_field": "subject_text"
}
```

## 9.3 Candidate type

Typ může být:

```text
person
organization
institution
unknown
```

Typ určuj pouze z explicitního inputu nebo velmi konzervativních znaků.

Například validní IČO silně naznačuje organization.

Jméno samo nestačí k jistému určení person.

---

# 10. Entity candidate matches

Rozšiř manifest například o:

```json
{
  "matching": {
    "dataset_commit": "...",
    "index_schema_version": "1.0.0",
    "candidate_subjects": [
      {
        "candidate_id": "candidate-001",
        "input": {},
        "resolution_status": "possible_matches",
        "matches": [
          {
            "entity_id": "spolecnost-priklad",
            "entity_type": "organization",
            "match_type": "exact_identifier",
            "score": 1.0,
            "confidence_class": "very_high",
            "matched_fields": [
              "ico"
            ],
            "conflicting_fields": [],
            "reasons": [
              "valid_ico_equal"
            ],
            "manual_review_required": true
          }
        ]
      }
    ]
  }
}
```

## 10.1 Stabilní řazení

Matches řaď:

1. confidence class;
2. score descending;
3. match type priority;
4. entity ID ascending.

Stejný input musí vytvořit stejné pořadí.

## 10.2 Limit kandidátů

Omez výstup například na top 10.

Zachovej:

```text
total_candidates_considered
total_matches_above_floor
matches_returned
```

Neukládej stovky slabých shod do reportu.

## 10.3 Match floor

Pod určitou podobností kandidáta vůbec nevracej.

Threshold musí být dokumentovaný a testovaný.

---

# 11. Duplicate intake detection

Phase 3 má detekovat možné duplicity podnětů, pokud existuje lokální dataset předchozích intake artifacts nebo fixtures.

Nezaváděj databázi.

## 11.1 Co je duplicita

Možné signály:

* stejné repository + issue number;
* stejný intake ID;
* stejný normalized subject;
* překryv stejných submitted URLs;
* stejný validní identifier;
* velmi podobný description hash;
* stejné téma a subject.

## 11.2 Typy duplicity

```text
same_issue
exact_subject_identifier
same_subject_and_sources
similar_subject_and_description
possible_related_submission
no_duplicate
```

## 11.3 Nedělej automatický merge

Výstup:

```json
{
  "duplicate_status": "possible_duplicate",
  "candidates": [],
  "manual_review_required": true
}
```

Procesor nesmí:

* zavřít issue;
* označit issue;
* sloučit manifests;
* přepsat starší podání;
* vybrat kanonickou issue.

## 11.4 Local artifact source

Použij pouze skutečnou Phase 1 artifact strategy.

Pokud předchozí intake manifests nejsou lokálně dostupné, implementuj interface a fixture adapter.

Nevymýšlej produkční store.

---

# 12. Risk classification

Implementuj deterministický classifier.

Preferovaná struktura:

```text
scripts/intake/risk/
  constants.mjs
  detect-personal-data.mjs
  detect-sensitive-material-claims.mjs
  detect-adverse-allegation-language.mjs
  detect-anonymous-source-language.mjs
  detect-injection-markers.mjs
  classify-intake-risk.mjs
```

## 12.1 Risk model

Každý flag musí obsahovat:

```json
{
  "code": "contains_possible_personal_contact_data",
  "severity": "high",
  "category": "privacy",
  "source_field": "description_text",
  "evidence": {
    "kind": "pattern_match",
    "redacted_excerpt": "t***@example.cz"
  },
  "effect": "manual_security_review_required",
  "explanation": "Text obsahuje řetězec odpovídající e-mailové adrese.",
  "detector_version": "1.0.0"
}
```

## 12.2 Severity

Použij omezený enum:

```text
info
low
medium
high
critical
```

Critical musí být vzácné a mechanicky odůvodněné.

## 12.3 Kategorie

```text
privacy
security
editorial
legal_review
data_quality
workflow
abuse
```

Nevydávej právní závěr.

`legal_review` znamená pouze potřebu lidského posouzení.

---

# 13. Povinné risk flags

Implementuj minimálně:

```text
missing_public_interest_basis
missing_source_urls
contains_nonpublic_material_claim
contains_confidentiality_request
contains_possible_email_address
contains_possible_phone_number
contains_possible_postal_address
contains_sensitive_personal_data_terms
contains_unnamed_source_language
contains_serious_adverse_allegation_language
contains_criminal_allegation_language
contains_threat_language
contains_doxxing_pattern
contains_prompt_injection_language
contains_shell_instruction_language
contains_hidden_unicode_controls
contains_mass_mentions
possible_existing_subject
possible_duplicate_intake
conflicting_entity_identifiers
manual_security_review_required
```

Každý flag musí mít přesný význam.

## 13.1 Missing source URLs

To není důkaz, že podnět je nepravdivý.

Je to:

```text
data_quality warning
```

## 13.2 Criminal allegation language

Detekuj pouze výrazy jako:

```text
krádež
podvod
úplatek
korupce
trestný čin
zpronevěra
vydírání
```

Výstup musí říct:

```text
text contains criminal allegation language
```

nikoli:

```text
criminal allegation confirmed
```

## 13.3 Unnamed source language

Příklady:

```text
můj známý říkal
interní zdroj
člověk z firmy
nemohu říct kdo
anonymní svědek
```

Pouze flag.

## 13.4 Nonpublic material claim

Příklady:

```text
mám interní dokument
neveřejná smlouva
uniklý e-mail
tajná nahrávka
posílám přílohu
```

Flag musí vést minimálně na:

```text
manual_security_review_required
```

## 13.5 Personal data

Detekce musí být konzervativní.

E-mail a telefon lze rozpoznávat patternem.

Poštovní adresu a zdravotní údaje označ jako heuristiku.

Neloguj celý nalezený údaj.

Použij redacted evidence.

---

# 14. Risk effects

Každý flag může mít workflow effect.

Příklad:

| Flag                              | Severity | Effect                   |
| --------------------------------- | -------: | ------------------------ |
| missing_source_urls               |   medium | needs_information        |
| contains_nonpublic_material_claim |     high | security_review_required |
| contains_possible_email_address   |     high | security_review_required |
| possible_duplicate_intake         |   medium | possible_duplicate       |
| possible_existing_subject         |     info | manual_review            |
| conflicting_entity_identifiers    |     high | manual_review            |
| prompt_injection_language         |      low | audit_only               |

## 14.1 Precedence

Definuj deterministickou precedence:

```text
security_review_required
> invalid
> needs_information
> possible_duplicate
> triage
```

Nepoužívej risk score k automatické autorizaci nebo zamítnutí.

## 14.2 Workflow states

Po Phase 3 procesor smí nastavit pouze:

```text
intake_status:
  triage
  needs_information
  possible_duplicate
  security_review_required

authorization_status:
  pending_owner

publication_status:
  blocked
```

Nikdy:

```text
authorized
publishable
published
```

---

# 15. Pattern safety

Regexy mohou být samy bezpečnostní díra.

Požadavky:

* žádný catastrophic backtracking;
* bounded input;
* přednost jednoduchým token checks;
* regexy benchmarkuj na dlouhém adversarial inputu;
* nepoužívej nested unbounded quantifiers;
* testuj 100k znaků, pokud limit dovoluje;
* každý detector musí mít časový limit nepřímo přes bounded input.

Pokud regex není nutný, použij lineární scan.

---

# 16. Redaction

Risk evidence nesmí zveřejnit osobní údaj znovu.

Implementuj:

```text
redact-email
redact-phone
redact-url-credentials
redact-long-numeric-identifiers
```

Příklady:

```text
tom***@example.cz
+420 *** *** 123
https://***:***@example.cz/
```

Raw manifest submission může obsahovat původní veřejný issue text, ale risk report nesmí osobní údaj zvýraznit celý.

---

# 17. Report

Rozšiř Markdown report o:

```markdown
## Možné shody v datasetu

### Kandidát 1

- Vstup:
- Typ:
- Stav rozlišení:
- Počet možných shod:

| Entita | Typ shody | Skóre | Důvody | Konflikty |
|---|---|---:|---|---|

> Možná shoda není potvrzení identity.

## Možné duplicitní podněty

...

> Automat podněty neslučuje ani nezavírá.

## Rizikové příznaky

| Závažnost | Kód | Vysvětlení | Dopad |
|---|---|---|---|

> Rizikový příznak není skutkový ani právní závěr.
```

## 17.1 Report requirements

* žádné raw osobní údaje v evidence;
* žádné aktivní mentions;
* žádné implicitní obvinění;
* jasné disclaimer texty;
* stabilní řazení;
* maximálně omezený počet matches;
* human-readable reasons.

---

# 18. Schema změny

Rozšiř intake manifest schema o:

```text
matching
duplicate_detection
risk_classification
workflow_decision
```

## 18.1 Versioning

Pokud jde o backward-compatible optional fields:

* rozhodni podle repo versioning policy.

Pokud se required structure mění:

* increment schema version.

Nepřepiš Phase 2 schema bez migrace fixtures.

## 18.2 Compatibility

Procesor musí umět:

* načíst Phase 2 manifest;
* obohatit jej na Phase 3 manifest;
* nebo zpracovat event rovnou do nové verze.

Vyber jednu jasnou cestu.

Preferuj pipeline:

```text
event
→ base manifest
→ matching enrichment
→ risk enrichment
→ final validation
```

---

# 19. Testy matching

Vytvoř syntetický entity dataset.

Minimálně:

```text
Jan Testovací
Jan Pavel Testovací
Jan Testovaci
Testovací Jan
Jana Testovací
Společnost Příklad s.r.o.
Společnost Příklad a.s.
Příklad Holding SE
Obec Testov
Město Testov
```

Test cases:

## Exact

* exact entity ID;
* exact IČO;
* exact databox;
* exact canonical name;
* exact alias.

## Normalized

* case differences;
* diacritics;
* whitespace;
* title stripping;
* swapped personal name order;
* legal form normalization.

## Conflict

* same name, different IČO;
* same IČO, different name;
* alias collision;
* multiple persons with same name;
* organization suffix mismatch.

## Near matches

* one-character typo;
* missing middle name;
* short surname;
* unrelated similar surname;
* token reordering.

## Ambiguity

* two equal-scoring candidates;
* no decisive identifier;
* multiple exact normalized names.

## Limits

* long name;
* many aliases;
* many candidates;
* Unicode controls;
* homoglyph.

---

# 20. Testy risk classifieru

Vytvoř syntetické věty.

## Privacy

* e-mail;
* telefon;
* možná adresa;
* datum narození;
* zdravotní údaj;
* žádný osobní údaj.

## Confidentiality

* „Mám interní dokument.“
* „Posílám neveřejnou smlouvu.“
* „Nechci zveřejnit své jméno.“
* běžný veřejný zdroj bez confidentiality.

## Adverse language

* trestní obvinění;
* finanční obvinění;
* neurčitá kritika;
* neutrální otázka;
* citace titulku zdroje.

## Anonymous source

* „můj známý z úřadu“;
* „anonymní zaměstnanec“;
* „podle veřejné výroční zprávy“.

## Injection

* prompt injection;
* shell command;
* Markdown marker spoof;
* HTML comment;
* mass mentions;
* normal technical text.

## False positives

Povinně přidej false-positive tests.

Například:

```text
Článek pojednává o trestním právu obecně.
```

nesmí automaticky znamenat, že podání obviňuje subject z trestného činu.

---

# 21. Property a determinism tests

Testuj:

* stejné entity v jiném pořadí indexu;
* stejné aliases v jiném pořadí;
* stabilní match ordering;
* stabilní scores;
* stabilní report;
* stabilní manifest hash;
* duplicate detector bez závislosti na filesystem ordering;
* risk flags ve stabilním pořadí;
* žádná závislost na locale systému;
* žádná závislost na timezone;
* žádná závislost na aktuálním datu.

---

# 22. Performance

Změř:

* vytvoření indexu;
* matching jednoho kandidáta;
* matching deseti kandidátů;
* risk classification maximálního povoleného textu;
* celou fixture pipeline.

Cíle:

```text
entity index do několika tisíc entit: lineární nebo n log n build
jedno intake matching: rozumně pod 1 s
risk classification: lineární k délce textu
```

Neoptimalizuj předčasně, ale neimplementuj O(n²) string comparison přes celý dataset bez candidate filtering.

## 22.1 Candidate filtering

Použij levný předvýběr:

* identifier map;
* normalized exact-name map;
* first token / surname bucket;
* organization token bucket.

Near-name similarity nespouštěj na každou entitu bez omezení.

---

# 23. Package scripts

Přidej nebo rozšiř:

```json
{
  "intake:index": "...",
  "intake:match-fixture": "...",
  "test:intake:matching": "...",
  "test:intake:risk": "..."
}
```

Pokud `test:intake` již existuje, musí zahrnout nové testy.

`npm run intake:fixture` má po Phase 3 vytvořit obohacený manifest a report.

---

# 24. Dokumentace

Aktualizuj:

```text
docs/intake/entity-matching.md
docs/intake/risk-classification.md
docs/intake/intake-manifest.md
docs/intake/local-processor.md
reports/intake/phase-03-implementation-report.md
```

Použij repo-native strukturu.

## 24.1 Matching dokumentace

Popiš:

* source data;
* index;
* normalizace;
* match classes;
* scoring;
* thresholds;
* ambiguity;
* conflicts;
* manual review;
* limitations.

## 24.2 Risk dokumentace

Popiš:

* každý flag;
* severity;
* category;
* effect;
* false positives;
* redaction;
* versioning;
* workflow precedence;
* co classifier netvrdí.

## 24.3 ADR

Aktualizuj decision log:

```text
Phase 3 implemented
matching model
risk model
schema version
known limitations
```

---

# 25. Statické bezpečnostní gates

Přidej testy nebo kontrolu, která potvrzuje:

* `scripts/intake/**` nepoužívá síť;
* matcher nezapisuje produkční entity;
* classifier nezapisuje autorizaci;
* žádný kód nenastavuje `authorized`;
* žádný kód nenastavuje `published`;
* žádný kód nespouští `git`;
* žádný kód nespouští `gh`;
* žádný kód nespouští externí proces z issue textu.

Pozor na falešné pozitivy v dokumentaci a test strings.

Kontroluj executable paths, ne celý repozitář bez rozlišení.

---

# 26. Co Phase 3 neimplementuje

Explicitně nezaváděj:

* síťový URL preflight;
* DNS;
* redirect handling;
* GitHub Actions;
* GitHub labels;
* issue comments;
* web CTA;
* externí AI;
* NER model;
* Prismatic;
* automatic authorization;
* entity creation;
* entity merge;
* dossier creation;
* claims;
* source verification;
* source family corroboration;
* pull request;
* merge;
* deploy.

---

# 27. Akceptační kritéria

Phase 3 je hotová pouze tehdy, když:

1. Phase 2 baseline projde.
2. Existuje zdokumentovaný entity matching inventory.
3. Je jasný kanonický source datasetu.
4. Existuje deterministic matching index.
5. Index je derived artifact.
6. Index je stabilně řazený.
7. Index neobsahuje zbytečná citlivá data.
8. Existuje normalizace osobních jmen.
9. Existuje normalizace organizací.
10. Existuje normalizace IČO.
11. IČO checksum je testovaný.
12. Existují match classes.
13. Existuje vysvětlitelné score.
14. Každý score obsahuje components.
15. Exact identifier má prioritu.
16. Name-only match nikdy automaticky neslučuje osobu.
17. Conflicting identifiers jsou explicitní.
18. Ambiguous candidates jsou explicitní.
19. Každý match vyžaduje manual review.
20. Match output je stabilně řazený.
21. Počet returned matches je omezený.
22. Near matching používá candidate filtering.
23. Matching je offline.
24. Matching nemění produkční data.
25. Existuje duplicate intake detector.
26. Duplicate detector nic automaticky nezavírá.
27. Duplicate detector nic automaticky neslučuje.
28. Existuje deterministický risk classifier.
29. Každý risk flag má code.
30. Každý risk flag má severity.
31. Každý risk flag má category.
32. Každý risk flag má explanation.
33. Každý risk flag má effect.
34. Risk evidence je redacted.
35. Risk classifier nevydává právní závěry.
36. Risk classifier nevydává skutkové závěry.
37. Existuje flag pro nonpublic material.
38. Existuje flag pro personal contact data.
39. Existuje flag pro anonymous source language.
40. Existuje flag pro criminal allegation language.
41. Existuje flag pro prompt injection.
42. Existuje flag pro hidden Unicode controls.
43. Existuje flag pro possible duplicate.
44. Existuje flag pro conflicting identifiers.
45. Workflow precedence je deterministická.
46. Authorization status zůstává `pending_owner`.
47. Publication status zůstává `blocked`.
48. Procesor neumí vytvořit `authorized`.
49. Procesor neumí vytvořit `published`.
50. Report obsahuje candidate matches.
51. Report obsahuje duplicate section.
52. Report obsahuje risk section.
53. Report obsahuje disclaimery.
54. Report nespouští mentions.
55. Existují exact-match tests.
56. Existují ambiguity tests.
57. Existují identifier conflict tests.
58. Existují near-match tests.
59. Existují false-positive tests.
60. Existují privacy tests.
61. Existují injection tests.
62. Existují Unicode tests.
63. Existují performance measurements.
64. Existují determinism tests.
65. Není použita síť.
66. Není použit GitHub API.
67. Není použita AI.
68. Nebyla vytvořena entita.
69. Nebyl vytvořen dossier.
70. Nebyla změněna autorizace.
71. Nebyl vytvořen workflow.
72. Dokumentace odpovídá implementaci.
73. `npm run intake:fixture` projde.
74. `npm run test:intake` projde.
75. `npm run build` projde.
76. `git diff --check` projde.
77. Nevznikl commit bez pokynu.
78. Phase 4 contract je explicitní.

---

# 28. Doporučené pořadí implementace

## Step 1

Ověř Phase 2 baseline.

## Step 2

Audituj entity fields a existující indexy.

## Step 3

Navrhni matching index contract.

## Step 4

Implementuj index builder nebo adapter.

## Step 5

Implementuj identifier normalization.

## Step 6

Implementuj person-name normalization.

## Step 7

Implementuj organization-name normalization.

## Step 8

Implementuj exact matching.

## Step 9

Implementuj alias matching.

## Step 10

Implementuj constrained near matching.

## Step 11

Implementuj explainable scoring.

## Step 12

Implementuj ambiguity a conflict handling.

## Step 13

Implementuj duplicate detector.

## Step 14

Navrhni risk taxonomy.

## Step 15

Implementuj privacy detectors.

## Step 16

Implementuj security/injection detectors.

## Step 17

Implementuj editorial risk detectors.

## Step 18

Implementuj risk precedence.

## Step 19

Rozšiř manifest schema.

## Step 20

Rozšiř report.

## Step 21

Přidej fixtures a testy.

## Step 22

Přidej package scripts.

## Step 23

Aktualizuj dokumentaci a ADR.

## Step 24

Spusť kompletní gates.

Po každém kroku spusť nejmenší relevantní test.

---

# 29. Phase 4 contract

Na konci vytvoř přesný kontrakt pro Phase 4:

```text
Bezpečný URL preflight a SSRF hardening
```

Phase 4 má dostat:

* syntakticky normalizované URL;
* risk flags z Phase 3;
* publication blocked state;
* offline manifest;
* žádné důvěrné credentials;
* žádné raw attachments.

Definuj:

* URL input contract;
* DNS resolver contract;
* IP classification;
* redirect policy;
* timeout;
* response limit;
* content-type policy;
* metadata extraction limit;
* output schema;
* test harness;
* mock HTTP server requirements;
* network isolation.

Neimplementuj to v Phase 3.

---

# 30. Průběžný report

Aktualizuj:

```text
reports/intake/phase-03-implementation-report.md
```

Obsah:

* base commit;
* Phase 2 baseline;
* matching inventory;
* matching index;
* scoring decisions;
* thresholds;
* risk taxonomy;
* false positives;
* performance;
* schema changes;
* tests;
* commands;
* known limitations;
* Phase 4 contract.

---

# 31. Závěrečný report

Na konci vypiš:

```text
PHASE=03
NAME=ENTITY_MATCHING_DEDUPLICATION_AND_RISK_CLASSIFICATION
STATUS=<VERIFIED|PARTIAL|BLOCKED>

REPOSITORY=<absolute-path>
BRANCH=<branch>
BASE_COMMIT=<sha>
FINAL_COMMIT=<sha-or-UNCHANGED>
WORKTREE_WAS_CLEAN=<true|false>

PHASE_02_BASELINE=<PASS|FAIL|PARTIAL>
MATCHING_INDEX=<path>
MATCHING_INDEX_ENTITY_COUNT=<number>
MATCH_RULE_COUNT=<number>
RISK_FLAG_COUNT=<number>
FIXTURE_COUNT=<number>
TEST_COUNT=<number>

NETWORK_USED=false
GITHUB_API_USED=false
AI_USED=false
AUTHORIZATION_CHANGED=false
PRODUCTION_ENTITY_CHANGED=false
DOSSIER_CREATED=false
WORKFLOW_CREATED=false
COMMIT_CREATED=false
PUSH_PERFORMED=false

INTAKE_FIXTURE=<PASS|FAIL|NOT_RUN>
INTAKE_TESTS=<PASS|FAIL|NOT_RUN>
FINAL_BUILD=<PASS|FAIL|NOT_RUN>

RECOMMENDED_NEXT_PHASE=04
NEXT_PHASE_NAME=SAFE_URL_PREFLIGHT_AND_SSRF_HARDENING
```

Potom:

## Implemented

## Matching architecture

## Matching rules

## Risk taxonomy

## Security guarantees

## False-positive handling

## Performance

## Tests

## Commands run

## Files changed

## Deviations

## Known limitations

## Phase 4 contract

---

# 32. Finální validace

Spusť minimálně:

```bash
npm run intake:fixture
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
žádné změny
```

Pokud byly soubory změněné před začátkem, zaznamenej to a nedotýkej se jich.

---

# 33. Pracovní styl

Pracuj autonomně a konzervativně.

Nevymýšlej ML systém tam, kde stačí několik explicitních map a pravidel.

Nevydávej podobnost za identitu.

Nevydávej risk flag za vinu.

Nevydávej score za epistemickou pravdu.

Nevytvářej skrytou automatickou deduplikaci.

Výsledkem má být nudně čitelný systém:

```text
„Tento kandidát odpovídá, protože má stejné validní IČO.“
```

ne:

```text
„AI má pocit, že je to asi on.“
```

Začni nyní Phase 3. Neimplementuj Phase 4.
