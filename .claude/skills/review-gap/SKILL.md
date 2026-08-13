---
name: review-gap
description: Zkontroluje, jestli je zapsaná mezera (GAP) skutečně otevřenou otázkou, a ne skrytou spekulací nebo náznakem obvinění bez důkazu. Použij ho při revizi dossieru, před zápisem nové mezery, nebo když někdo namítne, že GAP „něco naznačuje".
argument-hint: "<GAP-## [slug dossieru]> nebo text mezery"
---

Review mezery. **Read-only.**

Mezera je nejcitlivější typ záznamu v celém modelu. Na tvrzení je vidět,
že je tvrzení, a posuzuje se podle zdrojů. Mezera vypadá jako poctivé
přiznání neznalosti — a přesně proto se do ní dá schovat obvinění, které
by jako tvrzení neprošlo.

## Kdy ho použít

- Před zápisem nové mezery.
- Při revizi dossieru.
- Když někdo řekne, že formulace mezery „nasazuje brouka do hlavy".

## Kdy ho NEPOUŽÍT

- **Na tvrzení.** To je `/review-claim`.
- **K rozhodnutí, jestli má mezera vzniknout.** Vzniknout má vždycky,
  když zdroje na otázku neodpovídají. Tenhle skill kontroluje, **jak je
  napsaná**, ne jestli má být.

## Sedm kontrol

| # | Kontrola | Co hledáš |
|---|---|---|
| 1 | **Je to otázka** | dá se odpovědět faktem? Nebo je to dojem? |
| 2 | **Neobsahuje odpověď** | „není doloženo, proč to zatajil" už tvrdí, že zatajil |
| 3 | **Není náznak** | čte se to jako „něco za tím je"? Pak je to obvinění bez důkazu |
| 4 | **Je zodpověditelná** | existuje zdroj nebo registr, který by ji uzavřel? |
| 5 | **Vazby** | odkazuje na tvrzení, kterých se týká? Existují? |
| 6 | **Priorita** | odpovídá tomu, co by odpověď skutečně změnila? |
| 7 | **Datum kontroly** | kdy se naposledy ověřovalo, že mezera trvá? |

## Test, který rozhoduje

Přečti mezeru **jako čtenář, který o věci nic neví**, a zeptej se:

> Co si z toho odnesu, kdyby to nikdo nikdy nedoplnil?

Když je odpověď „že s tím člověkem asi něco je", mezera je špatně
napsaná, i kdyby každé jednotlivé slovo bylo pravdivé.

Dobrá mezera po sobě nechá **prázdné místo**, ne stín.

| Špatně | Dobře |
|---|---|
| „Není jasné, odkud měl peníze." | „Citované zdroje neuvádějí zdroj financování nákupu." |
| „Nepodařilo se zjistit, co skrývá." | „Ministerstvo na žádost o informace do <data> neodpovědělo." |
| „Zůstává otázkou jeho role v kauze." | „Citované zpravodajství neuvádí, zda byl účastníkem jednání dne X." |

Rozdíl je pokaždé stejný: pravý sloupec říká, **co konkrétně chybí ve
zdrojích**. Levý říká, co si má čtenář domyslet.

## Výstup

```
MEZERA:      <GAP-##> — <text>
JE TO OTÁZKA:     ano | ne (<co to je místo toho>)
OBSAHUJE ODPOVĚĎ: ne | ano (<která část>)
ČTE SE JAKO NÁZNAK: ne | ano (<proč>)
ZODPOVĚDITELNÁ:   <čím konkrétně>
VAZBY:       <na která tvrzení>  |  <chybí | neexistující>
PRIORITA:    <deklarovaná> — <sedí | návrh>
NÁLEZY:      [BLOCKER|HIGH|MEDIUM|LOW|NOTE] <…>
NÁVRH ZNĚNÍ: <přeformulováno, když je nález>
```

**BLOCKER** je mezera, která funguje jako obvinění. Návrh nového znění
je u takového nálezu povinný — samotné „přeformuluj" nepomůže.

## Co skill NEUDĚLÁ

- Nezmění záznam.
- Nezavře mezeru. Zavírá ji doložená odpověď, ne rozhodnutí.
- Nesmaže mezeru proto, že je nepohodlná.

## Příklady

**Základní.** „Citované zdroje neuvádějí, jak řízení skončilo."
→ otázka, bez odpovědi, bez náznaku, zodpověditelná soudním
rozhodnutím, navázaná na konkrétní tvrzení. Bez nálezu.

**Realistický.** „Není doloženo, proč se k tomu odmítá vyjádřit."
→ [HIGH]: obsahuje odpověď („odmítá se vyjádřit" je tvrzení, které patří
doložit) a čte se jako náznak. Návrh: rozdělit na doložené tvrzení
o tom, že redakce oslovila a nedostala odpověď, plus mezeru o tom, co
zdroje neuvádějí.

**Selhání.** „Zůstává nejasné, jaké má vazby na organizovaný zločin."
→ [BLOCKER]. Formulace zavádí téma, pro které neexistuje jediný zdroj,
a mezera z něj dělá otevřenou otázku, ačkoli otevřená není — nikdy
nebyla položena. Návrh znění: žádný. Tahle mezera se nemá
přeformulovat, má zaniknout.

## Související

`/review-claim` (tvrzení), `/editorial-review` (celý dossier),
`.claude/rules/editorial.md` (mezera místo spekulace).
