+++
title = "A101 — Co je dossier"
description = "Dossier jako datová struktura, ne jako článek. Proč je rozdělený na registry a co z toho plyne pro čtení i psaní."
template = "learning-lesson.html"
weight = 1101

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A101"
level = "foundations"
estimated_minutes = 8
audience = ["ctenar", "zdroje", "research"]
objectives = [
  "Popíšete dossier jako strukturu čtyř provázaných registrů, ne jako text.",
  "Vysvětlíte, proč má každý záznam vlastní stránku místo řádku v tabulce.",
  "Odvodíte, co z té struktury plyne pro dohledatelnost.",
]
related_kb = ["koncepty/co-je-dossier.md", "koncepty/strojove-citelna-data.md"]
next = "A102"
+++

Slovo „dossier“ svádí představit si složku s články. Tady je to **datová
struktura**: čtyři provázané registry, ze kterých se text teprve vykresluje.

## Proč to není článek

Článek nese fakta i jejich doložení v jednom proudu vět. Nedá se z něj
strojově zjistit, které tvrzení stojí na kterém zdroji, a když se jeden
zdroj ukáže jako chybný, nedá se dohledat, co všechno tím padá.

Rozdělený dossier tohle umí. Když `SRC-12` přestane platit, je okamžitě
vidět seznam tvrzení, která se o něj opírají.

{% <callout kind="pravidlo" title="Dva důsledky, které stojí za zapamatování"> %}
**Každý záznam má vlastní stránku a vlastní adresu.** Ne řádek v tabulce —
skutečnou URL, na kterou jde odkázat a která přežije reorganizaci.

**Vazby jsou obousměrné.** Tvrzení ví o svých zdrojích, zdroj ví o
tvrzeních, která podpírá. Rozejít se nemůžou; hlídá to validátor.
{% </callout> %}

## Čtyři registry

| Registr | Odpovídá na otázku |
|---|---|
| Tvrzení | Co se tvrdí? |
| Zdroje | Odkud to víme? |
| Kauzy | Do jakého děje to patří? |
| Mezery | Co nevíme? |

K tomu entity (kdo a co v tom vystupuje) a vztahy mezi nimi.

## Co z toho plyne pro vás

- **Při čtení:** cesta od tvrzení k dokladu je vždy stejně dlouhá — jeden
  klik. Když ji někdo neujde, nečetl dossier, četl jen jeho povrch.
- **Při psaní:** nepíšete text, plníte strukturu. Věta, která nemá zdroj,
  nemá kam patřit — a to je záměr, ne omezení.

{% <kontrola otazka="Proč nestačí, aby dossier byl jeden dobře napsaný článek s poctivými odkazy?"> %}
Protože v článku není strojově zjistitelné, co na čem stojí.

Konkrétně to znamená, že nejde ověřit, že každé faktické tvrzení má zdroj
(v článku se odkazy dají rozdat nerovnoměrně a nikdo si toho nevšimne);
nejde zjistit dopad vadného zdroje; nejde vynutit, aby stav odpovídal
počtu nezávislých linií; a nejde odkázat na jedno konkrétní tvrzení tak,
aby odkaz vydržel.

Struktura není formalita navíc — je to jediný způsob, jak tyhle čtyři věci
kontrolovat strojem místo důvěrou v autora.
{% </kontrola> %}
