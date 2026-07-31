# Datový kontrakt (workbench mise, Fáze 1 — T-017)

Kanonický tok dat a jeho vynucování. Souvisí:
[mise](missions/2026-07-30-workbench-master-prompt.md) § 5,
[baseline audit](audits/information-architecture-baseline.md) § 5,
[`schemas/README.md`](../schemas/README.md).

## Kanonický zdroj → normalizace → konzumenti

```
content/dossiers/**/*.md   data/dossiers.toml   data/dossiers/<slug>/graph.toml
content/entities/*.md      data/government.toml
        │                        │                      │
        └────────┬───────────────┘                      │
                 ▼                                      ▼
  scripts/dossier/lib/record-tables.mjs      lib/jsonld-shared.mjs#readGraphToml
  (JEDINÝ parser front matter → řádky)       (JEDINÝ parser graph.toml pro exporty)
                 │
   ┌─────────────┼──────────────────┬───────────────────┐
   ▼             ▼                  ▼                   ▼
 build:data-  build:jsonld-      validate:schemas    (další generátory čtou
 exports      exports            (AJV brána)          buď řádky, nebo výstupy
 /data/*.json /data/*.jsonld                          předchozích kroků)
```

Pravidlo § 1.4 mise: generované artefakty (`static/data/`,
`data/generated/`, `static/search-index.json`, stats.toml) se **nikdy**
needitují ručně — jsou gitignorované a každý build je přepíše.

## Kde se data upravují

Jen v kanonických zdrojích: front matter záznamů
(`content/dossiers/<slug>/{claims,sources,cases,gaps,relations}/*.md`),
registr `data/dossiers.toml`, graf `data/dossiers/<slug>/graph.toml`,
roster `data/government.toml`, globální entity `content/entities/*.md`
(roster stránky generuje `build:government-roster`, ručně se nepřepisují).

## Jak přidat nové pole záznamu

Čtyři místa, jinak je změna nedokončená (rozšíření původního „three
places" pravidla z CLAUDE.md):

1. front matter schéma daného typu (obsah),
2. `scripts/dossier/lib/record-tables.mjs` (normalizovaný řádek),
3. `schemas/<kind>.schema.json` (kontrakt — `additionalProperties:
   false` jinak build spadne, což je záměr: žádné pole bez validátoru),
4. konzument (šablona / export / view-model) — pole bez uživatele
   schéma nepřijímá koncepčně (recenze), technicky ho odhalí mrtvý kód
   v record-tables.

## Dělba práce validátorů (jedno pravidlo, jeden vlastník)

| Vrstva | Vlastník | Příklady |
|---|---|---|
| Tvar (typy, povinnost, formáty ID/URL, uzavřený status enum) | `validate:schemas` (AJV, `schemas/*.schema.json`) | `CLM-\d+`, `retrieved` = ISO datum, claim ≥ 1 zdroj |
| Referenční integrita registrů | `validate:dossier` | CLM↔SRC křížové odkazy, duplicitní ID |
| Sémantika grafu | `validate:graph`, `validate:graph-coverage` | povolené typy vztahů, hrany kryté claims/sources, pokrytí záznamů mapou |
| Autorizace subjektů | `validate:authorization` (+ append-only log gate) | žádný obsah o osobě bez záznamu v AGENTS.md |
| Struktura entity/aggregate | `validate:dossier-types` | kdo vlastní fyzické záznamy |
| JSON-LD poctivost + integrita | `verify:jsonld`, `verify:export` | zákaz ClaimReview/ratingů, manifest sha256, přepočet citačních otisků, @id↔routes.json |

## Identifikátory jsou složený klíč `(dossier, id)`

`CLM-01`, `SRC-01`, `CASE-01` i `GAP-01` jsou číslované **po dossierech**, ne
globálně. Každý dossier začíná od jedničky, takže 472 zdrojů má dohromady jen
55 různých hodnot `src_id` a 32 z nich sdílí víc dossierů. Klíčem je vždy
dvojice `(dossier, id)`.

Kdo to přehlédne, dostane tiché nafouknutí místo chyby. Změřeno na skutečných
datech přes `static/data/*.json`:

| join `claims` → `sources` | řádků |
|---|---|
| `ON s.dossier = c.dossier AND s.src_id = t.sid` | 1 141 — shoduje se se `sum(source_count)` |
| `ON s.src_id = t.sid` (bez `dossier`) | 17 633 — nafouknutí 15,5× |

Přesně tuhle chybu dělala `templates/partials/jsonld.html` do commitu `ce59cf8`:
překládala odkazy tvrzení průchodem přes všechny dossiery, takže 94 % vložených
citací ukazovalo na záznamy nesouvisejících osob. Vada byla jen ve strojově
čitelné vrstvě — viditelné stránky byly správně, a proto ji lidská kontrola
nemohla zachytit.

Uvnitř repozitáře invariant hlídá `validate:dossier` (referenční integrita
v rámci dossieru) a `verify:jsonld` job 4 (citace odpovídají deklarovaným
zdrojům). Pro **externí konzumenty** plochých exportů žádná brána neexistuje —
proto je správný tvar joinu předvedený jako příklad v SQL konzoli a limity jsou
uvedené přímo na stránce `/data/`.

## Prezentační index adresáře

`static/data/dossiers.json` slouží jako jediný vstup pro adresář dossierů
(tabulka / seznam / dlaždice na `/` a `/dossiers/`). Staví ho
`scripts/dossier/lib/record-tables.mjs` z kanonických zdrojů:

| údaj | zdroj |
|---|---|
| identita, typ, subjekt | `data/dossiers.toml` |
| počty záznamů | `data/dossiers/<slug>/stats.toml` (generuje `generate-stats.mjs`) |
| popis, `updated`, `reviewed_at` | front matter `content/dossiers/<slug>/_index.md` |
| routy registrů | `data/generated/navigation.json` (generuje `build-navigation.mjs`) |

Routy se **čtou** z navigačního manifestu, neskládají se z řetězců —
manifest je kanonický, takže přejmenování registru se projeví na jednom
místě. Počty se nikdy nepíšou do šablony; test
`scripts/ui/dossier-directory.test.mjs` je porovnává se `stats.toml`.

Není to druhý významový model: jde o prezentační projekci týchž front
matter dat, ze kterých vzniká `@graph` v `build-jsonld-exports.mjs`.
Rozhodnutí a jeho důsledky popisuje
[ADR o adresáři](adr/dossier-directory-multi-view.md).

## Odvozené hodnoty

Počty (tvrzení, zdrojů, kauz, mezer, entit, vztahů) generuje
`generate:stats` do `data/dossiers/<slug>/stats.toml`; šablony je čtou
odtud. Ručně psaný počet v šabloně = bug (audit § 5 žádný nenašel;
prevence: recenze + budoucí lint ve Fázi 8).

## Rozhodnutí: AJV (mini-ADR)

Přidána dev-závislost `ajv` (build-time only, nic se neservíruje
klientovi). Alternativa „vlastní mini-validátor" odmítnuta: schémata
používají draft 2020-12 (`additionalProperties`, `enum`, `pattern`,
`items`, nullable typy) a vlastní implementace by byla větší údržbová
plocha než standardní, všude auditovaný AJV — přesně případ, kdy
`adr` disciplína repa závislost povoluje (měřená potřeba: 8 schémat,
207+ řádků, brána v každém buildu).
