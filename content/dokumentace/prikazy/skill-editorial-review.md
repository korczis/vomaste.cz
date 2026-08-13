+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/editorial-review — Redakční review v celku"
template = "tooling-command.html"
weight = 112
description = "Redakční review v celku: Skládá atomické kontroly tvrzení, zdrojů a mezer a přidává deset kontrol, které jsou vidět až v celku: konzistence procesního rámování napříč zmínkami, tichá eskalace tónu bez nových zdrojů, poměr obvinění a reakcí, třetí osoby čtoucí se jako subjekty, koncentrace zdrojů u jednoho vydavatele, rovnováha stavů, záměna mezery za zúžený fakt, časová osa, shrnutí říkající víc než záznamy pod ním, a grafové vazby vytvářející dojem vlivu.. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-editorial-review"
tooling_command = "skill-editorial-review"
view_model = "generated/tooling-catalog.json"
+++

Skládá atomické kontroly tvrzení, zdrojů a mezer a přidává deset kontrol, které jsou vidět až v celku: konzistence procesního rámování napříč zmínkami, tichá eskalace tónu bez nových zdrojů, poměr obvinění a reakcí, třetí osoby čtoucí se jako subjekty, koncentrace zdrojů u jednoho vydavatele, rovnováha stavů, záměna mezery za zúžený fakt, časová osa, shrnutí říkající víc než záznamy pod ním, a grafové vazby vytvářející dojem vlivu.

## Kdy ho spustit {#kdy}

Před merge větší obsahové změny, při periodické revizi dossieru, a po dokončení rešeršního průchodu — vždy dřív, než se cokoli publikuje.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** editor, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Nenahrazuje npm run build. Mechanické brány (parita, reference, JSON-LD) běží tam; tohle je redakční vrstva.
- Nejčastější reálný nález je devátá kontrola: jednotlivá tvrzení jsou v pořádku a shrnutí nad nimi je o krok dál, než zdroje unesou.
- Dvacet stejných nálezů je jeden nález. Řádek CELKOVÝ TÓN je povinný a nesmí být „v pořádku“ bez odůvodnění.
- Publikovat se nesmí s BLOCKER. HIGH je rozhodnutí člověka, ale vědomé, ne přehlédnuté.

