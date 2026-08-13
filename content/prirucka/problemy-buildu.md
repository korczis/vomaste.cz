+++
title = "Řešení problémů: build a šablony"
description = "Šest pádů, které přijdou až při sestavení nebo po něm — včetně těch, kde chyba není tam, kde se ohlásila."
template = "learning-lesson.html"
weight = 2402

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "problem"
estimated_minutes = 8
audience = ["vyvojar", "maintainer"]
+++

## Rozbitá kotva

- **Znamená**: odkaz míří na `id`, které ve vydaném HTML není.
- **Příčina**: překlep, přeformulovaný text (kotva zanikla), nebo změna
  struktury generované stránky.
- **Najdete**: kontrola kotev po sestavení; hláška uvádí zdroj i cíl.
- **Opravíte**: obnovíte kotvu, nebo přesměrujete odkaz. **Nemažte
  odkaz jen proto, aby brána zmlkla** — rozpad tím nezmizí, jen o něm
  nikdo nebude vědět.
- **Předejdete**: při přeformulování textu zkontrolujte, kdo na něj
  odkazuje.

## Neznámý typ stránky

- **Znamená**: `record_type` použitý v obsahu nemá záznam v konfiguraci
  metadat — nebo naopak záznam existuje a nic ho nepoužívá.
- **Příčina**: nový typ stránky bez doplnění konfigurace; nebo zbytek po
  smazaném obsahu.
- **Najdete**: kontrola metadat po sestavení.
- **Opravíte**: doplníte, nebo odstraníte — kontrola je **obousměrná**.
- **Předejdete**: nový typ stránky = i záznam v konfiguraci, jedním
  zásahem.

## Příkaz bez záznamu v katalogu

- **Znamená**: nový npm skript nemá doprovodný záznam.
- **Příčina**: skript přidán bez záznamu.
- **Najdete**: kontrola katalogu příkazů.
- **Opravíte**: doplníte záznam a přegenerujete katalog.
- **Předejdete**: je to schválně — díky téhle bráně nemůže dokumentace
  příkazů zaostat za kódem.

## Ruční úprava generované stránky zmizela

- **Znamená**: změna se ztratila a build zůstal zelený.
- **Příčina**: uvnitř brány běží synchronizace obsahu **dřív** než
  kontrola parity, takže se úprava přepíše místo ohlášení.
- **Najdete**: pusťte kontrolu parity **samostatně**:
  `npm run data:check-generated:content`.
- **Opravíte**: změnu udělejte v kanonických datech.
- **Předejdete**: generovaný soubor poznáte podle příznaku v hlavičce.

## Komponenta se vykreslí prázdná

- **Znamená**: rámeček je na stránce, obsah v něm chybí, build je zelený
  a nic se neohlásilo.
- **Příčina**: tělo komponenty čte jiné jméno parametru, než jaké je
  v hlavičce — a `| safe` na tom řádku chybu spolkne.
- **Najdete**: v postavené stránce. Ve zdroji to nepoznáte, protože
  syntakticky je všechno v pořádku.
- **Opravíte**: srovnáte jméno v hlavičce `{% component %}` s tím, co
  tělo skutečně vypisuje.
- **Předejdete**: `| safe` jen tam, kde vědomě vpouštíte hotové HTML.
  `{{ x }}` build shodí, když `x` neexistuje; `{{ x | safe }}` tiše
  nevypíše nic — viz [A603](@/akademie/a603-zola.md).

## Zeleno lokálně, červeno v automatizaci

- **Znamená**: rozdíl prostředí, ne kódu.
- **Příčina**: jiná verze nástroje, citlivost na velikost písmen v cestách,
  časový limit úlohy, nebo odvozený soubor, který u vás zbyl
  z předchozího běhu.
- **Najdete**: pusťte lokálně **přesně ten příkaz**, který selhal.
- **Opravíte**: podle příčiny; u odvozených souborů ověřte v čerstvém
  klonu.
- **Předejdete**: čas od času postavte projekt z prázdného adresáře —
  najdete tím skryté závislosti.
