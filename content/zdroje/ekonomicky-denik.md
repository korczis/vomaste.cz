+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Ekonomický deník"
template = "source-catalog-entry.html"
weight = 300
description = "Ekonomický deník — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/ekonomicky-denik"
catalog_entry = "ekonomicky-denik"
view_model = "generated/source-catalog.json"
+++

Odborný server o hospodářství a veřejných financích. Pro dossiery je užitečný tím, že sleduje agendy, které se v celostátním zpravodajství objeví až v okamžiku sporu — rozpočtové přesuny, výběrová řízení, obsazování státních firem.

Meze má dvě a obě sdílí se sesterskou Českou justicí: **agenturní přetisky pod odbornou hlavičkou** a **jednoho vydavatele za třemi doménami**, kterého kontrola nezávislosti podle domény nerozpozná.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- U textu s podepsaným redaktorem: že jde o vlastní zpravodajství této redakce, a tedy o samostatný hlas vedle jiných vydavatelů.
- Hospodářský detail, který obecné zpravodajství vynechává — rozpočtové položky, průběh výběrových řízení, personální změny ve státních firmách.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není u konkrétního článku ověřen kredit — část textů přebírá ČTK.
- Nezávislost na České justici a Zdravotnickém deníku. Všechny tři portály vydává Media Network s.r.o. — pro doložení to není víc vydavatelů.
- Zjištění tam, kde jde o komentář nebo analýzu. Redakce sama v patičce uvádí, že články v názorové rubrice nemusí vyjadřovat stanovisko redakce; ekonomický rozbor dokládá výklad autora, ne stav věci.
- Čísla samotná. Rozpočtové a smluvní údaje se citují z primárního dokladu (registr smluv, rozpočtová dokumentace); článek dokládá, že je někdo zveřejnil, ne jejich správnost.

## Pasti {#pasti}

### První `<meta name="author">` je vydavatel, ne autor

Stránka nese dvě značky `<meta name="author">`: nejprve `Media Networks` (vydavatelský systém), teprve pak skutečného autora — `Jana Bartošová` u `ivan-bednarik/SRC-02`, `Tereza Čapková` u `karel-havlicek/SRC-10`. Čtení první shody dostane u každého článku totéž jméno. Rozhoduje druhá značka nebo JSON-LD uzel `author`. Web sdílí tuto vlastnost s Českou justicí, protože jde o tentýž redakční systém.

### Tři domény, jeden vydavatel

Patička webu uvádí doslova: „Vydavatelem zpravodajských portálů Ekonomický deník, Zdravotnický deník a Česká justice je Media Network s.r.o." Pravidlo S10 porovnává outlet a registrovanou doménu, takže tyto tři portály mu projdou jako tři nezávislí vydavatelé. Tvrzení opřené o dva z nich není potvrzené dvěma redakcemi.

### Odborný web nese agenturní texty

Patička uvádí, že „Portál Ekonomický deník využívá zpravodajství ČTK", a část záznamů z tohoto vydavatele má v datasetu rodinu `ctk`. Zaměření na hospodářství tedy nedokládá, že text vznikl v jeho redakci.

## Jak v něm hledat {#jak-hledat}

Ignoruj první `<meta name="author">`; rozhoduje druhá značka nebo `author` v JSON-LD. Než započítáš druhý nezávislý hlas, ověř, zda jím není sesterský portál téhož vydavatele. Číselný údaj z článku dohledej v primárním registru a cituj ten.

