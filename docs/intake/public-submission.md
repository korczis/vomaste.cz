# Jak podat veřejný podnět

Formulář: **[Navrhnout dossier nebo entitu](https://github.com/korczis/vomaste.cz/issues/new?template=navrh-dossieru.yml)**
(`.github/ISSUE_TEMPLATE/navrh-dossieru.yml`, verze `vomaste-intake-form:v1`).

## Co lze navrhnout

Čtyři typy podnětu:

- **Nový dossier** — návrh veřejně činného subjektu, který zatím nemá dossier.
- **Nová entita** — doplnění firmy, spolku nebo vazby do grafu, bez nutnosti
  samostatného dossieru.
- **Nové téma pro existující dossier** — rozšíření už autorizovaného pokrytí
  o konkrétní, nově publikovanou kauzu.
- **Propojení existujících entit** — vztah mezi dvěma už evidovanými
  entitami, doložený veřejným zdrojem.

## Co uvést

- **Koho nebo čeho se podnět týká** — jméno osoby, organizace, instituce
  nebo existujícího dossieru.
- **Co by mělo být prověřeno** — vlastními slovy, jako otázka nebo popis
  události, ne jako hotové obvinění.
- **Proč je téma ve veřejném zájmu** — vztah k veřejné funkci, veřejným
  prostředkům, rozhodování nebo jiné veřejně relevantní činnosti. Systém
  to nepředpokládá automaticky — musíte to napsat.
- **Veřejné zdroje** — jedna URL na řádek. U návrhu nového dossieru bez
  zdroje počítejte s tím, že podnět skončí ve stavu „chybí informace";
  u ostatních typů je pole nepovinné.
- Volitelně: veřejné identifikátory (IČO, datová schránka — **nikdy** rodné
  číslo ani osobní adresa), co zatím nevíte, souvislost s existujícím
  záznamem na webu.

## Co se stane po odeslání

Podnět se zpracuje **lokálně a offline** (Fáze 6 zatím tento krok
neautomatizuje na GitHubu — viz níže): forma se zparsuje, zdroje se
syntakticky zaznamenají (ne síťově ověří, pokud nikdo výslovně nespustí
`--preflight`), podnět se porovná s existujícím datasetem entit a projde
rizikovou klasifikací. Výsledkem je strukturovaný manifest a čitelný
report — nikdy sám o sobě dossier, tvrzení ani autorizace.

## Co se nestane automaticky

- **Nevzniká dossier ani tvrzení.** Podnět je vstup k posouzení.
- **Nikdo automaticky neautorizuje rozsah.** To dělá výhradně vlastník
  projektu, ručně, zápisem do append-only logu v `AGENTS.md`.
- **AI o ničem nerozhoduje.** Zpracování je deterministický tooling
  (parsování, syntaktická normalizace, porovnání s datasetem, riziková
  klasifikace podle pevných pravidel) — ne redakční ani právní úsudek.
- **Uvedené zdroje nejsou automaticky uznány jako nezávislé ani
  důvěryhodné.** Ani v případě, že projde volitelnou technickou kontrolou
  dostupnosti (`--preflight`) — ta ověřuje jen, že URL technicky
  odpovídá, ne obsah ani důvěryhodnost.
- **Počet reakcí nebo hlasů na věci nic nemění.**

## Kdo autorizuje a kdo schvaluje publikaci

Rozsah pokrytí reálných osob autorizuje výhradně vlastník projektu,
zápisem do append-only logu v [`AGENTS.md`](https://github.com/korczis/vomaste.cz/blob/master/AGENTS.md) —
bez tohoto záznamu žádný nástroj v tomto repozitáři obsah o reálné osobě
nepřidá (`npm run dossier:scaffold` to mechanicky odmítne). Publikace
vyžaduje vždy další, samostatnou lidskou kontrolu podle redakčních
pravidel — podání samo o sobě dataset nemění.

# Co neposílat

- neveřejné dokumenty, interní materiály;
- osobní kontaktní údaje kohokoli;
- identitu oznamovatele;
- zdravotní informace;
- rodná čísla, osobní adresy;
- tajné přístupové údaje;
- materiál, jehož zveřejnění by mohlo ohrozit zdroj — tento projekt
  nemá způsob, jak takový materiál ochránit (viz níže).

# Co GitHub znamená

Podání je **veřejná GitHub issue**: veřejná okamžitě, dlouhodobě
dohledatelná, s historií editací, vyžaduje GitHub účet. Smazání issue z
webového rozhraní obsah spolehlivě neodstraní — forky a cache Gitu si ho
mohou uchovat. GitHub negarantuje anonymitu odesílatele.

# Stav důvěrného intake kanálu

Projekt zatím neposkytuje důvěrný whistleblower kanál. Toto tvrzení platí
bez výjimky — žádná cesta v tomto formuláři, repozitáři ani na webu
nenabízí anonymní ani chráněné podání. Kdo má citlivé podklady vyžadující
ochranu zdroje, měl by je poslat jinam než sem. Plné odůvodnění a rozsah
tohoto omezení: [`docs/constitution/OPEN_INTELLIGENCE_COMMONS.md`](../constitution/OPEN_INTELLIGENCE_COMMONS.md), § 4–5.

# Technický kontrakt (pro vývojáře)

Přesný field-to-heading mapping, verzovací politika a parser
compatibility testy: [`docs/intake/issue-form-contract.md`](issue-form-contract.md).
