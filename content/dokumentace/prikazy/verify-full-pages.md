+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run verify:full-pages — Plnostránková doktrína"
template = "tooling-command.html"
weight = 65
description = "Plnostránková doktrína: Vynucuje, že každé tvrzení a každý zdroj je plnohodnotná stránka, ne stub — a že se vykresluje ze strukturovaných dat, ne z druhé ručně psané reprezentace. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/verify-full-pages"
tooling_command = "verify-full-pages"
view_model = "generated/tooling-catalog.json"
+++

Vynucuje, že každé tvrzení a každý zdroj je plnohodnotná stránka, ne stub — a že se vykresluje ze strukturovaných dat, ne z druhé ručně psané reprezentace. Doktrína je závazná i pro adoptery a forky.

## Kdy ho spustit {#kdy}

Až po zola build.

## Co shodí běh {#vynucuje}

- Stránka tvrzení bez sekce citovaných zdrojů (id="clm-sources-h") nebo bez odkazu na Git provenance.
- Stránka zdroje bez metadatové tabulky (řádek „Odkaz“), bez sekce podporovaných tvrzení (id="src-claims-h") — s výjimkou záměrně kontextových zdrojů bez tvrzení — nebo bez odkazu na Git provenance.

## Co je potřeba vědět {#pozor}

- Zdrojová strana téže doktríny (povinná pole a minimální redakční tělo zdroje) žije v kanonických validátorech, JSON-LD strana ve verify:jsonld.

