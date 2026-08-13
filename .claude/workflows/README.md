# Workflow — uživatelské cesty

Workflow je **cesta**, ne postup. Postup je skill; workflow skládá
skilly, agenty a lidská rozhodnutí do sledu, který dává smysl někomu
konkrétnímu.

Tenhle soubor se **nenačítá** jako pravidlo ani jako schopnost — je to
dokumentace adresáře. Katalog workflow je generovaný
(`docs/TOOLING.md`, `/dokumentace/prikazy/`).

## Kdy vzniká workflow

Když lidé opakují víckrokový sled, ve kterém se dá zabloudit, a žádný
jednotlivý skill ho nepokrývá celý. Když je to jeden postup, je to
skill. Když je to fakt, je to pravidlo.

## Kontrakt

Frontmatter:

```yaml
---
title:   krátký název
persona: hlavní persona (viz .claude/rules/personas.md)
goal:    čeho se dosáhne, jednou větou
skills:  skilly, které cesta používá
agents:  agenti, kterým deleguje (nebo vynech)
---
```

Tělo:

```
Pro koho · Předpoklady · Kroky · Lidské checkpointy ·
Co z toho vyleze · Jak poznat, že je hotovo · Když se to pokazí
```

**Lidský checkpoint je povinná část**, ne ozdoba. Cesta bez něj tvrdí,
že celý sled jde automatizovat — a u publikace, rozsahu pokrytí,
sporné nezávislosti a mergování to není pravda.

## Brány

- Workflow bez záznamu v `data/tooling/` shodí build (G9), a stejně
  tak mrtvý záznam.
- Jméno se nesmí opakovat mezi skillem, agentem a workflow (CT7) —
  proto se cesty jmenují `verify-a-claim`, ne `review-claim`.
- Odkaz na neexistující skill nebo soubor shodí
  `npm run validate:claude-tooling`.
