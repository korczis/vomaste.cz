# Claude Code — na čem tenhle repozitář stojí

Tooling v `.claude/` používá konkrétní schopnosti Claude Code. Ty se
mění mezi verzemi. Tenhle soubor říká, **co bylo ověřeno, kdy a proti
čemu** — aby se za rok nehádalo, jestli něco nefunguje kvůli chybě, nebo
proto, že se API mezitím posunulo.

| | |
|---|---|
| **Minimální ověřená verze** | `2.1.231` |
| **Ověřeno dne** | 2026-08-13 |
| **Ověřeno proti** | oficiální dokumentaci na `https://code.claude.com/docs/en/` (skills, sub-agents, hooks, memory) |
| **Ověřovací příkaz** | `claude --version` |

Pozn.: doména se v roce 2026 přesunula — `docs.claude.com/en/docs/claude-code/*`
vrací 301 na `code.claude.com/docs/en/*`. Při příštím ověřování začni
u indexu `https://code.claude.com/docs/llms.txt`.

---

## Na čem repozitář stojí (povinné)

Bez těchto schopností tooling nefunguje. Když se změní, je to breaking
change pro `.claude/`.

### Skills — `.claude/skills/<jméno>/SKILL.md`

- Název příkazu se bere z **názvu adresáře**, ne z pole `name` ve
  frontmatteru. `name` je u projektových skillů jen zobrazovací štítek.
  (U pluginových skillů je to jinak — nás se to netýká.)
- Frontmatter je volitelný, doporučené je `description`. Claude podle něj
  rozhoduje, kdy skill sám použít.
- `description` + `when_to_use` se v seznamu skillů ořezávají na
  **1 536 znaků** dohromady. Klíčový případ užití patří na začátek.
- Tělo skillu se načítá **až při použití** — dlouhý referenční text proto
  nestojí kontext, dokud není potřeba. To je celý důvod, proč procedury
  patří sem a ne do `CLAUDE.md`.

Pole frontmatteru, která tenhle repozitář používá:

| Pole | K čemu tady |
|---|---|
| `description` | rozpoznání záměru — musí být napsané tak, aby Claude poznal, kdy skill sedí |
| `argument-hint` | nápověda k argumentům v autocomplete |
| `disable-model-invocation` | u rizikových akcí (`commit`, `pr`, zápis do dat) — Claude je nesmí spustit mimoděk, jen člověk přes `/jméno` |
| `allowed-tools` | předschválené nástroje pro daný tah |


Ověřená pole, která tady zatím nepoužíváme: `when_to_use`, `arguments`,
`user-invocable`, `disallowed-tools`, `model`, `effort`, `context: fork`,
`agent`, `background`, `hooks`, `paths`, `shell`, `metadata`, `license`,
`compatibility`.

**Proč ne `metadata`.** Je to legální free-form mapa pro vlastní
tooling a nabízela se jako místo pro personu a riziko. Nepoužívá se:
Claude Code na ni nesahá, takže by runtime nepřinesla nic, a subagenti
mají uzavřenou sadu polí frontmatteru, takže by pro ně stejně musel
vzniknout druhý mechanismus. Persona a riziko proto žijí jednotně
v `data/tooling/*.json`.

**Pozor při vývozu skillu ven.** Mimo Claude Code (nahrání na claude.ai,
Skills API, `package_skill.py`) projde jen šestice `name`, `description`,
`license`, `compatibility`, `metadata`, `allowed-tools`. `argument-hint`
by tam skončil tvrdou chybou. Skilly tohoto repozitáře se nikam
nenahrávají — jsou projektové a žijí v gitu — takže to nevadí; kdyby se
to změnilo, tohle je ta past.

### Subagenti — `.claude/agents/*.md`

- `name` a `description` jsou **povinné**. `name` nesmí obsahovat `:`.
- `tools` vynechané = zdědí všechno. Tenhle repozitář ho proto vyplňuje
  vždy: read-only agent bez `tools` by měl `Write` a `Edit`.
- `model` výchozí `inherit`.
- `skills` přednačte celý obsah skillu do kontextu agenta (ne jen popis).
- `isolation: worktree` dá agentovi vlastní dočasný git worktree.
- Adresář `.claude/agents/` vzniklý až po startu session se nenačte —
  po přidání prvního agenta je potřeba restart.

### Hooks — `.claude/settings.json`

Události, na kterých tenhle repozitář stojí: `SessionStart`,
`PreToolUse`. Existuje jich mnohem víc (`PostToolUse`, `Stop`,
`SubagentStart`, `InstructionsLoaded`, `FileChanged`, …) — nepoužíváme
je, protože pro ně není měřená potřeba.

Blokace v `PreToolUse` má dvě podoby a obě fungují:

```jsonc
// 1) exit code 2 + zpráva na stderr
// 2) exit 0 + JSON:
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "…"
  }
}
```

Matcher: prostý název nástroje (`Bash`), výčet (`Edit|Write`), nebo —
při jiném znaku — JavaScript regex bez ukotvení.

### Rules — `.claude/rules/*.md`

- Načítají se rekurzivně, `.md` soubory, i z podadresářů.
- **Bez** `paths` frontmatteru se načtou při startu se stejnou prioritou
  jako `.claude/CLAUDE.md`. Kontext tedy neušetří.
- **S** `paths` (glob patterny) se načtou, teprve když Claude sáhne na
  odpovídající soubor. To je jediný způsob, jak `CLAUDE.md` skutečně
  zhubnout — ne rozdělením na víc vždy-načítaných souborů.
- Po `/compact` se path-scoped pravidla samy neinjektují zpátky; načtou
  se, až Claude znovu otevře odpovídající soubor.

To je důvod, proč jsou pravidla v tomhle repozitáři rozdělená právě
takhle: co platí vždy, zůstává v `CLAUDE.md`; co platí jen při práci
s určitou částí stromu, je path-scoped pravidlo.

---

## Co je volitelné

Nic z toho není potřeba k tomu, aby šlo v tomhle repozitáři pracovat.
Dokumentace to smí zmiňovat jen jako volitelné.

- **MCP servery.** Repozitář žádný nevyžaduje a `npm run build` na
  žádném nestojí. Prohlížečová automatizace se hodí pro `/ui-review`
  a `/a11y-review`, ale oba skilly musí fungovat i bez ní (statickou
  kontrolou šablon) a musí to říct nahlas.
- **`context: fork`** ve skillu. Užitečné pro rešeršní skilly, které by
  jinak zaplavily hlavní kontext. Nepoužíváme — subagenti v
  `.claude/agents/` dělají totéž explicitněji a jsou verzované.
- **`isolation: worktree`** u agentů. Repozitář má vlastní worktree
  disciplínu v `docs/coop/PROTOCOL.md`; míchat obojí by mátlo.
- **Agent teams, background agents, cross-session messaging.** Souběžnou
  práci tady řeší co-op protokol, ne tahle vrstva.

---

## Co se ověřilo jako past

- **Import `@AGENTS.md` v `CLAUDE.md` načte celý soubor při startu.**
  Včetně append-only autorizačního logu, který tvoří většinu jeho délky.
  Je to záměrné — rozsahová brána musí být v kontextu — ale je to
  nejdražší jedna položka celého startu. Kdo bude někdy `AGENTS.md`
  dělit, musí nejdřív vyřešit `validate-authorization.mjs`, které se na
  konkrétní sekce toho souboru odkazuje.
- **Doporučená velikost `CLAUDE.md` je pod 200 řádků.** Delší soubor
  spolehlivost dodržování snižuje.
- **Vestavěné příkazy si své jméno drží.** `/help`, `/doctor`, `/memory`,
  `/context`, `/init`, `/compact`, `/agents`, `/model` a další
  terminálové built-iny jsou rezervované a projektový skill toho jména
  v interaktivní session nepřebijí. Skill by šel napsat a zdokumentovat,
  ale ne spustit — což je přesně ta „dokumentovaná schopnost bez
  implementace", kterou konstituce §8 zakazuje. Tenhle repozitář se
  proto trefil dvakrát a dvakrát přejmenoval: rozcestník je `/guide`
  (ne `/help`) a diagnostika `/diagnose` (ne `/doctor`). **Než skill
  pojmenuješ, ověř, že jméno není built-in.**
- **Import se nedělá uvnitř backticků.** `` `@README` `` je text,
  `@README` je import.
- **`CLAUDE.local.md` v gitignore existuje jen v tom worktree, kde
  vznikl.** Sdílené osobní instrukce patří do `~/.claude/`.

---

## Když se Claude Code posune

Postup při větší změně `.claude/` toolingu — nebo když něco přestane
fungovat:

1. `claude --version` a porovnat s minimální ověřenou verzí nahoře.
2. Otevřít `https://code.claude.com/docs/llms.txt` a projít stránky
   skills / sub-agents / hooks / memory.
3. Zkontrolovat, jestli pole, na kterých tenhle repozitář stojí (tabulky
   výše), pořád existují a znamenají totéž.
4. Aktualizovat tenhle soubor — verzi i datum ověření.
5. Když je změna zásadní (zanikne pole, na kterém stojí brána), napsat
   ADR. Tichá migrace se nedělá.

Deprecated konfigurace se nepřepisuje odhadem. Když dokumentace mlčí,
je to mezera, ne důvod k improvizaci.
