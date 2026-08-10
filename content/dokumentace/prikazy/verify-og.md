+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:og — Sociální a SEO metadata ve vydaném HTML"
template = "tooling-command.html"
weight = 68
description = "Sociální a SEO metadata ve vydaném HTML: Post-build brána nad každou vydanou stránkou: og:* a twitter:* jsou úplné, míří na existující absolutní obrázek, vejdou se do mezí z data/seo.toml a nesou doslova tytéž hodnoty jako stránkový uzel JSON-LD.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-og"
tooling_command = "verify-og"
view_model = "generated/tooling-catalog.json"
+++

Post-build brána nad každou vydanou stránkou: og:* a twitter:* jsou úplné, míří na existující absolutní obrázek, vejdou se do mezí z data/seo.toml a nesou doslova tytéž hodnoty jako stránkový uzel JSON-LD.

## Kdy ho spustit {#kdy}

Až po zola build, nad public/ — stejně jako verify:jsonld.

## Co shodí běh {#vynucuje}

- Chybějící nebo prázdná značka z enforce.required_og / enforce.required_twitter v data/seo.toml.
- og:url, které se neshoduje s <link rel="canonical"> — nebo kanonická URL na stránce, která ji podle enforce.without_canonical mít nemá.
- Relativní og:image, obrázek chybějící ve vydaném stromu, a twitter:image nebo og:image:secure_url mířící jinam než og:image.
- Titulek nebo popis mimo meze limits.* — včetně prázdného.
- Rozchod og:title / og:description s name / description stránkového uzlu JSON-LD (do T-076 se lišily na 2 246, resp. 463 stránkách).
- og:type mimo slovník seo.page_types, a nesoulad mezi record_type v content/** a klíči seo.page_types v OBOU směrech.

## Co je potřeba vědět {#pozor}

- Nechodí na síť a neměří rozměry obrázku — kontroluje jen to, co je v postaveném HTML a na disku. Limity délky jsou horní strop, ne doporučení.

