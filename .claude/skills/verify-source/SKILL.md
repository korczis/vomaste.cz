---
name: verify-source
description: Otevře zdroj a řekne, co doopravdy dokládá a co ne — vydavatel, autor, datum, primární versus převzatý, zdrojová rodina, přímé citace, dostupnost. Použij ho, když má někdo článek, rejstříkový výpis nebo dokument a ptá se „je tenhle zdroj dobrý", „co z toho plyne", „můžu to použít", „prověř mi tohle", nebo když se má existující SRC záznam ověřit proti realitě.
argument-hint: "<URL nebo popis zdroje> [\"tvrzení, které má doložit\"]"
---

Prověření jednoho zdroje. **Nic nezapisuje.** Výstupem je zjištění, co
zdroj unese — a hlavně co neunese.

## Kdy ho použít

- Někdo přinesl článek nebo dokument a neví, co s ním.
- Před tím, než se zdroj použije u tvrzení.
- Když se ověřuje, jestli existující `SRC-##` pořád platí (mrtvý odkaz,
  změněný text, doplněná oprava redakce).

## Kdy ho NEPOUŽÍT

- **Na výsledek vyhledávání.** Snippet není zdroj. Když nemáš URL, které
  jde otevřít, prověřovat není co — to je hledání, ne ověřování.
- **K rozhodnutí, jestli se o někom smí psát.** To je rozsah, ne
  doloženost. Dvě různé brány.
- **Ke srovnání dvou zdrojů na nezávislost.** Na to je `/source-family`.

## Nepodkročitelné pravidlo

**Zdroj musí být otevřený a přečtený.** Ne popsaný z výtahu, ne
odhadnutý z URL, ne převzatý z toho, co o něm říká jiný text. Tenhle
repozitář má na to worked example, který stál za to: URL z Reflex.cz
vypadala jako běžné zpravodajství, ve vyhledávači i v odkazu — a po
otevření se ukázalo, že vyšla v satirické rubrice „Divoký kačer",
označené jako fikce. Byla vyřazena z autorizace úplně.

Když se stránka nedá otevřít (403, paywall, mrtvý odkaz), **je to
výsledek**, ne překážka k obejití. Řekni to a navrhni archivní kopii
nebo primární registr.

## Postup

### 1. Otevři to

Načti stránku. Zaznamenej, jestli se to povedlo, a co se stalo, když ne.

### 2. Zjisti, co to vlastně je

| Co | Proč to rozhoduje |
|---|---|
| **Vydavatel** | rozhoduje o nezávislosti (pravidlo S10 srovnává i doménu) |
| **Autor / podpis** | anonymní redakční text má jinou váhu než podepsaná investigace |
| **Datum vydání** | bez něj nejde tvrzení zařadit v čase |
| **Datum pořízení** | dnešek; patří do záznamu vždy |
| **Rubrika** | komentář, názor, satira, PR, inzerce — všechno vypadá jako článek |
| **Primární × převzaté** | agenturní zpráva přetištěná jinde je pořád jeden hlas |
| **Původ materiálu** | odkud pochází, ne kdo to vytiskl → kandidát na `sourceFamily` |

Rubriku hledej **na stránce**, ne v URL. „Komentář", „Názor",
„Reklamní sdělení", „Divoký kačer" — tohle je ta informace, kvůli které
se otevírá.

### 3. Odděl, co dokládá, od toho, co ne

Tohle je jádro celého skillu a píše se **konkrétně**, ne obecně.

```
DOKLÁDÁ:
  — že soud dne X zrušil zprošťující rozsudek
  — že obhájce po jednání řekl větu Y (doslovně)

NEDOKLÁDÁ:
  — že je obviněný vinen (soud sám uvedl, že o vině nerozhoduje)
  — jak řízení dopadlo (článek je z data, kdy běželo)
  — nic o dalších osobách, které jen jmenuje
```

Věta „potvrzuje kauzu X" není zjištění. Zjištění je, který konkrétní
fakt z toho textu plyne.

### 4. Vytěž přímé citace přesně

Citace se přepisuje **doslova**, s uvedením, kdo ji řekl a kde.
Zkrácení musí být označené. Parafráze, která zní jako citace, je
redakční chyba, ne stylistická volba.

### 5. Navrhni stav tvrzení, které by zdroj podpíral

Ne rozhodni — navrhni, s odůvodněním:

- **jediný hlas** → `1 ZDROJ`;
- **výrok subjektu** → `CITACE` (dokládá, že to bylo řečeno, ne že to
  platí);
- **komentář** → `NÁZOR`, strukturálně oddělený;
- **sporná věc** → `SPORNÉ`;
- **CORROBORATED** navrhuj jen tehdy, když už existuje druhý zdroj
  jiného vydavatele *i* jiné rodiny — a i pak to patří `/source-family`.

## Výstup

```
ZDROJ:       <URL>
OTEVŘENO:    ano | ne (<důvod>)
VYDAVATEL:   <outlet>          AUTOR: <jméno nebo „nepodepsáno">
VYDÁNO:      <datum>           POŘÍZENO: <dnešní datum>
TYP:         zpravodajství | investigace | komentář | registr | úřední dokument | jiné
PŮVOD:       primární | převzato od <koho>   → sourceFamily: <návrh>
DOKLÁDÁ:     <konkrétní fakta, po bodech>
NEDOKLÁDÁ:   <co se z toho běžně vyvozuje a neplyne>
CITACE:      <doslovné výroky s atribucí, nebo „—">
TŘETÍ OSOBY: <kdo je jmenován a v jaké roli>
NAVRHOVANÝ STAV: <status + proč>
RIZIKA:      <paywall, změna textu, mrtvý odkaz, rubrika>
DALŠÍ KROK:  <co teď>
```

## Selhání a co s nimi

| Situace | Co udělat |
|---|---|
| 403 / paywall | řekni to; navrhni archiv nebo primární registr. Neodhaduj obsah |
| stránka bez data | datum je povinné; bez něj zdroj tvrzení neunese |
| rubrika komentář/satira | **nejdůležitější nález.** Řekni to výrazně, ne v poznámce |
| text jmenuje třetí osoby | vyjmenuj je a označ jako kontext, ne jako subjekty |
| obsahuje osobní údaje | datum narození, adresa — do repozitáře se nepřebírají |
| zdroj cituje jiný zdroj | doklad je ten původní; tenhle je rozcestník |

## Co skill NEUDĚLÁ

- Nezapíše `SRC` záznam. Na to je `/dossier-entry`.
- Nerozhodne o rozsahu pokrytí.
- Neprohlásí dva zdroje za nezávislé.
- Neuloží kopii dokumentu (to má vlastní doktrínu — Zone A/B).

## Příklady

**Základní.** `/verify-source https://ct24.ceskatelevize.cz/...` →
vydavatel ČT24, podepsaná redakce, datum, zpravodajství, primární;
dokládá tři konkrétní fakta; nedokládá čtvrté, které se z něj běžně
vyvozuje; navrhovaný stav `1 ZDROJ`.

**Realistický.** Článek bulváru přetiskující ČTK. Zjištění: vydavatel je
bulvár, **původ je ČTK**, `sourceFamily: ctk`. Důsledek se řekne
rovnou: s jiným přetiskem téže zprávy nedá CORROBORATED, protože je to
jeden hlas ve dvou kabátech.

**Selhání.** URL vede na text v rubrice označené jako satira. Výstup
začíná tím, že **tohle není zdroj faktu**, a končí doporučením
nepoužívat ho vůbec — ne „použít opatrně". Přesně tenhle případ už
jednou vedl k vyřazení tématu z autorizace.

## Související

`/source-family` (jsou dva zdroje nezávislé?), `/evidence-packet`
(z ověřených zdrojů podklad), `/dossier-entry` (zápis),
`docs/osint/SOURCE_CATALOG.md` (který registr co unese),
`.claude/rules/evidence.md` (pravidla).
