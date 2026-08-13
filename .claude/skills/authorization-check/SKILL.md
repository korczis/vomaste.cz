---
name: authorization-check
description: Zjistí, jestli konkrétní osoba nebo téma spadá do rozsahu, který tenhle repozitář smí pokrývat — čtením autorizačního logu v AGENTS.md, ne odhadem. Použij ho PŘED napsáním jakéhokoli tvrzení o člověku, před založením dossieru, a kdykoli někdo řekne „můžeme psát o X", „je X autorizovaný", „smím přidat tvrzení o Y", „jaký je rozsah u Z".
argument-hint: "<jméno nebo slug entity> [\"konkrétní téma\"]"
---

Odpovídá na jednu otázku: **smí se o tomhle psát, a v jakém rozsahu.**

## Kdy ho použít

- Před prvním tvrzením o konkrétním člověku.
- Před založením dossieru.
- Když někdo navrhne téma, které v dossieru ještě není.
- Když si nejsi jistý, jestli je entita subjekt, nebo kontext.

## Kdy ho NEPOUŽÍT

- **Na kontextovou entitu.** Zaznamenat, že rejstříková vazba existuje
  (`publicationRole: "context"`, bez jediného tvrzení), autorizaci
  nevyžaduje a nikdy nevyžadovalo. Tenhle skill je o **tvrzeních**.
- **Na technickou změnu.** Šablona, validátor, skript ani dokumentace se
  rozsahu pokrytí nedotýkají.
- **Aby autorizaci udělil.** To neumí a nesmí. Kanonický zapisovatel je
  `scripts/dossier/authorize-entity.mjs` a jedná na základě rozhodnutí
  vlastníka, ne na základě analýzy.

## Zdroje pravdy — v tomhle pořadí

1. **`AGENTS.md`, sekce „Content about real parties"** — append-only
   log. Je to autorita. Čti ho, nehádej z názvu dossieru.
2. **`AGENTS.md`, „Standing scope authorization and publication gates"**
   — co platí pro subjekty od 2026-08-05, a devět publikačních bran.
3. **`data/authorizations.toml`** — auditovaný přepis logu, který čte
   mechanická brána (`validate-authorization.mjs`).
4. **`.claude/rules/authorization.md`** — zkrácené shrnutí. **Není
   zdroj.** Když se rozchází s `AGENTS.md`, platí `AGENTS.md`.

## Postup

### 1. Rozliš, o co jde

```
Chci zaznamenat, že vazba existuje?     → autorizace se neřeší
Chci napsat tvrzení o člověku?          → pokračuj
Chci otevřít dossier?                   → pokračuj
```

Když nevíš, které z toho, **je to to druhé**.

### 2. Najdi entitu

```bash
grep -rn "<jméno>" AGENTS.md | head
grep -rn "<slug>" data/authorizations.toml
ls -d data/dossiers/<slug> 2>/dev/null
```

U existující entity si přečti její záznam:
`data/dossiers/_shared/entities/<id>.json` — pole `publicationRole`,
`dossierEnabled`, `dossierStatus`, `dossiers`.

### 3. Urči, který režim platí

Rozsahový model se dvakrát měnil a **starší záznamy se nepřepisují**.
Datum rozhoduje:

| Kdy | Co platí |
|---|---|
| před 2026-08-05 | per-subjektová autorizace, vyjmenovaná témata |
| od 2026-08-05 | standing scope: veřejní funkcionáři a PEP bez nového kola |
| od 2026-08-09 | „záměrně minimální" omezení starších záznamů padají |
| od 2026-08-10 | rekurzivní rozšiřování; sdílený záznam `subjects = ["*"]` |

Starší záznam se čte jako **historický popis toho, co bylo schváleno
tehdy** — jeho tematické limity dnes nebrání rozšíření, ale jeho
**zamítnutí** a **povinná rámování** platí dál a beze změny.

### 4. Zkontroluj zamítnutí a povinná rámování

Tohle je ten krok, který se nejčastěji přeskočí, a je nejdražší.

- Existuje pro subjekt **výslovně zamítavý záznam**? (Worked example:
  „Not authorized: Radovan Krejčíř" — platí dál.)
- Nese téma **povinné rámování**? Typicky: nepravomocnost při každé
  zmínce, zastavení stíhání není zproštění, odvolání z funkce není
  závěr o pochybení, kritika je pozice svého autora.
- Je někdo v tématu **výslovně mimo rozsah**? (Nejmenované třetí osoby,
  příbuzní, oběti, děti.)

### 5. Použij test veřejného zájmu, když jde o nový uzel

Rekurzivní rozsah má jednu zastavovací podmínku — konstituce §7:
subjektem se stane jen uzel, který **sám o sobě** projde testem
veřejného zájmu. Ptej se konkrétně:

- Jaká veřejná funkce, veřejné peníze nebo institucionální
  odpovědnost je ve hře?
- Je zásah přiměřený?
- Existuje méně invazivní varianta (kontextová entita místo subjektu)?

„Už to někde na internetu je" **není** odůvodnění.

## Výstup

```
SUBJEKT:     <jméno>
STAV:        AUTORIZOVÁN | KONTEXT | NEAUTORIZOVÁN | ZAMÍTNUT
ZÁKLAD:      <konkrétní záznam nebo standing scope + odkaz na sekci>
ROZSAH:      <co konkrétně smí být pokryto>
POVINNÉ RÁMOVÁNÍ: <co musí být u KAŽDÉ zmínky, nebo „—">
MIMO ROZSAH: <co výslovně ne>
DALŠÍ KROK:  <co udělat teď>
```

Stav **ZAMÍTNUT** je něco jiného než **NEAUTORIZOVÁN**: první znamená,
že se to už posuzovalo a rozhodlo proti, a znovu se to neotevírá bez
nového rozhodnutí vlastníka.

## Selhání a co s nimi

| Situace | Co udělat |
|---|---|
| entita v logu není | není to zamítnutí — projdi test veřejného zájmu a řekni výsledek |
| dvě osoby stejného jména | **nespojuj je.** Bez listinného ověření identity je to mezera |
| záznam je nejednoznačný | cituj ho doslova a řekni, co z něj neplyne |
| téma se vejde do rozsahu, ale zdroj chybí | rozsah není důkaz. Bez otevřeného zdroje se tvrzení nepíše |
| jde o soukromou osobu | test veřejného zájmu neprojde; kontextová entita ano, dossier ne |

## Co skill NEUDĚLÁ

- **Neudělí autorizaci** a nenapíše záznam do logu.
- **Nezmění** `AGENTS.md` ani `data/authorizations.toml`.
- **Nerozhodne, že zdroj stačí.** Rozsah a doloženost jsou dvě různé
  brány a obě musí projít.

## Příklady

**Základní.** `/authorization-check "Petr Pavel"` → AUTORIZOVÁN,
základ `AUTH-2026-08-01-PAVEL`, rozsah vymezený na jedno už doložené
vlákno, další krok: čti záznam, ne shrnutí.

**Realistický.** `/authorization-check "Andrej Babiš" "Čapí hnízdo"` →
AUTORIZOVÁN, ale výstup **musí** obsahovat povinné rámování: zrušené
zproštění není odsouzení, odvolací soud sám uvedl, že o vině rozhodnout
nemůže, oba obvinění vinu popírají, nic není pravomocné. Bez toho je
odpověď neúplná, i když je „ano".

**Selhání.** `/authorization-check "Radovan Krejčíř"` → **ZAMÍTNUT**,
ne „neautorizován". Log obsahuje odůvodněné rozhodnutí: nemá veřejnou
funkci, dossier by byl true-crime profil, ne kontrola veřejné moci.
Jako kontextová entita u autorizovaného subjektu vystupovat smí. Skill
nesmí nabídnout cestu, jak to obejít.

## Související

`.claude/rules/authorization.md` (zkrácená pravidla), `/dossier-entry`
(zápis záznamu — sám si rozsah ověřuje znovu), `/evidence-packet`
(příprava podkladu), `AGENTS.md` (autorita).
