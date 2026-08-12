+++
title = "A406 — Anatomie pull requestu"
description = "Co má návrh změny obsahovat, aby ho šlo posoudit: rozsah, odůvodnění, doklad zelené brány a rozdíl, který se dá přečíst."
template = "learning-lesson.html"
weight = 1406

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A406"
level = "contribution"
estimated_minutes = 10
audience = ["research", "vyvojar"]
objectives = [
  "Sestavíte pull request s jedním tématem a čitelným rozdílem.",
  "Doložíte, že brána prošla, ještě než ji spustí někdo jiný.",
  "Vysvětlíte, proč se generované soubory neupravují ručně.",
]
prerequisites = ["A405"]
related_kb = ["koncepty/verzovano-v-gitu.md", "koncepty/strojove-citelna-data.md"]
next = "A407"
+++

Pull request je návrh změny. Posuzuje se **jako rozdíl**, takže všechno,
co rozdíl znečistí, zdrží schválení.

## Jedno téma na jeden návrh

Oprava data u zdroje a přeformulování tří tvrzení jsou dvě různé věci.
Když jsou v jednom návrhu, musí se schválit nebo zamítnout dohromady — a
to znamená, že se nezamítne ani jedno, dokud se nevyřeší obojí.

## Co má obsahovat

- **Co se mění a proč.** Ne co je v rozdílu vidět, ale co to řeší.
- **Doklad**, když jde o obsah — odkaz na zdroj, který změnu odůvodňuje.
- **Výsledek brány.** Že jste ji spustili sami, než jste odeslali.

{% <callout kind="pravidlo" title="Generované soubory se neupravují ručně"> %}
Stránky dossierů pod `content/dossiers/**` a `content/entities/*.md` jsou
**generované adaptéry**. Kanonická data jsou v `data/dossiers/**`.

Ruční úprava generované stránky se při dalším sestavení tiše přepíše —
build zůstane zelený a vaše změna prostě zmizí. Pull request, který mění
generovaný soubor, je proto skoro vždycky nedorozumění.
{% </callout> %}

## Brána

Kanonická brána projektu je jeden příkaz:

```bash
npm run build
```

Není to jen sestavení webu — projde jím validace kanonických dat, testy,
kontrola autorizací, linty, generátory, sestavení a po něm ověření
odkazů, strukturovaných dat, metadat a exportů. Musí skončit s kódem `0`.

Pro rychlou kontrolu bez generování existuje:

```bash
npm run check
```

A pro ověření jednoho záznamu při psaní:

```bash
npm run data:validate
```

{% <callout kind="poznamka" title="Zelená brána není totéž co správný obsah"> %}
Validátory chytí chybějící pole, rozbité vazby, stav neodpovídající
struktuře zdrojů nebo rozcházející se tabulku. Nepoznají posun významu
v citaci, nepřiměřený osobní údaj ani tvrzení, které říká víc než doklad.

Zelený build je nutná podmínka, ne dostatečná.
{% </callout> %}

{% <kontrola otazka="Váš pull request mění jedno tvrzení, ale v rozdílu je 40 změněných souborů. Co se stalo?"> %}
Skoro jistě jste spustili sestavení a přidali do návrhu i **regenerované
výstupy**.

Kanonická změna je jeden soubor v `data/dossiers/**`. Z něj se generují
adaptéry v `content/`, přehledy, exporty a reporty. Část z nich je
záměrně mimo verzování, část ne — a hromadné přidání toho zbytku udělá
z jednoduchého návrhu nečitelný rozdíl.

Postup: nechte v návrhu kanonickou změnu a ty generované soubory, které se
podle konvence repozitáře commitují (u dossierů jsou to adaptéry
v `content/`). Zbytek vraťte.

A ověřte, že jste opravdu needitovali generovanou stránku místo dat —
tenhle příznak často znamená právě to.
{% </kontrola> %}
