+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run report:originator-gaps — Detektor původního zjišťovatele"
template = "tooling-command.html"
weight = 41
description = "Detektor původního zjišťovatele: Generovaný seznam tvrzení, která stojí na jednom hlasu a přitom sama jmenují outlet, jenž věc zjistil první („podle zjištění Seznam Zpráv\") — a ten outlet mezi jejich zdroji chybí. npm skript, generování."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/report-originator-gaps"
tooling_command = "report-originator-gaps"
view_model = "generated/tooling-catalog.json"
+++

Generovaný seznam tvrzení, která stojí na jednom hlasu a přitom sama jmenují outlet, jenž věc zjistil první („podle zjištění Seznam Zpráv") — a ten outlet mezi jejich zdroji chybí. Pravidlo S10 takové tvrzení odmítne uznat za nezávisle doložené, ale neřekne, kde nezávislý hlas hledat; tenhle report to řekne konkrétně.

## Kdy ho spustit {#kdy}

Automaticky v data:build i v build. Ručně, když hledáš, kde má korroborační kolo začít.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Stopa, ne závěr. Že tvrzení jmenuje outlet, nedokládá, že ten outlet tvrzení potvrdí — konkrétní článek se musí najít, otevřít a přečíst, a když nesedí, zdroj se NEPŘIPOJÍ. Ověřeno v praxi: u jedné stopy se článek nenašel vůbec, u jiné byl za paywallem právě v části nesoucí jádro tvrzení.
- Názvy outletů se porovnávají na normalizovaný celý název (bez diakritiky a nealfanumerických znaků) jako prefix. První verze porovnávala první slovo malými písmeny a „Deník N" se jí shodovalo s „Deník.cz", „Ekonomický deník" i „Jihlavský deník" — výsledek byl nafouknutý o třetinu.
- Výstupy jdou do reports/ a data/generated/, nikdy do content/ — neroutují se a žádná stránka z nich nevzniká.

