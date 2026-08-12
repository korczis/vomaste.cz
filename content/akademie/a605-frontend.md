+++
title = "A605 — Frontend"
description = "Dva bundly, cílené závislosti a progresivní vylepšování. Proč graf nejezdí v hlavním balíku a proč se odhalení odpovědi řeší bez JavaScriptu."
template = "learning-lesson.html"
weight = 1605

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A605"
level = "engineering"
estimated_minutes = 10
audience = ["vyvojar"]
objectives = [
  "Popíšete, proč jsou bundly dva a co je v každém.",
  "Napíšete interakci, která funguje i bez JavaScriptu.",
  "Zdůvodníte, kdy je nová závislost přijatelná.",
]
prerequisites = ["A604"]
related_kb = ["koncepty/serverless.md", "koncepty/forkovatelnost.md"]
next = "A606"
+++

## Dva bundly

**Hlavní** — komponentová knihovna UI, drobná interaktivní vrstva a moduly
pro filtry, tabulky, vyhledávání, grafy a shell.

**Grafový** — samostatný balík pro stránky s vizualizací vztahů. Vykresluje
se jen tam, kde je element grafu; do hlavního balíku se záměrně nedostane,
protože renderer je největší závislost na webu a většina stránek ho
nepotřebuje.

## Progresivní vylepšování

Web musí být čitelný a použitelný bez JavaScriptu. Prakticky:

- **Obsah je v HTML**, ne dogenerovaný za běhu.
- **Skládací prvky** se dělají nativním `<details>`, ne skriptem.
- **Stav filtrů je v adrese**, takže konkrétní pohled jde poslat odkazem.
- **Navigace má bezskriptovou variantu** — sbalovací panel potřebuje
  skript, ale cíle jsou dostupné i bez něj.

{% <callout kind="pravidlo" title="Interaktivní prvek nesmí být jediným nositelem informace"> %}
Když se něco dá zjistit jen kliknutím, je to pro část lidí nedostupné.
Odsud plyne i to, jak jsou udělaná cvičení v téhle sekci: řešení je
v HTML, jen sbalené v `<details>`. Funguje klávesnicí, čtečkou obrazovky
i bez skriptu.
{% </callout> %}

## Závislosti

Knihovny jsou **cílené**, ne plošné: každá dělá jednu věc na stránkách,
kde je potřeba. Nová se přidává, když řeší skutečný, změřený problém —
a významné rozhodnutí tohoto typu se zapisuje jako rozhodovací záznam se
změřeným srovnáním, ne s odhadem.

{% <kontrola otazka="Potřebujete na stránce lekce skládací blok s řešením. Sáhnete po JavaScriptu?"> %}
Ne. `<details>` a `<summary>` to umí nativně.

Čtyři důvody, proč je to lepší než skript:

1. **Funguje bez JavaScriptu** — a to je u výukové stránky ta nejhorší
   možná regrese, když by nefungoval.
2. **Je to přístupné zadarmo** — klávesnice i čtečka obrazovky vědí, co to
   je, bez `aria` atributů navíc.
3. **Neexistuje stav, který by se rozešel** s tím, co je vidět.
4. **Nepřidává to nic do bundlu.**

Obecné pravidlo: než napíšete skript, ověřte, jestli to prohlížeč
neumí sám. Skládací prvky, dialogy, validace formulářů a lazy loading
obrázků mají nativní podobu — a ta je skoro vždycky lepší než vlastní.
{% </kontrola> %}
