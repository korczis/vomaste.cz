---
name: editorial-review
description: Redakční review celého dossieru nebo sady změn — skládá kontroly jednotlivých tvrzení, zdrojů a mezer a hledá navíc to, co je vidět až v celku: nekonzistentní rámování, tichou eskalaci stavů, nepoměr mezi obviněními a reakcemi, třetí osoby vystupující jako subjekty. Použij ho před merge, před publikací většího balíku, nebo při periodické revizi.
argument-hint: "[slug dossieru | changed | CLM-##,SRC-##,…]"
---

Review v celku. **Read-only.** Skládá atomické kontroly a přidává to,
co se z jednoho záznamu nepozná.

## Kdy ho použít

- Před merge větší změny obsahu.
- Při periodické revizi dossieru.
- Po dokončení rešeršního průchodu, než se cokoli publikuje.

## Kdy ho NEPOUŽÍT

- **Na jediný záznam.** Pak je rychlejší `/review-claim`,
  `/review-source` nebo `/review-gap` přímo.
- **Místo `npm run build`.** Tohle je redakční vrstva. Mechanické brány
  (parita, reference, JSON-LD) běží v buildu a review je nenahrazuje.
- **K opravě.** Vrací nálezy s prioritou; opravu dělá člověk.

## Rozsah

| Argument | Co projít |
|---|---|
| slug dossieru | všechna tvrzení, zdroje, mezery, kauzy a relace toho dossieru |
| `changed` | jen záznamy dotčené aktuálním diffem (`git status`, `git diff`) |
| výčet ID | jen ty |
| nic | zeptej se; projít všechno bez důvodu je plýtvání |

## Postup

### 1. Atomické kontroly

Projdi dotčené záznamy přes `/review-claim`, `/review-source`
a `/review-gap`. Nálezy si ponech, ale nevypisuj je zatím —
opakovaný stejný nález u dvaceti tvrzení je jeden nález, ne dvacet.

### 2. Kontroly, které jsou vidět jen v celku

Tohle je vlastní přínos tohohle skillu.

| # | Kontrola | Co hledáš |
|---|---|---|
| 1 | **Konzistence rámování** | procesní výhrada („nepravomocné", „zastaveno") je u KAŽDÉ zmínky, ne u první |
| 2 | **Tichá eskalace** | mění se tón mezi časnými a pozdějšími záznamy? Sílí formulace bez nových zdrojů? |
| 3 | **Poměr obvinění a reakcí** | je popření nebo vyjádření subjektu tam, kde ho zdroje mají? |
| 4 | **Třetí osoby** | vystupuje někdo opakovaně tak, že už se čte jako subjekt, aniž by jím byl? |
| 5 | **Koncentrace zdrojů** | stojí velká část dossieru na jednom vydavateli? Řekni to nahlas |
| 6 | **Rovnováha stavů** | je poměr `1 ZDROJ` a `CORROBORATED` v souladu se skutečnou nezávislostí? |
| 7 | **Mezery vs. tvrzení** | není mezera použitá tam, kde měl být zúžený fakt, nebo naopak? |
| 8 | **Časová osa** | odpovídají data v narativu datům v záznamech? |
| 9 | **Souhrn versus detail** | neříká úvodní text nebo shrnutí víc, než unesou jednotlivé záznamy? |
| 10 | **Grafové vazby** | nevytváří graf dojem vlivu tam, kde je jen společný uzel? („no guilt by graph") |

Kontrola 9 je nejčastější reálný nález: jednotlivá tvrzení jsou
v pořádku a **shrnutí nad nimi** je o krok dál, než zdroje unesou.

### 3. Priorita nálezů

```
BLOCKER  nedoložené tvrzení o člověku · chybějící procesní rámování ·
         jmenovaná třetí osoba, která má zůstat nejmenovaná ·
         osobní údaje · stav vydávající jeden hlas za dva
HIGH     nepřesnost, která mění význam · nekonzistentní rámování ·
         chybějící reakce subjektu, kterou zdroje mají
MEDIUM   formulace posouvající tón · nevyvážená koncentrace zdrojů
LOW      konzistence stylu, zkratky, formát dat
NOTE     pozorování bez požadavku na změnu
```

Publikovat se nesmí s BLOCKER. HIGH je rozhodnutí člověka — ale
vědomé, ne přehlédnuté.

## Výstup

```
ROZSAH:      <co bylo projito> (<n> tvrzení, <m> zdrojů, <k> mezer)
BLOCKER:     <n>
  1. <záznam> — <co a proč> → <konkrétní oprava>
HIGH:        <n>
MEDIUM:      <n>
LOW / NOTE:  <n>
CELKOVÝ TÓN: <je dossier v celku přesnější, nebo ostřejší, než jeho zdroje?>
KONCENTRACE ZDROJŮ: <n> % záznamů stojí na <vydavateli>
DOPORUČENÍ:  publikovat | opravit BLOCKER a znovu | rozhodnutí člověka u HIGH
```

Řádek **CELKOVÝ TÓN** je povinný a nesmí být „v pořádku" bez
odůvodnění. Je to jediné místo, kde se posuzuje dossier jako text, ne
jako sada záznamů.

## Co skill NEUDĚLÁ

- Nezmění žádný záznam.
- Nerozhodne o publikaci — to je lidský checkpoint.
- Nenahradí `npm run build`.
- Neposoudí rozsah pokrytí (to je `/authorization-check`).

## Příklady

**Základní.** `editorial-review petr-pavel` → 4 tvrzení, 2 zdroje,
1 mezera; žádný BLOCKER; NOTE o tom, že celý dossier stojí na dvou
vydavatelích, což u dossieru téhle velikosti není nález, ale je to
vidět.

**Realistický.** Dossier po rešeršním průchodu: 3× HIGH za nekonzistentní
rámování (slovo „nepravomocná" je u první zmínky a chybí u dalších
dvou), 1× MEDIUM za shrnutí, které mluví o „sérii pochybení", zatímco
záznamy dokládají tři nesouvisející věci. Doporučení: opravit, znovu.

**Selhání.** Změna přidala pět tvrzení opřených o jednu investigaci
téže redakce, všechna se stavem `CORROBORATED`. To je [BLOCKER] pětkrát,
ale **jeden nález**: jeden hlas vydávaný za dva. Oprava je změna stavu,
ne přidání výhrady do textu.

## Související

`/review-claim`, `/review-source`, `/review-gap` (atomické kontroly),
`/correction` (oprava nálezu), `/authorization-check` (rozsah),
`.claude/rules/editorial.md`.
