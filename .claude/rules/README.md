---
paths:
  - ".claude/rules/**"
---

# `.claude/rules/` — jak jsou pravidla rozdělená a proč

<!-- Tenhle soubor je sám path-scoped, i když je to jen dokumentace
     adresáře: rules se načítají rekurzivně jako pravidla, takže bez
     `paths` by se šedesát řádků meta-textu tahalo do každé session. -->


Tenhle adresář **nekopíruje** `AGENTS.md`. Odkazuje na něj. `AGENTS.md`
zůstává jediným vlastníkem editorčních pravidel, datového kontraktu
a append-only autorizačního logu; pravidla tady jsou navigační vrstva,
která připomene to správné ve chvíli, kdy na to člověk sahá.

## Proč jsou skoro všechna path-scoped

Pravidlo **bez** `paths` ve frontmatteru se načítá při startu každé
session se stejnou prioritou jako `CLAUDE.md`. Rozdělit velký `CLAUDE.md`
na deset vždy-načítaných pravidel tedy kontext neušetří ani o řádek —
jen ho rozseká na deset kusů.

Pravidlo **s** `paths` se načte teprve tehdy, když Claude sáhne na
odpovídající soubor. To je jediný způsob, jak startovní kontext
skutečně zmenšit.

Dělba je proto tahle:

- co platí **vždy a pro každého** → `CLAUDE.md` (identita, invarianty,
  rozcestník, brána kvality);
- co platí **jen při práci s určitou částí stromu** → path-scoped
  pravidlo tady;
- **postup** (víc kroků, spouští se na vyžádání) → skill v
  `.claude/skills/`;
- **záruka** → validátor v `scripts/`, ne text. Pravidlo, které jde
  vynutit kódem, se nevynucuje promptem.

Jediná výjimka je [`personas.md`](personas.md): definuje slovník, kterým
o sobě mluví `/guide`, `/bootstrap` i katalog schopností, takže musí být
v kontextu dřív, než se sáhne na jakýkoli soubor.

## Co tu je

| Soubor | Načte se, když se pracuje s |
|---|---|
| `personas.md` | vždy (slovník rolí) |
| `authorization.md` | `data/dossiers/**`, `data/authorizations.toml`, `AGENTS.md` |
| `evidence.md` | tvrzení a zdroji |
| `editorial.md` | kanonickými daty dossierů a jejich obsahem |
| `data-model.md` | `data/**`, `schemas/**`, `scripts/data/**` |
| `generated-content.md` | `content/**` |
| `ui.md` | `templates/**`, `assets/**`, CSS |
| `testing.md` | testy |
| `claude-tooling.md` | `.claude/**` |
| `documentation.md` | `docs/**`, `README.md`, `CONTRIBUTING.md` |
| `media.md` | obrázky entit |
| `learning.md` | vzdělávací vrstvou |
| `archive.md` | archivací úředních podkladů |

## Když pravidlo přidáváš

Ptej se v tomhle pořadí, a při první „ne" pravidlo nepiš:

1. Je to fakt platný vždy? → patří do `CLAUDE.md`.
2. Je to postup o víc krocích? → patří do skillu.
3. Jde to vynutit validátorem? → patří do `scripts/`, ne sem.
4. Existuje množina cest, u kterých to platí a jinde ne? → **tady**,
   s `paths`.
5. Neplatí ani 4? Pak to buď platí vždy (viz 1), nebo to neplatí
   dost jasně na to, aby to bylo pravidlo.
