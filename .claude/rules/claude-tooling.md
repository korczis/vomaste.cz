---
paths:
  - ".claude/**"
  - "data/tooling/**"
  - "scripts/build/build-tooling-catalog.mjs"
---

# Když přidáváš schopnost do `.claude/`

Rozhodnutí a jeho meze:
`docs/adr/claude-native-contributor-operating-environment.md`.
Ověřená fakta o Claude Code: `docs/claude-code/compatibility.md`.

## Pět otázek. Při první „ne" schopnost nevzniká

1. **Řeší to už něco, co existuje?** Rozšiř to, nezakládej druhé.
2. **Je za tím opakovaná práce?** Konkrétně: třikrát vložený stejný
   dlouhý prompt, padesát dokumentů zaplavujících hlavní kontext, nebo
   dvanáctikrokový postup opakovaný lidmi.
3. **Dá se to otestovat?** Metadata, odkazy, podpůrné skripty,
   přítomnost povinných klauzulí — ne text jako takový.
4. **Je to skill, nebo něco jiného?**
   ```
   fakt platný vždy        → CLAUDE.md
   pravidlo pro část stromu → .claude/rules/<téma>.md s `paths`
   postup                   → skill
   specialista v izolaci    → subagent
   uživatelská cesta        → workflow
   ZÁRUKA                   → validátor v scripts/
   ```
   **Pravidlo, které jde vynutit kódem, se nevynucuje promptem.**
5. **Je pro to persona?** Schopnost bez persony je schopnost bez
   uživatele.

## Co musí každá nová schopnost mít

Bez tohohle build spadne — není to doporučení:

- **záznam v `data/tooling/`** (`skill-<name>.json`, `agent-<name>.json`,
  `workflow-<name>.json`) s `personas`, `riskLevel` a `writes`
  (brány G2/G8/G9/G10);
- u **subagenta** vyjmenované `tools` ve frontmatteru a `name` shodné
  s názvem souboru (brána G11). Vynechané `tools` znamená v Claude Code
  dědění **všech** nástrojů — „read-only" agent by uměl Write a Edit;
- `description`, které Claude přečte a pozná z něj záměr uživatele.
  Popis je stropovaný na 1 536 znaků včetně `when_to_use`.

Po přidání: `npm run build:tooling-catalog` a
`node --test scripts/build/build-tooling-catalog.test.mjs`.

## Struktura SKILL.md

Název příkazu se bere z **názvu adresáře**, ne z pole `name`. Tělo se
načte teprve při použití, takže dlouhý referenční text nic nestojí,
dokud není potřeba.

Povinné oddíly, aby skill nebyl jen název:

```
Purpose · When to use · When NOT to use · Arguments · Preconditions
Steps · Human checkpoints · Failure modes · Output · Validation
Examples · Related skills
```

Každý uživatelsky viditelný skill má aspoň tři příklady: základní,
realistický a **selhání**. A vedle volání i **přirozenou formulaci** —
uživatel nemá memorovat názvy.

## Rizikové schopnosti

Skill, který commituje, publikuje nebo nasazuje, dostane
`disable-model-invocation: true`. Claude ho nesmí spustit mimoděk; jen
člověk přes `/jméno`.

## Zákazy

- Skill, který je jen název. Dokumentovaná schopnost bez implementace.
  Hook bez testu. Agent bez konkrétního použití.
- Tvrzení „Claude umí X", když to permission nedovolí, nástroj chybí
  nebo workflow neexistuje (konstituce §8).
- Druhý registr schopností. Katalog je jeden a je obousměrně hlídaný.
- Skill, který uděluje autorizaci. Žádný ji neudělí — viz
  [`authorization.md`](authorization.md).
