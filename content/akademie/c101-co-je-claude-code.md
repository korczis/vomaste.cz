+++
title = "C101 — Co je Claude Code"
description = "Nástroj, který pracuje uvnitř repozitáře a vidí jeho skutečný obsah. Co z toho plyne pro to, čemu se dá věřit a čemu ne."
template = "learning-lesson.html"
weight = 1801

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C101"
level = "claude-code"
estimated_minutes = 7
audience = ["ctenar", "zdroje", "research", "editor", "vyvojar"]
objectives = [
  "Popíšete, čím se Claude Code liší od chatu v prohlížeči.",
  "Vysvětlíte, proč „vidí repozitář“ neznamená „ví, co je pravda“.",
  "Rozeznáte tři místa, kam se dá psát, a co každé z nich znamená.",
]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "C102"
+++

Claude Code je nástroj, který běží **uvnitř repozitáře**. Ne v prohlížeči
s okýnkem pro text, ale v adresáři, kde jsou skutečné soubory tohohle
projektu — data, šablony, validátory, pravidla.

## Co z toho plyne

Rozdíl proti chatu není v tom, že by uměl víc přemýšlet. Je v tom, **co
má k dispozici**:

- může si otevřít konkrétní záznam a přečíst ho, místo aby si ho
  pamatoval;
- může spustit validátor a přečíst si, co skutečně vypsal;
- může najít, kde je pravidlo zapsané, místo aby ho parafrázoval.

To je celý rozdíl a je velký. Odpověď „myslím, že tvrzení CLM-12 cituje
dva zdroje" a odpověď „otevřel jsem CLM-12, cituje SRC-04 a SRC-09" jsou
dvě různé věci.

{% <callout kind="varovani" title="Vidět repozitář není totéž co vědět pravdu"> %}
Claude Code ví, **co je v repozitáři napsané**. Neví, jestli je to
pravda. Když v datech stojí nedoložené tvrzení, přečte ho a bude o něm
mluvit jako o obsahu — protože obsah to je. Ověření, jestli tam patří,
je práce, kterou dělá člověk s validátory a se zdroji.
{% </callout> %}

## Tři místa, kam se dá psát

Nováček nejčastěji tápe v tom, kam co patří. Jsou tři a v dokumentaci
mají různý štítek:

{% <prikaz kind="terminal"  note="Do terminálu. Spustí se program, Claude u toho být nemusí."> %}
npm run build
{% </prikaz> %}

{% <prikaz kind="claude"  note="Do Claude Code. Lomítko vyvolá schopnost, kterou má tenhle projekt připravenou."> %}
/diagnose
{% </prikaz> %}

{% <prikaz kind="prompt"  note="Taky do Claude Code, ale vlastními slovy. Nemusíte znát názvy."> %}
Zjisti, proč mi nejde postavit web.
{% </prikaz> %}

Poslední řádek je důležitější, než vypadá: **nemusíte se učit názvy
schopností**. Popis toho, co chcete, stačí. Lomítka jsou zkratka pro ty,
kdo je znají.

## Co Claude Code v tomhle projektu není

Není zdroj. Není autorita na to, co je pravda. Není nikdo, kdo by mohl
rozhodnout, o kom se smí psát.

Je to navigátor, rešeršní pomocník, mechanický operátor a kontrolor —
uvnitř pravidel, která si projekt určil sám.

{% <kontrola otazka="Claude Code vám řekne, že tvrzení CLM-07 je ověřené dvěma zdroji. Stačí to?"> %}
Ne, a ne proto, že by lhal. Řekl vám, **co je v datech** — že tvrzení má
stav „ověřeno více zdroji" a dva citované zdroje. Jestli jsou ty dva
zdroje **skutečně nezávislé**, je jiná otázka: dva přetisky téže
agenturní zprávy jsou jeden hlas. Na to se ptá lekce C108 a v praxi to
řeší schopnost, která zdrojové rodiny posuzuje.
{% </kontrola> %}
