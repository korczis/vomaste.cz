+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run screening:public-money — Screening toku veřejných prostředků"
template = "tooling-command.html"
weight = 79
description = "Screening toku veřejných prostředků: Pro zadaná IČO spočítá z registru smluv (ISRS, zákon č. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/screening-public-money"
tooling_command = "screening-public-money"
view_model = "generated/tooling-catalog.json"
+++

Pro zadaná IČO spočítá z registru smluv (ISRS, zákon č. 340/2015 Sb.), kolik smluv se subjektem uzavřely veřejné instituce v pokrytém období, jaký je jejich deklarovaný objem a kdo jsou objednatelé.

## Kdy ho spustit {#kdy}

Ručně, při rešerši k firmě. `--ico=…` (i více oddělených čárkou) nebo `--from-external-ids`, volitelně `--from=`/`--to=`/`--json`/`--no-cache`.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- DOKLÁDÁ: že v registru existují zveřejněné smlouvy, kde subjekt vystupuje jako smluvní strana, s uvedeným objednatelem, datem a (je-li vyplněna) hodnotou.
- NEDOKLÁDÁ pochybení. Uzavřená veřejná smlouva je běžný, zákonem předpokládaný a povinně zveřejňovaný jev; vysoký objem je jen objem.
- NEDOKLÁDÁ ÚPLNOST: registr obsahuje smlouvy nad 50 000 Kč od 1. 7. 2016 se zákonnými výjimkami. Chybějící záznam neznamená „subjekt nedostal veřejné peníze“.
- PŘIZNANÁ NEOVĚŘENOST: mapování XML elementů je napsané podle dokumentované struktury dumpu, NE proti živé odpovědi — v prostředí, kde skript vznikl, byl registr nedostupný (TLS handshake reset ze všech klientů i z nezávislé síťové cesty). Než výstup použiješ, spusť ho jednou na síti, kde registr odpovídá, a ověř, že počty nejsou nulové kvůli posunu schématu.
- Dump, ze kterého nevypadne ani jeden záznam, je tvrdá chyba, ne prázdný výsledek — ticho se nikdy nesmí tvářit jako „nic nenalezeno“.
- Čte se výhradně oficiální měsíční otevřený dump. Lidské rozhraní smlouvy.gov.cz/vyhledavani není kontrakt a rozpadlo by se při první změně šablony, proto ho skript záměrně nečte.

