+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/source-family — Nezávislost zdrojů"
template = "tooling-command.html"
weight = 120
description = "Nezávislost zdrojů: Posoudí, kolik nezávislých hlasů daná sada zdrojů skutečně tvoří, a tím jestli tvrzení unese CORROBORATED, nebo musí zůstat 1 ZDROJ. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-source-family"
tooling_command = "skill-source-family"
view_model = "generated/tooling-catalog.json"
+++

Posoudí, kolik nezávislých hlasů daná sada zdrojů skutečně tvoří, a tím jestli tvrzení unese CORROBORATED, nebo musí zůstat 1 ZDROJ. Hledá doslovný kredit původu (agenturní patičku, byline, „jak první informoval“), shodné formulace a společnou tiskovou zprávu. Když je nezávislost nerozhodnutelná z textu, vysloví to a důsledek je 1 ZDROJ.

## Kdy ho spustit {#kdy}

Před každým povýšením tvrzení na status-corroborated, a kdykoli někdo argumentuje počtem odkazů.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** ověřovatel, rešeršista, editor, recenzent
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- sourceFamily umí nezávislost jen ODEBRAT, nikdy přidat. Prázdná rodina neznamená nezávislost, znamená neposouzeno.
- Pravidlo S10 srovnává outlet i registrovanou doménu, takže jeden vydavatel je jeden hlas i ve třech rubrikách.
- Nejistota se řeší dolů, ne nahoru. Předstíraná jistota vyrábí falešné CORROBORATED, což je nejhorší jednotlivá chyba tohohle datového modelu.
- Přeštítkování není povýšení. CORROBORATED vyžaduje skutečně nový nezávislý hlas.

