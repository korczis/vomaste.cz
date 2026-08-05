+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Aktuálně.cz"
template = "source-catalog-entry.html"
weight = 250
description = "Aktuálně.cz — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/aktualne-cz"
catalog_entry = "aktualne-cz"
view_model = "generated/source-catalog.json"
+++

Zpravodajský server s vlastní redakcí a s výraznou názorovou sekcí. V datasetu stojí na obojím, a právě to je jeho hlavní mez: **reportáž a komentář se čtou jinak**, i když nesou totéž logo.

Druhá mez je formální. Podpis na Aktuálně.cz běžně obsahuje víc než jedno jméno a jedno z nich nemusí být člověk — rubrika je v datech vedena jako osoba. Kdo čte jen první položku, přečte původ obráceně.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- U textu s podepsaným redaktorem: že jde o vlastní zpravodajství této redakce, a tedy o samostatný hlas vedle jiných vydavatelů.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není u konkrétního článku ověřen kredit — část textů přebírá ČTK.
- Zjištění tam, kde jde o komentář. Text z rubriky názorů dokládá, že autor své stanovisko vyslovil, ne že popsané platí.
- Nezávislé potvrzení dvěma vlastními texty. Dva články Aktuálně.cz jsou jeden vydavatel, tedy jeden hlas (pravidlo S10).

## Pasti {#pasti}

### Rubrika je zapsaná jako autor

JSON-LD u `andrej-babis/SRC-50` uvádí `"author":[{"@type":"Person","name":"Domácí"},{"@type":"Person","name":"ČTK"}]` — název rubriky je označen jako osoba a stojí v podpisu **před** agenturním kreditem. Čtení, které vezme první autora, dostane „Domácí" a text vyhodnotí jako vlastní zpravodajství. Rozhoduje celý seznam autorů, ne jeho první položka; pro srovnání `macinka-turek/SRC-36` nese jediného autora `Viet Tran`.

### Názorová subdoména je týž vydavatel

Komentáře vycházejí na `nazory.aktualne.cz` a zpravodajství na `zpravy.aktualne.cz` (viz `adam-vojtech/SRC-39` proti `adam-vojtech/SRC-06`). Registrovaná doména je v obou případech `aktualne.cz`, takže pravidlo S10 je správně spojí do jednoho hlasu — ale odlišná adresa i odlišný žánr svádí k tomu vést je jako dva zdroje. Komentář navíc není zjištění, i kdyby vydavatel byl jiný.

## Jak v něm hledat {#jak-hledat}

Původ čti z JSON-LD `author` nebo z `<meta name="author">`; agenturní přebírka má v podpisu `ČTK` a odkaz na rozcestník `/autori/ctk/`. Název rubriky v podpisu ignoruj — kredit rozhoduje ten, který pojmenovává osobu nebo agenturu.

