+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:og — Brána sociálních a SEO metadat"
template = "tooling-command.html"
weight = 65
description = "Brána sociálních a SEO metadat: Po `zola build` projde postavené HTML v `public/` a ověří, že každá routovaná stránka nese kompletní sadu `og:*` a `twitter:*` značek, že `og:url` odpovídá kanonické URL, že obrázek existuje jako soubor a je absolutní URL, že titulek a popis nepřekračují limity z `data/seo.toml`, a že se OG shoduje s JSON-LD téže stránky. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-og"
tooling_command = "verify-og"
view_model = "generated/tooling-catalog.json"
+++

Po `zola build` projde postavené HTML v `public/` a ověří, že každá routovaná stránka nese kompletní sadu `og:*` a `twitter:*` značek, že `og:url` odpovídá kanonické URL, že obrázek existuje jako soubor a je absolutní URL, že titulek a popis nepřekračují limity z `data/seo.toml`, a že se OG shoduje s JSON-LD téže stránky. Alias redirect stránky jsou vyjmuté.

## Kdy ho spustit {#kdy}

Automaticky jako krok pipeline po `zola build`. Ručně po zásahu do `templates/macros/meta.html`, `data/seo.toml` nebo front matteru stránek.

## Co shodí běh {#vynucuje}

- Neúplná sada značek, rozpor OG proti JSON-LD, chybějící soubor obrázku, relativní `og:image`, překročený limit délky, neznámý typ stránky i nepoužitý zápis ve slovníku typů — každý z nich shodí build.

## Co je potřeba vědět {#pozor}

- Nechodí na síť a neměří rozměry obrázku — kontroluje jen to, co je v postaveném HTML a na disku. Limity délky jsou horní strop, ne doporučení.

