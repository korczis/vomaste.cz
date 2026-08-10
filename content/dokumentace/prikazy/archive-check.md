+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run archive:check — Offline brána archivu úředních dokumentů"
template = "tooling-command.html"
weight = 1
description = "Offline brána archivu úředních dokumentů: Jedním offline během ověří ARES a Justice pokrytí všech podporovaných entit s IČO, sanitizaci veřejných Justice indexů, SHA-256 archivu, inventuru spisových značek, hranici Zone A/B a bezpečné zapojení doktríny i plánovaného refresh workflow.. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/archive-check"
tooling_command = "archive-check"
view_model = "generated/tooling-catalog.json"
+++

Jedním offline během ověří ARES a Justice pokrytí všech podporovaných entit s IČO, sanitizaci veřejných Justice indexů, SHA-256 archivu, inventuru spisových značek, hranici Zone A/B a bezpečné zapojení doktríny i plánovaného refresh workflow.

## Kdy ho spustit {#kdy}

Automaticky v pre-commit hooku a ve všech režimech pipeline; ručně po každé změně entity, IČO, archivního manifestu, spisové značky nebo archivní politiky.

## Co shodí běh {#vynucuje}

- Chybějící ARES nebo sanitizovaný Justice záznam pro podporovanou entitu s ověřeným IČO.
- Hash drift, nesanitizovaný veřejný Justice index, nezatříděná spisová značka nebo neprázdná nerevidovaná odpověď soudní vývěsky.
- Soubor Zone B či .part sledovaný Gitem, chybějící archivní doktrínu v AGENTS.md/README.md/CLAUDE.md nebo její odpojení z pipeline a pre-commit hooku.
- Naplánovaný workflow bez review PR, s přímým pushem do masteru nebo s pokusem stáhnout či uploadovat Zone B.

## Co je potřeba vědět {#pozor}

- Nesahá na síť ani do soukromého úložiště a nic nezapisuje, takže je deterministickou součástí běžného buildu.
- Kontroluje integritu a pokrytí, nikoli pravdivost obsahu úřední listiny ani právní závěr.

