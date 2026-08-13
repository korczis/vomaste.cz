---
name: pr
description: Připraví a otevře pull request — ověří větev a čistou bránu, shrne změny pro recenzenta, doloží spuštěné validace, vyjmenuje dotčené záznamy a případný vztah k rozsahu pokrytí. Použij ho, když je práce hotová a má jít na review. Nikdy nemerguje.
argument-hint: "[titulek PR]"
disable-model-invocation: true
---

Odeslání práce na review. **Zapisuje** (větev, PR), a proto ho spouští
člověk.

> `disable-model-invocation: true`: otevření PR je vnější akce.
> Claude ji nesmí udělat mimoděk.

## Kdy ho použít

- Práce je hotová, `/quality` vrátilo READY.
- Změna má jít někomu na posouzení.

## Kdy ho NEPOUŽÍT

- **Bez zeleného `npm run build`.** PR s červenou bránou plýtvá cizím
  časem.
- **Na `master` v hlavním checkoutu.** Tam commit rovnou nasazuje;
  PR by neměl co otevřít.
- **K mergi.** Merge je samostatné rozhodnutí a v co-op modelu ho dělá
  ORCH.

## Předpoklady — ověř, nepředpokládej

```bash
git status --short --branch      # čistý strom? správná větev?
git log --oneline origin/master..HEAD
npm run build                    # exit 0, jinak končíš tady
```

Když jsi na `master`, zastav se. Práce patří na `task/T-###` nebo na
`feature/`/`fix/` větev.

## Co má PR obsahovat

Recenzent musí z popisu poznat, **co posuzuje a jak to ověřit**, aniž
by musel číst celý diff.

```markdown
## Co se mění a proč
<dvě až čtyři věty, lidsky>

## Rozsah změn
- funkční: <n souborů>
- obsah a data: <n>  — <které záznamy>
- generované: <n>  — důsledek <čeho>
- dokumentace: <n>
- testy a brány: <n>

## Doložení
- `npm run build` → exit 0 (<datum>)
- <další spuštěné validátory a jejich výsledek>

## Dotčené záznamy
<CLM/SRC/GAP/CASE, nebo „žádné">

## Rozsah pokrytí
<netýká se | týká se — ověřeno přes /authorization-check, výsledek>

## Na co se při review zaměřit
<co je sporné nebo si zaslouží druhý pár očí>

## Co jsem NEudělal
<vědomě vynechané, nebo „—">
```

Poslední dva oddíly jsou ty, které review skutečně zrychlují. „Na co se
zaměřit" je poctivější než tvrdit, že je všechno v pořádku; „co jsem
neudělal" brání tomu, aby se vynechání objevilo až po mergi.

## Postup

1. Ověř větev a čistotu stromu.
2. Spusť `/quality`, nebo aspoň `npm run build`. **Bez exit 0 konec.**
3. Sestav popis podle šablony výše — z `/diff-explain`, ne z hlavy.
4. Push větve.
5. Otevři PR přes `gh pr create`.
6. U co-op úkolu ohlas merge-request na sběrnici.

## Co skill NEUDĚLÁ

- **Nemerguje** a nepushuje na `master`.
- Neotevře PR s červenou bránou.
- Nenapíše, že je něco otestované, když se to nespustilo.
- Nezmění rozsah pokrytí a netvrdí, že je něco autorizované, aniž by to
  ověřil.

## Příklady

**Základní.** Jeden skript a jeho test, build zelený → PR se čtyřmi
řádky popisu, doložením a prázdným „co jsem neudělal".

**Realistický.** Obsahová změna: 3 tvrzení, 2 zdroje, 40 generovaných
souborů. Popis musí říct, že těch 40 je **důsledek** `data:build`,
uvést výsledek `/editorial-review` a v „na co se zaměřit" jmenovat to,
co bylo sporné — typicky stav tvrzení a rámování.

**Selhání.** `npm run build` padá na `verify:anchors`. Skill PR
neotevře a řekne proč. Nabídnout „otevřu ho a opravíš to potom" by
znamenalo přesunout práci na recenzenta.

## Související

`/quality` (připravenost), `/diff-explain` (podklad pro popis),
`/commit` (commit před PR), `/review-pr` (druhá strana).
