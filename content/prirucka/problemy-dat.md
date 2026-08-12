+++
title = "Řešení problémů: data a validace"
description = "Šest nejčastějších pádů validace kanonických dat — co znamenají, jak je najít, jak opravit a jak jim předejít."
template = "learning-lesson.html"
weight = 2401

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "prirucka"
category = "problem"
estimated_minutes = 8
audience = ["vyvojar", "maintainer", "research"]
+++

## Text tvrzení neodpovídá řádku přehledové tabulky

- **Znamená**: dvě ručně udržované reprezentace téhož tvrzení se rozešly.
- **Příčina**: změna udělaná jen na jednom ze dvou míst.
- **Najdete**: `npm run data:validate`; hláška uvádí identifikátor.
- **Opravíte**: srovnáte znění v `claims/clm-NN.json` a v přehledové
  tabulce v `dossier.json`, pak `npm run data:build`.
- **Předejdete**: měňte obojí jedním zásahem. Jsou to jediné dvě ruční
  reprezentace v celém modelu.

## Stav neodpovídá struktuře zdrojů

- **Znamená**: „ověřeno více zdroji“ bez nezávislé dvojice, nebo „1 zdroj“
  přesto, že dvojice existuje.
- **Příčina**: zdroje mají stejnou rodinu nebo stejnou doménu vydavatele.
- **Najdete**: hláška jmenuje tvrzení i zdroje, které se posuzovaly.
- **Opravíte**: buď doplníte skutečně nezávislý zdroj, nebo stav
  opravíte. Nikdy ne vymyšlením jiné rodiny.
- **Předejdete**: vyplňujte `sourceFamily` podle **původu** materiálu při
  zakládání zdroje, ne zpětně.

## Tvrzení bez zdroje / zdroj bez tvrzení

- **Znamená**: vazba je vedená jen z jedné strany.
- **Příčina**: přidání odkazu do `sources`, ale ne do `claims` protistrany
  (nebo naopak).
- **Najdete**: referenční integrita; hláška uvádí obě strany.
- **Opravíte**: doplníte chybějící stranu.
- **Předejdete**: obě strany se přidávají zároveň — vazba je obousměrná
  z definice.

## Duplicitní nebo neshodné `@id`

- **Znamená**: dva záznamy mají totéž `@id`, nebo `@id` neodpovídá cestě
  souboru.
- **Příčina**: záznam vznikl kopií jiného a `@id` se nezměnilo; nebo se
  soubor přesunul.
- **Najdete**: referenční integrita.
- **Opravíte**: srovnáte `@id` s cestou. `@id` je identita — změna
  znamená jiný záznam.
- **Předejdete**: nezakládejte záznamy kopírováním, použijte generátor.

## Neplatný JSON nebo neznámý klíč

- **Znamená**: soubor se neparsuje, nebo obsahuje pole, které schéma nezná.
- **Příčina**: překlep, chybějící čárka, nebo nové pole bez záznamu ve
  schématu.
- **Najdete**: kontrola tvaru; hláška uvádí soubor a klíč.
- **Opravíte**: u překlepu opravíte; u nového pole je potřeba schéma,
  sestavovač modelů **i** konzument — tři místa, jinak je změna
  nedodělaná.
- **Předejdete**: rychlá smyčka
  `npm run data:validate -- --file <cesta>` během psaní.

## Chybějící nebo neúplné pokrytí archivace

- **Znamená**: entita nebo dokument nemá povinný snímek úřední evidence.
- **Příčina**: nová entita s ověřeným identifikátorem bez snímku, nebo
  spisová značka bez záznamu.
- **Najdete**: `npm run archive:check` (běží i v bráně, offline).
- **Opravíte**: doplníte pokrytí ručním síťovým krokem, ne odhadem.
- **Předejdete**: identifikátor se nikdy nedoplňuje podle shody jména.
