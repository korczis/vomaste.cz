+++
title = "C103 — Skill, agent, workflow"
description = "Tři vrstvy schopností a jak poznat, kterou zrovna potřebujete. A proč je jich právě tolik, kolik jich je."
template = "learning-lesson.html"
weight = 1803

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C103"
level = "claude-code"
estimated_minutes = 8
audience = ["ctenar", "zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Rozlišíte skill, agenta a workflow podle toho, co který řeší.",
  "Najdete si schopnost v katalogu, aniž byste znali její název.",
  "Vysvětlíte, proč čtení rizika předchází spuštění.",
]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "C104"
+++

Projekt má tři vrstvy schopností. Nejsou to synonyma a rozdíl je
praktický.

## Skill — postup

Jedna opakovaná věc, udělaná pořádně. „Prověř tenhle zdroj." „Zkontroluj
tohle tvrzení." „Spusť bránu kvality a vysvětli výsledek."

Skill se vyvolá lomítkem, nebo prostě popisem toho, co chcete:

{% <prikaz kind="skill"> %}
/verify-source https://example.org/clanek
{% </prikaz> %}

{% <prikaz kind="prompt"  note="Totéž. Název znát nemusíte."> %}
Prověř tenhle zdroj a řekni mi, co doopravdy dokládá.
{% </prikaz> %}

## Agent — specialista stranou

Některá práce znamená přečíst padesát souborů a použít z nich pět
řádků. Kdyby se to dělo v hlavní konverzaci, utopilo by to všechno
ostatní. Agent to udělá **u sebe** a vrátí závěr.

V tomhle projektu jsou všichni agenti **jen pro čtení**. Nemají nástroje
na zápis, a to není opomenutí — je to jejich definice.

## Workflow — cesta

Sled kroků, ve kterém se dá zabloudit: od nahlášené chyby k opravené,
ověřené a doložené změně. Workflow skládá skilly, agenty a **lidská
rozhodnutí**.

Ta poslední část je podstatná: cesta bez lidských checkpointů by
tvrdila, že celý sled jde automatizovat. U publikace, u rozsahu pokrytí
a u sporné nezávislosti zdrojů to není pravda.

{% <callout kind="poznamka" title="Kolik jich je a proč"> %}
Aktuální počet se nepíše sem — zastaral by při prvním přidání. Je
v generovaném katalogu. Co ale platí trvale: schopnost vzniká, jen když
projde pěti otázkami, a poslední z nich zní **je pro to persona?**
Schopnost bez uživatele je jen údržbová plocha.
{% </callout> %}

## Riziko se čte předem

Každá schopnost nese úroveň rizika. Není to ozdoba — je to informace
o tom, co se stane, když ji pustíte omylem.

| Úroveň | Znamená |
|---|---|
| jen čte | nic nezapisuje, můžete pustit naslepo |
| bezpečný zápis | zapíše do pracovního stromu, jde to vrátit |
| vyžaduje review | zapíše do obsahu nebo dat, musí to projít člověkem |
| údržbář | mění sdílený stav — schéma, pipeline, nasazení |
| autorizace vlastníka | dotýká se toho, o kom se smí psát |

{% <kontrola otazka="Chcete si prohlédnout, jak se dossier staví, ale bojíte se, že něco rozbijete."> %}
Podívejte se do katalogu na úroveň rizika a vyberte schopnost označenou
jako **jen čte**. Prohlídka projektu i vysvětlení jednotlivé věci mezi
ně patří. Nic z toho nesahá na soubory — a kdyby ano, katalog by to
musel přiznat, protože „jen čte" se zápisem zároveň shodí build.
{% </kontrola> %}
