+++
title = "Fakt odděleně od názoru"
description = "Citace jsou označené jako citace, komentáře jako názor, sporné případy jako neuzavřené. Vrstvy se nemíchají a nic se mezi nimi nepovyšuje mimoděk."
template = "concept.html"
weight = 220

[extra]
lang = "cs"
seo_type = "WebPage"
group = "metodika"
icon = "M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 8 0zM19 7l-3 7a4 4 0 0 0 8 0z"
tile_title = "Fakt odděleně od názoru"
tile_summary = "Citace jsou označené jako citace, komentáře jako názor. Sporné a neuzavřené případy zůstávají označené jako neuzavřené."
+++

Doložený fakt, přímá citace, sporné tvrzení a autorský komentář jsou čtyři
různé věci. Na tomhle webu mají čtyři různé, viditelné stavy a nikdy nesplývají
do generického „faktu".

## Kde se to obvykle rozbíjí

Ne v tabulce, ale ve větách okolo. Stačí napsat „přiznal", kde zdroj říká
„uvedl". Zkrátit citaci tak, aby zněla ostřeji. Poskládat doložené fakty do
řady, ze které plyne závěr, který žádný zdroj netvrdí. Nic z toho neporuší
formální pravidlo o zdrojování — a stejně to je manipulace.

## Procesní versus meritorní

Zvláštní podkategorií je zaměňování procesního výsledku za rozhodnutí ve věci.
Odložení pro promlčení znamená, že stíhání není právně možné; neznamená
potvrzení ani vyvrácení obvinění. Web tohle rozlišení uvádí **pokaždé**, ne
jednou v poznámce — detail v [registru kauz](@/koncepty/registr-kauz.md).

## Co z toho má čtenář

Možnost nesouhlasit s autorem a přesto použít data. Kdo chce jen fakta,
přeskočí názory. Kdo chce ověřit sporné, jde na
[zdroje](@/koncepty/registr-zdroju.md) obou stran. To je celý smysl toho
oddělení: čtenář nemusí věřit autorovi.

## Čtyři věty, čtyři různé stavy

Rozdíl je snazší vidět na příkladech než na definici. Vezměme čtyři věty,
které v běžném článku splynou do jednoho odstavce:

| věta | stav |
|---|---|
| „Dvě nezávislé redakce popsaly totéž jednání." | [ověřeno více zdroji](@/koncepty/stav-overeno-vice-zdroji.md) |
| „Napsala to jedna redakce, další to nepřevzala." | [1 zdroj](@/koncepty/stav-jeden-zdroj.md) |
| „Dotyčný řekl, že se to nestalo." | [citace](@/koncepty/stav-citace.md) |
| „Jedna strana tvrdí A, druhá B, uzavřeno to není." | [sporné](@/koncepty/stav-sporne.md) |

Poslední kategorie — komentář, který z toho vyvozuje závěr — je
[názor](@/koncepty/stav-nazor.md) a v registru tvrzení nepodpírá nic.

## Kde to selže i při dodržení pravidel

Formální zdrojování je nutná, ne dostatečná podmínka. Text se dá zkreslit,
aniž by porušil jediné pravidlo:

- **slovem** — „přiznal" tam, kde zdroj říká „uvedl";
- **zkrácením** — citace useknutá před podmínkou, která ji oslabuje;
- **řazením** — tři doložené fakty poskládané tak, že z nich plyne závěr,
  který netvrdí žádný z nich;
- **objemem** — deset odstavců k jedné straně a dva ke druhé.

Nic z toho nezachytí validátor. Zachytí to jen čtení proti zdroji — proto
je u každého tvrzení přímý odkaz a proto je celý web
[ve veřejné historii](@/koncepty/verzovano-v-gitu.md), kde je vidět, kdy se
formulace změnila.
