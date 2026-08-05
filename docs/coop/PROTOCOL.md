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

### Riziko hlavního checkoutu: rozdělaná práce může beze stopy zmizet

Pozorováno živě 2026-08-06: rozdělané (ne ještě commitnuté) úpravy dvou
souborů v hlavním checkoutu (`/Users/korczis/dev/vomaste.cz`) během
několika minut úplně zmizely — `git status` najednou hlásil čistý strom
přesně odpovídající `HEAD`, ve chvíli, kdy se tam objevil nový, nesouvisející
commit z jiné souběžné session. Přesný příkaz, který k tomu vedl, nebyl
zjištěn (žádost o `git reflog`/historii shellu jiné instance není k
dispozici) — ale výsledek odpovídá tomu, co udělá `git checkout -- <soubor>`,
`git reset --hard` nebo `git stash` bez následného `pop` spuštěný přímo
v tomhle checkoutu, zatímco v něm leží něčí neuncommitnutá práce. Na
rozdíl od konfliktů popsaných výš (rebase/merge/build) tohle **není
konflikt, který by cokoliv nahlásilo** — žádná chybová hláška, žádný
build fail, jen tichá ztráta.

Zmírnění, dokud hlavní checkout sdílí víc než jedna instance zároveň:

- Necommitnutou práci tu nenechávej ležet dlouho. Malý, rychle
  commitnutý krok přežije; hodina rozpracovaných úprav ve working tree
  je vystavená riziko celou tu hodinu.
- Před jakýmkoliv `git checkout`/`reset`/`stash`/`clean` v hlavním
  checkoutu zkontroluj `git status` a zvaž, jestli by ses tou operací
  nepřehnal přes cizí rozdělanou práci — stejné pravidlo, jaké tenhle
  agent (Claude Code) dostává jako obecnou instrukci, platí tu
  zdvojnásobeně, protože „cizí" tu může být jiná souběžná instance, ne
  jen historie z minula.
- Pokud potřebuješ delší rozpracovanou úpravu, zvaž dočasný worktree i
  pro práci, která by jinak šla přímo do hlavního checkoutu jako ORCH
  (viz sekce výš) — je to jediná záruka, kterou git nabízí proti přesně
  tomuhle.
- Ztracenou práci lze často rekonstruovat z konverzačního kontextu
  agenta, který ji psal (přesně tak se to řešilo 2026-08-06) — ale to je
  záchranná síť, ne omluva to riskovat znovu.

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
   `.github/workflows/deploy.yml` staví a nasazuje). Od 2026-08-05 se
   tohle po commitu na `master` děje **automaticky** — viz
   „Automatický push po commitu" níž — ORCH ho tedy typicky nespouští
   ručně, jen sleduje, že se `deploy` zpráva objevila na sběrnici.
   Průběžně: deploy po každém mergnutém tasku, ne až nakonec.
7. `wt-done T-###` uklidí worktree a větev.

Konflikty řeší vždy worker rebasem své větve na aktuální `master`
(`git fetch && git rebase master`) — ORCH nikdy neřeší konflikt za něj
při mergi.

## Automatický push po commitu (post-commit hook)

`.githooks/post-commit` (stejný instalační mechanismus jako
`.githooks/pre-commit` — `core.hooksPath`, viz README „Rychlý start")
od 2026-08-05 dělá na `master` po každém commitu automaticky přesně tu
sekvenci, kterou by jinak ORCH spouštěl ručně:

```
fetch origin master → rebase → npm run build (CELÝ, ne jen pre-commit
podmnožina) → push origin master → coop.sh send "*" deploy …
```

Vzniklo ze session 2026-08-05, kde tenhle postup ORCH opakovaně
spouštěl ručně po každém commitu (viz git historie kolem
`AUTH-2026-08-05` rozšíření james-quick dossieru).

Bezpečnostní chování, které z toho dělá něco jiného než „vždy pushni":

- Spustí se **jen na `master`** — workeři v task worktreech (`task/T-###`)
  jím nejsou dotčeni, single-writer pravidlo výše platí beze změny.
- Nikdy se nespustí uprostřed rebase/merge/cherry-picku (jinak by se
  spouštěl na každém mezikroku `git rebase --continue` a pushoval
  rozpracovaný stav).
- Rebase na konflikt se **vzdá** (`rebase --abort`) a nechá commit
  lokální — žádné automatické řešení konfliktů. Recept na typicky
  konfliktní generované soubory je v sekci níž.
- Před pushem musí projít **celý** `npm run build`, ne jen rychlá
  pre-commit podmnožina — červený build se nikdy nepushuje, protože
  push na `master` je live deploy. Commit zůstává lokálně, jen nejde
  ven automaticky; oprav a commitni znovu.
- Až 3 pokusy fetch+rebase+build+push (řeší prohraný závod se
  souběžným pushem odjinud), pak se vzdá se srozumitelnou hláškou.
- Únik: `COOP_NO_AUTOPUSH=1 git commit …` (např. vědomě rozpracovaný
  stav, který se ještě nemá dostat ven) — pak platí stará ruční
  sekvence z kroku 6 výše.

Tohle **nenahrazuje** krok 4/5 (worker → `review-request` →
ORCH merguje `--no-ff` do masteru) — ten merge commit na masteru je to,
co hook následně automaticky pushne. Automatizuje se jen „a teď to
dostaň ven", ne rozhodnutí, jestli se má mergnout.

## Konflikty na generovaných/derivovaných souborech

Session 2026-08-05 (souběžné rozšiřování james-quick dossieru ve dvou
instancích) ukázala, že nejčastější rebase konflikt při aktivním koop
provozu není v ručně psaných kanonických datech, ale v souborech, které
si dvě instance nezávisle přegenerovaly ze stejné výchozí verze. Recept
je pro každý typ jiný, ale vždy mechanický — žádná ruční aritmetika:

- **`scripts/data/compiled-golden.snapshot.json`** (počty záznamů pro
  golden test) — vezmi libovolnou stranu konfliktu
  (`git checkout --ours` nebo `--theirs`), pak `npm run test:update-golden`.
  Nikdy needituj `compiled-golden.test.mjs` ani JSON ručně — proto byl
  po téhle session refaktorovaný z hardcoded literálu právě do
  přegenerovatelného JSON souboru.
- **`data/discovery-log.jsonl`** (append-only NDJSON) — konflikt řeš
  jako sloučení obou stran (ponech obě sekvence řádků, žádnou
  nezahazuj), nikdy needituj počty ručně. Po dořešení ostatních
  konfliktů `npm run data:build` ověří, že log dál sedí s daty.
- **`reports/*.md`, `data/generated/routes.json`,
  `data/generated/navigation.json`** — čistě generované, nikdy je
  needituj ručně. Na konfliktu vezmi libovolnou stranu
  (`git checkout --theirs <soubor>`) a spusť `npm run build` (routes a
  navigation) nebo aspoň `npm run data:build` (reports) — přegenerují
  se z aktuálních dat, cokoliv jsi vzal jako výchozí obsah je jedno.
- **Past**: `data/generated/**` je v `.gitignore`, ale po
  `git reset --hard`/rebase přežívá na disku ze staré verze a
  `data:check-generated:content` pak hlásí zdánlivě nesmyslné route
  parity chyby (routa pro smazaný záznam pořád v `routes.json`, nová
  routa v něm chybí). Fix: `npm run build:routes` (a `build:navigation`)
  před dalším krokem, ne ladění obsahu — soubor je jen zastaralý, ne
  rozbitý.
- **Past, druhá a horší varianta**: dva plné `npm run build` běhy ve
  **stejném checkoutu** (ne dva různé worktrees — to je bezpečné, každý
  má vlastní `data/generated/`) se dřív mohly přetahovat o
  `data/generated/views/**` už v krocích `data:views`/
  `data:generate-content`/`data:sync-content`, dřív než došly na `zola
  build`, kde je chránil `with-build-lock.mjs`. Příznak: `zola build`
  spadne na `load_data: .../clm-NN.json doesn't exist`, přestože ten
  soubor existuje — vypadá to jako datová chyba, není. Reprodukováno
  živě 2026-08-05/06: dvě souběžné session ve stejném checkoutu, každá
  narazila na jiný chybějící view model, a soubor pak vždy existoval.
  Od 2026-08-06 `pipeline.mjs` zamyká **celý** `build` režim (od
  `data:views` po `verify:export`), ne jen zola krok — viz komentář v
  `with-build-lock.mjs`. `.githooks/post-commit` (auto push po commitu,
  viz níž) tenhle risk zvyšuje, protože teď plný build spouští
  automaticky každý commit na masteru, ne jen člověk, když si vzpomene.

## ID kolize u souběžně rozšiřovaného dossieru

Když dvě instance nezávisle přidávají nové `CLM-##`/`SRC-##`/…
záznamy do **téhož** dossieru, obě si typicky spočítají stejné „další
volné" číslo z toho, co vidí lokálně — a dorazí ke stejnému ID s jiným
obsahem (`add/add` konflikt, který git nedokáže automaticky sloučit).
Před přidáním nového záznamu do dossieru, na kterém může souběžně
pracovat i jiná instance:

1. `git fetch origin master` a zkontroluj aktuální nejvyšší
   `CLM-##`/`SRC-##`/… v cílovém dossieru **na originu**, ne jen
   lokálně — lokální stav může být starší.
2. Pokud i tak dojde ke kolizi (viděno 2026-08-05: dvě session obě
   sáhly po `CLM-09`/`SRC-09`/`SRC-10` ve stejném dossieru), neřeš to
   přepisem cizích záznamů. Přečísluj **svoje** nové záznamy tak, aby
   navazovaly za tím, co je skutečně na originu (ne co bylo v tvé
   poslední lokální kopii), včetně všech míst, která ID nesou:
   `identifier`, `@id`, `title`, cross-reference pole (`sources`/
   `claims` v obou směrech), `order`, hand-authored tabulka a graf v
   `dossier.json`, `content/` markdown (ten se ale nikdy needituje
   ručně — po přečíslování kanonických JSON stačí `npm run data:build`).
   `npm run data:validate` po přečíslování potvrdí, že nezůstal
   viset žádný neplatný odkaz.

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
