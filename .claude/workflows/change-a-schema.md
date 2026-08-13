---
title: Změna datového kontraktu
persona: maintainer
goal: Provést změnu schématu tak, aby po ní nezůstalo poloviční pole.
skills: data-model schema-change test build docs-sync adr commit
agents: repository-explorer docs-auditor
---

## Pro koho

Údržbář. **Nejrizikovější běžná změna** v tomhle repozitáři.

## Předpoklady

Jasno v tom, **kdo bude nové pole číst**. Bez toho se nezačíná —
nejlevnější pole je to, které nevzniklo.

## Kroky

1. **`/data-model <typ>`** — co dnes platí, podle schématu, ne podle
   dokumentace.
2. **`/schema-change`** — projdi **všech třináct** míst fan-outu.
   U každého buď „hotovo", nebo „netýká se, protože".
3. **Migrace**, když je pole povinné. Bez ní build spadne na každém
   existujícím záznamu — což je správně, ale musí to být plán, ne
   překvapení.
4. **`npm run data:validate`**, **`/test`**, golden snapshot.
5. **`/docs-sync`** — datový kontrakt, příručka, lekce úrovně A5,
   příklady. Deleguj `docs-auditor`, když je změna větší.
6. **`/adr`**, když je rozhodnutí sporné — nový kanonický formát,
   změna významu existujícího pole, druhý zdroj pravdy.
7. **`npm run build`**, **`/commit`**.

## Lidské checkpointy

- **Před krokem 2**: dá se to vyjádřit existujícím polem? Odvodit
  z toho, co už tam je? Hloubka v grafu se **počítá**, ne ukládá —
  a to je vzor, ne výjimka.
- **Před krokem 3**: jakou hodnotu dostanou historické záznamy, a je to
  poctivé? Doplnit povinné pole odhadem je horší než ho nechat
  volitelné.
- **Krok 6**: sporné rozhodnutí bez ADR se za rok nikdo nedozví, proč
  se udělalo.

## Co z toho vyleze

Pole, které existuje ve schématu, v datech, ve view modelu a u
konzumenta — a nikde jinde nechybí.

## Jak poznat, že je hotovo

`npm run build` je exit 0 **a** fan-out checklist nemá prázdný řádek.

## Když se to pokazí

`additionalProperties: false` odmítá data → to je brána, ne překážka.
Schéma nezná pole, které jsi přidal do dat.

Šablona čte pole, které schéma nezná → postupoval jsi shora dolů.
Vrať se ke schématu.
