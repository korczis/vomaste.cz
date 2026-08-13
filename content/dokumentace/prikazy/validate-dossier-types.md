+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "npm run validate:dossier-types — Entitní × agregátní dossier"
template = "tooling-command.html"
weight = 14
description = "Entitní × agregátní dossier: Vynucuje rozdíl mezi entitním a agregátním dossierem: agregát je generovaný pohled, nikdy třetí rovnocenný dossier a nikdy místo, kde vznikají nové záznamy.. npm skript, validace vstupů."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/validate-dossier-types"
tooling_command = "validate-dossier-types"
view_model = "generated/tooling-catalog.json"
+++

Vynucuje rozdíl mezi entitním a agregátním dossierem: agregát je generovaný pohled, nikdy třetí rovnocenný dossier a nikdy místo, kde vznikají nové záznamy.

## Kdy ho spustit {#kdy}

V build i dev pipeline; po každé změně dossierType nebo po přesunu záznamů mezi dossiery.

## Co shodí běh {#vynucuje}

- Entitní dossier, který vlastní byť jediný fyzický per-record soubor — každý registr, který ukazuje, musí být filtrovaná projekce, nikdy duplikát.

## Co je potřeba vědět {#pozor}

- Kde kanonické soubory fyzicky leží, samo o sobě vada není — Zola dává každému souboru právě jednu URL a přesun by rozbil existující kanonické adresy a kotvy. Kontroluje se tedy invariant, který za téhle podmínky dává smysl: nic se nesmí duplikovat.

