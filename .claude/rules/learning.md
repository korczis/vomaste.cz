---
paths:
  - "data/learning.toml"
  - "data/learning-fixtures.toml"
  - "content/akademie/**"
  - "content/bootcamp/**"
  - "content/prirucka/**"
  - "content/start/**"
  - "content/prispet/**"
  - "content/koncepty/**"
---

# Vzdělávací vrstva

`/start/` (nulová znalost), `/bootcamp/` (kurz na syntetických datech),
`/akademie/` (kurikulum v úrovních), `/prirucka/` (lookup), `/prispet/`
(rozcestník). Model je `data/learning.toml` + `data/learning-fixtures.toml`,
integritu hlídá `npm run validate:learning` (v `build` i `check`).

## Definice pojmů vlastní koncepty. Nepodkročitelné

Kanonické znění každého pojmu vlastní `content/koncepty/*`. Akademie
a Bootcamp pojem **aplikují**, Příručka pomáhá **dohledat** — ani jedna
ho nedefinuje podruhé. Pět míst s pěti definicemi slova „ověřeno více
zdroji" je přesně ten drift, kterému datový model brání jinde.

## Cvičná data jsou vymyšlená a musí zůstat

Všechno v `data/learning-fixtures.toml` je fiktivní, označené
`synthetic = true`, cvičné URL jsou v rezervovaném jmenném prostoru
(RFC 2606). Kontrola L13 shodí build, pokud se cvičný identifikátor
objeví v `data/dossiers/**`.

Nacvičovat klasifikaci obvinění na skutečném člověku by znamenalo psát
o něm nedoložená tvrzení. **Výuka nesmí být zadními vrátky k rozšíření
rozsahu.**

## Kdy vzdělávací vrstvu povinně projít

| Změna | Co projít |
|---|---|
| nový/změněný **stav tvrzení** | `content/koncepty/stav-*.md`, `/prirucka/ref-stavy-tvrzeni/`, A104, Bootcamp 01, cvičení ve fixtures (vynutí L12) |
| změna **schématu záznamu** | `/prirucka/ref-povinna-pole/`, lekce úrovně A5 a příklady v ní |
| nový/přejmenovaný **npm příkaz** | `/prirucka/jak-validovat-a-buildnout/`, `/prispet/chci-programovat/`, A602 — a **nikdy neopisovat katalog příkazů**, ten je generovaný |
| změna **redakčního pravidla** nebo publikační brány | Bootcamp, úroveň A3, A308, `/prispet/chci-editovat/` |
| změna **autorizačního modelu** | A308, A701, `/prirucka/jak-zkontrolovat-rozsah/`, Bootcamp 05 |
| změna **architektury nebo pipeline** | úroveň A6, `/prirucka/problemy-buildu/` |
| nový **skill, agent nebo workflow** | katalog schopností je generovaný; ručně se doplní jen persona a riziko v `data/tooling/` a případná lekce Claude Code úrovně |

Zastaralá technická lekce je horší než žádná: čtenář podle ní pracuje
a neví, že popisuje stav, který už neplatí.

## Dvě Zola pasti, na které se tu najelo

- `self::` **nefunguje** napříč importem, a self-import makra shodí Zolu
  přetečením zásobníku — proto je `macros/learning-atoms.html` zvlášť.
- `get_page()` bere cestu **bez** prefixu `@/`, na rozdíl od `get_url()`.
