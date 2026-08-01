# Authorization tracker

This file is a **working index and decision queue**, not a legal record.
The chain of authority is:

1. **`AGENTS.md`** ("Content about real parties") — the actual,
   append-only, human-authored authorization log. If this file ever
   disagrees with `AGENTS.md`, `AGENTS.md` wins, always.
2. **`data/authorizations.toml`** — a structured, build-checked mirror of
   every *granted* entry in that log (`AUTH-####-##-##-X` IDs), read by
   `scripts/dossier/validate-authorization.mjs` to fail the build if any
   dossier's front matter claims a scope the log doesn't back.
3. **`reports/authorization-candidates.md`** /
   `data/generated/authorization-candidates.json` — auto-regenerated on
   every `npm run build`/`npm run dev` by
   `scripts/dossier/generate-authorization-candidates.mjs`. It lists every
   *context* entity (`publication_role = "context"`) currently in the
   system — i.e. everything discovered because an already-authorized
   dossier's sources or claims named it — with no memory of past
   decisions. It gets overwritten every build.
4. **This file (`AUTHORIZATION.md`) and `authorization.json`** — hand
   maintained, never touched by a build script. They exist because (3) has
   no decision state: it cannot tell you "the owner already said no to
   this one" or "this one is next in line." This file adds that state on
   top of (3)'s raw feed, and is the thing to open when deciding what to
   review next.

**This file never authorizes anything by itself.** Moving a row from
"pending" to "authorized" only happens after the site owner grants it
explicitly and on the record, which is then written into `AGENTS.md` as a
new dated subsection (never edited/removed — see `CLAUDE.md`), mirrored
into `data/authorizations.toml`, and only then reflected here. Same
process for a decline: `AGENTS.md` gets the record (see the "Not
authorized: Radovan Krejčíř" entry for the pattern), then this file is
updated to match.

Regenerate the raw candidate feed this file is triaged from with:

```
npm run generate:candidates
```

Last triaged against that feed: **2026-08-01** (61 context entities, 24
dossiers).

---

## 1. Already authorized (23 subjects, 24 dossiers incl. the aggregate)

Source of truth: `AGENTS.md`, mirrored in `data/authorizations.toml`.

| Subject | Dossier slug | First authorized | AUTH ID(s) |
|---|---|---|---|
| Petr Macinka | `petr-macinka` | 2026-07-21 | AUTH-2026-07-21-A/B, AUTH-2026-07-30-A |
| Filip Turek | `filip-turek` | 2026-07-21 | AUTH-2026-07-21-A/B, AUTH-2026-07-22-A, AUTH-2026-07-30-A |
| Oto Klempíř | `oto-klempir` | 2026-07-30 | AUTH-2026-07-30-KLEMPIR |
| Alena Schillerová | `alena-schillerova` | 2026-07-30 | AUTH-2026-07-30-B |
| Aleš Juchelka | `ales-juchelka` | 2026-07-30 | AUTH-2026-07-30-B |
| Lubomír Metnar | `lubomir-metnar` | 2026-07-30 | AUTH-2026-07-30-B |
| Ivan Bednárik | `ivan-bednarik` | 2026-07-30 | AUTH-2026-07-30-B |
| Boris Šťastný | `boris-stastny` | 2026-07-30 | AUTH-2026-07-30-B |
| Andrej Babiš | `andrej-babis` | 2026-07-30 | AUTH-2026-07-30-C, AUTH-2026-07-30-E |
| Tomio Okamura | `tomio-okamura` | 2026-07-30 | AUTH-2026-07-30-D |
| Karel Havlíček | `karel-havlicek` | 2026-07-30 | AUTH-2026-07-30-M |
| Jaromír Zůna | `jaromir-zuna` | 2026-07-30 | AUTH-2026-07-30-N |
| Jeroným Tejc | `jeronym-tejc` | 2026-07-30 | AUTH-2026-07-30-O |
| Zuzana Mrázová | `zuzana-mrazova` | 2026-07-30 | AUTH-2026-07-30-P |
| Adam Vojtěch | `adam-vojtech` | 2026-07-30 | AUTH-2026-07-30-Q |
| Igor Červený | `igor-cerveny` | 2026-07-30 | AUTH-2026-07-30-R |
| Robert Plaga | `robert-plaga` | 2026-07-30 | AUTH-2026-07-30-S |
| Martin Šebestyán | `martin-sebestyan` | 2026-07-30 | AUTH-2026-07-30-T |
| Tünde Bartha | `tunde-bartha` | 2026-07-30 | AUTH-2026-07-30-U |
| Jaroslav Faltýnek | `jaroslav-faltynek` | 2026-07-30 | AUTH-2026-07-30-V |
| Richard Chlad | `richard-chlad` | 2026-07-30 | AUTH-2026-07-30-W |
| Petr Pavel | `petr-pavel` | 2026-08-01 | AUTH-2026-08-01-PAVEL |
| Petr Vencálek | `petr-vencalek` | 2026-08-01 | AUTH-2026-08-01-VENCALEK |
| *(aggregate, not a subject)* | `macinka-turek` | 2026-07-29 | structural, see AGENTS.md |

Every one of the current 16 government members (`data/government.toml`)
already has an authorized dossier — **the cabinet roster is fully
covered**; there is no "authorize the rest of the government" backlog
item left.

## 2. Explicitly declined

| Subject | Date | Reason (see `AGENTS.md` for full text) |
|---|---|---|
| Radovan Krejčíř | 2026-07-30 | No public office, no institutional angle — a true-crime profile of a private convicted individual fails the public-interest test (constitution §7). May appear only as a context entity where already-cited reporting documents a relation to an authorized subject. |

## 3. Pending candidates — for owner review, one at a time

Only **persons** can become dossier subjects under this site's data model
(`dossier_type = "entity"` is scoped to one person; see `AGENTS.md`).
Companies, institutions, parties, controversies and events are structurally
**not eligible** for their own dossier — they stay context entities no
matter how much reporting cites them. They're listed in §4 for completeness
only, not because they're pending decisions.

### Tier A / Tier B — resolved 2026-08-01

**Petr Pavel** (`pavel`) — authorized with the narrow, already-documented
scope only (refusal to appoint Turek environment minister + Turek's
unfiled lawsuit threat). See `AUTH-2026-08-01-PAVEL`, dossier
`petr-pavel`. Moved to §1.

**Petr Vencálek** (`vencalek`) — authorized for two topics:
(1) ownership/jednatelství of GMR GAS s.r.o. and its tie to GMR GAS UA
LLC — written, sourced, live; (2) donations to Klub motoristů, z.s. —
authorized as scope, but **no source has been found**; tracked as
`GAP-01` in his dossier rather than silently dropped or written without
a source. See `AUTH-2026-08-01-VENCALEK`, dossier `petr-vencalek`. Moved
to §1.

### Tier C — bare ARES registry stubs, zero editorial content: **not recommended** without new sourcing

These 11 people were pulled in automatically by `scripts/osint/expand-entity.mjs`
(`discovered_via: ares-expansion-26185610-2026-07-31`) purely because they
are listed as **members of AGROFERT, a.s.'s statutory board**. Each has
zero claims, zero sources, zero relations — no controversy has been found
or written about any of them individually. Per the same reasoning as the
Krejčíř decline (constitution §7 public-interest test), sitting on a
company's board is not, by itself, grounds to open a dossier. Recommend
leaving these as context entities unless/until a specific, independently
sourced controversy about one of them is found.

| Candidate | `entity_id` | Status |
|---|---|---|
| JUDr. Alexej Bílek | `alexej-bilek` | not recommended |
| Ing. Jaroslav Kurčík | `jaroslav-kurcik` | not recommended |
| Jiří Tvrdík | `jiri-tvrdik` | not recommended |
| Ing. Josef Mráz | `josef-mraz` | not recommended |
| Mgr. Libor Němeček | `libor-nemecek` | not recommended |
| Ing. Martin Kubů | `martin-kubu` | not recommended |
| Ing. Michal Jedlička | `michal-jedlicka` | not recommended |
| Mgr. Pavel Hanus | `pavel-hanus` | not recommended |
| Ing. Petr Cingr | `petr-cingr` | not recommended |
| Ing. Petra Procházková | `petra-prochazkova` | not recommended |
| Ing. Zbyněk Průša | `zbynek-prusa` | not recommended |

## 4. Not eligible for their own dossier (companies, institutions, parties, controversies, events)

Listed for completeness — these are the remaining 43 context entities from
the current 56-entity candidate feed. None of these can become a dossier
"subject" under the current data model; they remain context entities that
back already-authorized persons' claims. If the site ever adds an
institutional/company dossier type, this section is where that discussion
would start — it is **not** proposed here.

Companies: Agrofert, BLAKEY FINANCE LIMITED, BOYNE HOLDING LLC, České
dráhy *(org)*, GMR GAS UA LLC, GMR GAS s.r.o., Hartenberg Holding, Imoba,
Kostelecké uzeniny, Pekárna Zelená louka, RSVP Trust, SCP Bigaud, SynBiol,
Zapper-Club s.r.o.

Public institutions: Evropský parlament, EPPO, Evropská komise, Fakultní
nemocnice Olomouc, Ministerstvo zdravotnictví, NCOZ, Národní rozpočtová
rada, Nejvyšší správní soud, Nemocnice Na Homolce, Nejvyšší kontrolní
úřad, Národní finanční prokuratura (Francie), Policie ČR, Městská část
Praha 3, Státní zastupitelství, Státní zemědělský intervenční fond, SZPI,
Ústavní soud, Vláda ČR, Správa železnic.

Political parties/organizations: Motoristé sobě, Klub motoristů z.s., SPD.

Controversies/events/processes/roles (already narrative threads inside an
authorized subject's dossier, not separate subjects): Čapí hnízdo, Kauza
2024 (fotografie a svícny), Kauza 2025 (smazané příspěvky), Jmenování
ministrem ŽP (2026), Nehoda 2026, Trestní oznámení (2025), Zmocněnec pro
Green Deal.

---

## Process for turning a "pending" row into "authorized"

1. Owner reviews the row above and states the scope explicitly, on the
   record, in conversation — who, which specific topics, sourced to what
   the owner has actually seen (never inferred from "it's public
   interest").
2. Run `scripts/dossier/authorize-entity.mjs` (interactive, human-typed
   scope text) — this is the only thing allowed to write a new entry.
3. A new dated subsection is appended to `AGENTS.md`'s log (never edit an
   existing one).
4. A matching `[[authorizations]]` entry is added to
   `data/authorizations.toml`.
5. This file's row moves from §3 to §1 (or §2, for a decline), and the
   dossier is scaffolded with `npm run scaffold:dossier` only after step 3.
