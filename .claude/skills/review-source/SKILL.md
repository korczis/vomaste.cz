---
name: review-source
description: Zkontroluje existující SRC záznam v dossieru — metadata, živost odkazu, zdrojovou rodinu, redakční poznámku, obousměrné vazby na tvrzení a soulad s tím, co zdroj po otevření skutečně říká. Použij ho při revizi dossieru, po nahlášení mrtvého odkazu, nebo když se má ověřit, že zapsaný zdroj pořád platí.
argument-hint: "<SRC-## [slug dossieru]>"
---

Review zapsaného zdroje. **Read-only.**

Rozdíl proti `/verify-source`: ten prověřuje zdroj, který ještě není
v dossieru. Tenhle kontroluje **záznam** — jestli odpovídá realitě,
schématu a tomu, k čemu je připojený.

## Kdy ho použít

- Periodická revize dossieru.
- Někdo hlásí mrtvý nebo změněný odkaz.
- Po redakční opravě u vydavatele.
- Když se přidává tvrzení k už existujícímu zdroji.

## Kdy ho NEPOUŽÍT

- **Na zdroj, který v dossieru není.** To je `/verify-source`.
- **K rozhodnutí o nezávislosti.** To je `/source-family`.
- **K opravě.** Nález se popíše; opravu dělá člověk.

## Co načíst

```bash
cat data/dossiers/<slug>/sources/src-NN.json
```

plus **samotný zdroj** (otevřít znovu — text se mění) a všechna
tvrzení, která se na něj odkazují.

## Devět kontrol

| # | Kontrola | Co hledáš |
|---|---|---|
| 1 | **Odkaz žije** | 200, přesměrování jinam, 404, paywall, který dřív nebyl |
| 2 | **Text se nezměnil** | doplněná oprava redakce, změněný titulek, stažený odstavec |
| 3 | **Metadata sedí** | `outlet`, `published`, `retrieved`, autor — proti stránce, ne proti paměti |
| 4 | **Typ** | `sourceType` odpovídá tomu, co to je (zpravodajství × komentář × registr) |
| 5 | **Zdrojová rodina** | je vyplněná? Odpovídá **původu**, ne vydavateli? |
| 6 | **Redakční poznámka** | povinná, ≥ 150 znaků (T7): co dokládá, nezávislost, meze |
| 7 | **Obousměrnost** | `claims` v záznamu × `sources` v tvrzeních — souhlasí v obou směrech? (R8) |
| 8 | **Podpora** | dokládá zdroj SKUTEČNĚ všechna tvrzení, u kterých je uvedený? |
| 9 | **Lokální dokument** | pokud je uvedený, existuje soubor pod `static/` a prošel individuální revizí? |

Kontrola 8 se přeskakuje nejčastěji: zdroj se přidá k tvrzení, protože
je „o tom samém", ale konkrétní fakt v něm není.

## Zvláštní případ: zdroj přestal být dostupný

Mrtvý odkaz **není** důvod zdroj smazat. Tvrzení by tím ztratilo
doložení, aniž by se cokoli zjistilo. Správný postup:

1. zaznamenat, že odkaz nefunguje, a od kdy;
2. hledat archivní kopii nebo primární registr;
3. když ani to ne — je to nález pro `/correction`, ne tichá úprava.

## Výstup

```
ZDROJ:       <SRC-##> — <outlet>, <datum>
DOSTUPNOST:  živý | přesměrován na <kam> | 404 | paywall
ZMĚNA TEXTU: žádná | <co se změnilo>
METADATA:    OK | <co nesedí>
RODINA:      <hodnota> — <sedí | návrh změny + proč>
POZNÁMKA:    OK | chybí | příliš krátká (<n> znaků)
VAZBY:       podporuje <CLM…>  |  nesouhlasí: <detail>
PODPORA:     <u kterých tvrzení skutečně dokládá, u kterých ne>
NÁLEZY:      [BLOCKER|HIGH|MEDIUM|LOW|NOTE] <…>
DALŠÍ KROK:  <konkrétně>
```

## Co skill NEUDĚLÁ

- Nezmění záznam ani nesmaže zdroj.
- Nestáhne kopii dokumentu (má vlastní doktrínu — Zone A/B).
- Neposoudí nezávislost vůči ostatním zdrojům.

## Příklady

**Základní.** Zdroj je živý, metadata sedí, poznámka 240 znaků, vazby
obousměrné → bez nálezu, výstup vyjmenuje, co bylo prověřeno.

**Realistický.** Odkaz vede na 301 do rubriky „Komentáře". Nález
[HIGH]: `sourceType` je zpravodajství, ale text je komentář — tvrzení,
která se o něj opírají, mají mít stav `NÁZOR` s atribucí, ne fakt.

**Selhání.** Zdroj je uvedený u tří tvrzení a po otevření dokládá dvě.
[BLOCKER] u toho třetího: nedoložené tvrzení o člověku. Oprava není
odebrat zdroj — je najít doklad, nebo tvrzení zúžit či převést na
mezeru.

## Související

`/verify-source` (zdroj mimo dossier), `/source-family` (nezávislost),
`/review-claim` (tvrzení), `/correction` (oprava),
`.claude/rules/evidence.md`.
