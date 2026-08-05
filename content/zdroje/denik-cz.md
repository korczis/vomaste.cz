+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Deník.cz"
template = "source-catalog-entry.html"
weight = 280
description = "Deník.cz — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/denik-cz"
catalog_entry = "denik-cz"
view_model = "generated/source-catalog.json"
+++

Celostátní síť regionálních deníků jednoho vydavatele. Její silná stránka — krajské mutace s vlastními redakcemi — je zároveň hlavní evidenční past: **jeden vydavatel se v datech objevuje pod několika jmény**.

Druhý rys sdílí s většinou zdejších médií: značná část textů jsou přetisky ČTK a pozná se to jen z podpisu.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- U textu s podepsaným redaktorem: že jde o vlastní zpravodajství této redakční sítě, a tedy o samostatný hlas vedle jiných vydavatelů.
- Regionální detail, který celostátní zpravodajství neuvádí — síť má krajské mutace s vlastními redaktory.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není u konkrétního článku ověřen kredit — významná část textů přebírá ČTK.
- Nezávislé potvrzení dvěma texty ze dvou krajských mutací. Kolínský i Ústecký deník jsou táž redakční síť a týž vydavatel, tedy jeden hlas (pravidlo S10).

## Pasti {#pasti}

### Agentura je podepsaná jako redaktor

U přebraných zpráv nese JSON-LD `"author": [{"@type":"Person","name":"ČTK","url":"https://www.denik.cz/autori/ctk/"}]` — agentura má vlastní autorský profil ve stejném tvaru jako lidé. Vlastní text má navíc `jobTitle: "Redaktor"` (`Jiří Janda` u `robert-plaga/SRC-10`), agenturní zápis ne. Rozdíl mezi `robert-plaga/SRC-09` a `SRC-10` je jen ve jméně v podpisu; podle vzhledu stránky se nepozná.

### Krajské mutace vypadají jako různí vydavatelé

V datech se týž vydavatel vyskytuje pod třemi názvy — „Deník.cz (VLTAVA LABE MEDIA)", „Kolínský deník (Deník.cz)" a „Ústecký deník (Deník.cz)". Pravidlo S10 je spojí přes registrovanou doménu `denik.cz` (subdomény typu `prazsky.denik.cz` se skládají do ní), takže dvě mutace nikdy nedají korroboraci. Bez toho by regionální přetisk téže agenturní zprávy vypadal jako druhá redakce.

### Dva zdejší texty vedle sebe nestačí

`robert-plaga/CLM-16` cituje `SRC-09` (rodina `ctk`) i `SRC-10` (rodina `denik-cz`) — dva různé texty, dvě různé rodiny, jeden vydavatel. Stav CORROBORATED tomu tvrzení náleží až díky třetímu zdroji, kterým je oznámení Ministerstva školství (`SRC-11`). Bez něj by šlo o jeden hlas se dvěma URL.

## Jak v něm hledat {#jak-hledat}

Původ čti z JSON-LD `author`: `/autori/ctk/` je agenturní přebírka, jmenovitý profil s `jobTitle` vlastní text. Krajskou mutaci nikdy neveď jako samostatného vydavatele — v datech se pojmenovává tak, jak je na stránce, ale pro nezávislost je to táž `denik.cz`.

