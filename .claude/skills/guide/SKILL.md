---
name: guide
description: Nevíš, co dál, nebo neznáš názvy skillů tohoto repozitáře? Tenhle skill zjistí, co chceš udělat, a nasměruje tě na správnou schopnost — podle záměru, ne podle abecedy. Použij ho, když uživatel řekne „nevím co dál", „jak na to", „co s tím", „mám článek a nevím co s ním", „chci přispět", nebo když z jeho zadání není jasné, kterým postupem začít.
argument-hint: "[volitelně: co chceš udělat, vlastními slovy]"
---

Tenhle skill je **rozcestník podle záměru**.

> **Proč `/guide` a ne `/help`.** `/help` je vestavěný příkaz Claude
> Code a projektový skill ho v interaktivní session nepřebije — skill
> toho jména by šel dokumentovat, ale ne spustit. Dokumentovaná
> schopnost bez funkce je přesně to, co `.claude/rules/claude-tooling.md`
> zakazuje, takže se jmenuje jinak. Na formulaci „nevím, co dál" se
> stejně chytí sám, i bez lomítka. Nevypisuje čtyřicet
příkazů — od toho je generovaný katalog `docs/TOOLING.md`. Zjistí, co
člověk chce, a pošle ho na jednu věc.

## Kdy ho použít

- Uživatel neví, jak začít, nebo se ptá „co teď".
- Zadání je jasné jako cíl, ale ne jako postup („mám nový článek",
  „chci opravit chybu na stránce", „chci přispět").
- Uživatel nezná názvy skillů a nemá důvod je znát.

## Kdy ho NEPOUŽÍT

- **Když už víš, který postup je správný.** Pak ho rovnou spusť.
  Rozcestník mezi tebou a cílem je krok navíc, ne služba.
- **Když se uživatel ptá na fakt** („co znamená 1 ZDROJ", „kde jsou
  data"). To je otázka na vysvětlení, ne na postup.
- **Jako obsah odpovědi.** Výstupem není seznam schopností, ale
  jedna doporučená cesta.

## Postup

### 1. Zjisti záměr

Když uživatel napsal, co chce, **neptej se znovu** — zařaď to. Když
nenapsal nic, nabídni tenhle výběr (a nic víc):

```
Co chceš udělat?

 1  Porozumět projektu — co to je a jak to funguje
 2  Porozumět konkrétní věci — tvrzení, zdroji, pojmu
 3  Ověřit, jestli tvrzení sedí se zdroji
 4  Prověřit zdroj, který mám
 5  Udělat rešerši k tématu
 6  Nahlásit nebo opravit chybu
 7  Upravit web — vzhled, šablony, kód
 8  Připravit příspěvek k odeslání
 9  Zkontrolovat změny, které už mám
10  Nefunguje mi prostředí
```

### 2. Načti skutečnou nabídku, nevypisuj ji z hlavy

Seznam schopností **není v tomhle souboru** a nikdy nebude — zastaral by
při prvním přidání skillu. Je v generovaném katalogu:

```
data/generated/tooling-catalog.json
```

Čti z něj pole `entries` a filtruj `kind` na `skill`, `agent`,
`workflow`. Každý záznam nese `name`, `invocation`, `summary`,
`personas`, `riskLevel`, `writes` a `route`. Když soubor neexistuje,
spusť `npm run build:tooling-catalog`.

### 3. Doporuč jednu věc a řekni, co udělá

Formát odpovědi — vždy tenhle, vždy s rizikem:

```
Doporučuji:  <invocation z katalogu>
Riziko:      <riskLevel, česky — viz .claude/rules/personas.md>
Co udělá:    <summary, zkrácené na jednu větu>
Potom:       <navazující krok, jen pokud v katalogu existuje>

Přirozeně:   "<totéž jako věta, kterou by uživatel řekl sám>"
```

Řádek **Přirozeně** je povinný. Uživatel nemá memorovat názvy — má
vidět, že stačí říct, co chce.

### 4. Když žádná schopnost nesedí

Řekni to. Nabídni nejbližší věc a rozdíl pojmenuj:

```
Přesně na tohle schopnost není.
Nejblíž je <schopnost z katalogu>.
Rozdíl: <co udělá jinak, než uživatel čekal>.
```

Nevymýšlej si příkaz, který neexistuje. Kontrola CT5
(`npm run validate:claude-tooling`) tuhle chybu hlídá v textech, ale
v konverzaci ji nikdo nechytí — proto ji nedělej.

## Mapování záměru na cestu

Tady **nejsou vypsané názvy schopností**, a to je záměr: seznam v tomhle
souboru by zastaral při prvním přidání nebo přejmenování skillu, a
odkaz na schopnost, která ještě nevznikla, je přesně to
„dokumentovaná schopnost bez implementace", které
`.claude/rules/claude-tooling.md` zakazuje.

Záměr se místo toho páruje s katalogem. Pro každou položku výběru
z kroku 1 hledej v `entries` schopnost, jejíž `summary` a `personas`
sedí na tohle:

| # | Záměr | Co má cíl umět | Očekávaná persona |
|---|---|---|---|
| 1 | porozumět projektu | popsat strukturu ze skutečného repozitáře | reader |
| 2 | porozumět konkrétní věci | vysvětlit záznam, soubor nebo pojem | reader |
| 3 | ověřit tvrzení | projít tvrzení proti jeho zdrojům | verifier |
| 4 | prověřit zdroj | otevřít zdroj a říct, co dokládá | verifier, source-contributor |
| 5 | rešerše | zúžit otázku, najít a ověřit zdroje | researcher |
| 6 | oprava chyby | vést od nahlášení k ověřené opravě | source-contributor, editor |
| 7 | úprava webu | rozložit zadání, zkontrolovat UI | developer |
| 8 | připravit příspěvek | projít bránou kvality a otevřít PR | developer, editor |
| 9 | zkontrolovat změny | vysvětlit diff netechnicky | reviewer |
| 10 | nefunguje prostředí | diagnostika prerekvizit | vše |

Když katalog pro daný záměr nic nemá, řekni to rovnou — viz krok 4.
Nevymýšlej název, který „by dával smysl".

## Čemu se vyhnout

- **Nezahltit.** Jedna doporučená věc, ne devět možností s výhradami.
- **Nepředstírat autoritu.** Rozcestník nerozhoduje o rozsahu pokrytí,
  o publikaci ani o tom, jestli je zdroj dost dobrý.
- **Nezačínat zápisem.** Pro začátečníka je výchozí cesta vždy
  READ-ONLY. Zápis se nabízí, až když je jasné, že o něj jde.

## Příklady

**Základní.** Uživatel napíše `/guide` bez ničeho → nabídne se
desetibodový výběr, uživatel řekne „4", v katalogu se najde
schopnost pro personu `verifier`, a doporučí se s vysvětlením
a přirozenou formulací.

**Realistický.** „Mám článek z Deníku N o ministrovi a nevím, co s ním."
→ Záměr je 4 (prověřit zdroj), ne 5 (rešerše). V katalogu se najde
schopnost pro personu `verifier`, která zdroj otevře a řekne, co
dokládá; doporučí se ta. Zmíní se, že rozsah pokrytí se řeší až
u zápisu, ne teď.

**Selhání.** „Chci přidat nový dossier o svém sousedovi." → Žádná
schopnost tohle neudělá a je to správně. Odpověď říká, že rozsah
pokrytí se řídí testem veřejného zájmu (`.claude/rules/authorization.md`),
že soukromá osoba jím neprojde. Kontrolu rozsahu nabídne, jen pokud je
v katalogu; jinak odkáže na pravidlo. Obcházení nenabízí nikdy.

## Související

`/bootstrap` (nastartování session a volba role) a `docs/TOOLING.md`
(úplný katalog, když ho někdo opravdu chce vidět celý). Ostatní cíle
se hledají v katalogu, ne v tomhle seznamu.
