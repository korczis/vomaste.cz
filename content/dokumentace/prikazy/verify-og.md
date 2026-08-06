+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:og — Post-build brána sociálních a SEO metadat"
template = "tooling-command.html"
weight = 65
description = "Post-build brána sociálních a SEO metadat: Nad vydaným public/ ověřuje og:* a twitter:* na každé stránce a jejich shodu s JSON-LD uzlem stránky.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-og"
tooling_command = "verify-og"
view_model = "generated/tooling-catalog.json"
+++

Nad vydaným public/ ověřuje og:* a twitter:* na každé stránce a jejich shodu s JSON-LD uzlem stránky.

## Kdy ho spustit {#kdy}

Automaticky po `zola build` jako součást `npm run build`; samostatně při ladění náhledů odkazů.

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Zavedeno po zjištění, že 334 stránek vztahů mělo og:type=website místo article a že titulek v og a v JSON-LD tvrdil na 2 246 stránkách dvě různé věci.
- Přesměrovací stuby aliasů Zoly jsou vyjmuty, stejně jako ve verify-jsonld.

