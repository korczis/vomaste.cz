+++
title = "ADR: přestavba aplikačního shellu"
description = "Audit navigačního rámce webu a fázovaný plán jeho přestavby — záměrně vedený jako audit a plán, ne jako hotová práce."
template = "docs-viewer.html"
weight = 17

[extra]
lang = "cs"
source_file = "docs/adr/application-shell-rebuild.md"
+++

**Co to je.** Audit toho, co navigační rámec webu uměl v době vzniku
dokumentu, a plán, co s ním dál. Je tu i proto, že sám sebe označuje za
audit a plán, **ne** za provedenou přestavbu — a v tomhle repozitáři je
rozdíl mezi „navrženo" a „hotovo" věc, která se nezamlčuje.

**Co z něj mezitím platí.** Sidebar je dnes generovaný ze stejného
datasetu jako zbytek webu, ne ručně udržovaný seznam — žádná osoba není
položkou nejvyšší úrovně a nový dossier se do stromu dostane sám.

**Historická poznámka.** Dokument vznikl před přechodem na JSON-first
datový model a sám to v úvodu přiznává.
