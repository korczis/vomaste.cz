# Claude tooling pro vomaste.cz

Tenhle adresář je **contributor interface** projektu: tři vrstvy
schopností, které mají člověka dostat od „naklonoval jsem repozitář"
k bezpečnému příspěvku, aniž by musel znát layout, memorovat příkazy
nebo skládat několikastránkové prompty.

Proč vznikl a jaké má meze růstu:
[`docs/adr/claude-native-contributor-operating-environment.md`](../docs/adr/claude-native-contributor-operating-environment.md).
Proč se **neimportoval** cizí agent framework a proč to platí dál:
[`docs/adr/aiad-and-agent-tooling-import.md`](../docs/adr/aiad-and-agent-tooling-import.md).

## Co tu je

```
.claude/
├── rules/      pravidla — path-scoped, načtou se u odpovídajících souborů
├── skills/     postupy — načtou se při použití
├── agents/     specialisté v izolovaném kontextu
└── settings.json
```

**Seznam schopností tady záměrně není.** Zastaral by při prvním
přidání. Je generovaný:

- `docs/TOOLING.md` — katalog pro čtení v repozitáři;
- `/dokumentace/prikazy/` — publikovaná podoba;
- `data/generated/tooling-catalog.json` — view model, ze kterého čte
  `/guide`.

Regeneruje `npm run build:tooling-catalog`, drift hlídá
`npm run verify:tooling-catalog`.

## Jak to spolu souvisí

```
fakt platný vždy         → CLAUDE.md
pravidlo pro část stromu → .claude/rules/<téma>.md s `paths`
postup                   → skill
specialista v izolaci    → agent
ZÁRUKA                   → validátor v scripts/
```

Poslední řádek je ten, na kterém záleží: **pravidlo, které jde vynutit
kódem, se nevynucuje promptem.**

## Než přidáš schopnost

Přečti [`rules/claude-tooling.md`](rules/claude-tooling.md) — pět
otázek, při první „ne" schopnost nevzniká. A vezmi na vědomí, že brána
je mechanická:

- schopnost bez záznamu v `data/tooling/` shodí build (G2/G8/G9);
- záznam bez persony, rizika a `writes` shodí build (G10);
- subagent bez vyjmenovaných `tools` shodí build (G11) — vynechané
  `tools` znamená v Claude Code dědění **všech** nástrojů, takže by
  „read-only" agent uměl `Write`;
- odkaz na neexistující soubor, příkaz nebo skill shodí build
  (`npm run validate:claude-tooling`).

Jména ověřuj proti vestavěným příkazům Claude Code. Rozcestník se
jmenuje `/guide` a ne `help`, diagnostika `/diagnose` a ne `doctor`,
právě proto — viz [`../docs/claude-code/compatibility.md`](../docs/claude-code/compatibility.md).

## Subagenti: co bylo vyhodnoceno a nevytvořeno

Vytvořeno je šest: `repository-explorer`, `source-verifier`,
`claim-reviewer`, `editorial-reviewer`, `ui-reviewer`, `docs-auditor`.
Všichni **read-only** (`Read`, `Grep`, `Glob`, u ověřovatele zdrojů
navíc `WebFetch` a `WebSearch`).

Dva další se zvažovaly a **záměrně nevznikly**:

- **code-reviewer** — technickou kvalitu už pokrývá `/review-pr`, který
  navíc ví, které osy pro danou změnu dávají smysl. Samostatný agent by
  musel dostat `Bash`, aby si spustil testy, čímž by přestal být
  read-only. Až bude měřená potřeba, je to jeden soubor.
- **test-analyzer** — `/test` pokrývá výběr sady i výklad selhání.
  Izolovaný kontext by pomohl jen u velmi objemného výstupu, což se
  zatím nestalo. A stejně jako výše: potřeboval by `Bash`.

Obojí je zapsané tady, ne zapomenuté. Kritérium pro vznik je stejné
jako u všeho ostatního — měřená potřeba, ne anticipace.

## Portable nastavení

Verzované `.claude/settings.json` smí obsahovat jen to, co funguje
v čerstvém klonu a neškodně selže, když sousední repozitář chybí.
Žádné absolutní osobní cesty, žádná tajemství.

`.claude/settings.local.json` se **necommituje**. Lokální oprávnění
a cesty patří do lokální konfigurace.

## Prismatic

Čtyři `prismatic-*` skilly volají versionovaný export kontrakt.
Skutečné a otestované je `status`, `probe` a `plan`; `run`, `import`,
`diff`, `review-report`, `promote`, `verify`, `drift` a `enrich-all`
jsou **pořád stuby**, protože Prismatic nemá odpovídající exportér.

Přečti `SKILL.md` toho konkrétního skillu, než cokoli ohlásíš jako
hotové. Veřejný build na Prismaticu nestojí a musí fungovat i s úplně
chybějícím sousedním repozitářem.

Prismatic **není citovatelný zdroj**. Může najít kandidáta nebo ukázat,
kde hledat; citace míří na registr.
