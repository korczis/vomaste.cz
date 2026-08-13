---
name: a11y-review
description: Zkontroluje přístupnost stránky nebo komponenty — sémantiku, hierarchii nadpisů, ovladatelnost klávesnicí, viditelný focus, ARIA, kontrast, redukovaný pohyb a chování bez JavaScriptu. Použij ho po přidání interaktivního prvku, nové šablony nebo komponenty, nebo když někdo řekne „je to použitelné pro odečítač", „jde to bez myši".
argument-hint: "[cesta k šabloně nebo komponentě | changed]"
---

Review přístupnosti. **Read-only.**

Přístupnost tady není doplněk: web je veřejná evidence a čtenář, který
se k obsahu nedostane, se k němu nedostane celý.

## Kdy ho použít

- Po přidání interaktivního prvku (dropdown, drawer, filtr, kopírovací
  tlačítko, graf).
- Po vzniku nové šablony.
- Před merge změny UI.

## Kdy ho NEPOUŽÍT

- **Na čistě datovou změnu.** Nová položka v seznamu přístupnost
  nemění.
- **Místo `/ui-review`.** Ten kontroluje konvence a komponenty; tenhle
  ovladatelnost a vnímatelnost. Překrývají se málo.

## Deset kontrol

| # | Kontrola | Co hledáš |
|---|---|---|
| 1 | **Sémantika** | `<nav>`, `<main>`, `<article>`, `<table>` — ne `<div>` se stylem |
| 2 | **Hierarchie nadpisů** | jeden `h1`, žádné přeskočené úrovně |
| 3 | **Popisky** | každý ovládací prvek má text nebo `aria-label`; ikona bez popisku je hádanka |
| 4 | **Klávesnice** | dostaneš se tabem všude? Dá se to obsloužit a zavřít bez myši? |
| 5 | **Focus** | je vidět? Globální `:focus-visible` je v `input.css` — nepřebíjej ho |
| 6 | **Pořadí focusu** | odpovídá vizuálnímu pořadí? Nezůstane focus uvnitř zavřeného panelu? |
| 7 | **ARIA** | `aria-expanded`, `aria-controls`, `role` — a hlavně: **správně**. Špatná ARIA je horší než žádná |
| 8 | **Kontrast** | tokeny z palety; vlastní barva se musí ověřit |
| 9 | **Pohyb** | respektuje se `prefers-reduced-motion`? |
| 10 | **Bez JavaScriptu** | zobrazí se hlavní obsah? Filtr smí přestat filtrovat, obsah nesmí zmizet |

Kontrola 10 je pro tenhle web zásadní. Registr entit je toho příkladem:
bez JS zůstává viditelný plný plochý seznam, takže stránka funguje
i tak. Interaktivita je zlepšení, ne podmínka přístupu k obsahu.

## Zvláštní pozor

- **Zpětná vazba u kopírování.** „Zkopírováno" musí být oznámeno i
  odečítači (`aria-live`), ne jen změnou barvy.
- **Drawer a dropdown.** Zavření klávesou Escape, vrácení focusu na
  spouštěč, `aria-expanded` na spouštěči.
- **Graf vztahů.** Vizuální komponenta potřebuje textovou alternativu —
  ne popis obrázku, ale skutečná data v dostupné podobě.
- **Tabulky.** Záhlaví jako `<th>` se `scope`, ne jako tučný řádek.
- **Barva nikdy sama.** Stav, rozdíl ani riziko se nesmí sdělovat jen
  barvou — vždy k tomu text nebo ikona s popiskem.

## Bez prohlížeče

Statická kontrola šablony pozná sémantiku, popisky, ARIA a strukturu.
**Nepozná** pořadí focusu, skutečný kontrast ani chování odečítače.
Když se nedá otestovat, řekni to:

```
OVĚŘENO STATICKY: sémantika, popisky, ARIA atributy
NEOVĚŘENO:        pořadí focusu, kontrast, chování odečítače
```

## Výstup

```
ROZSAH:      <co bylo projito>
SÉMANTIKA:   <OK | nálezy>
NADPISY:     <hierarchie>
KLÁVESNICE:  <ověřeno jak | neověřeno>
FOCUS:       <viditelný | přebitý>
ARIA:        <OK | chybné | chybějící>
KONTRAST:    <z palety | vlastní barva — ověřeno?>
BEZ JS:      <obsah dostupný | ztrácí se <co>>
NÁLEZY:      [BLOCKER|HIGH|MEDIUM|LOW] <…>
NEOVĚŘENO:   <co vyžaduje prohlížeč nebo odečítač>
```

**BLOCKER**: obsah nedostupný bez myši, obsah zmizí bez JS, ovládací
prvek bez popisku.

## Příklady

**Základní.** Nový odkaz v patičce → sémantika OK, popisek OK, bez
nálezu.

**Realistický.** Kopírovací tlačítko u příkazu. Nález [HIGH]: po
kliknutí se mění jen text v tlačítku, což odečítač neoznámí. Oprava:
`aria-live="polite"` na oblasti se stavem. Nález [MEDIUM]: tlačítko
má jen ikonu — potřebuje `aria-label` včetně toho, co kopíruje.

**Selhání.** Filtr, který bez JS skryje celý seznam. [BLOCKER]:
progresivní vylepšení znamená, že bez JS se filtruje méně, ne že se
nezobrazí nic.

## Související

`/ui-review` (konvence a komponenty), `/seo-review` (metadata),
`.claude/rules/ui.md` (doktrína F1–F7).
