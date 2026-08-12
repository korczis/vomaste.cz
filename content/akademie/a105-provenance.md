+++
title = "A105 — Provenance"
description = "Odkud informace přišla, kdy, čím prošla a co ji podpírá. Provenance je to, co odlišuje ověřitelný záznam od dobře znějící věty."
template = "learning-lesson.html"
weight = 1105

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A105"
level = "foundations"
estimated_minutes = 9
audience = ["research", "editor", "vyvojar"]
objectives = [
  "Vyjmenujete čtyři složky provenance, které repozitář u každého záznamu drží.",
  "Poznáte, proč samotný odkaz provenance netvoří.",
  "Vysvětlíte roli historie změn jako součásti dokladu.",
]
prerequisites = ["A104"]
related_kb = ["koncepty/verzovano-v-gitu.md", "koncepty/prubezne-overovani.md", "koncepty/primarni-dokumenty.md"]
next = "A106"
+++

Provenance je odpověď na otázku *„jak se tahle věta dostala na web?“* —
a musí být zodpověditelná i za pět let, i když mezitím zdroj zmizí a
autor bude nedostupný.

## Čtyři složky

1. **Odkud** — konkrétní zdroj, ne „z médií“.
2. **Kdy** — datum vydání zdroje **a** datum, kdy ho někdo otevřel.
3. **Čím to prošlo** — vlastní zjištění redakce, přetisk agentury,
   dohledání v registru, nebo přepis z dokumentu.
4. **Co to podpírá** — které konkrétní tvrzení, ne „tenhle dossier“.

Chybí-li kterákoli z nich, není to doklad. Je to odkaz.

{% <callout kind="pravidlo" title="Dvě data, dvě různé otázky"> %}
**Datum vydání** říká, k jakému okamžiku se výpověď vztahuje. **Datum
kontroly** říká, kdy někdo naposledy ověřil, že to tam pořád je a pořád to
tak stojí. Tříletý článek o „probíhajícím vyšetřování“ s dnešním datem
kontroly znamená: text je tam pořád, ale o výsledku nic neříká.
{% </callout> %}

## Historie změn je taky provenance

Data jsou verzovaná v Gitu, takže u každé věty jde dohledat, kdy vznikla,
jak se měnila a čím byla ta změna odůvodněná. To je vlastnost, kterou
článek na webu nemá: opravený článek vypadá, jako by byl vždycky správně.

{% <callout kind="varovani" title="Co provenance NEDĚLÁ"> %}
Nedělá tvrzení pravdivým. Perfektně doložený přetisk chybné tiskové zprávy
je pořád chybný. Provenance zaručuje jen to, že chyba je **dohledatelná
až ke svému původu** — a proto opravitelná.
{% </callout> %}

{% <kontrola otazka="Rešeršní nástroj vám vrátí, že firma má vazbu na jinou firmu. Vy tu vazbu zapíšete a jako zdroj uvedete ten nástroj. Co je špatně?"> %}
Nástroj není zdroj. Je to rozcestník.

Co dokládá vazbu, je **záznam ve veřejném rejstříku**, na který nástroj
ukázal. Citovat se má tedy ten rejstříkový záznam, s datem pořízení —
nikoli mezikrok, který vás k němu dovedl.

Důvod je praktický: nástroj může mít zastaralá data, může slučovat
jmenovce, může se odmlčet. Když je v citaci on, ztratí se doklad s ním.
Když je v citaci rejstřík, doklad přežije. Platí to i pro interní
nástroje projektu — jejich výstup smí kandidáta najít, ale publikovat se
smí jen s citací na tu veřejnou evidenci pod ním.
{% </kontrola> %}
