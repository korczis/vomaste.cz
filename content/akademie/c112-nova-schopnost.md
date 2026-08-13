+++
title = "C112 — Přidání nové schopnosti"
description = "Pokročilé: kdy schopnost vzniknout má, kdy ne, a co všechno k ní patří, aby byla hotová."
template = "learning-lesson.html"
weight = 1812

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C112"
level = "claude-code"
estimated_minutes = 9
audience = ["vyvojar", "maintainer"]
objectives = [
  "Použijete pět otázek, které rozhodují o vzniku schopnosti.",
  "Zařadíte věc do správné vrstvy: fakt, pravidlo, postup, záruka.",
  "Vyjmenujete, co brána vyžaduje, aby schopnost prošla buildem.",
]
related_kb = ["koncepty/forkovatelnost.md"]
next_route = "@/akademie/_index.md"
+++

Přidat schopnost je snadné. Přidat ji **správně** znamená nejdřív
zjistit, jestli má vzniknout.

## Pět otázek

Při první „ne" se schopnost nepíše:

1. **Řeší to už něco?** Rozšířit existující je skoro vždycky lepší než
   založit druhé.
2. **Je za tím opakovaná práce?** Konkrétně: třikrát vložený stejný
   dlouhý prompt, zaplavený kontext, dvanáctikrokový postup opakovaný
   lidmi.
3. **Dá se to otestovat?** Ne text — metadata, odkazy, přítomnost
   povinných částí.
4. **Je to opravdu schopnost?** Viz níž.
5. **Je pro to persona?** Schopnost bez uživatele je jen údržbová
   plocha.

## Zařazení do vrstvy

```
fakt platný vždy          → CLAUDE.md
pravidlo pro část stromu  → pravidlo s uvedenými cestami
postup                    → skill
specialista v izolaci     → agent
uživatelská cesta         → workflow
ZÁRUKA                    → validátor
```

{% <callout kind="pravidlo" title="Nejdůležitější řádek je poslední"> %}
**Pravidlo, které jde vynutit kódem, se nevynucuje promptem.** Text se
dodržuje většinou; validátor vždycky. Když se dá napsat kontrola,
napíše se kontrola — i kdyby to znamenalo víc práce než odstavec.
{% </callout> %}

## Co brána vyžaduje

Schopnost neprojde buildem bez:

- **záznamu v katalogu** s personou, úrovní rizika a informací, jestli
  zapisuje;
- **hranice použití** — kdy se schopnost NEMÁ použít. Schopnost bez
  hranice se použije tam, kam nepatří;
- **jedinečného jména** napříč vrstvami;
- **odkazů, které někam vedou** — na neexistující soubor, příkaz nebo
  schopnost build spadne.

U subagenta navíc **vyjmenované nástroje**. Vynechaný seznam znamená,
že zdědí všechny — a „jen čtoucí" agent by uměl zapisovat.

## Jméno ověřte

Některá jména jsou obsazená vestavěnými příkazy. Schopnost toho jména
by šla zdokumentovat, ale ne spustit — a dokumentovaná schopnost bez
funkce je přesně to, co ústava projektu zakazuje.

{% <kontrola otazka="Chcete přidat schopnost, která před commitem zkontroluje, že v datech není datum narození. Skill, nebo validátor?"> %}
**Validátor.** Je to mechanicky ověřitelné pravidlo, které má platit
vždycky — ne postup, který si někdo vyžádá. Skill by se dal přeskočit
a nikdo by se to nedozvěděl; validátor v bráně shodí build. Tohle je
čtvrtá otázka v praxi.
{% </kontrola> %}
