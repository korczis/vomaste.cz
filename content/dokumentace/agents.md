+++
title = "AGENTS.md — pravidla a autorizační log"
description = "Dossierový datový model, redakční pravidla a append-only autorizační log pro obsah o reálných osobách."
template = "docs-viewer.html"
weight = 1

[extra]
lang = "cs"
source_file = "AGENTS.md"
+++

**Co to je.** Provozní pravidla celého webu — datový model registrů,
redakční principy a hlavně **append-only autorizační log**: kdo, kdy a co
přesně schválil k publikování o reálných osobách. Bez záznamu v tom logu
nesmí na web vstoupit nový subjekt ani nové téma.

**Proč je to veřejné.** Aby šlo zkontrolovat nejen co web tvrdí, ale i
podle jakých pravidel to vzniklo — a jestli se jich drží. Log je zároveň
jediné místo, kde je vidět rozsah pokrytí: co je autorizované a co ne.

**Jak to číst.** Sekce „Content about real parties" na konci je
chronologická a **nikdy se needituje** — nová autorizace se přidává jako
nová datovaná podsekce. Že prošla, hlídá i tooling: `verify:authorization-log`
shodí build, kdyby někdo dřívější záznam změnil nebo smazal.

**Co tu nehledejte.** Samotný obsah dossierů; ten je v
[registrech](@/dossiers/_index.md). A vysvětlení pojmů — to je
v [konceptech](@/koncepty/_index.md).
