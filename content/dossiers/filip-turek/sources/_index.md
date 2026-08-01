+++
# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.
title = "Zdroje — Filip Turek"
description = "Zdroje z kanonického registru dossieru, které podkládají tvrzení o Filipu Turkovi."
template = "entity-dossier-registry.html"

[extra]
generated = true
view_model = "generated/views/dossiers/filip-turek/sources-index.json"
dossier = "filip-turek"
lang = "cs"
seo_type = "CollectionPage"
dossier_title = "Filip Turek"
canonical_dossier = "macinka-turek"
subject = "turek"
registry = "sources"
+++
Filtrovaný pohled na [registr zdrojů](@/dossiers/macinka-turek/sources/_index.md) — jen zdroje relevantní k Filipu Turkovi.

## Co u každého zdroje stojí

Vydavatel, typ materiálu, přímý odkaz, datum vydání a datum, kdy byl obsah
naposledy stažen a zkontrolován. To poslední není formalita: odkazy hnijí
a články se přepisují, takže datum stažení říká, k jakému okamžiku
odpovídá to, co web o zdroji tvrdí. Podrobně:
[registr zdrojů](@/koncepty/registr-zdroju.md).

## Nezávislost, ne počet odkazů

Pět přebraných verzí téže agenturní zprávy je jeden zdroj informace, i
když mají pět adres. Registr proto vede **vydavatelské rodiny** a index je
vypisuje otevřeně — pro stav
[ověřeno více zdroji](@/koncepty/stav-overeno-vice-zdroji.md) musí jít
o skutečně různé redakce.

## Vazba je obousměrná

U každého zdroje je vidět, která tvrzení podkládá, a u každého tvrzení,
o které zdroje se opírá. Validátor build shodí, když odkaz vede na
neexistující záznam nebo když se oba směry rozejdou — zdroj bez jediného
podporovaného tvrzení je taky chyba, ne dekorace.
