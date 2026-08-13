+++
title = "A104 — Taxonomie stavů"
description = "Pět stavů, dvě z nich vynucuje validátor. Jak se stav přiděluje, kdy se mění a proč se nikdy nemění samo od sebe."
template = "learning-lesson.html"
weight = 1104

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A104"
level = "foundations"
estimated_minutes = 12
audience = ["ctenar", "zdroje", "research", "editor"]
objectives = [
  "Přidělíte stav podle struktury zdrojů, ne podle přesvědčivosti tvrzení.",
  "Popíšete, které dva stavy vynucuje validátor a jak.",
  "Vysvětlíte, proč se stav nedá povýšit přeznačením.",
]
prerequisites = ["A103"]
related_kb = ["koncepty/stav-overeno-vice-zdroji.md", "koncepty/stav-jeden-zdroj.md", "koncepty/stav-citace.md", "koncepty/stav-sporne.md", "koncepty/stav-nazor.md"]
next = "A105"
+++

Stav není hodnocení věrohodnosti. Je to **popis struktury dokladů**, a
u dvou stavů ho počítá stroj.

## Rozhodovací postup

1. Je to hodnotící soud autora? → **názor**
2. Je předmětem tvrzení výrok konkrétní osoby? → **citace**
3. Odporují si zdroje, nebo je věc neuzavřená? → **sporné**
4. Existuje mezi zdroji dvojice lišící se **rodinou i vydavatelem**?
   → **ověřeno více zdroji**
5. Jinak → **1 zdroj**

Pořadí není libovolné. Kroky 1–3 se ptají na **povahu** tvrzení, kroky 4–5
na **strukturu dokladů**. Citace zůstane citací, i kdyby ji přineslo deset
nezávislých redakcí — doložené je pořád jen to, že výrok padl.

## Co vynucuje validátor

- **Ověřeno více zdroji** neprojde, dokud mezi zdroji není nezávislá
  dvojice. Nezávislost se posuzuje podle rodiny **a** podle registrované
  domény vydavatele — dva texty téže redakce jsou jeden hlas.
- **1 zdroj** naopak neprojde, když taková dvojice existuje. Podhodnotit
  doložení je taky nepřesnost.

{% <callout kind="varovani" title="„1 zdroj“ neznamená jeden odkaz"> %}
Tvrzení může citovat tři URL a zůstat na „1 zdroj“, když jsou to přetisky
jedné agenturní zprávy. A naopak: dva odkazy stačí na „ověřeno“, když se
liší původem i vydavatelem. Rozhoduje struktura, ne počet.
{% </callout> %}

## Jak se stav mění

Jedině **novým dokladem**. Přeznačit tvrzení z „1 zdroj“ na „ověřeno“ bez
přidání nezávislého zdroje není povýšení — je to nepravdivé tvrzení o
vlastní evidenci, a validátor to navíc odmítne.

Sporné tvrzení se nezlepší tím, že zestárne. Mění ho jen nový jmenovaný
zdroj — a i pak se rozliší, jestli přišlo věcné zjištění, nebo jen procesní
výsledek.

{% <kontrola otazka="Tvrzení má stav „citace“ a někdo navrhne povýšit ho na „ověřeno více zdroji“, protože ten výrok odvysílaly čtyři nezávislé televize. Je to správně?"> %}
Ne — plete se tu, **co je předmětem tvrzení**.

Tvrzení zní „X řekl Y“. Čtyři nezávislé záznamy dokládají, že výrok padl,
a to je dobře: znamená to, že o jeho existenci není spor. Ale stav „ověřeno
více zdroji“ by čtenář přečetl jako „obsah výroku je nezávisle potvrzený“,
což ty televize nedokládají — ony jen slyšely totéž.

Pokud je zajímavý obsah výroku, je to **jiné tvrzení**, které potřebuje
vlastní doklady. Tak vzniknou dva záznamy: citace o výroku a samostatné
tvrzení o skutečnosti, každé se svým stavem.
{% </kontrola> %}
