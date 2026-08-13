---
name: academy-lesson
description: Vytvoří nebo aktualizuje lekci Akademie či Bootcampu podle skutečného schématu vzdělávací vrstvy — frontmatter, cíle, prerekvizity, řetěz next, cvičení na syntetických datech a odkazy na kanonické koncepty. Použij ho, když má vzniknout nová lekce, nebo když se změnilo něco, co některá lekce popisuje.
argument-hint: "<kód lekce nebo téma> [úroveň]"
---

Zápis do vzdělávací vrstvy. **Riziko: review-required** — lekce
učí lidi pracovat, takže špatná lekce je horší než žádná.

## Kdy ho použít

- Vzniká nová lekce Akademie nebo úkol Bootcampu.
- Změnilo se něco, co existující lekce popisuje.
- Přibyla schopnost, kterou se lidé mají naučit používat.

## Kdy ho NEPOUŽÍT

- **K definici pojmu.** Kanonické znění vlastní `content/koncepty/*`.
  Lekce pojem **aplikuje**, nikdy ho nedefinuje podruhé. Druhá definice
  slova „sporné" je drift, ne didaktika.
- **K dokumentaci příkazu.** Katalog příkazů je generovaný. Lekce na
  něj odkazuje, neopisuje ho.
- **Na referenční lookup.** Na to je Příručka, ne lekce.

## Nepodkročitelné: cvičná data jsou vymyšlená

Všechno v cvičeních je fiktivní, označené `synthetic = true`, cvičné URL
v rezervovaném jmenném prostoru (RFC 2606). Kontrola L13 shodí build,
pokud se cvičný identifikátor objeví v `data/dossiers/**`.

Nacvičovat klasifikaci obvinění na skutečném člověku by znamenalo psát
o něm nedoložená tvrzení. **Výuka nesmí být zadními vrátky k rozšíření
rozsahu.**

## Struktura lekce

Lekce je Zola stránka v `content/akademie/` (nebo `content/bootcamp/`)
se strukturovaným `[extra]`. Skutečný tvar si ověř na existující lekci —
tohle je zkratka, ne autorita:

```toml
+++
title = "A104 — Taxonomie stavů"
description = "<jedna věta: co lekce učí a proč>"
template = "learning-lesson.html"
weight = <řadí v sekci>

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A104"
level = "<id úrovně z data/learning.toml>"
estimated_minutes = <číslo>
audience = ["<id z [[audiences]]>"]
objectives = [
  "<sloveso v 2. os. mn. č.: Popíšete… Vysvětlíte… Odvodíte…>",
]
related_kb = ["koncepty/<slug>.md"]
next = "<kód další lekce>"
+++
```

## Co validátor vynucuje

`npm run validate:learning` (v `build` i `check`) shodí build při:

- neznámé sekci, úrovni nebo audience;
- prerekvizitě na neexistující lekci;
- `next` do prázdna;
- duplicitním `lesson_id`;
- osiřelé lekci (nedosažitelné z žádné cesty);
- odkazu na neexistující stránku příručky nebo konceptu;
- cvičném identifikátoru, který se objeví v reálných datech (L13);
- rozporu mezi lekcí o stavech a skutečnou taxonomií (L12).

Nový `lesson_id` musí zapadnout do **řetězu**: něco na něj musí
odkazovat přes `next` nebo prerekvizitu, jinak je osiřelý.

## Postup

1. **Ověř, že lekce má vzniknout.** Existuje už něco, co to učí?
   Rozšířit je lepší než přidat.
2. **Zvol úroveň a kód.** Úrovně jsou v `data/learning.toml`
   (`[[levels]]`). Kód navazuje na pořadí v úrovni.
3. **Napiš cíle jako ověřitelné.** „Poznáte rozdíl mezi zastavením
   stíhání a zproštěním" ano; „Pochopíte důležitost zdrojů" ne.
4. **Odkaž na kanonické koncepty**, ne na vlastní vysvětlení.
5. **Napiš cvičení** na syntetických datech, s jednoznačným řešením.
6. **Zapoj do řetězu**: `next` z předchozí lekce, prerekvizity.
7. **Ověř**: `npm run validate:learning`, pak `npm run build`.

## Výstup

```
LEKCE:       <kód> — <titulek>
SEKCE/ÚROVEŇ: <sekce> / <úroveň>
CÍLE:        <ověřitelné, po bodech>
KONCEPTY:    <na které kanonické stránky odkazuje>
CVIČENÍ:     <syntetická data — která fixture>
ŘETĚZ:       <odkud se sem dá dostat> → <kam vede next>
VALIDACE:    npm run validate:learning → <výsledek>
ZBÝVÁ:       <co musí projít člověk>
```

## Co skill NEUDĚLÁ

- Nenapíše definici pojmu — odkáže na koncept.
- Nepoužije skutečnou osobu, kauzu ani tvrzení ve cvičení.
- Neopíše katalog příkazů.
- Nenechá lekci osiřelou.

## Příklady

**Základní.** Nová lekce o rozdílu mezi kandidátem a ověřeným zdrojem →
úroveň `research`, tři ověřitelné cíle, cvičení na fiktivním článku,
`next` na lekci o zdrojových rodinách.

**Realistický.** Změnil se význam stavu tvrzení. Zasažené: kanonický
koncept (tam se mění definice), lekce A104, Bootcamp 01, cvičení a
příručka. Skill musí říct, že **primární změna je v konceptu** a lekce
se opravují tak, aby ho aplikovaly.

**Selhání.** Návrh použít ve cvičení skutečný nedávný případ, „ať je to
zajímavé". Odmítnout: cvičení by obsahovalo tvrzení o skutečném člověku
bez zdrojů a bez rozsahu. Kontrola L13 by to navíc shodila.

## Související

`/kb-entry` (referenční záznam), `/docs-sync` (co ještě projít),
`.claude/rules/learning.md`, `data/learning.toml`.
