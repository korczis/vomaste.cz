---
name: research-question
description: Rozseká příliš širokou rešeršní otázku na konkrétní, doložitelné podotázky — a řekne, který registr nebo zdroj na kterou z nich vůbec může odpovědět. Použij ho, když někdo zadá „prověř firmu X", „zjisti něco o Y", „co je s tím ministrem", nebo když rešerše nemá jasný cíl a hrozí, že skončí seznamem odkazů místo odpovědi.
argument-hint: "<rešeršní zadání, jak přišlo>"
---

Zúžení otázky. Široké zadání není zadání — je to nálada. Tenhle skill
z něj udělá seznam otázek, u kterých se pozná, kdy jsou zodpovězené.

## Kdy ho použít

- Zadání zní „prověř", „zjisti", „mrkni na", „co je s".
- Rešerše běží a není jasné, kdy má skončit.
- Než se otevře deset záložek.

## Kdy ho NEPOUŽÍT

- **Když je otázka už konkrétní.** „Kdy byl jmenován ministrem" nemá co
  zužovat.
- **K rozšíření rozsahu pokrytí.** Zúžení otázky **nikdy** nesmí
  vyrobit téma, které rozsah nedovoluje. Rešerše smí být širší než
  publikace, ale ne než rozsah.
- **K rozhodnutí, co se publikuje.** Tohle je plán hledání, ne plán
  obsahu.

## Postup

### 1. Pojmenuj, co v zadání chybí

Skoro každé široké zadání postrádá tři věci:

```
KDO     — konkrétní entita, ověřená identita (ne jméno)
CO      — jaký typ faktu (funkce, peníze, řízení, výrok, vazba)
KDY     — časové ohraničení
```

Bez `KDO` s ověřenou identitou se nedá začít vůbec: jmenovec je
nejčastější a nejtišší chyba celé rešerše.

### 2. Rozděl na doložitelné podotázky

Dobrá podotázka má tři vlastnosti:

1. **odpověď je fakt, ne dojem** — „kolik" a „kdy" ano, „jak moc
   problematické" ne;
2. **existuje konkrétní registr nebo zdroj**, který ji může
   zodpovědět;
3. **jde poznat, kdy je hotová** — včetně odpovědi „ten registr na to
   neodpoví".

Špatně → dobře:

| Široké | Zúžené |
|---|---|
| „prověř firmu X" | Jaké má IČO? Kdo je jednatel a od kdy? Má smlouvy v registru smluv, kolik a s kým? Jsou ve Sbírce listin účetní závěrky? |
| „co je s tím ministrem" | Kdy nastoupil a odkud? Které jeho kroky popsalo jmenované zpravodajství? Vede se proti němu řízení, a v jaké fázi? |
| „je v tom namočený" | **Není to podotázka.** Rozděl na doložitelné vazby a nech vyvození čtenáři |

### 3. Přiřaď zdroj ke každé podotázce

**Než začneš hledat, přečti katalog zdrojů** —
`docs/osint/SOURCE_CATALOG.md` odpovídá na otázku, který registr vůbec
odpoví, co z jeho odpovědi lze citovat a na jakou past se v něm už
najelo.

U každé podotázky vyplň:

```
PODOTÁZKA:  <konkrétně>
ZDROJ:      <registr nebo typ zdroje>
DOKÁŽE:     <co z něj lze citovat>
NEDOKÁŽE:   <co se z něj běžně vyvozuje a neplyne>
PAST:       <známá past z katalogu, nebo „—">
```

Když žádný zdroj neodpoví, **je to výsledek**: podotázka je kandidát na
mezeru (`GAP`), ne na hedge větu.

### 4. Seřaď podle doložitelnosti, ne podle zajímavosti

Nejdřív to, co má primární registr a jednoznačnou odpověď. Zajímavá
otázka bez doložitelné odpovědi je poslední, ne první — jinak rešerše
spálí čas na tom, co stejně skončí jako mezera.

### 5. Řekni, co je mimo

Explicitně vyjmenuj, co se hledat **nebude**: osobní údaje, soukromé
osoby, rodina, věci mimo rozsah pokrytí. Nechat to nevyřčené znamená,
že to někdo vyhledá „pro kontext".

## Výstup

```
ZADÁNÍ:      <jak přišlo>
IDENTITA:    <jak je subjekt jednoznačně vymezený — kotva, ne jméno>
PODOTÁZKY:
  1. <otázka>  → <zdroj>  → <co dokáže / nedokáže>
  2. …
POŘADÍ:      <čím začít a proč>
MIMO ROZSAH: <co se hledat nebude>
OČEKÁVANÉ MEZERY: <co pravděpodobně skončí jako GAP>
```

## Časté chyby

- **Jméno místo identity.** „Martin Pavlík" není subjekt; rejstříkový
  profil s konkrétním ID je. Tenhle repozitář má na to explicitní
  pravidlo, protože jmenovec už problém způsobil.
- **Podotázka, která předpokládá odpověď.** „Proč to zatajil" má
  zabudovaný závěr.
- **Agregátor jako cíl.** Agregátor je rozcestník; doklad je registr,
  na který ukazuje. Tvrzení opřené jen o agregátor zůstává `1 ZDROJ`.
- **Zdroj, který na otázku neumí odpovědět.** Některé služby vrátí
  data i na filtr, který neumí (vyhledávání VVZ). Vydávat to za nález
  je horší než říct, že odpověď z tohohle zdroje nejde získat.

## Co skill NEUDĚLÁ

- Nehledá. Na to je `/find-source`.
- Nerozhoduje o rozsahu pokrytí.
- Nezapisuje nic.

## Příklady

**Základní.** „Prověř Nadační fond FIDUCIA." → identita přes IČO,
čtyři podotázky (zápis a orgány, listiny ve sbírce, smlouvy v registru
smluv, vazby na už pokryté subjekty), pořadí od rejstříku, mimo rozsah
osobní údaje zakladatelů.

**Realistický.** „Co je s tím ministrem?" → nejdřív se ptá zpět, který
resort a které období, protože bez toho se hledá cokoli. Pak čtyři
podotázky s konkrétními zdroji a poznámkou, že hodnocení jeho působení
je `NÁZOR` s atribucí, ne fakt.

**Selhání.** „Zjisti, jestli bere úplatky." → Tohle není rešeršní
otázka, je to obvinění hledající podklad. Zúžení musí skončit tím, že
doložitelné jsou jen konkrétní věci (existuje řízení? v jaké fázi? kdo
to uvedl?) a že z jejich nepřítomnosti neplyne nic — ani v jednom
směru.

## Související

`/find-source` (hledání), `/verify-source` (ověření nálezu),
`/authorization-check` (rozsah), `docs/osint/SOURCE_CATALOG.md`
(který registr co unese).
