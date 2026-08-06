+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Novinky.cz"
template = "source-catalog-entry.html"
weight = 240
description = "Novinky.cz — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/novinky-cz"
catalog_entry = "novinky-cz"
view_model = "generated/source-catalog.json"
+++

Zpravodajský server s vlastní redakcí, který zároveň slouží jako výkladní skříň dvou dalších zdrojů: tištěného deníku **Právo** a agenturního servisu **ČTK**. Patička to přiznává rovnou — copyright na hlavní stránce uvádí vedle sebe Borgis a.s., Seznam.cz a.s. a ČTK.

Pro evidenci z toho plyne jediné pravidlo: **značka není původ**. Vlastní zpravodajství Novinek je samostatný hlas, přetisk Práva a agenturní zpráva nikoli — a rozdíl je vidět jen v podpisu konkrétního článku.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- U textu s podepsaným redaktorem: že jde o vlastní zpravodajství této redakce, a tedy o samostatný hlas vedle jiných vydavatelů.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není u konkrétního článku ověřen kredit. Část textů přebírá ČTK, část přetiskuje deník Právo a část reprodukuje zjištění Seznam Zpráv.
- Nezávislost na Seznam Zprávách. Obě značky provozuje Seznam.cz — pro doložení to není druhý vydavatel.
- Nezávislé potvrzení dvěma vlastními texty. Dva články Novinky.cz jsou jeden vydavatel, tedy jeden hlas (pravidlo S10).

## Pasti {#pasti}

### V podpisu stojí instituce vedle lidí

JSON-LD pole `author` nese jak jmenovité redaktory (`Karolina Brodníčková` u `igor-cerveny/SRC-24`), tak institucionální „autory" s vlastním rozcestníkem: `Novinky` (`/autor/novinky-302`), `Právo` (`/autor/pravo-303`, tedy přetisk tištěného deníku vydavatele Borgis — `james-quick/SRC-17`) a `ČTK` (`/autor/ctk-304`, u `andrej-babis/SRC-61` uvedená hned vedle „autora" `Novinky`). Podpis tedy sám o sobě neříká, že text je vlastní práce Novinek — říká jen, ke které značce je připsán.

### Přebírka bývá přiznaná až v těle textu

U `zuzana-mrazova/SRC-28` je v podpisu jmenovaný redaktor, ale článek uvnitř výslovně uvádí, že reprodukuje „zjištění serveru Seznam Zprávy". Rodina `seznam-zpravy` sem proto byla doplněna ručně (oprava z 3. 8. 2026); `detect-source-family.mjs` ji najít nemohl, protože tělo článku záměrně nečte — zmínka uprostřed textu je běžná i ve vlastním zpravodajství. U textu, který se opírá o cizí investigaci, tedy nestačí přečíst podpis.

### Fotokredity vypadají jako autoři

Stránka nese desítky dalších výskytů klíče `author` pocházejících z fotografických kreditů (`Petr Horník`, `Michal Šula`, `archiv autora`). Strojové čtení, které bere první nebo libovolnou shodu, dostane fotografa místo autora textu. Rozhoduje `author` v JSON-LD uzlu článku, ne kdekoli na stránce.

## Jak v něm hledat {#jak-hledat}

Původ čti z podpisového odkazu: `/autor/ctk-304` je agenturní přebírka, `/autor/pravo-303` přetisk deníku Právo, `/autor/novinky-302` redakční text bez jmenovitého autora, `/autor/<jméno>` vlastní text konkrétního redaktora. U textu, který se odvolává na cizí investigaci, ověř navíc tělo článku a rodinu doplň ručně.

