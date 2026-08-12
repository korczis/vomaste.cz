+++
title = "A405 — GitHub bez programování"
description = "Co je repozitář, issue a pull request běžnou češtinou — a co všechno se dá udělat rovnou v prohlížeči, bez instalace čehokoli."
template = "learning-lesson.html"
weight = 1405

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A405"
level = "contribution"
estimated_minutes = 10
audience = ["ctenar", "zdroje", "research"]
objectives = [
  "Vysvětlíte, co je repozitář, issue a pull request, bez technického žargonu.",
  "Podáte podnět i navrhnete úpravu textu přímo v prohlížeči.",
  "Budete vědět, co je na GitHubu trvale veřejné.",
]
prerequisites = ["A404"]
related_kb = ["koncepty/verzovano-v-gitu.md", "koncepty/forkovatelnost.md"]
next = "A406"
+++

GitHub vypadá jako nástroj pro programátory. Pro tenhle projekt je to
hlavně **archiv s historií a diskusní fronta** — a většina užitečné práce
se dá udělat v prohlížeči.

## Tři pojmy

**Repozitář** je složka projektu se vším: daty, texty, šablonami, skripty.
Web se z ní staví.

**Historie** je záznam každé změny — kdo, kdy, co a proč. Nedá se
přepsat. To je důvod, proč projekt Git používá: opravená chyba zůstane
dohledatelná i po opravě.

**Issue** je vlákno: hlášení, dotaz, podnět. Nemění nic v datech, jen
otevírá téma.

**Pull request** je návrh konkrétní změny. Ukáže se jako **rozdíl** —
vlevo původní znění, vpravo navrhované — a někdo ho schválí nebo ne.

## Co jde bez instalace

- **Podat podnět.** Formuláře popsané v [A401](@/akademie/a401-nahlaste-chybu.md).
  Potřebujete jen účet.
- **Navrhnout úpravu textu.** U každého souboru je tlačítko s tužkou.
  Upravíte, popíšete proč, odešlete — GitHub z toho udělá pull request
  za vás.
- **Prohlížet historii.** U každého souboru je vidět, kdy se měnil a jak.
- **Číst probíhající diskuse** a připojit se.

{% <callout kind="varovani" title="Všechno tam je veřejné a trvalé"> %}
Issue, komentář i pull request jsou veřejné od okamžiku odeslání. Smazání
je nesmaže z historie ani z kopií, které si někdo mezitím udělal.

Projekt **nemá** důvěrný kanál pro citlivé podněty a netvrdí, že ho má.
Když máte materiál, který nesmí být veřejný, neposílejte ho sem.
{% </callout> %}

## Kdy už potřebujete počítač

Když měníte **data** — tvrzení, zdroje, entity. Ty se generují do stránek
a před odesláním se musí ověřit validací. K tomu je potřeba repozitář
lokálně a pár příkazů; to je téma [A602](@/akademie/a602-lokalni-vyvoj.md).

Většina užitečných příspěvků tam ale nespadá.

{% <kontrola otazka="Našli jste překlep na stránce a chcete ho opravit sami. Jde to bez instalace?"> %}
Většinou ano, ale záleží kde.

Pokud je překlep v **ručně psané stránce** — koncept, dokumentace, lekce —
najdete soubor v repozitáři, kliknete na tužku, opravíte a odešlete jako
pull request. Nic instalovat nemusíte.

Pokud je v **textu tvrzení nebo zdroje**, je situace jiná: stránky
dossierů jsou **generované** z kanonických dat. Oprava v generované
stránce by se při dalším sestavení přepsala. Skutečná oprava patří do
`data/dossiers/**` — a ta se dá taky udělat v prohlížeči, jen musíte
najít správný soubor.

Když si nejste jisti, který případ je který, je jednodušší poslat podnět
formulářem. Deset vteřin práce navíc pro vás, žádná pro toho, kdo to
vyřizuje.
{% </kontrola> %}
