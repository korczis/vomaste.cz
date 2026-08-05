+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "FORUM 24"
template = "source-catalog-entry.html"
weight = 260
description = "FORUM 24 — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/forum24"
catalog_entry = "forum24"
view_model = "generated/source-catalog.json"
+++

Zpravodajský a názorový server s vlastní redakcí. V datasetu stojí na obojím: část záznamů jsou vlastní texty s podepsanými autory, část přebírá ČTK.

Pro tenhle projekt je FORUM 24 typovým příkladem pravidla **S10** — týž vydavatel nikdy nezakládá nezávislé doložení. Dokumentace pravidla používá jako ukázku právě `outlet:FORUM 24`, protože se tu potkaly obě podoby jednoho vydavatele: text s vyplněnou rodinou a text bez ní.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- U textu s podepsaným redaktorem: že jde o vlastní zpravodajství této redakce, a tedy o samostatný hlas vedle jiných vydavatelů.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není u konkrétního článku ověřen kredit — část textů přebírá ČTK.
- Zjištění tam, kde jde o komentář. Značná část záznamů z tohoto vydavatele je v datasetu vedena jako komentář nebo názor; takový text dokládá stanovisko autora, ne popsaný děj.
- Nezávislé potvrzení dvěma vlastními texty. Dva články FORUM 24 jsou jeden vydavatel, tedy jeden hlas (pravidlo S10).

## Pasti {#pasti}

### ČTK je v podpisu vedena jako osoba

U přebraných zpráv obsahuje JSON-LD `"author":[{"@type":"Person","name":"ČTK","url":"https://www.forum24.cz/autor/ctk"}]` — agentura má vlastní autorský rozcestník a v podpisu vypadá přesně jako jmenovaný redaktor (`karel-havlicek/SRC-02`). Vedle toho stojí texty s běžným autorem (`Jiří Sezemský` u `karel-havlicek/SRC-04`, `Adam Opatrný` u `zuzana-mrazova/SRC-10`) ve zcela stejném tvaru. Rozdíl je jen ve jméně, ne ve struktuře — kdo kontroluje jen přítomnost autora, přebírku nepozná.

### Týž vydavatel dvakrát vypadal jako dvě potvrzení

U `karel-havlicek/CLM-05` stojí vedle sebe `SRC-02` (rodina `ctk`) a `SRC-04` (bez rodiny) — oba FORUM 24. Než platilo pravidlo S10, počítaly se jako dvě nezávislé redakce právě proto, že jeden z nich měl vyplněnou rodinu a druhý spadl na fallback přes outlet. Jedna redakce ale nepotvrzuje sama sebe; tvrzení proto zůstává na stavu „1 ZDROJ". Totéž je vidět u `zuzana-mrazova/CLM-12` a `ales-juchelka/CLM-22`, kde druhý nezávislý hlas přinášejí až jiní vydavatelé.

## Jak v něm hledat {#jak-hledat}

Původ čti z podpisového odkazu: `/autor/ctk` znamená agenturní přebírku, `/autor/<jméno>` vlastní text. Rubrika ani titulek o původu nevypovídají. U tvrzení, které se opírá o dva texty tohoto vydavatele, hledej třetí hlas jinde — dva zdejší texty jsou jedno doložení.

