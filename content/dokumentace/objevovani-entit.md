+++
title = "Objevování entit a autorizační brána"
description = "Jak nové osoby a firmy vstupují do datového modelu — a proč se z nich samy od sebe nestávají dossiery. Popis stálého procesu, ne autorizace čehokoli."
template = "docs-viewer.html"
weight = 9

[extra]
lang = "cs"
source_file = "docs/entity-discovery.md"
+++

**Co to je.** Popis hranice, na které tenhle projekt stojí: **zaznamenat,
že vazba existuje, a napsat o někom tvrzení jsou dva různé úkony, a jen
ten druhý je hlídaný.**

Kontextová entita — firma nebo osoba, kterou jmenuje veřejný rejstřík
nebo už citovaný článek — může vzniknout strojově, protože sama o sobě
netvrdí vůbec nic. Otevřít o někom dossier nebo o něm napsat tvrzení
vyžaduje datovaný zápis vlastníka webu v append-only logu v
[AGENTS.md](@/dokumentace/agents.md). Automat ten záměr nemůže odvodit
a „je to ve veřejném rejstříku" není pokyn k publikaci.

**Dvě věci, které nástroje odmítají udělat i kdyby mohly.** Data narození
a adresy bydliště se z rejstříku nepřebírají, a existující záznam
generátor nikdy nepřepíše — kolize jména se hlásí člověku k posouzení,
nikdy neřeší sama.
