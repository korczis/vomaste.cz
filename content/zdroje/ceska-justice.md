+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Česká justice"
template = "source-catalog-entry.html"
weight = 290
description = "Česká justice — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/ceska-justice"
catalog_entry = "ceska-justice"
view_model = "generated/source-catalog.json"
+++

Odborný server o justici. Jeho hodnota pro dossiery je v procesní přesnosti — pojmenuje soud, instanci i povahu rozhodnutí tam, kde obecné zpravodajství píše „soud rozhodl".

Dvě meze to ale ohraničují. Značná část textů je agenturních, takže odbornost webu nedokládá vlastní redakční práci. A portál není osamocený: se dvěma dalšími odbornými deníky sdílí jednoho vydavatele, což **strojová kontrola nezávislosti nepozná**, protože se dívá na doménu.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- U textu s podepsaným redaktorem: že jde o vlastní zpravodajství této redakce, a tedy o samostatný hlas vedle jiných vydavatelů.
- Procesní detail, který obecné zpravodajství vynechává — soud, instanci, datum a povahu rozhodnutí.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není u konkrétního článku ověřen kredit — významná část textů přebírá ČTK.
- Nezávislost na Ekonomickém deníku a Zdravotnickém deníku. Všechny tři portály vydává Media Network s.r.o. — pro doložení to není víc vydavatelů.
- Zjištění tam, kde jde o komentář nebo odbornou analýzu. Redakce sama v patičce uvádí, že články v názorové rubrice nemusí vyjadřovat stanovisko redakce; právní rozbor dokládá výklad autora, ne procesní stav.
- Právní stav věci. Odborný text popisuje rozhodnutí, závazné znění nese až rozhodnutí soudu nebo jeho tisková zpráva.

## Pasti {#pasti}

### První `<meta name="author">` je vydavatel, ne autor

Stránka nese dvě značky `<meta name="author">` v tomto pořadí: `Media Networks` (vydavatelský systém) a teprve pak skutečného autora — `ČTK` u `andrej-babis/SRC-01`, `Alžběta Vejvodová` u `karel-havlicek/SRC-07`. Čtení, které vezme první shodu, dostane u každého článku totéž jméno a původ nikdy nerozliší. Rozhoduje druhá značka, respektive JSON-LD uzel `author`.

### Tři domény, jeden vydavatel

Patička webu uvádí doslova: „Vydavatelem zpravodajských portálů Ekonomický deník, Zdravotnický deník a Česká justice je Media Network s.r.o." Pravidlo S10 porovnává outlet a registrovanou doménu, takže `ceska-justice.cz`, `ekonomickydenik.cz` a `zdravotnickydenik.cz` mu projdou jako tři nezávislí vydavatelé, přestože jsou jeden. Tvrzení opřené o dva z těchto portálů proto není potvrzené dvěma redakcemi a musí se posoudit ručně.

### Odborný web nese agenturní texty

Patička uvádí, že „Portál Česká justice využívá zpravodajství ČTK". V datasetu má většina záznamů z tohoto vydavatele rodinu `ctk` — u `andrej-babis/SRC-01` je kredit `<meta name="author" content="ČTK" />`, u dalších jen odkaz na autorský rozcestník `/author/ctk/`. Odbornost webu tedy neznamená, že text vznikl v jeho redakci.

## Jak v něm hledat {#jak-hledat}

Ignoruj první `<meta name="author">`; rozhoduje druhá značka nebo `author` v JSON-LD. Kredit `ČTK` či odkaz `/author/ctk/` znamená přebírku. Před započtením druhého hlasu ověř, zda tím druhým zdrojem není sesterský portál téhož vydavatele.

