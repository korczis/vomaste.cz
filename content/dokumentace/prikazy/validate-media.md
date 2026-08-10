+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:media — Licenční brána médií"
template = "tooling-command.html"
weight = 15
description = "Licenční brána médií: Ověřuje, že každá publikovaná fotografie a logo má doloženou svobodnou licenci, autora, odkaz na stránku zdroje a soubor přímo v repozitáři.. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-media"
tooling_command = "validate-media"
view_model = "generated/tooling-catalog.json"
+++

Ověřuje, že každá publikovaná fotografie a logo má doloženou svobodnou licenci, autora, odkaz na stránku zdroje a soubor přímo v repozitáři.

## Kdy ho spustit {#kdy}

V build pipeline; po každém `npm run media:fetch` a po ručním zásahu do pole `media`.

## Co shodí běh {#vynucuje}

- M1 — odkazovaný soubor v repozitáři skutečně existuje a není prázdný; mrtvá cesta by se vykreslila jako rozbitý rámeček v každém sociálním náhledu.
- M2 — licence je na seznamu svobodných licencí (scripts/media/lib/licences.mjs) a autor i datum stažení jsou vyplněné; u CC BY / BY-SA je uvedení autora podmínkou licence, ne zdvořilostí.
- M3 — sourceUrl vede na stránku souboru s licencí, ne na samotné bajty; rozhoduje hostitel a cesta, ne přípona (stránka na Commons se legitimně jmenuje File:Něco.JPG).
- M4 — žádný soubor v static/images/{people,logos,media} neleží v repozitáři bez záznamu, který by se k němu hlásil.

## Co je potřeba vědět {#pozor}

- Tvarovou kontrolu dělá schéma entity; tenhle validátor kontroluje význam — schéma ověří, že `license` je řetězec, ne že ta licence dovoluje publikaci.
- Seznam svobodných licencí je záměrně allowlist se společným vlastníkem pro validátor i stahovač: „fair use“, „non-free logo“ ani prázdná hodnota neprojdou.

