+++
title = "A508 — Generovaný obsah"
description = "content/ je adaptér, ne zdroj. Proč se ruční úprava generované stránky tiše přepíše a jak se to pozná."
template = "learning-lesson.html"
weight = 1508

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A508"
level = "data"
estimated_minutes = 10
audience = ["vyvojar", "maintainer"]
objectives = [
  "Rozliší se vám generovaný a ručně psaný obsah.",
  "Víte, proč se ruční úprava generované stránky ztratí bez chybové hlášky.",
  "Umíte ověřit podezřelý rozdíl v content/.",
]
prerequisites = ["A507"]
related_kb = ["koncepty/strojove-citelna-data.md", "koncepty/verzovano-v-gitu.md"]
next_route = "@/akademie/a601-architektura.md"
next_label = "A601 — Architektura repozitáře (úroveň Inženýrství)"
+++

Generátor webu potřebuje ke každé routě soubor. Kanonická data jsou ale
JSON. Řeší to **adaptéry**: minimální stránky s ukazatelem na pohledový
model, generované z dat.

## Co je generované a co ne

**Generované** (nikdy needitovat ručně):

- `content/dossiers/<slug>/_index.md`
- `content/dossiers/<slug>/{claims,sources,cases,gaps,relations}/*.md`
- `content/entities/*.md`

**Ručně psané**: koncepty, dokumentace, manifest, kořenové rozcestníky,
tenké routovací indexy uvnitř dossierů — a tahle vzdělávací vrstva.

{% <callout kind="varovani" title="Ruční úprava se ztratí bez chybové hlášky"> %}
Uvnitř plné brány běží synchronizace obsahu **dřív** než kontrola parity.
Ruční změna generované stránky se proto přepíše, kontrola pak porovnává
už přepsaný strom a **nic nehlásí**. Build zůstane zelený a vaše změna
prostě zmizí.

Kontrola front matter tomu nepomůže — ta se dívá jen na hlavičku, ne na
tělo.
{% </callout> %}

## Jak ověřit podezřelý rozdíl

Když rozdíl v `content/` vypadá divně, pusťte kontrolu parity **samostatně**,
mimo pipeline:

```bash
npm run data:check-generated:content
```

Nad nesynchronizovaným stromem chybu ohlásí — na rozdíl od běhu uvnitř
brány.

## Správný postup změny

```bash
$EDITOR data/dossiers/<slug>/…   # kanonický JSON
npm run data:validate            # rychlá kontrola
npm run data:build               # pohledové modely + adaptéry
npm run build                    # plná brána
```

{% <kontrola otazka="Kolega tvrdí, že opravil překlep na stránce tvrzení, ale po sestavení je tam zase. Co se stalo?"> %}
Editoval **generovaný adaptér** místo kanonických dat.

Stránka pod `content/dossiers/<slug>/claims/` je odvozený soubor. Při
dalším `data:build` nebo plné bráně se přepsal obsahem vygenerovaným
z JSON záznamu — a protože synchronizace běží před kontrolou parity, nikdo
to neohlásil.

Oprava patří do `data/dossiers/<slug>/claims/clm-NN.json`. A protože jde
o text tvrzení, i do odpovídajícího řádku přehledové tabulky
v `dossier.json` — jinak spadne parita tabulky.

Poznávací znamení: generované stránky nesou v hlavičce příznak, že jsou
generované, a ukazatel na pohledový model. Když ho v souboru vidíte,
needitujete zdroj.
{% </kontrola> %}
