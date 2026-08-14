---
name: deploy
description: Ruční nasazení vomaste.cz na GitHub Pages — push na master, když se automatický post-commit/post-merge hook nespustil nebo nedoběhl. Ověří, že strom je čistý a synchronní, projde plnou bránu i prohlížečové testy (které v `npm run build` NEJSOU, ale v CI ano), pushne s deploy sentinelem a počká na výsledek workflow. Použij ho, když někdo řekne „nasaď to", „pushni master", „proč to není na webu", nebo když hook ohlásil, že push přeskočil.
argument-hint: "[--no-wait — nečekat na doběhnutí CI]"
disable-model-invocation: true
---

Push na `master` je **živý deploy** na GitHub Pages. Tenhle skill je
jediné místo v repozitáři, které smí použít sentinel
`CLAUDE_DEPLOY_SKILL=1` (tier 1 v `~/.claude/hooks/block-git-push.sh`).

> `disable-model-invocation: true`: nasazení je publikační rozhodnutí.
> Spouští ho člověk přes `/deploy`, Claude ho nesmí vyvolat mimoděk.

## Za normálních okolností tenhle skill nepotřebuješ

Na `master` se nasazuje **samo**. Po každém commitu i mergi se spustí
`.githooks/post-commit` / `.githooks/post-merge`, které sdílejí rutinu
`.githooks/lib/auto-push-master.sh`:

```
fetch origin master → rebase → npm run build (plná brána) → git push origin master
                                                          → zpráva na coop sběrnici
```

Rutina nikdy nepushne červený build ani rozdělaný stav. Mezi
„commitnuto" a „nasazeno" proto **není pauza na rozmyšlenou**.

## Kdy ho použít

Když automatika neproběhla nebo nedoběhla — hook to vždycky vypíše:

| Hláška hooku | Co se stalo |
|---|---|
| `COOP_NO_AUTOPUSH=1 — auto-push přeskočen` | commit byl schválně lokální |
| `auto-push přeskočen — probíhá rebase/merge/…` | commit padl doprostřed operace |
| `'git fetch origin master' selhal` | nebyla síť nebo origin |
| `rebase na origin/master narazil na konflikt` | vyřeš konflikt, pak nasaď |
| `'npm run build' selhal PO rebase` | oprav build; nikdy neobcházej |
| `push se nepodařil po 3 pokusech` | souběžné pushe, zkus znovu |

A dál: když je `master` napřed proti `origin/master` a nikdo neví proč,
nebo když se předchozí deploy rozbil v CI a je potřeba ho po opravě
znovu spustit.

## Kdy ho NEPOUŽÍT

- **Na větvi.** Worker na `task/T-###` nenasazuje — merguje jen ORCH.
  Na push větve je uživatelský příkaz `push` (globální
  `~/.claude/commands/push.md`, ne skill tohohle repozitáře), na PR `/pr`.
- **K „rychlému" nasazení kolem červeného buildu.** Sentinel obchází
  hook, ne bránu kvality. Červený build se opravuje, ne pushuje.
- **Když jsi neviděl obsah změny.** Push na master zveřejňuje tvrzení
  o skutečných lidech; deploy není mechanický krok.

## Předpoklady

1. Jsi na `master` v hlavním checkoutu (`/Users/korczis/dev/vomaste.cz`).
2. Pracovní strom je čistý (`git status --short` prázdný).
3. Obsahové změny prošly rozsahovou kontrolou (`authorization-check`).

## Postup

1. **Kontext.** `git status --short`, `git rev-parse --abbrev-ref HEAD`,
   `git rev-list --left-right --count origin/master...master`.
   Nečistý strom → nejdřív `/commit`, nikdy necommituj mimoděk.
2. **Srovnej se s originem.**
   ```bash
   git fetch origin master && git rebase origin/master
   ```
   Konflikt na generovaných souborech → recept je v
   `docs/coop/PROTOCOL.md`, sekce „Automatický push po commitu a mergi".
3. **Plná brána.** `npm run build` musí skončit **exit 0**.
4. **Prohlížečové testy.** `npm run test:e2e` — viz varování níž. Taky
   musí být zelené.
5. **Push.** Sentinel je první token, nic před ním:
   ```bash
   CLAUDE_DEPLOY_SKILL=1 git push origin master
   ```
6. **Ověř nasazení**, nespoléhej na to, že push == web:
   ```bash
   gh run list --workflow=deploy.yml --limit 3
   gh run watch <run-id>       # nebo --no-wait a zkontroluj později
   ```

## Zelený `npm run build` NENÍ zelený deploy

Nejdůležitější věc v tomhle souboru, protože je kontraintuitivní a už
jednou stála nasazení (2026-08-13):

`npm run build` **záměrně neobsahuje** Playwright testy — je bránou před
každým commitem a e2e by ji protáhly (viz hlavička
`playwright.config.mjs`). CI je ale spouští jako **samostatný krok
`Browser tests` uvnitř téhož jobu `build`**, a job `deploy` běží jen
tehdy, když `build` projde celý.

Důsledek: e2e selhání = **web se nenasadí**, i když je lokální build
zelený a push proběhl. Navenek to vypadá jako úspěch — commit je na
originu, `git status` čistý — a přitom je na webu pořád předchozí verze.
Proto krok 4 a proto krok 6.

## Lidské kontrolní body

- Před krokem 5: viděl jsi diff toho, co se zveřejňuje?
- U změny dossieru: prošla `/editorial-review`?
- Po kroku 6: workflow **doběhlo zeleně**, ne jen „spustilo se".

## Selhání a co s nimi

| Symptom | Příčina | Řešení |
|---|---|---|
| hook odmítl push s „DOCTRINE: pushing a protected branch" | chybí sentinel | spusť přes `/deploy`, sentinel jako první token |
| `npm run build` červený | skutečná vada | oprav příčinu; `--no-verify` deploy neřeší |
| e2e timeout | web povyrostl přes rozpočet testu | rozpočet testu, ne vada webu — viz `tests/e2e/a11y-sweep.spec.mjs` |
| push odmítnut (non-fast-forward) | někdo pushnul mezitím | krok 2 znovu |
| CI zelené, web starý | Pages cache / běžící workflow | počkej na `deploy` job, pak tvrdé obnovení |

## Výstup

Krátká zpráva: co se nasadilo (SHA + předmět), že brána i e2e byly
zelené, a **stav workflow s odkazem na run**. Bez posledního bodu není
nasazení ohlášeno, jen pushnuto.

## Ověření

```bash
git rev-list --left-right --count origin/master...master   # musí být 0  0
gh run list --workflow=deploy.yml --limit 1                # success
```

## Příklady

**Základní** — hook přeskočil push, dodělám to ručně:
> „post-commit říká COOP_NO_AUTOPUSH, nasaď to"

**Realistický** — po sloučení několika větví, kdy merge commity vznikly
s vypnutým auto-pushem:
> „mergnuto, build zelený, pusť to na web a řekni mi, jak dopadlo CI"

**Selhání** — deploy skončí červeně a skill NEPOKRAČUJE:
> „nasaď to"
> → `npm run build` zelený, `npm run test:e2e` spadne na dvou testech
> → **nepushuje se**; hlásí se, které testy a proč, a nabídne se oprava.
> Kdyby se pushlo, commit by na originu byl, ale web by se neaktualizoval
> — nejhorší z obou světů.

**Přirozené formulace**: „nasaď to", „pushni master", „dej to na web",
„proč to není vidět na vomaste.cz", „deployni".

## Související

- `/commit` — commit; na masteru rovnou spouští auto-deploy
- `/build` — samotná brána kvality
- `/pr` — větev + pull request
- `push` — globální uživatelský příkaz na push větve (ne masteru)
- `/coop-status` — kdo právě drží build-lock
- `docs/coop/PROTOCOL.md` — „Automatický push po commitu a mergi"
