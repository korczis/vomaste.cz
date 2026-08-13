---
name: find-source
description: Hledá kandidátní zdroje ke konkrétní otázce a přísně odděluje, co je kandidát, co bylo otevřeno a co je skutečně citovatelné. Použij ho, když je otázka už zúžená a je potřeba k ní najít doklad — „najdi zdroj k tomuhle", „kdo o tom psal", „je to někde doložené". Výsledek hledání sám o sobě nikdy není důkaz.
argument-hint: "<konkrétní otázka nebo tvrzení, ke kterému hledáš doklad>"
---

Hledání kandidátů. Nikoli ověřování — to je `/verify-source` a je to
samostatný krok, který se nesmí přeskočit.

## Kdy ho použít

- Otázka je konkrétní a je potřeba k ní najít doklad.
- Existující tvrzení potřebuje druhý nezávislý hlas.
- Ověřuje se, jestli o věci vůbec někdo psal.

## Kdy ho NEPOUŽÍT

- **Když je zadání široké.** Nejdřív `/research-question`, jinak
  vznikne seznam odkazů místo odpovědi.
- **Jako doklad.** Výstup tohohle skillu **nesmí** být citován
  u tvrzení. Jsou to kandidáti.
- **Když primární registr odpoví přímo.** IČO, funkce, zápis, spisová
  značka — na to se nehledá ve zpravodajství, na to se jde do registru.

## Čtyři stavy a hranice mezi nimi

```
kandidát  →  otevřený  →  ověřený  →  citovatelný
```

Tenhle skill dodává **výhradně první stupeň**. Přechod na druhý je
otevření stránky, na třetí `/verify-source`, na čtvrtý zápis se
záznamem provenience.

Zaměnit první za čtvrtý znamená publikovat tvrzení opřené o výtah
z vyhledávače. To je jeden z mála způsobů, jak tenhle projekt může
vyrobit vymyšlenou citaci.

## Postup

### 1. Nejdřív primární registr, potom zpravodajství

Pořadí není preference, je to pravidlo:

1. **primární registr nebo úřední dokument** — ARES, veřejný rejstřík,
   Sbírka listin, registr smluv, soudní vývěska, oficiální profily;
2. **jmenované zpravodajství** — redakce s bylinem a datem;
3. **agregátor** — jen jako rozcestník, nikdy jako doklad.

`docs/osint/SOURCE_CATALOG.md` říká, který registr na co odpoví
a v čem se v něm už chybovalo. Přečti ho dřív, než začneš.

### 2. Formuluj dotaz podle toho, co zdroj umí

Registr má vlastní logiku. Hledat v soudní vývěsce podle jména je
zakázané (docket-only dotaz). Hledat firmu podle názvu vrátí jmenovce.
Filtr, který služba neumí, tiše ignoruje a vrátí nefiltrovaný výsledek.

### 3. Zaznamenej každého kandidáta stejně

```
KANDIDÁT:  <URL>
NÁZEV:     <jak se jeví ve výsledku>
VYDAVATEL: <podle domény — zatím neověřeno>
DATUM:     <podle výsledku — zatím neověřeno>
STAV:      kandidát (neotevřeno)
```

Slova „zatím neověřeno" nejsou zdvořilost. Vydavatel podle domény
a datum podle výsledku vyhledávání se **běžně liší** od toho, co je na
stránce.

### 4. Odděl, co bylo otevřeno

Když stránku otevřeš, posuň jí stav a řekni, co se ukázalo. Zvlášť:
rubrika (komentář, satira, PR), paywall, přesměrování jinam, chybějící
datum.

### 5. Řekni, když nic není

Nulový nález je legitimní výsledek a musí být explicitní:

```
NALEZENO: 0 citovatelných zdrojů
HLEDÁNO:  <kde konkrétně>
ZNAMENÁ:  <že v těchto zdrojích doklad není — ne že věc neexistuje>
DALŠÍ:    kandidát na GAP
```

Negativní odpověď registru znamená „v den dotazu tam nic nebylo",
nikdy „nikdy to neexistovalo".

## Výstup

```
OTÁZKA:      <konkrétně>
HLEDÁNO V:   <registry a zdroje, v tomhle pořadí>
KANDIDÁTI:   <n>  (neotevřeno — nejsou to zdroje)
  1. <URL>  <domněnka o vydavateli>  <stav>
OTEVŘENO:    <n>
  1. <URL>  → <co se ukázalo>
CITOVATELNÉ: <n>  → dál přes /verify-source
NENALEZENO:  <co se nepodařilo doložit>  → kandidát na GAP
PASTI:       <co v použitých zdrojích nefungovalo, jak katalog varuje>
```

## Co skill NEUDĚLÁ

- **Nevydá kandidáta za zdroj**, ani když vypadá přesvědčivě.
- Nezapíše `SRC` záznam.
- Neposoudí nezávislost (to je `/source-family`).
- Nerozšíří rozsah pokrytí tím, že „u toho něco našel".

## Příklady

**Základní.** „Kdy byl jmenován ministrem?" → nejdřív `vlada.gov.cz`
(primární, odpoví přímo), teprve pak zpravodajství jako druhý hlas.
Výstup: jeden citovatelný kandidát z primárního zdroje, jeden
z redakce.

**Realistický.** „Kdo psal o té pokutě?" → pět kandidátů z vyhledávání.
Po otevření: dva jsou přetisky téže agenturní zprávy, jeden je
komentář, jeden má paywall, jeden je původní zjištění redakce.
Citovatelné: jeden hlas plus agenturní. Výstup to říká rovnou, protože
jinak by pět odkazů vypadalo jako pět dokladů.

**Selhání.** „Najdi zdroj, že je propojený s tou firmou." → Skill musí
odmítnout hledat doklad pro předem hotový závěr a otočit zadání:
hledají se **rejstříkové vazby**, ne potvrzení. Když se najde zápis, je
to evidenční fakt, ne důkaz pochybení („no guilt by graph").

## Související

`/research-question` (zúžení otázky — dělá se dřív), `/verify-source`
(ověření — dělá se potom), `/source-family` (nezávislost),
`docs/osint/SOURCE_CATALOG.md` (co který registr unese).
