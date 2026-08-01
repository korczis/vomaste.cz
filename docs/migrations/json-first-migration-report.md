# JSON-first migrace — report fáze D (T-028)

**Generuje**: `npm run data:migrate` (scripts/migrations/migrate-content-to-json.mjs) —
tento soubor se při každém běhu deterministicky přegenerovává, ručně needitovat.
Strojová verze včetně úplné mapy „starý soubor → nové @id":
`data/generated/migration-report.json` (gitignored, regenerovatelná).

Migrace POUZE ČTE dnešní zdroje pravdy (content/**, data/dossiers.toml,
data/authorizations.toml, data/dossiers/*/{graph,updates}.toml) a zapisuje
kanonické JSON balíčky do `data/dossiers/**`. Zdrojové soubory zůstávají
autoritou až do fáze H.

## Počty migrovaných záznamů

| typ | počet |
|---|---|
| case | 81 |
| claim | 835 |
| dossier | 22 |
| entity | 84 |
| gap | 187 |
| relation | 101 |
| source | 514 |
| update | 42 |

| dossier | claims | sources | cases | gaps | relations | updates |
|---|---|---|---|---|---|---|
| adam-vojtech | 50 | 32 | 3 | 13 | 2 | 3 |
| alena-schillerova | 40 | 22 | 4 | 8 | 2 | 1 |
| ales-juchelka | 46 | 19 | 5 | 13 | 1 | 3 |
| andrej-babis | 76 | 53 | 16 | 6 | 37 | 1 |
| boris-stastny | 39 | 18 | 3 | 10 | 1 | 2 |
| filip-turek | 0 | 0 | 0 | 0 | 0 | 0 |
| igor-cerveny | 57 | 36 | 4 | 14 | 1 | 3 |
| ivan-bednarik | 47 | 29 | 2 | 9 | 3 | 3 |
| jaromir-zuna | 53 | 32 | 4 | 11 | 1 | 3 |
| jaroslav-faltynek | 8 | 5 | 2 | 2 | 2 | 1 |
| jeronym-tejc | 51 | 23 | 3 | 10 | 1 | 3 |
| karel-havlicek | 46 | 31 | 3 | 11 | 2 | 3 |
| lubomir-metnar | 25 | 6 | 4 | 11 | 1 | 1 |
| macinka-turek | 49 | 56 | 4 | 7 | 33 | 2 |
| martin-sebestyan | 44 | 27 | 3 | 14 | 2 | 3 |
| oto-klempir | 43 | 28 | 5 | 7 | 1 | 1 |
| petr-macinka | 0 | 0 | 0 | 0 | 0 | 0 |
| richard-chlad | 8 | 3 | 2 | 2 | 3 | 1 |
| robert-plaga | 54 | 32 | 3 | 12 | 1 | 3 |
| tomio-okamura | 35 | 27 | 5 | 8 | 1 | 1 |
| tunde-bartha | 8 | 5 | 2 | 4 | 5 | 1 |
| zuzana-mrazova | 56 | 30 | 4 | 15 | 1 | 3 |

## Klíčová rozhodnutí

1. **Vlastnictví záznamů macinka-turek**: záznamy fyzicky pod
   `content/dossiers/macinka-turek/` migrují s `dossier` =
   `macinka-turek` — agregát je i v kanonickém JSON fyzický domov
   kanonických záznamů. Pole `subjects` (tagging z
   `scripts/dossier/tag-subjects.mjs`) se přenáší beze změny; případný
   „decoupling" vlastnictví na `petr-macinka`/`filip-turek` je
   samostatné redakční rozhodnutí MIMO fázi D (viz ADR, náhrada za
   zrušený T-001).
2. **Kanonický zdroj hran je `graph.toml`**; detailní stránka
   `relations/<edge-id>.md` dodává tělo a `subjects` a musí s hranou
   souhlasit (mirror kontrola, nesoulad = chyba). Stejná mirror kontrola
   platí pro `[[extra.cases]]` bloky ↔ case stránky.
3. **Texty byte-verně**: claim `text` = front matter `summary`; celé
   Markdown tělo každé detailní stránky (po odstranění front matter,
   trim) je jediný `{"type":"markdown"}` content blok — žádná
   segmentace, žádné přepisy, žádná nová faktická pole, žádné
   confidence/truth skóre.
4. **`updated` u entity views**: `petr-macinka` a `filip-turek`
   nemají vlastní `updated` (ani updates.toml) — deterministicky
   přebírají `updated` kanonického dossieru `macinka-turek`.
5. **Dossier `title` je z registru** `data/dossiers.toml`;
   stránkový title (`_index.md`) se liší jen u `macinka-turek`
   („Dossier — …") a zůstává v content/ jako prezentační text.
6. **`discovered_at` entit se nemapuje na `snapshotDate`** —
   `snapshotDate` je dle schématu government-roster snímek
   (`government_snapshot`); směšovat s datem objevení by měnilo význam.
   `discovered_at`/`discovered_via` zůstávají v content/entities do
   rozhodnutí fází E–H (viz inventář nepřenesených polí níže).
7. **Vícero `[[updates]]` zápisů téhož dne**: předpoklad fáze B „jeden
   vstup na datum" reálná data nesplňují (11 z 20 updates.toml má víc
   append-only zápisů se stejným datem — postupné pracovní seance).
   Slévání zápisů by nebylo lossless (zánik záznamů, konkatenace textů),
   odmítnutí by znemožnilo migraci; zvoleno minimální rozšíření
   identifikátoru o deterministický pořadový sufix
   (`2026-07-30`, `2026-07-30-2`, …) podle stabilního append-only
   pořadí v TOML + odpovídající úprava vzorů
   `updateGlobalId`/`updateIdentifier` v schemas/canonical/
   (zdokumentováno přímo v `$comment` schémat). Pole `date` zůstává
   čisté datum.
8. **`[[extra.timeline]]` bloky `_index.md` se migrují lossless**
   (fáze E prerekvizita): každý blok = jeden entry
   `{ date, title, anchor?, dot?, subjects? }` v druhém contentBlocku
   `{ "type": "timeline", "entries": [...] }` dossier.json — pořadí
   vstupu zachováno, žádná deduplikace, `date` byte-verně (včetně
   českého volného formátu, viz `$comment` timelineEntry
   v schemas/canonical/_defs.schema.json). Parita počtu entries i
   date/title je součást runParityChecks.

## Known-baseline-violations (grandfathered debt)

Sémantická porušení zděděná 1:1 z dnešního obsahu. Migrace data nemění,
proto je nemůže „opravit"; místo toho je zapisuje do explicitního
allowlistu `data/dossiers/_shared/semantics-baseline.json`, který
sémantická brána (`scripts/data/validate-semantics.mjs`) čte: záznam
v allowlistu = warning, jakékoli NOVÉ porušení mimo allowlist = chyba.
Pravidla S5/S6 (autorizace) grandfatherovat nelze.

- `https://vomaste.cz/id/dossiers/andrej-babis/claims/CLM-50` — pravidlo S2: andrej-babis/claims/clm-50.json: status-corroborated cituje 2 zdroj(e) z 1 source family/families — definice badge vyžaduje ≥2 zdroje z ≥2 nezávislých rodin
- `https://vomaste.cz/id/dossiers/andrej-babis/claims/CLM-51` — pravidlo S2: andrej-babis/claims/clm-51.json: status-corroborated cituje 2 zdroj(e) z 1 source family/families — definice badge vyžaduje ≥2 zdroje z ≥2 nezávislých rodin

## Anomálie a jednotlivá rozhodnutí běhu

- dossier filip-turek: _index.md nemá "updated" — převzato z kanonického dossieru macinka-turek (2026-07-29)
- dossier macinka-turek: title v registru ("Petr Macinka a Filip Turek") ≠ title stránky ("Dossier — Petr Macinka a Filip Turek") — kanonický title je z data/dossiers.toml, stránkový zůstává v content/ do fáze H
- dossier petr-macinka: _index.md nemá "updated" — převzato z kanonického dossieru macinka-turek (2026-07-29)
- relation macinka-turek/edge-babis-vlada: pole "note" ("Nesporné veřejné pozadí (kdo je premiérem), ne tvrzení dokládané vlastním zdrojem tohoto dossieru.") nemá v kanonickém schématu ekvivalent — zůstává v graph.toml/content do fáze H
- updates adam-vojtech: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates ales-juchelka: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates boris-stastny: 1 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates igor-cerveny: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates ivan-bednarik: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates jaromir-zuna: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates jeronym-tejc: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates karel-havlicek: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates macinka-turek: 1 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates martin-sebestyan: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates robert-plaga: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)
- updates zuzana-mrazova: 2 zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)

## Inventář polí, která kanonické schéma nepřenáší

Následující front matter klíče kanonická schémata (schemas/canonical/)
záměrně nemají; hodnoty NEZANIKAJÍ — zdrojové soubory zůstávají v repu
beze změny až do fáze H, kde se o každém poli rozhodne (přenést do
schémat v2 / přesunout do prezentační vrstvy / zahodit). Strukturální
klíče (`dossier`, `record_type`, `lang`, `template`, `weight`,
`title`/`description` tam, kde jen duplikují jiná pole) plně nahrazuje
kanonická obálka a umístění souboru.

| typ záznamu | klíč | výskytů |
|---|---|---|
| entity | `claims` | 73 |
| entity | `cluster` | 16 |
| entity | `depth` | 84 |
| entity | `description` | 16 |
| entity | `discovered_at` | 84 |
| entity | `discovered_via` | 84 |
| entity | `government_office` | 16 |
| entity | `government_party` | 16 |
| entity | `sources` | 73 |
| entity | `subject` | 84 |
| claim | `aliases` | 45 |
| source | `aliases` | 52 |
| gap | `aliases` | 6 |
| relation | `note` | 1 |

Pozn.: `aliases` u claim/source/gap stránek (staré routy) nemá v
schématech claim/source/gap ekvivalent — routing aliasy převezme
generátor content adaptérů (fáze E) přímo z view modelu; u entit se
`aliases` přenáší jako `routeAliases`, u dossierů jako `aliases`.

## Co zůstává fázím E–G

- **E**: generátor content/** adaptérů (stubů) z kanonických dat.
- **F**: view modely pro šablony.
- **G**: přepojení dnešních generátorů/exportů na compiled model
  (case→sources unie do exportního tvaru, aliasy rout, timeline).
- **H**: odstranění starých zdrojů pravdy — teprve pak přestává platit
  „content/ je autorita" a inventář výše se musí vyřešit beze zbytku.
