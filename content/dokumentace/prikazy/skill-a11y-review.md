+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/a11y-review — Review přístupnosti"
template = "tooling-command.html"
weight = 106
description = "Review přístupnosti: Deset kontrol přístupnosti: sémantika, hierarchie nadpisů, popisky ovládacích prvků, ovladatelnost klávesnicí, viditelný a správně vracený focus, ARIA, kontrast z palety, respektování redukovaného pohybu a dostupnost hlavního obsahu bez JavaScriptu. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-a11y-review"
tooling_command = "skill-a11y-review"
view_model = "generated/tooling-catalog.json"
+++

Deset kontrol přístupnosti: sémantika, hierarchie nadpisů, popisky ovládacích prvků, ovladatelnost klávesnicí, viditelný a správně vracený focus, ARIA, kontrast z palety, respektování redukovaného pohybu a dostupnost hlavního obsahu bez JavaScriptu. Zvlášť řeší kopírovací zpětnou vazbu, drawer, graf vztahů a tabulky.

## Kdy ho spustit {#kdy}

Po přidání interaktivního prvku nebo nové šablony, před merge změny UI.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, recenzent, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Bez JS smí filtr přestat filtrovat, obsah nesmí zmizet. Registr entit je toho vzorem: bez JS zůstává viditelný plný plochý seznam.
- Špatná ARIA je horší než žádná.
- Barva nikdy sama: stav, rozdíl ani riziko se nesmí sdělovat jen barvou.
- Statická kontrola nepozná pořadí focusu, skutečný kontrast ani chování odečítače — a musí to říct.

