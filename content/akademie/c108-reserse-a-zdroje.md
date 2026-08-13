+++
title = "C108 — Rešerše s Claude: AI není zdroj"
description = "Čtyři stavy důkazu a hranice, přes kterou se nesmí přejít ani omylem."
template = "learning-lesson.html"
weight = 1808

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C108"
level = "claude-code"
estimated_minutes = 10
audience = ["zdroje", "research", "editor"]
objectives = [
  "Vyjmenujete čtyři stavy důkazu a řeknete, čím se liší.",
  "Vysvětlíte, proč výstup vyhledávání ani shrnutí od AI není zdroj.",
  "Použijete Claude k rešerši tak, aby výsledek šel doložit.",
]
related_kb = ["koncepty/nezavisle-dolozeni.md"]
next = "C109"
+++

Claude umí u rešerše hodně: zúžit otázku, najít kandidáty, přečíst dlouhé
texty, porovnat je, uspořádat. Jednu věc neumí a nikdy umět nebude —
**být zdrojem.**

## Čtyři stavy a hranice mezi nimi

```
kandidát  →  otevřený  →  ověřený  →  publikovaný důkaz
```

- **Kandidát** je výsledek hledání. Titulek, doména, útržek. Nic z toho
  nemusí odpovídat tomu, co je na stránce.
- **Otevřený** znamená, že se stránka skutečně načetla a přečetla.
- **Ověřený** znamená, že je jasné, co konkrétně dokládá **a co ne**.
- **Publikovaný důkaz** je citovaný u tvrzení, s datem pořízení,
  a prošel publikačními branami.

{% <callout kind="varovani" title="Kde se dělá chyba"> %}
Zaměnit **kandidáta** za **důkaz**. Vypadá to jako úspora času a je to
jediný způsob, jak tenhle projekt může vyrobit vymyšlenou citaci: URL,
která existuje, titulek, který sedí, a obsah, který nikdo neviděl.
{% </callout> %}

## Worked example, který to stál

Do rešerše se dostala URL z běžného zpravodajského webu. Ve výsledku
vyhledávání i v odkazu vypadala jako normální článek. **Po otevření** se
ukázalo, že vyšla v satirické rubrice, výslovně označené jako fikce.

Téma bylo z autorizace vyřazeno úplně. Nezachránil to titulek, doména
ani to, že šlo o jinak seriózního vydavatele — zachránilo to jedině
otevření stránky.

## Jak se ptát

{% <prikaz kind="prompt"> %}
Najdi kandidátní zdroje, ale výsledek vyhledávání nepovažuj za důkaz. Každý zdroj, který použiješ, otevři a řekni mi, co doopravdy dokládá a co ne. Odděl kandidáta, ověřený zdroj a to, co doložit nejde.
{% </prikaz> %}

A pak konkrétně:

{% <prikaz kind="skill"  note="Otevře zdroj a vrátí, co dokládá, co nedokládá, kdo ho vydal a v jaké rubrice."> %}
/verify-source https://…
{% </prikaz> %}

{% <prikaz kind="skill"  note="Kolik je to hlasů, ne kolik odkazů."> %}
/source-family SRC-04 SRC-09
{% </prikaz> %}

## Tři zdroje ≠ tři hlasy

Tři weby, které přetiskly tutéž agenturní zprávu, jsou **jeden hlas**.
Tři rubriky jednoho vydavatele taky. Doložení „více zdroji" vyžaduje dva
zdroje, které se liší **původem materiálu i vydavatelem**.

Claude tohle umí posoudit — a když to z textu posoudit nejde, má to
říct. Nejistota se v tomhle projektu řeší **dolů**, ne nahoru.

## Co s tím, co doložit nejde

Napíše se to jako **mezera**: co konkrétně citované zdroje neuvádějí.
Ne jako opatrně formulované tvrzení. „Podle dostupných informací se zdá,
že…" je nedoložené tvrzení v převleku.

{% <kontrola otazka="Claude vám vrátí shrnutí tří článků a vy z něj chcete napsat tvrzení. Co musíte udělat dřív?"> %}
Otevřít ty články. Shrnutí od AI je pracovní pomůcka, ne důkaz —
u tvrzení se cituje **původní materiál**, s datem vydání i pořízení.
A po otevření se může ukázat, že jeden z nich je komentář, druhý přetisk
třetího, a doložený je tedy jeden hlas místo tří.
{% </kontrola> %}
