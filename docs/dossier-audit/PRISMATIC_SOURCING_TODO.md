*Historický dokument — popisuje stav před JSON-first migrací (T-028).*

# Prismatic-platform sourcing TODO (per dossier)

Generated 2026-07-30 by mapping `~/dev/prismatic-platform` (the site owner's
separate Elixir/OTP OSINT & due-diligence platform, not part of this repo)
against the dossiers currently registered in `data/dossiers.toml`.

## Guardrail (binding — read before running anything on this list)

Every item below may **only** be used to find additional, independent
sources for **already-authorized** claims — e.g. upgrading a `status-single`
("1 ZDROJ") claim to `status-corroborated` once a second, genuinely
independent source is opened and read, or resolving an open item in a
dossier's gaps registry (`GAP-##`). Per `AGENTS.md`:

- No step here authorizes a new subject, new topic, new controversy, or a
  new named third party. If a tool run surfaces something outside the
  scope already recorded in `AGENTS.md`'s authorization log, that's a new
  candidate to bring to the site owner for an explicit, dated, on-record
  decision — never a reason to write it into a dossier directly.
- A source found this way still has to be **opened and read directly**
  before being cited (per the standing rule applied throughout the
  2026-07-30 authorization entries) — a tool's structured output/snippet is
  not itself a citable source.
- `mix investigate.person`, `mix prismatic.osint.*`, and the `dd.seed.*`
  tasks live entirely in `~/dev/prismatic-platform` (separate Elixir/OTP
  app, own DB, own credentials/setup via `just setup`). Nothing here runs
  from this repo, and none of it is wired into `npm run build` or the
  dossier validators.
- Where a subject's authorization entry explicitly excludes a category
  (e.g. Richard Chlad's "business activities generally"), that exclusion
  is repeated below — do not run the general-purpose tool against it.

## Cross-cutting tools (not per-dossier)

These are bulk seeders/registries, useful once as a sanity cross-check
across all subjects, not as a source of new per-claim material:

- `mix dd.seed.pep` — Politically Exposed Persons (~2,000) — confirms
  public-office status, the basis of this site's public-interest test
- `mix dd.seed.parliament` / `dd.seed.senate` / `dd.seed.local_gov` —
  legislator/official rosters — cross-check office dates against what a
  dossier states
- `mix dd.seed.sanctions` — EU/OFAC/UN sanctioned entities (~100) —
  negative-result check; expected to return nothing for every subject here

## Per-dossier steps

- [ ] **Petr Macinka / Filip Turek** (`petr-macinka`, `filip-turek`,
      aggregate `macinka-turek`)
  - `mix investigate.person "Petr Macinka" <rok narození> --legal-history --business-network --property-records`
  - `mix investigate.person "Filip Turek" <rok narození> --legal-history --business-network --property-records`
  - `mix prismatic.osint.czech.business` — ARES validace firemních/spolkových
    vazeb dnes agregovaných strojově z Hlídače státu (AGENTS.md finanční
    vrstva už žádá "ověřená proti ARES")
  - `mix prismatic.osint.czech.property` — Praha-Dubeč pozemek, byt na
    Strahově (Turek)
  - `mix prismatic.osint.legal.investigation` — 2017 embassy incident,
    uzavřený trestní spis (jen procesní fakta — status, ne obsah)
  - `mix dd.seed.sanctions` — kontrolní běh (očekává se nulový výsledek)

- [ ] **Oto Klempíř**
  - `mix investigate.person "Oto Klempíř" <rok> --business-network --property-records`
    — pokrývá již autorizované "hlubší finanční/rejstříkové kolo"
  - `mix prismatic.osint.czech.business`

- [ ] **Alena Schillerová**
  - `mix prismatic.osint.legal.investigation` — dohledat samotné stanovisko
    Národní rozpočtové rady jako primární dokument, ne jen jeho citace v
    médiích
  - Finanční/rejstříkové téma **není autorizováno** pro tento subjekt —
    nespouštět `dd.seed.ares_sweep` / `investigate.person --business-network`

- [ ] **Andrej Babiš**
  - `mix prismatic.osint.legal.investigation` — Čapí hnízdo, aktuální
    procesní stav po 2025-06 (dnes GAP — iROZHLAS vrací 403 na automatický
    fetch)
  - `mix prismatic.osint.czech.business` + `mix dd.seed.ares_sweep` —
    Agrofert/SynBiol struktura, RSVP Trust
  - `mix dd.seed.top_firms` — Agrofert jako státní dodavatel/příjemce
    dotací
  - Francie (nemovitosti), Setuza, Kostelecké uzeniny: žádný z CZ
    registrových nástrojů to nepokrývá — zůstává na ručním dohledání
    zahraničních/oborových zdrojů

- [ ] **Tomio Okamura**
  - `mix prismatic.osint.legal.investigation` — SPD verdikt, stav odvolání
  - `mix czech_registry` — SPD jako registrovaná strana, financování

- [ ] **Lubomír Metnar**
  - Žádný registr-vázaný nástroj nesedí (čistě politický spor o ochranku
    NKÚ) — jen `mix dd.seed.pep` pro cross-check funkce

- [ ] **Aleš Juchelka**
  - `mix prismatic.osint.legal.investigation` — stav ohlášených trestních
    oznámení
  - `mix prismatic.osint.czech.business` — firma bývalé poradkyně (ARES) —
    poradkyně sama zůstává jen záznamem vazby, ne subjektem

- [ ] **Ivan Bednárik**
  - `mix prismatic.osint.czech.business` — České dráhy rejstříkové vazby
  - `mix prismatic.osint.czech.property` — platby Správě železnic za
    pozemky

- [ ] **Boris Šťastný**
  - `mix dd.seed.pep` cross-check; jinak málo registr-vázaného obsahu
    (nahrávací zařízení, sociální sítě) — mimo dosah těchto nástrojů

- [ ] **Karel Havlíček**
  - `mix prismatic.osint.czech.business` + `mix dd.seed.ares_sweep` —
    toustový chléb, výrobní linka Agrofert
  - `mix prismatic.osint.legal.investigation` — nález EU auditu jako
    primární dokument

- [ ] **Jaromír Zůna**
  - Žádný registr-vázaný nástroj (rozpočtový/personální spor) —
    `mix dd.seed.pep` jen cross-check

- [ ] **Jeroným Tejc**
  - `mix prismatic.osint.legal.investigation` — trestní oznámení
    (bitcoiny), kárná žaloba na soudkyni — predchůdce a soudce zůstávají
    jen záznamem vazby

- [ ] **Zuzana Mrázová**
  - `mix prismatic.osint.czech.property` — byt Bílina, stavby v rozporu s
    územním plánem
  - `mix prismatic.osint.legal.investigation` — stav nepravomocné pokuty
    (musí zůstat nepravomocná při každé zmínce)

- [ ] **Adam Vojtěch**
  - `mix prismatic.osint.legal.investigation` — trestní oznámení FN
    Olomouc — cílí na nemocnici, ne na ministra osobně; toto rozlišení
    musí zůstat explicitní

- [ ] **Igor Červený**
  - `mix prismatic.osint.czech.property` — chybějící dům v majetkovém
    přiznání
  - `mix prismatic.osint.czech.business` — podcastová firma (střet zájmů)

- [ ] **Robert Plaga**
  - Žádný registr-vázaný nástroj (čistě školské politiky) — mimo dosah

- [ ] **Martin Šebestyán**
  - `mix prismatic.osint.czech.business` + `mix dd.seed.top_firms` —
    SZIF → Agrofert dotační toky
  - `mix prismatic.osint.legal.investigation` — stav vymáhání dotací

- [ ] **Tünde Bartha**
  - `mix prismatic.osint.legal.investigation` — usnesení Prahy 3 + obě
    protichůdná právní stanoviska (obě musí zůstat, i to odmítavé)
  - `mix prismatic.osint.czech.property` — byt
  - `mix prismatic.osint.czech.business` — Agrofert zaměstnání jako fakt
    kariéry, výslovně ne jako důkaz vlivu (viz explicitní vyloučení v
    AUTH-2026-07-30-U)

- [ ] **Jaroslav Faltýnek**
  - `mix prismatic.osint.legal.investigation` — usnesení o zastavení
    trestního stíhání (2018), soudní záznam jeho svědectví

- [ ] **Richard Chlad** *(autorizován AUTH-2026-07-30-W, dossier zatím
      nescaffoldován — čeká na `npm run scaffold:dossier`)*
  - `mix czech_registry` / registr dárců (UDHPSH) — jen srovnání
    638 864 Kč vs. "necelé dva miliony"
  - **Mimo scope, nespouštět**: `mix prismatic.osint.czech.business` /
    `investigate.person --business-network` obecně na jeho firmy —
    AUTH-2026-07-30-W to výslovně vylučuje ("jeho obchodní aktivity
    obecně")

## Not on this list

- **Radovan Krejčíř** — žádný dossier autorizován (AGENTS.md, "Not
  authorized: Radovan Krejčíř"). Čeká se na upřesnění rozsahu od
  vlastníka webu, viz probíhající konverzace. Dokud není nový on-record
  záznam v `AGENTS.md`, žádný z výše uvedených nástrojů se na něj nesmí
  spustit s cílem najít materiál pro dossier.
