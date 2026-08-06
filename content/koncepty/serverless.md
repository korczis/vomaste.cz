+++
title = "Serverless jako vlastnost, ne módní slovo"
description = "Publikovaný web nezávisí na živém aplikačním serveru, neveřejné databázi ani osobním účtu jednoho správce. Míň provozovaných míst znamená míň míst k zabezpečení, k financování a k tichému zásahu."
template = "concept.html"
weight = 315

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
tile_title = "Serverless jako vlastnost"
tile_summary = "Žádný živý aplikační server, žádná neveřejná databáze, žádný osobní účet, na kterém by publikace závisela. Statický build z verzovaných vstupů."
+++

Manifest, bod 12. Tahle stránka rozvádí, co "serverless" v kontextu
tohohle webu znamená technicky — a proč to není jen architektonická
preference, ale bezpečnostní a provozní vlastnost.

## Co web opravdu potřebuje ke svému chodu

Nic, co by muselo běžet nepřetržitě. Publikovaná stránka je statický
HTML soubor vygenerovaný při buildu ze Zoly z kanonických dat v
`data/dossiers/**`. Žádné volání aplikačního API za běhu, žádný
databázový dotaz při načtení stránky, žádná session, žádné přihlášení
— [strojově čitelná data](@/koncepty/strojove-citelna-data.md) (JSON-LD)
jsou taky vygenerovaná do statických souborů, ne servírovaná z běžícího
procesu.

## Nasazení bez osobního tokenu

`.github/workflows/deploy.yml` sestaví web při každém push na `master`
a nahraje ho na GitHub Pages přes OIDC (`id-token: write` oprávnění
workflow, ne uložený osobní access token). Kdyby účet, který kdysi
deploy nastavil, zanikl, nasazení tím nepřestane fungovat — nezávisí na
jeho existenci.

## Proč míň běžících míst = míň rizika

Každý trvale běžící privilegovaný systém je něco, co potřebuje záplaty,
monitoring, rozpočet a přístupová práva — a je to místo, kde by šlo
publikovaný obsah změnit potichu, bez commitu a bez historie. Statický
build tenhle problém neřeší lépe, on ho **odstraňuje**: neexistuje
proces, který by šel prolomit a přimět k vydání jiného obsahu, než jaký
odpovídá poslední zelené sestavě z Gitu. Co vidí čtenář, je přesně to,
co vygeneroval build z konkrétního commitu — ne to, co by v tu chvíli
vrátila databáze.

## Serverless neznamená, že servery zmizely

GitHub Actions runner, který build spouští, je server. GitHub Pages,
který statické soubory servíruje, běží na serverech. Rozdíl je v tom, že
ani jeden z nich nemusí existence webu jako *svého* trvalého,
privilegovaného, na sobě závislého systému — jsou to nahraditelné
distribuční kanály nad reprodukovatelným buildem, ne autorita, která drží
data. Přesně to rozvádí
[Forkovatelnost a adopce](@/koncepty/forkovatelnost.md): hosting je
distribuční kanál, ne jediný nositel existence.

## Co tahle architektura nedává zadarmo

Statický build neznamená žádnou logiku vůbec — validátory, generátory a
kontrolní skripty jsou reálný kód, který reálně běží, jen ne za běhu
prohlížené stránky, nýbrž při buildu. A neznamená to ani odolnost proti
tomu, kdo má přístup k repozitáři samotnému — to řeší jiná vrstva,
[verzováno v Gitu](@/koncepty/verzovano-v-gitu.md) a
[nezastavitelnost](@/koncepty/nezastavitelnost.md).
