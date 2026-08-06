+++
title = "Forkovatelnost a adopce"
description = "Celý systém je forkovatelný: build nepotřebuje žádné tajemství, privátní backend ani službu mimo repozitář. Jeden vstupní bod (just) a jedna brána kvality — plus poctivý výčet toho, co si fork ještě musí upravit ručně."
template = "concept.html"
weight = 350

[extra]
lang = "cs"
seo_type = "WebPage"
group = "otevrenost"
accent = true
tile_title = "Forkovatelnost a adopce"
tile_summary = "Tenhle web není produkt, je to <strong class=\"text-white/80\">použitelný vzor</strong>: dossierový datový model, validátory a build gate si můžete forknout a nasadit na vlastní téma. Build nepotřebuje žádné tajemství ani službu mimo repozitář, vstupní bod je jeden příkaz (<code>just</code>). Co fork ještě musí upravit ručně, je vypsané — bez toho by to byl slib, ne vlastnost."
quickstart = [
  "git clone git@github.com:<vas-ucet>/vomaste.cz.git",
  "just doctor   # zkontroluje prerekvizity (Node, Zola, hooky)",
  "just setup    # npm ci + nastaví git hooks",
  "just build    # TA brána kvality — stejná sekvence jako CI",
]
+++

Forkovatelnost je v [konstituci](@/dokumentace/konstituce.md) vedená jako
závazný invariant, ne jako marketingová vlastnost. Znamená to konkrétní věc:
kdokoli si může vzít tenhle repozitář, vyměnit téma i subjekty a provozovat
vlastní nezávislý web na stejném datovém modelu — bez dohody s kýmkoli, bez
přístupu k naší infrastruktuře a bez našeho redakčního schválení.

## Proč to jde

Protože tady není co skrývat ani co doinstalovat. Build je statický: nemá
serverovou část, nečte žádný secret, nevolá privátní API a nepotřebuje účet
u žádné služby. Nasazení jde přes GitHub Actions do Pages přes OIDC token
workflow — ani deploy tedy nepotřebuje osobní token, který by fork nemohl
mít. Všechna data, která web zobrazuje, jsou v repozitáři jako verzované
soubory; [strojově čitelná data](@/koncepty/strojove-citelna-data.md) se
z nich generují při buildu, ne z nějaké databáze vedle. Proč statická
architektura sama o sobě snižuje riziko, ne jen náklady:
[Serverless jako vlastnost](@/koncepty/serverless.md).

## Jeden vstupní bod

Repozitář má přes třicet npm skriptů a je snadné netrefit ten, na kterém
záleží. Proto je v rootu `justfile` ([just](https://github.com/casey/just)):

```
just              # vypíše všechny recepty
just doctor       # zkontroluje prerekvizity (Node, Zola, hooks)
just setup        # nainstaluje závislosti a nastaví git hooks
just dev          # live preview na 127.0.0.1:1111
just build        # TA brána kvality — stejná sekvence jako CI
```

`just` je **pouze pohodlí**. Každý recept je obyčejný příkaz, který jde
spustit i přímo, a nic v buildu, v hooku ani v CI na `just` nezávisí — kdo
ho nechce, přijde jen o výpis.

Podstatný je `just build`. Je to stejná sekvence, kterou spouští CI, a
zahrnuje validátory, které tenhle datový model vlastně definují: integrita
registrů, parita ručně psané tabulky s generovanými stránkami, stavová
pravidla podle počtu citovaných zdrojů, existence kotev v hotovém HTML,
poctivost JSON-LD. Adoptér, který tyhle kontroly vypne, se nemůže hlásit
k tomuto datovému modelu — vypnutím kontrol z něj zbyde jen vzhled.

## Co fork nastavuje

`base_url` v `config.toml` (a `static/CNAME`, pokud chce vlastní doménu),
`title` a `description`, a samotný obsah — kanonická data
`data/dossiers/**` (žádný samostatný registr souborů: přítomnost
`data/dossiers/<slug>/dossier.json` je sama o sobě registrace daného
dossieru) plus ručně psané kořenové indexy a koncepty v `content/`.
Autorizační log v `AGENTS.md` si každý fork vede vlastní — náš není a
nemůže být pro nikoho jiného platný.

## Co fork ještě musí upravit ručně

Tady je poctivé omezení, které patří na tuhle stránku stejně jako to
předchozí: dokud neskončí de-specializační migrace, zůstávají v navigaci a
několika šablonách zbytky historické vazby na výchozí dossiery tohoto webu.
Přesný, průběžně aktualizovaný seznam je v auditu
`docs/migrations/remove-macinka-turek-coupling-audit.md` a hlídá ho vlastní
linter (`lint:historical-coupling`). Fork je tedy možný, ale vyžaduje jejich
ruční úpravu — a dokud to platí, nebudeme tvrdit, že je forkování
bezešvé.

## Co si fork řeší sám

Redakční odpovědnost, právní posouzení a případný příjem podnětů. Fork
nepřebírá naše redakční schválení ani naši autorizaci pokrytí konkrétních
osob; každý záznam o reálné osobě musí projít vlastním rozhodnutím
provozovatele forku. A platí i tady, co je napsané v
[bezpečnostních hranicích](@/koncepty/bezpecnostni-hranice.md): tenhle
projekt nemá důvěrný intake a fork ho nedostane jako součást balíku —
kdo ho potřebuje, musí si ho postavit a odpovídat za něj.
