---
name: diagnose
description: Zkontroluje, jestli je prostředí schopné v tomhle repozitáři pracovat — git, worktree, Node, Zola, závislosti, git hooky, vygenerované soubory, stav co-op a dostupnost brány kvality. Použij ho, když něco nejde spustit, build padá na něčem, co nevypadá jako chyba v datech, po prvním naklonování repozitáře, nebo když uživatel řekne „nefunguje mi to", „nejde build", „chybí mi něco".
argument-hint: "[volitelně: co konkrétně nefunguje]"
allowed-tools: Bash(git status:*) Bash(git branch:*) Bash(git worktree:*) Bash(node --version) Bash(npm --version) Bash(zola --version) Bash(claude --version) Read Grep Glob
---

Diagnostika prostředí. Vypíše **PASS / WARN / FAIL** a u každého
problému konkrétní opravu.

> **Proč `/diagnose` a ne `/doctor`.** `/doctor` je vestavěný příkaz
> Claude Code (kontroluje instalaci a navrhuje zkrácení `CLAUDE.md`).
> Projektový skill toho jména by v interaktivní session nešlo spustit.

## Kdy ho použít

- Po naklonování repozitáře, před první prací.
- Když `npm run build` padá na něčem, co nevypadá jako chyba v datech.
- Když příkaz z dokumentace neexistuje nebo se chová jinak.
- Když si nejsi jistý, ve kterém worktree a na které větvi vlastně jsi.

## Kdy ho NEPOUŽÍT

- **Na chybu ve validátoru dat.** Když `npm run data:validate` hlásí
  konkrétní pravidlo (S2, R8, T4), prostředí je v pořádku a tenhle skill
  nic nezjistí. Čti hlášku validátoru.
- **Jako opravu.** Tenhle skill **nic nemění** a nesmí. Diagnostikovat
  a opravit jsou dva různé úkony a druhý patří člověku.
- **Jako průběžnou kontrolu.** Není to preventivní běh před každou
  změnou; od toho je pre-commit a `npm run build`.

## Co spustit

Všechno jen pro čtení. Když příkaz selže, to je ta odpověď — nezkoušej
obejít.

```bash
git rev-parse --show-toplevel        # kořen repozitáře
git branch --show-current            # větev
git worktree list                    # kde jsem a kdo ještě pracuje
git status --short                   # špinavý strom
node --version                       # runtime
npm --version
zola --version                       # generátor webu
claude --version                     # verze Claude Code
```

Dál (bez spouštění buildu):

- existuje `node_modules/`?
- je `core.hooksPath` nastavený na `.githooks`?
  (`git config core.hooksPath`)
- existují vygenerované vstupy? — `node scripts/build/require-generated.mjs`
- co říká co-op? — `scripts/coop/coop.sh status`
- načte se konfigurace? — `.claude/settings.json` musí být platný JSON
- kolik schopností se našlo? — `ls .claude/skills/*/SKILL.md`,
  `ls .claude/agents/*.md`, `ls .claude/workflows/*.md`

## Jak výsledky vyhodnotit

| Zjištění | Stav | Oprava |
|---|---|---|
| nejsem v git repozitáři | FAIL | jsi v jiném adresáři, než myslíš |
| větev `master` v hlavním checkoutu | PASS | ale pozor: commit = deploy |
| větev `master` a špinavý strom s cizími změnami | WARN | pracuje tu jiná session, ověř co-op |
| jsem ve worktree `T-###` | PASS | to je normální režim workera |
| Node < 20 | FAIL | repozitář používá moderní Node API |
| chybí `zola` | FAIL | `npm run build` skončí na `zola build`; ostatní kroky poběží |
| chybí `node_modules` | FAIL | `npm ci` |
| `core.hooksPath` není `.githooks` | WARN | `npm run hooks:install` |
| chybí vygenerované vstupy | WARN | `npm run generate:all` (nebo `npm run dev`) |
| `.claude/settings.json` není platný JSON | FAIL | konfigurace se tiše nenačte |
| co-op hlásí obsazený build-lock | WARN | počkej, nebo se ozvi na sběrnici |
| nula skillů | FAIL | jsi mimo repozitář, nebo je `.claude/` neúplné |

**Nový worktree je nejčastější případ.** Chybí v něm `node_modules`
i vygenerované soubory a pre-commit na tom spadne dřív, než se stihne
podivit. Pořadí je: `npm ci` (nebo symlink na hlavní checkout),
pak `npm run generate:all`.

## Co skill NEUDĚLÁ

- Nic nesmaže, nepřepíše, nenainstaluje ani nespustí build. Návrh
  opravy vypíše; provede ji člověk.
- Neřeší chyby v datech ani v obsahu.
- Neřekne, jestli je změna správná — jen jestli má prostředí šanci
  fungovat.

## Výstup

```
STAV:        WARN
PROŠLO:      git, Node 24.8.0, npm, závislosti, .claude/settings.json (10 skillů)
NEPROŠLO:    —
VAROVÁNÍ:    chybí vygenerované vstupy; core.hooksPath není nastavený
DALŠÍ KROK:  npm run generate:all  &&  npm run hooks:install
```

Když všechno projde, výstup je jeden řádek. Diagnostika, která i při
zdravém prostředí vypíše třicet řádků, se přestane číst.

## Příklady

**Základní.** Čerstvý klon → FAIL na chybějících `node_modules`,
další krok `npm ci`.

**Realistický.** `npm run build` padá na `verify:source-catalog`
v novém worktree. Diagnostika ukáže WARN „chybí vygenerované vstupy" —
brána nehlásí rozejitá data, ale to, že výstup ještě nikdy nevznikl.
Oprava je `npm run generate:all`, ne úprava katalogu.

**Selhání.** `zola --version` nic nevrátí. To je FAIL, ale **částečný**:
datové validátory i generátory poběží dál, spadne až `zola build`
a kontroly nad postaveným webem. Řekni to takhle přesně — „build
nefunguje" by poslalo člověka hledat chybu jinam.

## Související

`/bootstrap` (nastartování session — předpokládá, že prostředí už
funguje), `/guide` (nevím, co dál),
`docs/claude-code/compatibility.md` (minimální ověřená verze
Claude Code a co se ověřilo jako past).
