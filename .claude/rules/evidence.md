---
paths:
  - "data/dossiers/**/sources/**"
  - "data/dossiers/**/claims/**"
  - "data/dossiers/**/gaps/**"
  - "data/source-catalog/**"
  - "scripts/osint/**"
---

# Důkazy — co zdroj dokládá a co ne

## Než začneš hledat, přečti katalog zdrojů

`docs/osint/SOURCE_CATALOG.md` (publikovaně `/zdroje/`) odpovídá na
otázku, kterou si rešerše klade první: **který registr vůbec odpoví, co
z jeho odpovědi lze citovat a na jakou past se v něm už najelo.** Šetří
to opakované placení téhož poznatku — že ARES rozlišuje dva různé
významy odpovědi 404, že registr smluv tiše ignoruje `format=json`
i vlastní stránkování, že věstník veřejných zakázek vrací nefiltrovaná
data na filtr, který neumí.

Záznamy jsou `data/source-catalog/*.json`, stránky i markdown se
generují (`npm run build:source-catalog`). Nová past patří **do
katalogu**, ne do commit zprávy, kde ji najde jen ten, kdo ví, že ji má
hledat.

## Čtyři stavy, které se nesmějí zaměnit

```
kandidát  →  otevřený  →  ověřený  →  publikovaný důkaz
```

- **kandidát** — výsledek vyhledávání. Není zdroj.
- **otevřený** — stránka byla skutečně načtena a přečtena.
- **ověřený** — je jasné, co konkrétně dokládá a co ne.
- **publikovaný důkaz** — je citovaný u konkrétního tvrzení, s datem
  pořízení, a prošel devíti branami.

Výtah z vyhledávače, shrnutí od modelu ani výstup výzkumné platformy
nejsou zdroj v žádném z těch čtyř významů. Prismatic může kandidáta
najít nebo ukázat, kde hledat; citace pak míří na registr, ne na
Prismatic.

## Stavy tvrzení popisují sílu doložení, ne pravdu

| Stav | Kdy |
|---|---|
| `status-corroborated` | mezi citovanými zdroji je **nezávislá dvojice**: liší se zdrojovou rodinou *i* vydavatelem |
| `status-single` | citované zdroje nedávají druhý nezávislý hlas — i kdyby jich byly tři |
| `status-quote` | přímý výrok subjektu, podaný jako výrok |
| `status-disputed` | otevřená, sporná nebo nepotvrzená věc |
| `status-opinion` | autorský komentář, strukturálně oddělený od zpravodajství |

`1 ZDROJ` **není** „právě jedna URL". Tři přetisky jedné agenturní
zprávy jsou pořád jeden hlas (pravidlo S10 srovnává `outlet`
i registrovanou doménu `url`). Povýšení na CORROBORATED vyžaduje
**přidat skutečně nezávislý zdroj**, nikdy jen přeštítkování.

`sourceFamily` se jmenuje podle **původu** materiálu, ne podle
vydavatele: agenturní zpráva přetištěná bulvárem patří do rodiny
agentury. Pole umí nezávislost jen **odebrat**, nikdy přidat.

## Dvě pravidla, která platí pro každý rešeršní průchod

1. **Doklad je vždy primární registr.** Agregátor je rozcestník: ukáže,
   kde hledat, a pak cituješ to, na co ukazuje. Tvrzení doložené jen
   agregátorem zůstává `1 ZDROJ`.
2. **Zdroj, který neumí odpovědět, se odmítne — neaproximuje se.**
   Některé služby vrátí data i na otázku, kterou nepodporují (vyhledávání
   VVZ tiše ignoruje filtr a vrátí nefiltrovanou stránku). Vydávat to za
   nález je horší než říct, že z tohoto zdroje odpověď nejde získat.

## Redakční poznámka zdroje je povinná

Každý `SRC-##` má v těle stránky ručně psanou redakční poznámku (min.
150 znaků, pravidlo T7): **co dokládá, jak je nezávislý, kde jsou jeho
meze.** Tohle je jediná ručně psaná část stránky zdroje — všechno
ostatní renderují šablony z dat.
