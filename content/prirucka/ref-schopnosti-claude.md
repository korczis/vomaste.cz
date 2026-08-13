+++
title = "Slovník: skill, agent, workflow, riziko"
description = "Referenční přehled pojmů, které používá vrstva Claude Code — a odkaz na místo, kde je jejich seznam vždy aktuální."
template = "learning-lesson.html"
weight = 2440

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "reference"
estimated_minutes = 5
audience = ["zdroje", "research", "editor", "vyvojar", "maintainer"]
+++

Pojmy, které se v souvislosti s Claude Code v tomhle projektu používají.
**Seznam konkrétních schopností tady není** — je generovaný a najdete ho
v [katalogu příkazů](@/dokumentace/prikazy/_index.md). Opsat ho sem by
znamenalo, že zastará při prvním přidání.

## Vrstvy

**Skill** — postup pro jednu opakovanou věc. Vyvolá se lomítkem
(`/verify-source`), nebo popisem toho, co chcete. Načte se až při
použití, takže může být podrobný.

**Agent (subagent)** — specialista, který pracuje v odděleném kontextu
a vrací závěr místo materiálu. V tomhle projektu jsou **všichni jen pro
čtení**: nemají nástroje na zápis.

**Workflow** — cesta, která skládá skilly, agenty a **lidská
rozhodnutí**. Není to postup, je to sled, ve kterém se dá zabloudit.

**Pravidlo** — text, který se načte, když se sáhne na odpovídající
soubory. Pravidlo o médiích se objeví u obrázků, ne u testů.

**Validátor** — kontrola v kódu. Na rozdíl od pravidla se dodržuje
vždycky, ne většinou.

## Úrovně rizika

Každá schopnost nese právě jednu. Čte se **před** spuštěním.

| Úroveň | Co nejhoršího udělá |
|---|---|
| jen čte | nic nezapisuje |
| bezpečný zápis | zapíše do pracovního stromu, jde to vrátit |
| vyžaduje review | zapíše do obsahu nebo dat, musí to projít člověkem |
| údržbář | mění sdílený stav — schéma, pipeline, nasazení |
| autorizace vlastníka | dotýká se toho, o kom se smí psát |

Když u schopnosti není jasné, kam patří, je to **vyžaduje review** nebo
výš. Podhodnocené riziko je horší než žádný štítek, protože se čte jako
záruka.

## Persony

Popis toho, co člověk právě dělá — ne hodnost a ne oprávnění. Jeden
člověk jimi během jedné session projde třemi.

`reader` · `verifier` · `source-contributor` · `researcher` · `editor` ·
`developer` · `reviewer` · `maintainer` · `orchestrator`

Co žádná persona nesmí: **rozšířit rozsah pokrytí osob.** To se řídí
autorizačním záznamem, ne rolí.

## Tři místa, kam se píše

| Kam | Jak vypadá | Co to je |
|---|---|---|
| terminál | `npm run build` | spustí se program |
| Claude Code | `/diagnose` | vyvolá schopnost |
| Claude Code | „Zjisti, proč to padá." | totéž, vlastními slovy |

Poslední řádek je důležitý: **názvy schopností se memorovat nemusí.**

## Kde je pravda

| Otázka | Kde |
|---|---|
| jaké schopnosti existují | [katalog příkazů](@/dokumentace/prikazy/_index.md) (generovaný) |
| co dělá konkrétní schopnost | její stránka v katalogu |
| jak začít | [Jak začít s Claude Code](@/prirucka/jak-zacit-s-claude-code.md) |
| co znamená hotovo | `npm run build` s návratovým kódem 0 |
