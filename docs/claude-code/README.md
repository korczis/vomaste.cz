# Claude Code v tomhle repozitáři

Krátký rozcestník. Nic z toho, co je jinde, se tu neopakuje.

## Chci s tím začít

Postup od naklonovaného repozitáře k první bezpečné práci je na webu:
[`/prirucka/jak-zacit-s-claude-code/`](https://vomaste.cz/prirucka/jak-zacit-s-claude-code/).

Zkráceně: `npm ci`, `npm run generate:all`, `claude`, pak `/diagnose`
a `/bootstrap`.

## Chci vědět, co všechno umí

Seznam schopností **není v žádném dokumentu** — je generovaný ze
skutečnosti, takže nemůže tvrdit schopnost, která neexistuje:

| Kde | Co |
|---|---|
| [`../TOOLING.md`](../TOOLING.md) | katalog pro čtení v repozitáři |
| [/dokumentace/prikazy/](https://vomaste.cz/dokumentace/prikazy/) | publikovaná podoba s personou a rizikem |
| `data/generated/tooling-catalog.json` | view model, ze kterého čte `/guide` |

Regeneruje `npm run build:tooling-catalog`; drift shodí
`npm run verify:tooling-catalog`.

## Chci pochopit, jak je to postavené

| Otázka | Kde |
|---|---|
| proč tahle vrstva existuje a jaké má meze růstu | [`../adr/claude-native-contributor-operating-environment.md`](../adr/claude-native-contributor-operating-environment.md) |
| proč se neimportoval cizí agent framework | [`../adr/aiad-and-agent-tooling-import.md`](../adr/aiad-and-agent-tooling-import.md) |
| na kterých schopnostech Claude Code to stojí | [`compatibility.md`](compatibility.md) |
| jak je to rozdělené na vrstvy | [`../../.claude/README.md`](../../.claude/README.md) |
| pravidla pro přidání schopnosti | `.claude/rules/claude-tooling.md` |

## Chci to učit nebo se to naučit

| Vrstva | Kde |
|---|---|
| praktické úkoly v terminálu | [/bootcamp/](https://vomaste.cz/bootcamp/), lekce B09–B11 |
| teorie, dvanáct lekcí | [/akademie/](https://vomaste.cz/akademie/), úroveň C1 |
| slovník pojmů a rizik | [/prirucka/ref-schopnosti-claude/](https://vomaste.cz/prirucka/ref-schopnosti-claude/) |

## Když něco nefunguje

Nejdřív `/diagnose` — vypíše PASS/WARN/FAIL a u každého problému
konkrétní opravu. Tabulka nejčastějších zádrhelů je v příručce.

Tři, které stojí za zapamatování, protože vypadají jako porucha a nejsou:

- **brána padá na něčem, co jste neměnili** → v čerstvém klonu nebo
  worktree nikdy neběžely generátory (`npm run generate:all`);
- **změna po buildu zmizela** → editoval se generovaný soubor místo
  kanonického; jediné místo, kde se to ohlásí, je
  `npm run data:check-generated:content`;
- **schopnost se nespustí pod jménem, které čekáte** → některá jména
  patří vestavěným příkazům Claude Code. Proto `/guide` a ne `/help`,
  `/diagnose` a ne `/doctor`.

## Co tahle vrstva není

Není zdroj. Není autorita na to, co je pravda. Nemůže rozhodnout, o kom
se smí psát, ani publikovat bez lidského přezkumu.

Je to navigátor, rešeršní asistent, mechanický operátor a kontrolor
uvnitř pravidel, která si projekt určil sám — a ta pravidla vlastní
`AGENTS.md`, ne tenhle adresář.

## Údržba

Claude Code se mění. Postup, když se něco posune, je v
[`compatibility.md`](compatibility.md): ověřit verzi, projít oficiální
dokumentaci, zkontrolovat pole, na kterých stojí brány, aktualizovat
datum ověření, a u zásadní změny napsat ADR. Tichá migrace se nedělá.
