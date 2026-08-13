+++
title = "C107 — Kanonický a generovaný soubor"
description = "Nejčastější a nejhůř viditelná chyba v tomhle repozitáři, a jak se jí vyhnout."
template = "learning-lesson.html"
weight = 1807

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C107"
level = "claude-code"
estimated_minutes = 7
audience = ["zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Poznáte generovaný soubor podle toho, co v něm je.",
  "Vysvětlíte, proč se ruční editace generovaného souboru ZTRATÍ.",
  "Najdete kanonický vstup ke konkrétní stránce.",
]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "C108"
+++

Text na stránce tvrzení vypadá jako soubor, který se dá opravit. Většinou
to je past.

## Dva druhy souborů

**Kanonický** je zdroj pravdy. V tomhle projektu jsou to JSON záznamy
v `data/` — tvrzení, zdroje, kauzy, mezery, entity.

**Generovaný** je výstup. Stránky v `content/dossiers/`, katalogy,
exporty, přehledy. Vznikají z kanonických dat příkazem a **při každém
buildu se přepíšou**.

{% <callout kind="protipriklad" title="Co se stane, když se opraví výstup"> %}
Uvnitř `npm run build` běží generování **dřív** než kontrola parity.
Ruční editace se tedy přepíše, build skončí zeleně a nikdo se nic
nedozví. Změna prostě zmizí — bez chyby, bez varování.

To je důvod, proč tuhle jednu věc hlídá kód a ne jen pravidlo.
{% </callout> %}

## Jak generovaný soubor poznat

Má v hlavičce `generated = true` a odkaz na svůj datový model. A hlavně:
leží v `content/dossiers/`, `content/entities/`, `content/zdroje/` nebo
`content/dokumentace/prikazy/`.

Ručně psané jsou naopak koncepty, akademie, bootcamp, příručka
a rozcestníky.

{% <prikaz kind="prompt"  note="Když si nejste jistí, tohle je nejrychlejší cesta k odpovědi."> %}
Je tenhle soubor generovaný, nebo se edituje ručně?
{% </prikaz> %}

## Kde je kanonický vstup

| Chcete opravit | Editujte |
|---|---|
| text tvrzení | `data/dossiers/<slug>/claims/clm-NN.json` **a** tabulku v `dossier.json` |
| údaje o zdroji | `data/dossiers/<slug>/sources/src-NN.json` |
| popis entity | `data/dossiers/_shared/entities/<id>.json` |
| popis příkazu | `data/tooling/<id>.json` |
| záznam o registru | `data/source-catalog/<id>.json` |

Po editaci se výstup přegeneruje:

{% <prikaz kind="terminal"> %}
npm run data:build
{% </prikaz> %}

## Proč to tak je

Kdyby se text tvrzení dal opravit na dvou místech, dřív nebo později by
se ta místa rozešla — a čtenář by nevěděl, které je platné. Jeden zdroj
pravdy je nuda, ale je to jediné, co drží.

{% <kontrola otazka="Na stránce zdroje je překlep ve jméně vydavatele. Kde ho opravíte?"> %}
V kanonickém záznamu zdroje pod `data/dossiers/…/sources/`, a pak
spustíte `npm run data:build`. Oprava přímo na stránce by zmizela při
nejbližším buildu — a nejhorší na tom je, že by to nikdo neohlásil.
{% </kontrola> %}
