# ADR: přechod na Zolu 0.23.3 a Teru 2

**Status**: přijato a nasazeno. **Datum**: 2026-08-13.
**Commity**: `2076be3d` (šablony), `b02f59cc` (obsah), `8fdc1fbe`, `77d93f71`,
`e3a10470` (regrese), `ed1ce049`, `4d611125` (lekce A603).

Tenhle záznam existuje proto, aby historické texty v repozitáři měly kam
ukázat. Bez něj potřebuje každý starší dokument vlastní vysvětlivku, proč
popisuje mechanismus, který už neexistuje.

## Kontext

Web běžel na Zole 0.22.1. Zola 0.23 je podle vlastního changelogu
„pravděpodobně nejvíc breaking verze, která kdy nastane": šablonovací
engine přešel z Tery 1 na Teru 2 a **shortcodes byly odstraněny úplně**.

Volba proto nebyla mezi starým a novým řešením, ale mezi zůstat
na 0.22 a migrovat. Rozsah v době rozhodnutí:

```
57 šablon, z toho 44 s {% import %}
42 maker v 11 jmenných prostorech, ~300 volání
5 shortcodů, 198 volání v markdownu
3 dvojice otevírací/uzavírací makro (53 volání)
```

## Rozhodnutí

Migrovat na 0.23.3. Makra se stala komponentami, shortcodes komponentami
s tělem, jmenné prostory se promítly do prefixů (`ui_`, `table_`,
`views_`), protože komponenty sdílejí jeden plochý globální prostor.

Sémantika webu se nemění. Migrace je překlad, ne redesign.

## Zvažované alternativy

**Zůstat na 0.22.1.** Zamítnuto: verze přestane dostávat opravy a rozdíl
proti upstreamu poroste. Migrace je jednorázová cena, která s odkladem
roste — každá nová šablona psaná v Teře 1 ji zvětšuje.

**Migrovat postupně, šablonu po šabloně.** Nejde. `{% import %}` v Teře 2
neexistuje a komponenty jsou globální; mezistav, kde část souborů importuje
makra a část volá komponenty, se nepřeloží. Přechod je atomický z povahy
věci.

**Přepsat při té příležitosti i markup.** Zamítnuto vědomě. Migrace, u které
se zároveň mění výstup, se nedá ověřit — nelze odlišit záměrnou změnu od
regrese. Redesign patří za migraci, ne do ní.

## Důsledky

Co migrace umožnila, aniž by to bylo cílem:

* Tři dvojice otevírací/uzavírací makro se složily do jedné komponenty
  s tělem. `macros/table.html` sám dokumentoval, že ta dvojice existuje jen
  proto, že Tera 1 neuměla call-bloky s tělem — Tera 2 je umí.
* `| filter(attribute=…)` a `| concat(with=…)` byly zrušeny; nahradily je
  list comprehensions, které jsou kratší i čitelnější.
* Záporné číslo a pole jdou použít jako výchozí hodnotu parametru, takže
  padly dva řetězcové sentinely zavedené kvůli limitům Tery 1.

Co migrace stojí:

* Komponenty **nevidí globální kontext** — žádný `config`, `page`, `section`.
  Co komponenta potřebuje, musí dostat parametrem.
* Typ parametru se odvozuje z výchozí hodnoty, takže sentinel `""` nejde
  použít pro parametr, do kterého chodí pole nebo číslo.
* Zachycení výstupu komponenty do proměnné HTML-escapuje a Tera nemá filtr,
  který by to vrátilo zpět.
* Obsah se pouští přes Teru **před** parsováním markdownu, takže doslovné
  příklady šablonového jazyka musí být v bloku `raw`.
* Verze je vynucená napevno: `justfile` kontroluje 0.23, oba workflow
  pinují `zola@0.23.3`. Zola 0.22.1 tenhle repozitář nepřeloží.

## Co se pokazilo, a proč to sem patří

Migrace prošla celou pipeline a přesto nasadila dvě tiché ztráty
obsahu. Obojí je zapsané, protože ten vzorec je poučnější než samotná
migrace.

**Callout bez těla, 98 stránek.** V Teře 2 je `body` vyhrazené pro obsah
těla, takže se parametr přejmenoval na `text`. Volající se opravil,
vykreslení uvnitř komponenty ne. Ukázalo se, že Tera to **kontroluje** —
`{{ nedefinovana }}` skončí chybou — ale na tom řádku stálo
`{{ body | safe }}` a filtr `safe` chybu spolkl.

**Badge `-1`, 2728 stránek.** Sentinel `count=""` se změnil na
`count: integer = -1`, ale tři podmínky dál porovnávaly `count != ""`.
Celé číslo se prázdnému řetězci nikdy nerovná, takže se badge vykreslil
vždycky — s doslovnou hodnotou `-1`.

Společný tvar: **změnila se deklarace a nezměnilo se to, co ji čte.**
Build zůstal zelený v obou případech, protože prázdný `<div>` i řetězec
`-1` jsou platné HTML. Ani jeden z nich nenašla brána; našly je audity
po nasazení.

Z toho plyne požadavek, který tenhle repozitář zatím nemá: žádný krok
pipeline netvrdí, že se komponenta vykreslila **a něco vykreslila**.
Detekce sentinelů (`-1`, `undefined`, `null`, `NaN`) a kontrola „`| safe`
na holém identifikátoru" jsou obojí statické a levné. Nula je přitom
legitimní hodnota — 376 stránek vykresluje viditelný `0` badge záměrně.

## Práh pro revizi

Tenhle záznam se reviduje, až Zola vydá další verzi, která mění
šablonovací engine nebo odstraňuje konstrukci, na které web stojí.
Aktuální pin je `zola@0.23.3` na třech místech (`justfile:27`,
`deploy.yml`, `archive-refresh.yml`); rozejdou-li se, platí workflow.

Podrobnosti pro autory obsahu i šablon jsou v lekci
[A603](../../content/akademie/a603-zola.md), která popisuje pět pastí
šablonovacího jazyka včetně obou výše.
