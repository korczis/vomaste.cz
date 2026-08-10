+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run archive:refresh-private — Úplný refresh soukromé Zone B"
template = "tooling-command.html"
weight = 72
description = "Úplný refresh soukromé Zone B: Na důvěryhodném stroji stáhne všechny listiny indexované v private raw Justice metadatech, atomicky dokončí soubory, přegeneruje globální checksum inventář a vyžádá úplné pokrytí.. npm skript, rešerše."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/archive-refresh-private"
tooling_command = "archive-refresh-private"
view_model = "generated/tooling-catalog.json"
+++

Na důvěryhodném stroji stáhne všechny listiny indexované v private raw Justice metadatech, atomicky dokončí soubory, přegeneruje globální checksum inventář a vyžádá úplné pokrytí.

## Kdy ho spustit {#kdy}

Pouze na důvěryhodném stroji s dostatečnou kapacitou a perzistentním úložištěm Zone B, po archive:refresh-public.

## Co shodí běh {#vynucuje}

- Selhání downloadu, chybný typ nebo velikost souboru, hash mismatch, zbylý .part soubor nebo jedinou indexovanou listinu chybějící v soukromém archivu.

## Co je potřeba vědět {#pozor}

- Nikdy neběží v CI a nikdy nic ze Zone B nepřidává do Gitu.
- Při nedostatku místa selže a zachová resumovatelné .part; následná kontrola je označí jako nehotový stav, ne jako kompletní archiv.

