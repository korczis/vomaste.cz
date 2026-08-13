+++
title = "A502 — Model tvrzení"
description = "Kanonický záznam tvrzení pole po poli, včetně toho, proč má globální @id a proč musí text sedět byte na byte s přehledovou tabulkou."
template = "learning-lesson.html"
weight = 1502

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A502"
level = "data"
estimated_minutes = 12
audience = ["vyvojar", "maintainer", "editor"]
objectives = [
  "Popíšete povinná pole záznamu tvrzení.",
  "Vysvětlíte rozdíl mezi lokálním identifikátorem a globálním @id.",
  "Poznáte, proč se text tvrzení nesmí lišit od řádku v přehledové tabulce.",
]
prerequisites = ["A501"]
related_kb = ["koncepty/registr-tvrzeni.md", "koncepty/strojove-citelna-data.md"]
next = "A503"
+++

Jeden soubor `data/dossiers/<slug>/claims/clm-NN.json` = jedno tvrzení.

```json
{
  "@context": "https://vomaste.cz/context/v1.jsonld",
  "@id": "https://vomaste.cz/id/dossiers/petr-pavel/claims/CLM-01",
  "@type": "vomaste:Claim",
  "recordType": "claim",
  "identifier": "CLM-01",
  "dossier": { "@id": "https://vomaste.cz/id/dossiers/petr-pavel" },
  "text": "…",
  "status": "status-corroborated",
  "statusLabel": "CORROBORATED",
  "sources": [
    { "@id": "https://vomaste.cz/id/dossiers/petr-pavel/sources/SRC-01" },
    { "@id": "https://vomaste.cz/id/dossiers/petr-pavel/sources/SRC-02" }
  ],
  "subjects": ["pavel"],
  "order": 1
}
```

## Dvě identity, každá k něčemu jinému

**`identifier`** (`CLM-01`) je lokální — v rámci jednoho dossieru. Používá
ho UI, protože „CLM-01“ se v tabulce čte líp než URL.

**`@id`** je globální a je to skutečná identita záznamu. Tvar
`https://vomaste.cz/id/dossiers/<slug>/claims/CLM-01` dělá kolizi napříč
dossiery mechanicky nemožnou — `CLM-01` existuje v každém, ale globální
`@id` je jen jedno.

## Vazby jsou obousměrné

Tvrzení odkazuje na zdroje a zdroj odkazuje zpět na tvrzení. Validátor
požaduje, aby obě strany souhlasily. Nedá se tedy dostat do stavu, kdy
tvrzení cituje zdroj, který o něm neví.

## `subjects`

Redakční údaj: koho se tvrzení **doopravdy týká**. Není odvoditelný
z grafu — je to rozhodnutí. Slouží k tomu, aby entity dossiery mohly
zobrazovat filtrovaný pohled na tatáž data bez jediné kopie.

{% <callout kind="pravidlo" title="Text musí sedět byte na byte"> %}
Přehledová tabulka na hlavní stránce dossieru je ručně psaná — je to to,
co editor edituje spolu se záznamy. Validátor tabulkové parity build
shodí, když se text, stav, popisek nebo seznam zdrojů v řádku liší od
kanonického záznamu, nebo když si množiny neodpovídají 1:1 v obou
směrech.

Jsou to schválně dvě reprezentace téže věci — a jediné dvě, které v tomhle
datovém modelu existují. Všechno ostatní je generované.
{% </callout> %}

{% <kontrola otazka="Chcete opravit překlep v textu tvrzení. Kolik souborů musíte změnit?"> %}
**Dva** — a je to jediné místo v celém datovém modelu, kde je to takhle.

1. `data/dossiers/<slug>/claims/clm-NN.json`, pole `text`.
2. Odpovídající řádek přehledové tabulky v `dossier.json`.

Když opravíte jen jedno, validátor tabulkové parity build shodí. To je
záměr: kdyby se ty dvě reprezentace mohly rozejít potichu, čtenář by
v tabulce viděl jiné znění než na stránce tvrzení a nikdo by nevěděl,
které platí.

Zbytek — stránka tvrzení, registrový index, exporty, strukturovaná data,
počty na dlaždicích — se **generuje**. Ty se nikdy neupravují ručně; ruční
úprava se při dalším sestavení tiše přepíše.

Po opravě obou míst se pustí `npm run data:build`, který adaptéry
přegeneruje.
{% </kontrola> %}
