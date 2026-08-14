+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.
title = "/deploy — Ruční nasazení na GitHub Pages"
template = "tooling-command.html"
weight = 142
description = "Ruční nasazení na GitHub Pages: Ruční push na master, tedy živý deploy na GitHub Pages — pro případy, kdy se automatický post-commit/post-merge hook nespustil nebo nedoběhl. Claude skill, provoz."

[extra]
generated = true
lang = "cs"
seo_type = "TechArticle"
record_type = "toolingCommand"
record_id = "https://vomaste.cz/id/prikazy/skill-deploy"
tooling_command = "skill-deploy"
view_model = "generated/tooling-catalog.json"
+++

Ruční push na master, tedy živý deploy na GitHub Pages — pro případy, kdy se automatický post-commit/post-merge hook nespustil nebo nedoběhl. Srovná větev s originem, projde plnou bránu i prohlížečové testy a po pushi ověří, že workflow doběhlo zeleně.

## Kdy ho spustit {#kdy}

Když hook vypsal, že auto-push přeskočil (COOP_NO_AUTOPUSH, rozdělaná operace, výpadek sítě, konflikt rebase, červený build, vyčerpané pokusy o push), když je master napřed proti origin/master, nebo když se předchozí deploy rozbil v CI a po opravě je potřeba ho spustit znovu.

## Pro koho a s jakým rizikem {#persona}

- **Persona:** údržbář, orchestrátor
- **Riziko:** údržbář
- **Zapisuje do souborů:** ano

## Co vynucuje {#vynucuje}

Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.

## Co je potřeba vědět {#pozor}

- Jediné místo v repozitáři, které smí použít sentinel CLAUDE_DEPLOY_SKILL=1 (tier 1 v ~/.claude/hooks/block-git-push.sh). Sentinel obchází hook, NE bránu kvality — červený build se opravuje, ne pushuje.
- Zelený `npm run build` není zelený deploy: Playwright testy jsou z buildu záměrně venku (byl by bránou před každým commitem), ale CI je pouští jako samostatný krok téhož jobu a job `deploy` běží jen při jeho úspěchu. Selhání e2e proto znamená, že se web nenasadí, přestože push proběhl — navenek k nerozeznání od úspěchu. Ověřeno 2026-08-13, kdy přesně tohle zůstalo nenasazené.
- Za normálních okolností se nepoužívá: na master nasazuje samo .githooks/lib/auto-push-master.sh (fetch → rebase → plný build → push → zpráva na sběrnici) po každém commitu i mergi.
- Nepatří na větev. Worker na task/T-### nenasazuje — merguje a pushuje jen ORCH; na push větve je /push, na PR /pr.

