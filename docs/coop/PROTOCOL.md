# Co-op protokol v1 — více instancí Claude Code nad jedním repem

Operační protokol pro paralelní práci více instancí Claude Code (nebo
lidí) na tomto repu. Je čistě **provozní**: nikdy nepřebíjí editorská
pravidla, autorizační log ani build gate v `AGENTS.md` — ta platí pro
každý task beze změny.

## Role

- **ORCH** (orchestrátor) — právě jedna instance, běží v hlavním
  checkoutu (`/Users/korczis/dev/vomaste.cz`, větev `master`). Jediná
  smí: rozkládat zadání na tasky, editovat `docs/coop/TASKS.md`,
  mergovat do `master` a pushovat (= deploy).
- **W-n** (worker) — libovolný počet instancí, každá v **vlastním git
  worktree** na **vlastní větvi**, pracuje vždy právě na jednom tasku.
- **REV** (reviewer, volitelný) — čte diff cizí větve, hlásí nálezy po
  sběrnici; nikdy needituje.

Identita instance: proměnná `COOP_AGENT_ID` (např. `ORCH`, `W-1`);
bez ní se použije jméno aktuální větve.

## Rozklad zadání (vstupní prompt → tasky)

Když přijde větší zadání (pastnutý text/prompt), ORCH ho **nejdřív**
rozloží na tasky a zapíše do boardu — teprve pak se začne pracovat:

1. Rozsekat na nezávislé, mergovatelné jednotky (jedna jednotka = jde
   samostatně zvalidovat přes `npm run build` a samostatně mergnout).
2. Každé jednotce dát ID `T-###`, titul, přesný scope (které soubory /
   sekce), akceptační kritérium a závislosti na jiných taskách.
3. Cokoliv, co by se dotklo obsahu o reálné osobě, dostane štítek
   `[scope-check]` a před startem se ověří proti autorizačnímu logu
   v `AGENTS.md`; nový subjekt/téma = stop a zeptat se vlastníka.
4. Board commitnout na `master` — tím je zadání trackovatelné v gitu.

## Task board — `docs/coop/TASKS.md`

Jediný zdroj pravdy o stavu práce, **single-writer**: edituje ho pouze
ORCH, pouze na `master`. Workeři stav nikdy needitují — hlásí ho po
sběrnici a ORCH ho propíše. (Stejný vzor jako single-source-of-truth u
dossieru: jedna kanonická reprezentace, žádné souběžné zápisy.)

Stavy: `todo → claimed → in-progress → review → merged`, kdykoliv
`blocked` (s důvodem v poznámce).

## Worktrees — jeden task = jedna větev = jeden worktree = jedna instance

Worktrees žijí mimo repo v `~/dev/vomaste-worktrees/` (zavedený
precedens), větve se jmenují `task/T-###`:

```sh
scripts/coop/coop.sh wt-add T-001    # git worktree add ../vomaste-worktrees/T-001 -b task/T-001 master
cd ~/dev/vomaste-worktrees/T-001 && npm ci   # worktree má vlastní node_modules
COOP_AGENT_ID=W-1 claude             # nová instance Claude Code v worktree
```

Po mergnutí: `scripts/coop/coop.sh wt-done T-001` (odstraní worktree i
větev). Worktree se nikdy nerecykluje na jiný task.

## Sběrnice zpráv (serializace)

Instance spolu mluví přes **append-only NDJSON log** ve sdíleném git
adresáři — ten je společný všem worktrees a není verzovaný:

```
$(git rev-parse --git-common-dir)/coop-bus/bus.ndjson
```

Jedna zpráva = jeden řádek = jeden JSON objekt (řádky < 4 kB jsou na
POSIX appendované atomicky, takže netřeba zámky):

```json
{"v":1,"ts":"2026-07-29T19:00:00Z","from":"W-1","to":"ORCH","type":"progress","task":"T-001","payload":{"note":"claims table hotova, bezi build"}}
```

- `v` — verze protokolu (teď `1`)
- `from`/`to` — ID instance; `to:"*"` = broadcast
- `type` — `claim` | `progress` | `blocked` | `review-request` |
  `done` | `merged` | `deploy` | `note` | `ping`
- `task` — `T-###`, nebo `""` u zpráv mimo task
- `payload` — libovolný validní JSON objekt (typicky `{"note": "..."}`)

Obsluha přes helper (nikdy neručně, ať je formát konzistentní):

```sh
scripts/coop/coop.sh send ORCH claim T-001 '{"note":"beru si to"}'
scripts/coop/coop.sh inbox        # zprávy pro mě (a broadcasty)
scripts/coop/coop.sh log 50       # posledních 50 zpráv celé sběrnice
scripts/coop/coop.sh status       # board + worktrees + poslední zprávy
```

Instance čtou sběrnici na začátku session (SessionStart hook pouští
`coop.sh status`) a průběžně mezi kroky — žádný push kanál není,
je to poll.

## Životní cyklus tasku

1. ORCH zapíše task do boardu (`todo`) a pošle `note`/broadcast.
2. Worker pošle `claim` → ORCH propíše `claimed` + `Owner`.
3. Worker pracuje ve svém worktree, průběžně posílá `progress`;
   commituje malé, atomické commity na `task/T-###`.
4. Hotovo = ve worktree prošel **celý** `npm run build` → worker pošle
   `review-request` (payload: větev, shrnutí, výstup buildu OK).
5. ORCH (příp. REV) zkontroluje diff, mergne do `master`
   (`git merge --no-ff task/T-###`), pustí `npm run build` ještě jednou
   na masteru, propíše `merged` do boardu.
6. Deploy = `git push` masteru (GitHub Pages CI v
   `.github/workflows/deploy.yml` staví a nasazuje). ORCH pošle
   `deploy` zprávu. Průběžně: deploy po každém mergnutém tasku, ne až
   nakonec.
7. `wt-done T-###` uklidí worktree a větev.

Konflikty řeší vždy worker rebasem své větve na aktuální `master`
(`git fetch && git rebase master`) — ORCH nikdy neřeší konflikt za něj
při mergi.

## Paralelismus uvnitř jedné instance

Souběžné instance přes worktrees jsou pro **nezávislé, dlouhoběžící**
tasky. Pro fan-out uvnitř jednoho tasku (průzkum, review z více úhlů)
má každá instance k dispozici vlastní subagenty (Agent tool /
Workflow) — ty koordinuje sama a na sběrnici hlásí jen souhrnný stav
tasku. Žádný vestavěný „co-op mode" v Claude Code není; co-op je přesně
tento protokol.

## Vazba na pravidla repa (závazné)

- Editorská pravidla, autorizační log a build gate z `AGENTS.md` platí
  v každém worktree stejně jako na masteru. Sběrnice ani board nikdy
  neslouží k obcházení „stop and ask" u obsahu o reálných osobách.
- Merge do `master` jen se zeleným `npm run build`. Červený build na
  masteru = stop-the-line: žádné další merge, dokud není zelený.
- Board i protokol jsou verzované v repu; sběrnice (`coop-bus/`) je
  efemérní provozní log a do gitu nepatří.
