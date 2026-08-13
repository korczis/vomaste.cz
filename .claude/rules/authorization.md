---
paths:
  - "AGENTS.md"
  - "data/authorizations.toml"
  - "data/dossiers/**"
  - "scripts/dossier/authorize-entity.mjs"
  - "scripts/dossier/validate-authorization.mjs"
---

# Rozsah pokrytí — co smíš a co nesmíš

Kanonické znění je v `AGENTS.md`, sekce „Standing scope authorization
and publication gates" a append-only log „Content about real parties".
Tady je jen to, co si musíš pamatovat, než na dossier sáhneš.

## Dva různé úkony, jen jeden je bránou

**Zaznamenat, že vazba existuje** — kontextová entita
(`data/dossiers/_shared/entities/<id>.json` s `publicationRole: "context"`,
`dossierEnabled: false`, `dossiers: []`, bez jediného tvrzení) o firmě
nebo osobě, kterou veřejný rejstřík či už citovaný zdroj sám jmenuje —
**nevyžaduje autorizaci** a neptá se na ni.

**Napsat o někom tvrzení, nebo na něj otevřít dossier** — to je publikace
a řídí se rozsahem.

Když si nejsi jistý, který z těch dvou děláš, děláš ten druhý.

## Co dnes platí pro nový subjekt

Od `AUTH-2026-08-10-RECURSIVE-SCOPE` existuje sdílený standing-scope
záznam s `subjects = ["*"]`. Nový dossier ve standing scope tedy
**nepotřebuje** vlastní per-subjektový záznam v `data/authorizations.toml`
ani vlastní datovaný zápis do logu. Zastavovací podmínka je **test
veřejného zájmu** (konstituce §7): subjektem se stane jen uzel, který jím
projde sám o sobě.

Co se tím **nezměnilo** a nezmění: devět publikačních bran, redakční
pravidla, minimalizace dat, „no guilt by graph", a všechna dřívější
výslovně zamítavá rozhodnutí — jmenovitě záznam „Not authorized:
Radovan Krejčíř" platí dál.

## Čeho se nedotkneš

- **Autorizační log v `AGENTS.md` je append-only.** Neupravuješ ani
  neodstraňuješ existující záznam. Ani kvůli překlepu. Vynucuje
  `npm run verify:authorization-log` (pre-commit i build).
- **Autorizaci nikdy neuděluješ.** Žádný skill, agent ani workflow
  v tomhle repozitáři autorizaci nevytváří. Kanonický zapisovatel je
  `scripts/dossier/authorize-entity.mjs` a spouští se na základě
  rozhodnutí vlastníka, ne odvozením.
- **Kontextovou entitu nepovyšuješ na subjekt potichu.** Získá-li
  `publicationRole: "subject"`, `dossierEnabled` nebo
  `dossierStatus: "authorized"` bez odpovídajícího podkladu, build spadne
  (pravidla S5/S6, `validate-semantics.mjs`).
- **Datum narození ani adresu bydliště z rejstříku nepřebíráš.** Nikdy,
  ani u kontextové entity, ani „jen do poznámky".

## Devět publikačních bran

Záznam smí do veřejného kanonického datasetu, jen když projde všemi.
Plné znění je v `AGENTS.md`; zkratka pro kontrolu:

1. **Jmenovaný důkaz** — zdroj byl skutečně otevřen a přečten. Výtah
   z vyhledávače není zdroj.
2. **Provenience** — odkud, kdy, jakou transformací, ke kterému záznamu.
3. **Věrný stav** — citace zůstává citací, obvinění připsaným obviněním,
   procesní výsledek se nepřepisuje na věcný závěr.
4. **Žádná vina z grafu** — společná adresa, firma ani účast na akci
   samy o sobě nedokládají vliv ani pochybení.
5. **Nezávislost zdrojové rodiny** — dva přetisky jedné agenturní zprávy
   jsou jeden hlas.
6. **Minimalizace dat** — adresy, kontakty, zbytná data narození,
   rodinné a zdrojově identifikující údaje se nepublikují.
7. **Přiměřenost vůči třetím osobám** — jmenovaná třetí osoba je kontext,
   ne nový subjekt.
8. **Přezkoumatelná změna** — každé povýšení je diff, který někdo viděl.
   Dávkový review je v pořádku, tichá publikace z discovery běhu ne.
9. **Deterministický build** — veřejný web se postaví z repozitáře, bez
   externí platformy, přihlašovacích údajů a bez sítě.

## Když rozsah neplatí

Nedopisuj hedge větu. Napiš **mezeru** (`GAP-##`). Mezera je poctivé
sdělení, že citované zdroje k závěru zatím nestačí — není to náznak
v obou směrech.
