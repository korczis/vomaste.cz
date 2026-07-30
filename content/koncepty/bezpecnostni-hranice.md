+++
title = "Bezpečnostní hranice"
description = "Všechny kanály projektu jsou veřejné a trvalé. Projekt nemá důvěrný intake, negarantuje anonymitu a nebude předstírat opak."
template = "concept.html"
weight = 340

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
accent = true
tile_title = "Bezpečnostní hranice"
tile_summary = "Všechny kanály projektu (GitHub issues, pull requesty, Git historie) jsou <strong class=\"text-white/80\">veřejné a trvalé</strong> — Git nezapomíná. Nevkládejte sem důvěrné dokumenty, identitu zdrojů ani nepublikovaný citlivý materiál. Projekt nemá zavedený důvěrný intake kanál, negarantuje anonymitu a nebude předstírat opak."
+++

Tohle je nejdůležitější stránka na webu pro každého, kdo chce něco poslat.
Čtěte ji dřív, než napíšete.

## Všechno je veřejné a trvalé

Issues, pull requesty, commity, Git historie — veřejné v okamžiku vzniku a
trvalé i po smazání. Smazaný commit přežívá ve forcích, cache a zrcadlech;
smazaná issue byla v e-mailových notifikacích. Neexistuje tady „dočasně" ani
„pak to smažu".

## Co sem nepatří

Důvěrné dokumenty. Cokoli, z čeho jde odvodit identitu zdroje. Nepublikovaný
citlivý materiál. Osobní kontakty, soukromá čísla, doklady. Nic z toho
nezpracujeme šetrněji, protože na to nemáme kanál ani infrastrukturu.

## Co projekt nemá

Nemá bezpečný ani šifrovaný intake. Negarantuje anonymitu. Nemá příspěvkové
CLI ani federaci. Neříká „anonymní", „nevystopovatelné" ani „100 % bezpečné" —
protože to nemůže splnit, a předstírat bezpečný kanál je horší než ho nemít:
někdo by mu uvěřil.

## Co dělat místo toho

Materiál, který je **už veřejně publikovaný**, můžete navrhnout jako zdroj
přes [veřejnou issue](https://github.com/korczis/vomaste.cz/issues/new).
Zranitelnosti webu se hlásí podle
[SECURITY.md](https://github.com/korczis/vomaste.cz/blob/master/SECURITY.md).
Citlivý nepublikovaný materiál patří redakci se skutečně zabezpečeným
kanálem — ne sem.

## Proč tohle není jen právní klauzule

Většina webů má někde větu „neposílejte nám citlivé údaje" a přesto má
formulář. Tady žádný formulář **není**, a to je ta podstatná část: kanál,
který neexistuje, se nedá omylem použít. Rozdíl mezi „prosím neposílejte"
a „nemáme kam" je celý rozdíl mezi slibem a hranicí.

Druhý důvod je technický. Git nezapomíná: co se jednou objeví v commitu,
přežívá ve forcích, cache a zrcadlech i po smazání. Chyba v úsudku „pošlu
to a případně se to smaže" je proto **nevratná** — viz
[verzováno v Gitu](@/koncepty/verzovano-v-gitu.md).

## Co o vás web ví

Sám o sobě nic: je to statické HTML bez analytiky, bez cookies, bez
serverové části, která by cokoli logovala. I
[SQL konzole](@/data/_index.md) běží celá ve vašem prohlížeči — dotaz se
nikam neposílá.

To ale neznamená anonymitu. Stránky servíruje GitHub Pages a část
prostředků (Chart.js, WASM pro konzoli) se stahuje z jsDelivr; oba vidí
vaši IP adresu a hlavičky prohlížeče, stejně jako u kteréhokoli jiného
webu. Projekt to nijak neovlivňuje a nebude předstírat opak. Kdo potřebuje
skutečnou anonymitu, ať použije nástroje, které ji poskytují — tenhle web
mezi ně nepatří.
