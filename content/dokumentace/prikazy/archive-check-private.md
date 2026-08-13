+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run archive:check-private — Kontrola soukromé Zone B"
template = "tooling-command.html"
weight = 39
description = "Kontrola soukromé Zone B: Na důvěryhodném lokálním úložišti ověří inventory.sha256, manifestové hashe a nepřítomnost částečných .part souborů v soukromém archivu listin.. npm skript, kontrola výstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/archive-check-private"
tooling_command = "archive-check-private"
view_model = "generated/tooling-catalog.json"
+++

Na důvěryhodném lokálním úložišti ověří inventory.sha256, manifestové hashe a nepřítomnost částečných .part souborů v soukromém archivu listin.

## Kdy ho spustit {#kdy}

Jen na stroji s připojenou perzistentní Zone B; po downloadu, přesunu nebo zálohování soukromého archivu.

## Co shodí běh {#vynucuje}

- Chybějící nebo neúplný inventory.sha256, hash mismatch, chybějící manifestový soubor, nevalidní manifest nebo zbylý .part soubor.

## Co je potřeba vědět {#pozor}

- Není v CI ani veřejném buildu, protože Zone B nesmí být na běžném runneru ani v GitHub artifactu.
- Bez --require-complete výslovně reportuje počet dosud nestažených dokumentů, ale nezaměňuje neúplnost za porušení integrity již uložených souborů.

