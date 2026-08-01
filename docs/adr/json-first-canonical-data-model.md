# ADR: JSON/JSON-LD-first kanonický datový model

- **Stav**: accepted (mise T-028, vlastník zadal 2026-08-01)
- **Kontext úlohy**: docs/coop/TASKS.md T-028; baseline
  docs/migrations/json-first-baseline.md
- **Fáze**: A (baseline) a B (schémata + context) hotové; C (kompilátor),
  D (lossless migrátor) v implementaci; E–J (adaptéry, view modely,
  přepojení generátorů, odstranění starých zdrojů pravdy, tooling,
  finální parity gate) navazují. Tento dokument se po každé fázi
  aktualizuje — sekce „Stav implementace" na konci.

## Rozhodnutí

Kanonickým zdrojem pravdy pro všechny dossierové doménové záznamy se
stává výhradně `data/dossiers/**/*.json` (JSON validovaný JSON Schematem,
současně deterministicky interpretovatelný jako JSON-LD přes verzovaný
lokální context). Markdown v `content/dossiers/**` a `content/entities/`
se stává **generovaným Zola routing adaptérem**, Tera zůstává čistě
prezentační vrstvou a `static/data/` generovaným veřejným exportem.

## Proč Markdown front matter přestává být zdrojem pravdy

Dnešní tok (front matter → regex parsování `record-tables.mjs` → odvozené
exporty) má tři strukturální vady, které baseline změřil, ne odhadl:

1. **Composite-key problém**: 1 649 identifikátorů typu `CLM-01`/`SRC-01`
   je dossier-scoped; `CLM-01` existuje nezávisle ve všech 22 dossierech.
   Historicky už způsobil chybné spojování `SRC-##` napříč dossiery.
   Řešení: globální `@id`
   `https://vomaste.cz/id/dossiers/<slug>/claims/CLM-01`; lokální
   `identifier` zůstává jen pro UI.
2. **Dvě reprezentace, jeden ručně synchronizovaný zdroj**: tabulka
   v `_index.md` + generované detailní stránky drží konzistenci jen díky
   validátorům a regeneračním skriptům; každé redakční kolo riskuje
   drift (viz nález duplicitních kotev z 2026-07-31).
3. **Regex parsování TOML front matter** je křehké vůči víceřádkovým
   hodnotám a pořadí klíčů; JSON + AJV dává tvrdé chyby s cestou.

## Proč je JSON/JSON-LD kanonické (a ne jen výstupní dekorace)

- Každý záznam nese `@context`, stabilní `@id` a `@type` už na vstupu;
  JSON-LD expanze je součástí validace (fáze C), takže exporty nemohou
  tvrdit nic, co ve vstupních datech není.
- Context `data/dossiers/_shared/context/vomaste-v1.jsonld` je lokální a
  verzovaný; build nikdy nestahuje context ze sítě (lokální document
  loader, cizí URL = chyba). Veřejná routa `/context/v1.jsonld` je
  publikací téhož souboru.
- Slovníky (statusy tvrzení, typy entit, typy vztahů, coverage stavy)
  jsou data (`_shared/vocabularies/`), převzatá doslovně z dosavadních
  enumů — žádné přejmenování, žádná „vylepšení". Statusy zůstávají
  kategoriální: žádné confidence/truth skóre (konstituce §6, mise §5.3).

## Proč Zola stále potřebuje generované content adaptéry

Zola neumí vytvořit routu bez content souboru. Generátor (fáze E) proto
vytváří minimální `content/**` stuby (`generated = true`, odkaz na view
model, prázdné tělo) — deterministicky, kompletně regenerovatelné,
zakázané k ruční editaci (lint fáze H/J). Alternativa „nechat fakta ve
front matter" by vrátila dva zdroje pravdy, což je přesně stav, který
tato změna ruší.

## Autorizační hranice

Append-only log v `AGENTS.md` zůstává jediným lidským zdrojem autorizací;
`data/authorizations.toml` je jeho auditně navázaný index. Kompilátor
(fáze C) odmítne entity dossier bez platné reference na autorizační
záznam a odmítne kontextovou osobu vydávanou za subjekt. Migrace (fáze D)
nesmí měnit rozsah: texty, statusy, zdroje, procesní výhrady i vazby se
přenášejí byte-verně; `macinka-turek` agregát se migruje beze změny
významu — vlastnictví záznamů řeší `dossier` pole podle existujícího
`subjects` taggingu, ne přesun souborů (náhrada za zrušený T-001).

## Tok dat (cílový)

```
data/dossiers/**/*.json  (kanonická data, JSON Schema + JSON-LD validace)
        → jednotný kompilátor (scripts/data: discover/load/validate/compile)
        → compiled model (jediný vstup pro všechny konzumenty)
        → view modely + routy + navigace + graf + statistiky + exporty
        → generované content/** adaptéry → Zola/Tera HTML
        → static/data/* + manifest (SHA-256, verze schémat i contextu)
```

## Rollback strategie

Fáze A–D nemění produkční výstup (nové soubory + nástroje vedle starého
toku; `npm run build` beze změny). Do dokončení fáze H existují oba toky
souběžně a parity testy (§20 mise) drží ekvivalenci; rollback = smazání
`data/dossiers/**/*.json` a nových skriptů, staré generátory zůstávají
funkční. Teprve fáze H odstraňuje staré zdroje pravdy — až po zeleném
route/export parity gate.

## Rozšiřování schémat

`schemaVersion` je explicitní (const 1); změna tvaru = nová verze +
migrace. Obsahové bloky jsou rozšiřitelná unie (`markdown` je lossless
základ; jemnější typy se zavádějí jen tam, kde je lze bezpečně odvodit).

## Contributor workflow (cílový)

```
$EDITOR data/dossiers/<slug>/...   # úprava JSON
npm run data:validate              # shape + reference + sémantika + JSON-LD
npm run data:build                 # kompilace + generování
npm run build                      # plný web
```

Přidání autorizovaného dossieru nesmí vyžadovat úpravu šablon, navigace,
JS ani ručního seznamu slugů.

## Stav implementace

| Fáze | Stav | Commit |
|---|---|---|
| A — baseline audit | hotovo | cb357a0 (+ refresh f2d9318 po T-034) |
| B — schémata, context, loader, fixtures | hotovo | viz git log task/T-028 |
| C — kompilátor + sémantika + JSON-LD validace | hotovo | viz git log task/T-028 |
| D — lossless migrátor + parity | hotovo (v pracovním stromu) | scripts/migrations/migrate-content-to-json.mjs; report docs/migrations/json-first-migration-report.md; 1 866 kanonických souborů (835 claims / 514 sources / 81 cases / 187 gaps / 101 relations / 42 updates / 22 dossiers / 84 entit); grandfathered debt v data/dossiers/_shared/semantics-baseline.json (2× S2) |
| E — view modely + content adaptéry (staging) | hotovo | scripts/data/{build-view-models,generate-zola-content,check-generated}.mjs; 1 938 view modelů, 1 936 stubů, route parity 0/0, alias parity 179/179, determinismus ověřen; timeline (225 entries) doplněna do dossier.json |
| G — přepojení build generátorů na compiled model | hotovo (v pracovním stromu) | record-tables.mjs = tenká projekce nad compiled modelem (API beze změny); generate-stats, build-route-manifest, build-data-exports, build-search-index, build-jsonld-exports, build-graph-projections (hrany z compiled relations, uzly/pořadí z graph.toml s mirror gatem), build-navigation, build-entity-type-sections přepnuty; schémata source/dossier aditivně rozšířena o `description`/`reviewedAt` (+ context v1 term `reviewedAt`, migrátor, 535 kanonických souborů); `scripts/build/pipeline.mjs` (build\|dev\|check) je jediný orchestrační entrypoint s `data:validate` bránou; generate-authorization-candidates + generate-discovery-log zůstávají na front matter (provenienční pole entit mimo model v1 — inventář, rozhodnutí fáze H); koncepty-subtree navigace mimo kanonický model (dokumentovaná výjimka) |
| F, H–J | čeká | — |
