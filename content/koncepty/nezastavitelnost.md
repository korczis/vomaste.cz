+++
title = "Nezastavitelnost je vlastnost architektury"
description = "Doména může přestat fungovat, hosting skončit, provozovatel odejít, repozitář zmizet. Odolný systém nemá jediný bod, jehož odstraněním by zmizela i data, metodologie a možnost publikaci obnovit."
template = "concept.html"
weight = 325

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
tile_title = "Nezastavitelnost"
tile_summary = "Žádný jednotlivý web není doslova nezastavitelný. Odolný systém nemá jediný bod, jehož odstraněním zmizí i data a možnost publikaci obnovit."
+++

Manifest, bod 14. Tahle stránka syntetizuje to, co je jinde na webu
rozvedené jednotlivě, do jedné otázky: kolik nezávislých věcí by muselo
selhat najednou, aby vomaste.cz jako metodologie a datová sada přestal
existovat?

## Čtyři věci, které mohou zmizet nezávisle na sobě

**Doména** je adresa, ne autorita — může vypršet nebo se přesunout, aniž
by to ovlivnilo data samotná. **Hosting** (GitHub Pages) je distribuční
kanál — statický build jde publikovat i jinde, viz
[serverless jako vlastnost](@/koncepty/serverless.md). **Provozovatel**
může odejít; append-only historie v Gitu a veřejná metodologie na jeho
pokračování nezávisí. **Repozitář** samotný může zmizet z GitHubu — ale
každý fork drží kompletní historii, ne jen aktuální stav.

Žádná z těchto čtyř věcí není postavená tak, aby její ztráta strhla i
ty ostatní tři.

## Ze sedmi bodů manifestu do jednoho invariantu

Nezastavitelnost není nová technika — je to, co dá dohromady, co už
web dělá jinde: [otevřená a exportovatelná data](@/koncepty/strojove-citelna-data.md),
[reprodukovatelný build bez kritického tajemství](@/koncepty/serverless.md),
veřejná metodologie (tenhle manifest a
[konstituce](@/dokumentace/konstituce.md)),
[možnost nezávislého forku](@/koncepty/forkovatelnost.md) a
[historie, kterou lze ověřit](@/koncepty/verzovano-v-gitu.md). Žádná z
těchhle vlastností sama o sobě nezastavitelnost nezaručuje; dohromady
znamenají, že neexistuje jediné privilegované místo, jehož ztráta by
vzala všechno ostatní s sebou.

## Co to konkrétně znamená

- Kdokoli může ověřit, jestli konkrétní kopie webu odpovídá
  deklarovaným vstupům — sestavit stejná data stejným buildem a
  porovnat výstup.
- Data jsou exportovatelná ve strojově čitelném tvaru, ne uvězněná v
  proprietární databázi jednoho hostingu.
- Metodologie (pravidla, podle kterých se cokoli publikuje) je veřejná
  a nezávisí na tom, kdo projekt zrovna provozuje.

## Co to není

Není to slib, že vomaste.cz nikdy nezanikne jako konkrétní běžící
instance — to slíbit nejde a manifest to ani netvrdí. Je to slib jiného
druhu: že zánik jedné instance neznamená zánik metodologie ani dat, na
kterých stojí. Válečný slogan by tvrdil nesmrtelnost. Tohle tvrdí jen
odstranění zbytečných bodů selhání — a přesně to je i závěr manifestu:
[vomaste.cz je jedna instance; metodologie musí přežít i bez ní](@/manifest.md#zavazek).
