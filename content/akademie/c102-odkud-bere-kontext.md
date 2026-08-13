+++
title = "C102 — Odkud Claude bere kontext"
description = "Co se načte při startu, co až při použití, a proč je rozdíl mezi „vždycky to ví“ a „umí si to najít“."
template = "learning-lesson.html"
weight = 1802

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "C102"
level = "claude-code"
estimated_minutes = 8
audience = ["ctenar", "research", "editor", "vyvojar"]
objectives = [
  "Vyjmenujete tři vrstvy kontextu a řeknete, kdy se která načte.",
  "Vysvětlíte, proč se procedury nepíšou do CLAUDE.md.",
  "Poznáte, kdy Claude něco „neví“, protože to prostě ještě nečetl.",
]
related_kb = ["koncepty/strojove-citelna-data.md"]
next = "C103"
+++

Claude Code nezná projekt zpaměti. Kontext dostává ve třech vrstvách
a **každá se načítá jindy** — což vysvětluje spoustu situací, které
zvenčí vypadají jako zapomnětlivost.

## Tři vrstvy

**1. Vždycky.** `CLAUDE.md` a `AGENTS.md` se načtou na začátku každé
session. Jsou tam fakta, která platí pořád: co projekt je, co se nikdy
nesmí, kde je brána kvality. Proto jsou krátká — dlouhý text se hůř
dodržuje a stojí místo.

**2. Když sáhne na odpovídající soubor.** Pravidla v `.claude/rules/`
mají v hlavičce seznam cest. Pravidlo o médiích se objeví, teprve když
někdo otevře obrázek entity. Do té doby nestojí nic.

**3. Když je vyžádaná.** Schopnost (skill) se načte až ve chvíli, kdy ji
někdo použije. Proto může mít sto řádků podrobného postupu — dokud ho
nikdo nepotřebuje, nikoho nezdržuje.

{% <callout kind="pravidlo" title="Z toho plyne pravidlo, které drží celý tooling"> %}
**Fakt** patří do `CLAUDE.md`. **Pravidlo pro část stromu** do
`.claude/rules/` s uvedenými cestami. **Postup** do schopnosti.
A **záruka** do validátoru — protože pravidlo, které jde vynutit kódem,
se nevynucuje textem.
{% </callout> %}

## Co je katalog schopností

Seznam toho, co projekt umí, se nikam nepíše ručně. Generuje se
z repozitáře, takže nemůže tvrdit schopnost, která neexistuje — a
naopak schopnost bez záznamu shodí build.

{% <prikaz kind="terminal"  note="Přegeneruje katalog. Ručně se needituje."> %}
npm run build:tooling-catalog
{% </prikaz> %}

Přečíst si ho můžete i bez Claude Code: `docs/TOOLING.md` v repozitáři,
nebo stránka s příkazy na webu.

## Když Claude něco „neví"

Většinou to znamená jednu ze dvou věcí:

- **ještě to nečetl** — soubor je v repozitáři, ale nikdo si ho
  nevyžádal. Řešení je říct kde, nebo se prostě zeptat konkrétně;
- **není to nikde napsané** — a to je nález, ne nedostatek nástroje.
  Znalost, kterou má jen jeden člověk v hlavě, je v tomhle projektu
  problém sám o sobě.

{% <kontrola otazka="Zeptáte se na pravidlo o obrázcích a dostanete obecnou odpověď. Co s tím?"> %}
Pravidlo o médiích je path-scoped — načte se, až se sáhne na obrázek
nebo na entitu. Stačí se zeptat konkrétně („můžu použít tuhle fotku
z Commons?"), nebo rovnou otevřít soubor, kterého se to týká. Obecná
odpověď na obecnou otázku není chyba nástroje; je to důsledek toho, že
kontext se načítá podle potřeby.
{% </kontrola> %}
