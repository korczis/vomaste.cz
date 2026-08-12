+++
title = "A504 — Model mezery"
description = "Mezera jako plnohodnotný záznam s prioritou a datem poslední kontroly — a proč se generuje plán evidence místo ručního seznamu úkolů."
template = "learning-lesson.html"
weight = 1504

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A504"
level = "data"
estimated_minutes = 9
audience = ["vyvojar", "maintainer", "editor"]
objectives = [
  "Popíšete pole záznamu mezery a jejich smysl.",
  "Vysvětlíte, proč se seznam práce generuje a nevede ručně.",
  "Poznáte, kdy mezera patří k tvrzení a kdy stojí sama.",
]
prerequisites = ["A503"]
related_kb = ["koncepty/registr-mezer.md", "koncepty/prubezne-overovani.md"]
next = "A505"
+++

Mezera je plnohodnotný záznam, ne poznámka. Bydlí v
`data/dossiers/<slug>/gaps/gap-NN.json` a nese kromě obvyklé identity:

- **`priority`** — vysoká nebo nízká. Ne podle zajímavosti, ale podle toho,
  jak moc chybějící odpověď brání pochopení věci.
- **`checked`** — datum, kdy se naposledy ověřovalo, že odpověď pořád není
  dostupná.
- **`claims`** — kterých tvrzení se mezera týká, když se váže na konkrétní.

## Mezera vázaná a samostatná

**Vázaná** doplňuje tvrzení: to, co je doložené, plus to, co k tomu není.
Čtenář je vidí pohromadě.

**Samostatná** stojí sama: otázka, kterou dossier považuje za podstatnou a
kterou žádné tvrzení nepokrývá. Typicky vzniká z toho, že se něco
nepodařilo doložit vůbec.

## `checked` je tvrzení, ne metadata

Datum poslední kontroly říká: *„k tomuhle dni nebyla odpověď z veřejných
zdrojů dostupná“*. To je ověřitelný výrok — a stárne. Dva roky staré
`checked` znamená, že o dnešní dostupnosti nevíme nic.

Proto se posouvá jen skutečnou kontrolou, nikdy automaticky.

{% <callout kind="pravidlo" title="Plán práce se generuje, nevede ručně"> %}
Kde evidence stojí a co dělat dál, počítá generátor z kanonických dat:
počty tvrzení podle stavu a podle typu dokladu, potenciál doložení,
mezery, odvozená priorita a konkrétní další krok — per dossier.

Paralelní ruční seznam úkolů by byl zastaralý dřív než další commit.
Odpověď na otázku „co mám dělat“ je proto vygenerovaný report, ne něčí
poznámky.
{% </callout> %}

{% <kontrola otazka="Tvrzení má stav „1 zdroj“. Má se k němu automaticky založit mezera „chybí druhý nezávislý zdroj“?"> %}
Ne. Byla by to mezera u každého takového tvrzení, tedy šum bez informace.

„Chybí druhý zdroj“ je už obsažené ve **stavu**. Stav `1 zdroj` přesně
tohle znamená a čtenář to vidí bez další položky. A kde je práce potřeba,
spočítá generovaný plán evidence — z dat, ne z ručně zakládaných záznamů.

Mezera má smysl tam, kde je **konkrétní zodpověditelná otázka**, kterou
stav nezachytí: *„Zdroje neuvádějí, zda byly ke smlouvě uzavřeny
dodatky.“* To není totéž jako „chtělo by to druhý zdroj“ — je z toho
vidět, co se hledá a kde by to mohlo být.

Rozdíl v jedné větě: stav popisuje **sílu doložení**, mezera popisuje
**chybějící znalost**.
{% </kontrola> %}
