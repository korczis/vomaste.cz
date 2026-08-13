+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/seo-review — Review metadat stránky"
template = "tooling-command.html"
weight = 121
description = "Review metadat stránky: Zkontroluje titulek, popis, kanonickou URL, Open Graph a Twitter karty, odvození og:type z record_type, JSON-LD a vnitřní prolinkování — proti tomu, jak to tenhle web dělá: metadata jsou data v data/seo.toml, vydává je jediné makro a po buildu je ověřuje verify-og. Claude skill, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-seo-review"
tooling_command = "skill-seo-review"
view_model = "generated/tooling-catalog.json"
+++

Zkontroluje titulek, popis, kanonickou URL, Open Graph a Twitter karty, odvození og:type z record_type, JSON-LD a vnitřní prolinkování — proti tomu, jak to tenhle web dělá: metadata jsou data v data/seo.toml, vydává je jediné makro a po buildu je ověřuje verify-og. Ruční meta tag v šabloně je nález.

## Kdy ho spustit {#kdy}

Při vzniku nové stránky nebo nového record_type, a když se řeší náhled při sdílení.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** vývojář, údržbář
- **Riziko:** jen čte
- **Zapisuje do souborů:** ne

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- og:title/og:description a name/description stránkového uzlu JSON-LD musí být tatáž hodnota. Nejsou to dva popisy téže stránky.
- Nový record_type bez záznamu v [page_types.*] shodí build, a obousměrně i mrtvý záznam bez použití.
- Truth-rating značky (ClaimReview, reviewRating) jsou zakázané a verify:jsonld je shodí. Stavy tohohle webu popisují doloženost, ne rozsouzenou pravdu.
- Popis stránky popisuje, co na ní je. Optimalizace nad rámec pravdivosti se tu nedělá.

