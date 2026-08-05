+++
# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.
title = "ČTK — Česká tisková kancelář"
template = "source-catalog-entry.html"
weight = 100
description = "ČTK — Česká tisková kancelář — co dokládá, co nedokládá a jak v něm hledat. média, omezený přístup."

[extra]
generated = true
lang = "cs"
seo_type = "WebPage"
record_type = "sourceCatalogEntry"
record_id = "https://vomaste.cz/id/zdroje/ctk"
catalog_entry = "ctk"
view_model = "generated/source-catalog.json"
+++

Nejcitovanější rodina v datasetu. Význam ČTK pro tenhle projekt není v tom, co dokládá, ale v tom, co **rozbíjí**: iluzi nezávislého potvrzení.

Dvě citace téže agenturní zprávy nejsou dvě doložení. Badge CORROBORATED slibuje dvě nezávislá — a slib, který data nekryjí, je horší než skromnější stav.

## Co dokládá {#doklada}

- Že agentura v daný den vydala zprávu daného znění — a tedy že údaj byl v tu chvíli veřejně k dispozici.

## Co nedokládá {#nedoklada}

- Nezávislost. Pět médií, která tutéž agenturní zprávu přebírají, je JEDNO doložení, ne pět.
- Vlastní ověření agenturou. Zpráva často reprodukuje prohlášení strany sporu; kdo mluví, musí zůstat v tvrzení uvedeno.

## Pasti {#pasti}

### Přebírání vypadá jako shoda

Právě kvůli tomuhle existuje pole `sourceFamily`. Bez něj se pět vydání téže zprávy počítá jako pět nezávislých redakcí a tvrzení dostane CORROBORATED, které si nezaslouží. Revize T-056 takto musela srazit 55 tvrzení zpět na 1 ZDROJ.

### Kredit je jen v metadatech a patičce

Zmínka „řekl ČTK" uprostřed textu je běžná i ve vlastním zpravodajství a původ nedokládá. Rozhoduje `<meta name="author">`, podpisový blok nebo patička „Zdroj: …".

## Jak v něm hledat {#jak-hledat}

Rodinu nikdy nehádej z outletu ani z podobnosti titulků. `scripts/osint/detect-source-family.mjs` čte doslovný kredit ve třech ukotvených oblastech; bez kreditu je verdikt `unknown`, což NENÍ „vlastní zpravodajství".

