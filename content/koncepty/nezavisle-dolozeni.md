+++
title = "Nezávislé doložení"
description = "Rozdíl mezi „dvě redakce to otiskly“ a „dva nezávislé zdroje to potvrzují“. Převzatá agenturní zpráva v pěti médiích je jeden hlas, ne pět — a vynucuje to build, ne dobrá vůle."
template = "concept.html"
weight = 160

[extra]
lang = "cs"
seo_type = "WebPage"
group = "evidence"
tile_title = "Dvě redakce, nebo dvakrát táž zpráva?"
tile_summary = "Pět převzetí jedné agenturní zprávy je jedno doložení. Nezávislost se počítá přes zdrojové rodiny a vydavatele, ne přes počet odkazů."
bullets = [
  "Zdrojová rodina: převzatá agenturní zpráva v pěti redakcích = <strong>jeden</strong> nezávislý hlas.",
  "Týž vydavatel nikdy nepotvrzuje sám sebe — porovnává se název média i registrovaná doména.",
  "Pravidlo vynucuje build: tvrzení, které slib odznaku nesplní, shodí validaci.",
]
+++

Věta „psaly o tom tři weby" a věta „potvrdily to tři nezávislé redakce"
vypadají skoro stejně a znamenají něco úplně jiného. Když tři weby přetisknou
tutéž agenturní zprávu, je to **jedna** informace na třech adresách — a
tvrzení, které se o ně opře, je pořád doložené jedním hlasem.

Tenhle rozdíl je hlavní věc, kterou tenhle web dělá jinak než běžný přehled
odkazů. Odznak
[ověřeno více zdroji](@/koncepty/stav-overeno-vice-zdroji.md) na téhle stránce
neslibuje počet URL, ale počet nezávislých hlasů.

## Zdrojová rodina

Každý [zdroj](@/koncepty/registr-zdroju.md) může nést **rodinu** — značku
původu materiálu. Dva zdroje se stejnou rodinou se počítají jako jedno
doložení, i když mají různá ID, různé domény a různé titulky. Typický případ
je zpráva tiskové agentury, kterou ve stejný den vydá pět redakcí: pět
záznamů, jeden hlas.

Rodina není totéž co vydavatel: dva různí vydavatelé mohou sdílet rodinu
(oba přetiskli tutéž zprávu). Proto je rodina samostatné pole, které určuje
člověk podle původu materiálu — ne funkce názvu média. Obráceně to ale
neplatí: dva vlastní texty téhož vydavatele se pro doložení stejně počítají
jako jeden hlas (viz níže), i když jsou na sobě redakčně nezávislé. Rodina
tedy nezávislost může jen odebrat, nikdy přidat.

## Jedna redakce nepotvrzuje sama sebe

Rodina sama nestačí. Kdyby se porovnávala jen ona, stačilo by, aby měl jeden
článek rodinu vyplněnou a druhý ne, a dva texty **téhož** vydavatele by prošly
jako dva nezávislé hlasy. Nezávislé doložení je proto definované jako
**dvojice** zdrojů, které se liší rodinou **a zároveň** vydavatelem — a
vydavatel se porovnává jak podle názvu média, tak podle registrované domény,
aby redakční subdomény téhož titulu nesplynuly ve dvě různá média.

Porovnává se párově, ne řetězově. Kdyby se zdroje slévaly tranzitivně přes
sdílenou rodinu, splynula by vlastní reportáž jednoho média s agenturní
zprávou jen proto, že tentýž web jinde agenturu přetiskuje — a skutečná
korroborace by zmizela.

## Vynucuje to build, ne dobrá vůle

Pravidlo není redakční předsevzetí. Je to brána v `npm run data:validate`,
kterou musí projít každý build (sémantická pravidla S1, S2, S4 a S10):

| pravidlo | co shodí build |
|---|---|
| tvrzení `CORROBORATED` (S2) | zdroje nedávají ani jednu nezávislou dvojici |
| tvrzení `1 ZDROJ` (S1) | mezi citovanými zdroji nezávislá dvojice **je**, tedy je doloženo víc, než přiznává |
| hrana v grafu (S4) | vztah označený jako potvrzený nemá nezávislé doložení |
| týž vydavatel (S10) | dva zdroje se shodným vydavatelem nebo registrovanou doménou se nikdy nepočítají jako dva hlasy |

Odznak si tedy nelze „dát". Buď v datech existují dva nezávislí vydavatelé,
nebo tvrzení nese slabší stav.

## Revize 5. srpna 2026: 119 tvrzení dolů

Standard je k něčemu jen tehdy, když se podle něj opravuje i to, co už bylo
publikované. V srpnu 2026 se ukázalo, že velká část zdrojů nemá rodinu
vyplněnou vůbec — a validátor tak nemohl odlišit druhého vydavatele od
druhého otisku téže agenturní zprávy.

Dvě revizní kola to napravila: zdrojům se doplnil skutečný původ (podle
strojových metadat, podpisu autora a patičky „Zdroj:", nikdy podle zmínky
v textu) a **119 tvrzení kleslo z `CORROBORATED` na `1 ZDROJ`**. Celkový počet
korroborovaných tvrzení na webu spadl z 300 na 181. Opravilo se i 27 míst
v komentářích ke zdrojům, která nezávislost výslovně tvrdila — včetně věty
o „třech vydavatelsky nezávislých redakcích" pro to, co byla jedna agenturní
zpráva.

Žádný zdroj se přitom nesmazal. Dokládá dál totéž co předtím — jen už
nepotvrzuje sám sebe.

Od té doby počet korroborovaných tvrzení zase roste, protože se dohledávají
skutečně nezávislé druhé zdroje a
[primární dokumenty](@/koncepty/primarni-dokumenty.md). Aktuální stav je
vidět v číslech na [úvodní stránce](@/_index.md) a ve
[strojově čitelných datech](@/koncepty/strojove-citelna-data.md) — tenhle
text ho záměrně neopakuje, aby nemohl zastarat.

## Co to není

Není to hodnocení pravdivosti. Dva nezávislí vydavatelé se můžou shodnout
a mýlit; jeden zdroj může mít pravdu. Stav popisuje **sílu doložení**, ne
výsledek sporu — a proto se z něj nikdy neodvozuje vina ani nevina.

Není to ani měřítko kvality média. Rodina a vydavatel říkají, odkud
informace pochází, ne jak je dobrá. Zda je citovaný zdroj důvěryhodný a zda
text tvrzení odpovídá tomu, co v článku doopravdy stojí, žádný validátor
nepozná — proto je u každého tvrzení přímý odkaz na originál a proto platí
[nevěřte autorovi](@/koncepty/co-to-je.md).

## Když nezávislý druhý zdroj neexistuje

Nic se nedomýšlí. Tvrzení zůstane s [1 zdrojem](@/koncepty/stav-jeden-zdroj.md)
a to, co z něj nejde uzavřít, se vede jako otevřená otázka v
[registru mezer](@/koncepty/registr-mezer.md). „Hledali jsme druhý zdroj a
neexistuje" je zjištění, ne selhání — a zapisuje se stejně jako každé jiné.
