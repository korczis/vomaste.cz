+++
title = "A609 — Nasazení"
description = "Push do hlavní větve je nasazení. Co to znamená pro rytmus práce a proč mezi commitem a produkcí prakticky není pauza."
template = "learning-lesson.html"
weight = 1609

[extra]
lang = "cs"
seo_type = "LearningResource"
record_type = "lesson"
section = "akademie"
lesson_id = "A609"
level = "engineering"
estimated_minutes = 8
audience = ["vyvojar", "maintainer"]
objectives = [
  "Popíšete cestu od commitu na produkci.",
  "Víte, kdy je potřeba potvrzení, a proč před commitem, ne po něm.",
  "Poznáte, co se stane, když brána selže během nasazení.",
]
prerequisites = ["A608"]
related_kb = ["koncepty/serverless.md", "koncepty/nezastavitelnost.md", "koncepty/verzovano-v-gitu.md"]
next = "A610"
+++

Web je statický a hostuje se ze sestaveného výstupu. **Push do hlavní
větve je nasazení** — žádný samostatný krok „vypustit na produkci“
neexistuje.

## Automatika na hlavní větvi

Commit i merge na hlavní větvi spouští lokální řetěz: stažení a přeskládání
na aktuální stav, **plná brána**, a při úspěchu push. Řetěz se přeruší
čistě — commit zůstane lokální a nic se nepublikuje — když nastane
konflikt při přeskládání nebo brána selže.

{% <callout kind="varovani" title="Mezi commitem a produkcí není pauza"> %}
Dřív platilo „commitnu teď, pushnu po kontrole“. To už neplatí: commit na
hlavní větvi typicky nasadí během okamžiku.

Praktický důsledek: **potvrzení se získává před commitem, ne po něm.**
Kdo počítá s tím, že to ještě stihne zastavit, počítá špatně.
{% </callout> %}

Pro případ, kdy chcete tu pauzu zpět — třeba když skládáte několik
souvisejících commitů — existuje způsob, jak jeden commit z automatiky
vyřadit. V pracovních větvích se automatika nespouští vůbec.

## Když brána selže

Nic se nepublikuje. Vydaný web zůstane na poslední úspěšné verzi.

Je to záměrné a je to jediná rozumná volba: publikovat data, která
neprošla validací, by znamenalo vydat obsah, o kterém nevíme, jestli
splňuje vlastní pravidla.

{% <callout kind="pravidlo" title="Nezastupitelnost je vlastnost, ne slogan"> %}
Doména, hosting, provozovatel a repozitář jsou čtyři nezávislé body.
Sestavení nepotřebuje nic z nich kromě repozitáře — takže kdo má klon, má
všechno, co je k provozu potřeba.

Odsud plyne i zákaz externích závislostí v sestavení: každá by z jednoho
z těch bodů udělala podmínku.
{% </callout> %}

{% <kontrola otazka="Uděláte commit na hlavní větvi a za dvě minuty zjistíte, že tvrzení má chybu. Co s tím?"> %}
Je to nejspíš už venku. Ne panikařit — opravit.

Postup je normální oprava: změna kanonických dat, brána, commit. Zveřejní
se stejnou cestou.

Co **nedělat**: přepisovat historii, aby to vypadalo, že se chyba nestala.
Celý projekt stojí na tom, že historie je dohledatelná — a je to totéž
pravidlo, jaké platí pro autorizační záznamy. Zveřejněná chyba a její
oprava jsou legitimní záznam. Přepsaná historie je ztráta důvěryhodnosti
za nic.

A ponaučení pro příště je v předchozí sekci: potvrzení se získává **před**
commitem. Kdo si nechává kontrolu na dobu mezi commitem a pushem, spoléhá
na pauzu, která tam není.
{% </kontrola> %}
