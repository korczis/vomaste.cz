+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "Echo24"
template = "source-catalog-entry.html"
weight = 270
description = "Echo24 — co dokládá, co nedokládá a jak v něm hledat. média, veřejně dostupný."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/echo24"
catalog_entry = "echo24"
view_model = "generated/source-catalog.json"
+++

Zpravodajský a názorový server s vlastní redakcí. V datasetu je zhruba půl na půl: vlastní texty a přebírky.

Echo24 je v katalogu hlavně proto, že u něj **strojová metadata lžou o původu**, aniž by kdokoli lhal. Článek psaný redaktorem společně s agenturou má v `<meta name="author">` jen redaktora — a to je přesně ten případ, kdy se přebírka tváří jako nezávislý hlas.

## Co dokládá {#doklada}

- Že redakce k danému datu zveřejnila text daného znění.
- U textu s podepsaným redaktorem: že jde o vlastní zpravodajství této redakce, a tedy o samostatný hlas vedle jiných vydavatelů.

## Co nedokládá {#nedoklada}

- Že popsaný děj nastal. Článek dokládá, co redakce k danému datu zveřejnila, a je-li v něm citováno prohlášení strany sporu, dokládá to prohlášení, ne jeho obsah.
- Nezávislost na jiném zdroji, dokud není u konkrétního článku ověřen kredit. Přebírá se tu ČTK i zpravodajství jiných redakcí.
- Nezávislé potvrzení dvěma vlastními texty. Dva články Echo24 jsou jeden vydavatel, tedy jeden hlas (pravidlo S10) — viz `adam-vojtech/CLM-19`, kde stojí vedle sebe `SRC-11` s rodinou `ctk` a `SRC-12` bez rodiny.

## Pasti {#pasti}

### Agenturní kredit není ve strojových metadatech

U `adam-vojtech/SRC-11` obsahuje podpisový blok dva odkazy vedle sebe — `<a rel="author" href="/author/dominik-stein">Dominik Stein</a>` a `<a rel="author" href="/author/ctk">čtk</a>` — ale `<meta name="author">` nese jen prvního z nich, tedy `Dominik Stein`. Kdo se opře o strojová metadata, dostane text jako vlastní zpravodajství; společné autorství s agenturou je vidět jen v podpisovém bloku. Proto je verdikt u takových textů opřený o odkaz na rozcestník `/author/ctk` a nese nižší jistotu.

### Redakční zkratka není jmenovitý autor

`adam-vojtech/SRC-12` je podepsán `jkr` — redakční zkratkou, ne jménem ani agenturní značkou. Takový podpis nedokládá vlastní zpravodajství o nic víc než chybějící podpis; je to `unknown`, ne `own`. Zkratky (`jkr`, `red`, `jas`) proto nesmí sloužit jako důkaz samostatného hlasu.

### Patička webu odkazuje na ČTK vždy

V patičce každé stránky stojí „Copyright © Echo Media, a.s. © ČTK". To je licenční doložka celého webu, ne kredit článku — pro určení původu je bezcenná a nesmí se zaměnit s patičkou „Zdroj: …" pod konkrétním textem.

### Přebírá se i mimo agenturu

`andrej-babis/SRC-15` nese rodinu `idnes-dividenda-2026-07`, tedy převzetí zjištění jiné redakce. Kontrola zaměřená jen na ČTK by ho vyhodnotila jako vlastní zpravodajství a tvrzení by dostalo nezávislé doložení, které nemá.

## Jak v něm hledat {#jak-hledat}

Rozhoduje podpisový blok, ne `<meta name="author">` — ten na tomto webu uvádí jen prvního z autorů. Odkaz `/author/ctk` znamená agenturní podíl, `/author/<jméno>` jmenovitého redaktora, samotná zkratka nedokládá nic. Mobilní varianta `m.echo24.cz` je táž stránka a týž vydavatel.

