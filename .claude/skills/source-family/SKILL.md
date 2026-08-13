---
name: source-family
description: Posoudí, jestli jsou dva nebo víc zdrojů skutečně nezávislé hlasy, nebo jeden hlas v několika kabátech — a tím jestli tvrzení unese stav CORROBORATED, nebo musí zůstat 1 ZDROJ. Použij ho pokaždé, když se má tvrzení povýšit na „ověřeno více zdroji", nebo když někdo řekne „vždyť to psaly tři weby".
argument-hint: "<SRC-01 SRC-02 …> nebo <URL URL …>"
---

Odpovídá na jedinou otázku: **kolik nezávislých hlasů to je?**

Tři odkazy nejsou tři zdroje. Tenhle skill je tu proto, že rozdíl mezi
„tři weby o tom psaly" a „tři nezávislé redakce to zjistily" je rozdíl
mezi doloženým a nedoloženým tvrzením.

## Kdy ho použít

- Před povýšením tvrzení na `status-corroborated`.
- Když někdo argumentuje počtem odkazů.
- Při revizi existujícího tvrzení, jestli jeho stav pořád sedí.
- Když se do dossieru přidává zdroj k tvrzení, které už nějaké má.

## Kdy ho NEPOUŽÍT

- **K prověření jednoho zdroje.** Na to je `/verify-source`.
- **Když zdroje ještě nebyly otevřeny.** Nezávislost se neposuzuje
  z URL. Nejdřív `/verify-source`, potom tohle.
- **K rozhodnutí, jestli je tvrzení pravdivé.** Stav popisuje sílu
  doložení, ne pravdu.

## Co rozhoduje

Pravidlo S2 (`validate-semantics.mjs`) vyžaduje mezi citovanými zdroji
**nezávislou dvojici**: dva zdroje, které se liší **zdrojovou rodinou
i vydavatelem**. Pravidlo S10 k tomu přidává, že jeden vydavatel je
jeden hlas — srovnává `outlet` **i registrovanou doménu** `url`.

Z toho plyne asymetrie, kterou je potřeba znát:

> `sourceFamily` umí nezávislost jen **odebrat**, nikdy přidat.

Vyplněná rodina může dva zdroje sloučit do jednoho hlasu. Prázdná
rodina ale neznamená, že jsou nezávislé — znamená, že to zatím nikdo
neposoudil.

## Postup

### 1. Otevři je (nebo si ověř, že už otevřené byly)

Bez otevření to nejde. Rozhodující informace — komu redakce připisuje
původ — je v patičce, v bylinu nebo v metadatech, ne v URL.

### 2. Hledej doslovný kredit původu

Konkrétně:

- `Zdroj: ČTK`, `(čtk)`, `ČTK/red`;
- byline „podle serveru X";
- první odstavec typu „jak první informoval …";
- shodné formulace a shodné pořadí odstavců napříč texty;
- tisková zpráva jako společný předek (úřad, firma, strana, NGO).

`npm run sources:detect-family` umí kredit vytěžit strojově z už
uložených zdrojů s prázdnou rodinou. Vrací **návrh** do
`reports/source-family-proposals.md`; zápis je samostatný krok
`--apply`, jen pro verdikt `ctk` a jen do prázdného pole. Dokládá
kredit na stránce — **ne** že jsou dva texty shodné, a **ne** úplnost.

### 3. Zařaď každý zdroj

| Verdikt | Znamená |
|---|---|
| **stejný vydavatel** | jeden hlas, i kdyby to byly tři rubriky |
| **agenturní přetisk** | jeden hlas s původcem agentury |
| **syndikace / společný vlastník** | jeden hlas |
| **společná tisková zpráva** | jeden hlas — původcem je ten, kdo ji vydal |
| **jeden zjistil, druhý převzal** | jeden hlas; doklad je ten první |
| **nezávislé zjištění** | dva hlasy |
| **nejisté** | **jeden hlas.** Nejistota se řeší dolů, ne nahoru |

### 4. Sečti a vyslov důsledek

```
Existuje aspoň jedna dvojice, která se liší rodinou I vydavatelem?
  ano  → CORROBORATED je oprávněné
  ne   → zůstává 1 ZDROJ
```

A hlavně: řekni, **co by ten chybějící hlas musel být**. „Zůstává
1 ZDROJ" bez toho je slepá ulička; s tím je to zadání.

## Výstup

```
TVRZENÍ:     <CLM-## nebo text>
ZDROJE:      <n>
  SRC-01  <outlet>  doména <d>  rodina <f>  původ: vlastní zjištění
  SRC-02  <outlet>  doména <d>  rodina <f>  původ: přetisk SRC-01
NEZÁVISLÝCH HLASŮ: <n>
NEZÁVISLÁ DVOJICE: <ano: SRC-0x + SRC-0y | ne>
VERDIKT:     CORROBORATED oprávněné | zůstává 1 ZDROJ
CHYBÍ:       <co konkrétně by druhý hlas musel být>
JISTOTA:     jistá | vyžaduje lidský úsudek (<proč>)
```

## Kde končí strojový úsudek

Nezávislost není vždy rozhodnutelná z textu. Řekni to nahlas, když:

- dvě redakce mají stejného vlastníka a není to z hlavičky vidět;
- oba texty čerpají z téhož nejmenovaného zdroje;
- jeden text je „potvrzení" získané dotazem u téhož úřadu;
- shoda formulací může být přetisk i shodný úřední podklad.

V takovém případě je verdikt **nejisté**, důsledek **1 ZDROJ**,
a rozhodnutí patří člověku. Předstíraná jistota tady vyrábí falešné
CORROBORATED, což je nejhorší jednotlivá chyba, kterou tenhle datový
model umí udělat.

## Co skill NEUDĚLÁ

- Nezmění stav tvrzení ani nezapíše `sourceFamily`.
- Nepovýší tvrzení na CORROBORATED bez skutečně nového hlasu.
  **Přeštítkování není povýšení.**
- Nerozhodne za člověka spornou nezávislost.

## Příklady

**Základní.** Dvě URL, dvě různé redakce, obě s vlastním bylinem a
vlastními detaily → dva hlasy, CORROBORATED oprávněné.

**Realistický.** Tři odkazy: ČeskéNoviny.cz, Blesk, Deník. Všechny mají
v patičce `Zdroj: ČTK` a shodné pořadí odstavců → **jeden hlas**,
rodina `ctk`. Verdikt: zůstává `1 ZDROJ`. Chybí: vlastní zjištění
redakce, která u toho byla, nebo úřední dokument.

**Selhání.** Dva texty, jeden z nich píše „jak informoval server X",
kde X je ten druhý → jeden hlas. Časté nedorozumění: „ale jsou to různé
weby" — různé weby nejsou různá zjištění, a právě proto tenhle skill
existuje.

## Související

`/verify-source` (prověření jednoho zdroje — dělá se dřív),
`.claude/rules/evidence.md`
(pravidla stavů a rodin), `npm run sources:detect-family` (strojový
návrh původu).
