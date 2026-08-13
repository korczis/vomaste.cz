+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:navigation — Kontrola navigačního stromu"
template = "tooling-command.html"
weight = 65
description = "Kontrola navigačního stromu: Hlídá generovaný navigační strom proti dvěma strukturálním rozhodnutím vlastníka a proti realitě na disku.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-navigation"
tooling_command = "validate-navigation"
view_model = "generated/tooling-catalog.json"
+++

Hlídá generovaný navigační strom proti dvěma strukturálním rozhodnutím vlastníka a proti realitě na disku.

## Kdy ho spustit {#kdy}

Hned po build:navigation, v build i dev pipeline.

## Co shodí běh {#vynucuje}

- Osoba jako top-level položka sidebaru — skelet musí zůstat bez slugu, bez osoby a bez ručně psané per-dossier registry položky.
- Agregátní dossier s vlastním rozbalovacím podstromem (smí být jen jeden zřetelně označený odkaz, aby nešel splést s třetí osobou).
- Odkaz na něco, co na disku neexistuje.

