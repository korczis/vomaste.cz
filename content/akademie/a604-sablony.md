+++
title = "A604 — Šablony"
description = "Šablona je čistá prezentace nad pohledovým modelem. Sdílené komponenty, vynucené znovupoužití a proč se metadata píšou jen na jednom místě."
template = "learning-lesson.html"
weight = 1604

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A604"
level = "engineering"
estimated_minutes = 11
audience = ["vyvojar"]
objectives = [
  "Napíšete šablonu, která čte pohledový model a nic nepočítá.",
  "Použijete sdílené komponenty místo vlastního markupu.",
  "Vyhnete se ručnímu psaní metadat a tabulek.",
]
prerequisites = ["A603"]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "A605"
+++

Šablony jsou **čistě prezentační**. Data berou z pohledových modelů
(`data/generated/views/**`), nikdy z ručně psané hlavičky stránky —
adaptéry nesou jen routovací obálku.

## Sdílené komponenty

| Soubor | K čemu |
|---|---|
| `macros/ui.html` | hlavička stránky, drobečky, dlaždice, prázdné stavy, patička |
| `macros/table.html` | jediná tabulková komponenta |
| `macros/meta.html` | sociální a SEO metadata |
| `macros/learning*.html` | prvky vzdělávací vrstvy |
| `components/` | komponenty volatelné z markdownu (`callout`, `cviceni`, `cvicna_data`, `kontrola`, `prikaz`, `seznam`) |
| `partials/jsonld.html` | strukturovaná data stránky |

## Co je vynucené

**Znovupoužití komponent.** Obsahová šablona musí zavolat některou ze
sdílených `ui_*` komponent. Komponenty jsou globální — nic se
neimportuje. Výjimky jsou per-soubor a s odůvodněním, ne plošné.

**Tabulky přes jednu komponentu.** Šablona s `<table>` mimo
`macros/table.html` build shodí. Obal navíc nese typ záznamu, který provazuje
řádky se strukturovanými daty stránky.

**Metadata jen na jednom místě.** Žádná šablona nepíše značky pro sociální
sítě ručně — vydává je jediná komponenta podle politiky v datech, a kontrola po
sestavení to ověřuje.

**Žádný inline `style`.** Utility třídy, ne vlastní atributy. Kontroluje se
nad vydaným HTML.

{% <callout kind="pravidlo" title="Šablona nesmí počítat"> %}
Když šablona sečítá, filtruje napříč dossiery nebo odvozuje hodnotu, patří
ten výpočet do generátoru. Jinak vznikne druhé místo, kde se počítá totéž,
a ta dvě se rozejdou.

Test: kdyby tutéž hodnotu potřeboval export, musel by ji počítat znovu?
Pak patří do pohledového modelu.
{% </callout> %}

{% <kontrola otazka="Přidáváte nový typ stránky s vlastní hodnotou `record_type`. Co se stane při sestavení, když nic dalšího neuděláte?"> %}
Build spadne — a je to tak správně.

Politika metadat je v datech a kontrola po sestavení ji ověřuje
**obousměrně**: každý `record_type` použitý v obsahu musí mít záznam
v konfiguraci a každý záznam v konfiguraci musí být v obsahu použitý.
Chybějící ani mrtvý typ tedy neprojde.

Doplnit je potřeba, jaký typ dokumentu to je pro sociální sítě a jaký
výchozí typ pro strukturovaná data.

Za zmínku stojí, jak se ta kontrola osvědčila: přibyl typ stránky
v jednom úkolu, obousměrná brána vznikla nezávisle v jiném, a build spadl
při prvním běhu, kdy se ty dvě věci potkaly. Přesně na tohle ta kontrola
je — chytit nesoulad, o kterém nikdo neví, že ho způsobil.
{% </kontrola> %}
