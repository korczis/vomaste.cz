# Návrhy zdrojových rodin

> **Generováno** `npm run sources:detect-family` — needitovat ručně.
> Vygenerováno: 2026-08-05T13:28:45.597Z

Tenhle report je **návrh, ne zápis**. Detekce sama nic do
`data/dossiers/**` nezapisuje; rodinu vyplní až vědomý krok
`node scripts/osint/detect-source-family.mjs --apply data/generated/source-family-proposals.json`,
a to **jen u verdiktu `ctk`**.

**Co verdikt znamená**

| Verdikt | Význam | Zapisuje `--apply`? |
|---|---|---|
| `ctk` | doložený kredit ČTK v metadatech, podpisu nebo patičce | ano, do prázdného pole |
| jiná rodina | doložený jiný původ (přetisk cizí redakce/agentury) | ne — rozhoduje člověk |
| `own` | jmenovitý autor bez agenturní značky ⇒ rodina se **nevyplňuje** (fallback na outlet je správný) | ne |
| `unknown` | nezjištěno (paywall, 403, chybějící podpis) ⇒ rodina se **nevyplňuje** | ne |

## Souhrn

| Verdikt | Počet |
|---|---|
| `own` | 187 |
| `ctk` | 183 |
| `unknown` | 108 |
| **celkem zpracováno** | **478** |

## Verdikt `ctk` (183)

| Dossier | ID | Outlet | Jistota | Evidence |
|---|---|---|---|---|
| adam-vojtech | SRC-03 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| adam-vojtech | SRC-04 | Zdravotnický deník | high | <meta name="author" content="ČTK" /> |
| adam-vojtech | SRC-08 | Zdravotnický deník | medium | odkaz na autorský rozcestník /ctk/ |
| adam-vojtech | SRC-09 | Zdravotnický deník | high | <meta name="author" content="ČTK" /> |
| adam-vojtech | SRC-11 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| adam-vojtech | SRC-19 | Zdravotnický deník | high | <meta name="author" content="ČTK" /> |
| adam-vojtech | SRC-25 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| adam-vojtech | SRC-26 | Zdravotnický deník | high | <meta name="author" content="ČTK" /> |
| adam-vojtech | SRC-29 | Blesk.cz | high | JSON-LD author: ČTK / Šimánek Vít |
| adam-vojtech | SRC-31 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| adam-vojtech | SRC-33 | Report.cz | high | JSON-LD author: - ČTK - |
| adam-vojtech | SRC-36 | Ústecký deník (Deník.cz) | high | JSON-LD author (@type Person): ČTK |
| adam-vojtech | SRC-37 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| alena-schillerova | SRC-02 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| alena-schillerova | SRC-08 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24" data-next-head=""/> |
| alena-schillerova | SRC-12 | Týden.cz | medium | agenturní značka: „(ČTK)" |
| alena-schillerova | SRC-27 | Blesk.cz | high | <meta name="author" content="Magdalena Škapová,ČTK"> |
| ales-juchelka | SRC-05 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| ales-juchelka | SRC-06 | Blesk.cz | high | <meta name="author" content="ČTK,Jaroslav Šimáček"> |
| ales-juchelka | SRC-19 | Česká televize (ČT24) | medium | patička: „Zdroj: ČT24 , ČTK" |
| ales-juchelka | SRC-24 | Deník N | medium | agenturní značka: „(ČTK)" |
| ales-juchelka | SRC-25 | Deník N | medium | agenturní značka: „(ČTK)" |
| andrej-babis | SRC-01 | Česká justice | high | <meta name="author" content="ČTK" /> |
| andrej-babis | SRC-02 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, Jolana Vašinová" data-next-head=""/> |
| andrej-babis | SRC-03 | Česká justice | medium | odkaz na autorský rozcestník /ctk/ |
| andrej-babis | SRC-04 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, Klára Ješinová" data-next-head=""/> |
| andrej-babis | SRC-05 | Česká justice | high | <meta name="author" content="ČTK" /> |
| andrej-babis | SRC-07 | Česká justice | high | <meta name="author" content="ČTK" /> |
| andrej-babis | SRC-20 | Transparency International ČR | medium | patička: „Zdroj: ČTK" |
| andrej-babis | SRC-28 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| andrej-babis | SRC-29 | Seznam Zprávy | high | JSON-LD author (@type Person): ČTK |
| andrej-babis | SRC-34 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| andrej-babis | SRC-35 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| andrej-babis | SRC-41 | ČT24 (Česká televize) | medium | podpis: „1. 6. 2023 ‌ ‌ \| Zdroj: ČTK , iROZHLAS.cz" |
| andrej-babis | SRC-42 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| andrej-babis | SRC-43 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| andrej-babis | SRC-45 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| andrej-babis | SRC-48 | ČT24 (Česká televize) | medium | podpis: „8. 7. 2024 ‌ ‌ \| Zdroj: ČT24 , ČTK" |
| andrej-babis | SRC-50 | Aktuálně.cz | high | JSON-LD author (@type Person): ČTK |
| andrej-babis | SRC-52 | ČT24 (Česká televize) | medium | podpis: „2. 2. 2022 ‌ ‌ \| Zdroj: ČT24 , ČTK" |
| andrej-babis | SRC-53 | ČT24 (Česká televize) | medium | podpis: „4. 1. 2022 ‌ ‌ \| Zdroj: ČTK" |
| andrej-babis | SRC-55 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| andrej-babis | SRC-57 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| andrej-babis | SRC-58 | ČT24 (Česká televize) | medium | patička: „Zdroj: ČTK , ČT24" |
| andrej-babis | SRC-59 | Seznam Zprávy | high | JSON-LD author (@type Person): ČTK |
| andrej-babis | SRC-60 | ČT24 (Česká televize) | medium | patička: „Zdroj: ČT24/ČT24, ČTK" |
| andrej-babis | SRC-61 | Novinky.cz | high | JSON-LD author (@type Person): ČTK |
| andrej-babis | SRC-64 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| andrej-babis | SRC-69 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, Kristina Nováková" data-next-head=""/> |
| andrej-babis | SRC-71 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| andrej-babis | SRC-73 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| boris-stastny | SRC-07 | Blesk.cz | medium | podpis: „Zdroj: ČTK / Blesk Zprávy" |
| boris-stastny | SRC-15 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| boris-stastny | SRC-19 | Zdravotnický deník | high | <meta name="author" content="ČTK" /> |
| igor-cerveny | SRC-02 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| igor-cerveny | SRC-04 | Ekolist.cz (ČTK) | high | <meta name="author" content="ČTK"> |
| igor-cerveny | SRC-05 | Blesk.cz | medium | podpis: „Zdroj: Blesk Zprávy / ČTK" |
| igor-cerveny | SRC-06 | Ekolist.cz (ČTK) | high | <meta name="author" content="ČTK"> |
| igor-cerveny | SRC-07 | Blesk.cz | medium | podpis: „Zdroj: čtk/blesk" |
| igor-cerveny | SRC-09 | Blesk.cz | medium | podpis: „Zdroj: ČTK / Blesk Zprávy" |
| igor-cerveny | SRC-12 | Seznam Zprávy | high | JSON-LD author (@type Person): ČTK |
| igor-cerveny | SRC-13 | FORUM 24 | high | JSON-LD author (@type Person): ČTK |
| igor-cerveny | SRC-14 | EnviWeb (přebírá ČTK) | medium | patička (odděleným elementem): „Zdroj: ČTK" |
| igor-cerveny | SRC-15 | CNN Prima News | high | JSON-LD author (@type Person): ČTK |
| igor-cerveny | SRC-19 | Ekolist.cz (ČTK) | high | <meta name="author" content="ČTK"> |
| igor-cerveny | SRC-27 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| igor-cerveny | SRC-29 | Seznam Zprávy | high | JSON-LD author (@type Person): ČTK |
| igor-cerveny | SRC-32 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| igor-cerveny | SRC-34 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| igor-cerveny | SRC-38 | Seznam Zprávy | high | JSON-LD author (@type Person): ČTK |
| ivan-bednarik | SRC-13 | ČT24 (Česká televize) | medium | patička: „Zdroj: ČT24 , ČTK" |
| ivan-bednarik | SRC-19 | Aktuálně.cz | high | JSON-LD author (@type Person): ČTK |
| ivan-bednarik | SRC-21 | Newstream | high | JSON-LD author (@type Person): ČTK, duk |
| ivan-bednarik | SRC-22 | eLogistika.info | medium | patička: „Zdroj: ČTK" |
| ivan-bednarik | SRC-29 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| ivan-bednarik | SRC-33 | Kolínský deník (Deník.cz) | high | JSON-LD author (@type Person): ČTK |
| jaromir-zuna | SRC-05 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24, Jáchym Novotný, Adam Vrubel" data-next-head=""/> |
| jaromir-zuna | SRC-07 | CNN Prima News | high | JSON-LD author (@type Person): ČTK |
| jaromir-zuna | SRC-08 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| jaromir-zuna | SRC-10 | Blesk.cz | high | <meta name="author" content="ČTK,eis"> |
| jaromir-zuna | SRC-11 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| jaromir-zuna | SRC-12 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| jaromir-zuna | SRC-13 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| jaromir-zuna | SRC-17 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| jaromir-zuna | SRC-19 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| jaromir-zuna | SRC-29 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| jaromir-zuna | SRC-37 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24" data-next-head=""/> |
| jaroslav-faltynek | SRC-02 | Hospodářské noviny | high | <meta name="author" content="ČTK"> |
| jaroslav-faltynek | SRC-03 | Echo24 | high | <meta name="author" content="čtk" /> |
| jaroslav-faltynek | SRC-04 | ČT24 (Česká televize) | medium | patička: „Zdroj: ČT24 , ČTK , Právo" |
| jaroslav-faltynek | SRC-06 | Info.cz | high | JSON-LD author (@type Person): ČTK |
| jaroslav-faltynek | SRC-07 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24" data-next-head=""/> |
| jaroslav-faltynek | SRC-08 | ČT24 (Česká televize) | medium | patička: „Zdroj: ČTK , ČT24" |
| jaroslav-faltynek | SRC-09 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| jeronym-tejc | SRC-05 | Blesk.cz | high | <meta name="author" content="ČTK,Maxmilián Nový"> |
| jeronym-tejc | SRC-06 | Česká justice | medium | odkaz na autorský rozcestník /ctk/ |
| jeronym-tejc | SRC-07 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| jeronym-tejc | SRC-10 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24, Vítězslav Komenda" data-next-head=""/> |
| jeronym-tejc | SRC-11 | Česká justice | medium | odkaz na autorský rozcestník /ctk/ |
| jeronym-tejc | SRC-12 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| jeronym-tejc | SRC-14 | Česká justice | high | <meta name="author" content="ČTK" /> |
| jeronym-tejc | SRC-16 | CNN Prima News | high | JSON-LD author (@type Organization): ČTK / Šulová Kateřina |
| jeronym-tejc | SRC-23 | Česká justice | high | <meta name="author" content="ČTK" /> |
| jeronym-tejc | SRC-25 | Česká justice | medium | odkaz na autorský rozcestník /ctk/ |
| jeronym-tejc | SRC-26 | Česká justice | high | <meta name="author" content="ČTK" /> |
| karel-havlicek | SRC-02 | FORUM 24 | high | JSON-LD author (@type Person): ČTK |
| karel-havlicek | SRC-09 | FORUM 24 | medium | agenturní značka: „/ČTK/" |
| karel-havlicek | SRC-14 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| karel-havlicek | SRC-15 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| karel-havlicek | SRC-16 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| karel-havlicek | SRC-18 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| karel-havlicek | SRC-19 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| karel-havlicek | SRC-21 | TZB-info | high | JSON-LD author (@type Person): ČTK, redakce |
| karel-havlicek | SRC-22 | Právní prostor | high | JSON-LD author (@type Person): ČTK |
| karel-havlicek | SRC-23 | FORUM 24 | high | JSON-LD author (@type Person): ČTK |
| karel-havlicek | SRC-32 | CNN Prima News | high | JSON-LD author (@type Person): ČTK |
| lubomir-metnar | SRC-01 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| lubomir-metnar | SRC-06 | Blesk.cz | high | <meta name="author" content="Magdalena Škapová,ČTK"> |
| lubomir-metnar | SRC-07 | Hospodářské noviny | high | <meta name="author" content="ČTK"> |
| macinka-turek | SRC-02 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| macinka-turek | SRC-19 | Blesk.cz | high | <meta name="author" content="Zpravodajové Blesku,ČTK"> |
| macinka-turek | SRC-20 | Česká justice | medium | odkaz na autorský rozcestník /ctk/ |
| macinka-turek | SRC-21 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| macinka-turek | SRC-28 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| macinka-turek | SRC-30 | HN.cz (Hospodářské noviny) | high | <meta name="author" content="ČTK"> |
| macinka-turek | SRC-31 | ČT24 (Česká televize) | medium | podpis: „12. 5. 2026 ‌ ‌ \| Zdroj: ČT24 , ČTK , Page not found" |
| macinka-turek | SRC-32 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| macinka-turek | SRC-33 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| macinka-turek | SRC-38 | Blesk.cz | high | <meta name="author" content="Jaroslav Šimáček,ČTK"> |
| macinka-turek | SRC-42 | CNN Prima News | high | JSON-LD author (@type Organization): ČTK, Profimedia.cz |
| macinka-turek | SRC-45 | HN.cz (Hospodářské noviny) | high | <meta name="author" content="ČTK"> |
| macinka-turek | SRC-48 | Aktuálně.cz | high | <meta content="ČTK" name="author" /> |
| macinka-turek | SRC-51 | Blesk.cz | high | <meta name="author" content="Zpravodajové Blesku,ČTK"> |
| macinka-turek | SRC-54 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| macinka-turek | SRC-58 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, Milan Gerčák" data-next-head=""/> |
| macinka-turek | SRC-59 | ČT24 (Česká televize) | medium | patička: „Zdroj: ČT24 , ČTK" |
| martin-sebestyan | SRC-05 | iROZHLAS.cz (Český rozhlas) | high | JSON-LD author (@type Person): ČTK |
| martin-sebestyan | SRC-07 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, Lukáš Smrkovský" data-next-head=""/> |
| martin-sebestyan | SRC-12 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24" data-next-head=""/> |
| martin-sebestyan | SRC-20 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, Tamara Kejlová, Kristýna Kosmannová" data-next-head=""/> |
| martin-sebestyan | SRC-22 | Hrot24.cz | medium | sigla-podpis: „čtk" |
| martin-sebestyan | SRC-36 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| oto-klempir | SRC-08 | Pražský deník | high | JSON-LD author (@type Person): ČTK |
| oto-klempir | SRC-11 | Blesk.cz | high | <meta name="author" content="simao,ČTK"> |
| oto-klempir | SRC-13 | FORUM 24 | high | JSON-LD author (@type Person): ČTK |
| oto-klempir | SRC-14 | Aktuálně.cz | high | <meta content="ČTK" name="author" /> |
| oto-klempir | SRC-15 | ČT24 (Česká televize) | medium | podpis: „30. 1. 2026 ‌ ‌ \| Zdroj: ČT24 , ČTK" |
| oto-klempir | SRC-17 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| oto-klempir | SRC-18 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| oto-klempir | SRC-19 | Echo24 | medium | odkaz na autorský rozcestník /ctk/ |
| oto-klempir | SRC-21 | ČT24 (Česká televize) | medium | podpis: „26. 4. 2026 ‌ ‌ \| Zdroj: ČT24 , ČTK" |
| oto-klempir | SRC-24 | Opera PLUS | medium | odkaz na autorský rozcestník /ctk/ |
| petr-pavel | SRC-02 | HN.cz (Hospodářské noviny) | high | <meta name="author" content="ČTK"> |
| petr-pavel | SRC-03 | Blesk.cz | high | <meta name="author" content="Zpravodajové Blesku,ČTK"> |
| richard-chlad | SRC-02 | CNN Prima News | high | JSON-LD author (@type Organization): ČTK, Profimedia.cz |
| robert-plaga | SRC-03 | Blesk.cz | high | <meta name="author" content="ČTK,Zpravodajové Blesku"> |
| robert-plaga | SRC-07 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| robert-plaga | SRC-09 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| robert-plaga | SRC-15 | ČT24 (Česká televize) | medium | podpis: „24. 7. 2026 ‌ ‌ \| Zdroj: ČT24 , ČTK , EDUin , MŠMT" |
| robert-plaga | SRC-18 | Česká justice | high | <meta name="author" content="ČTK" /> |
| robert-plaga | SRC-20 | Učitelské noviny | medium | agenturní značka: „(čtk)" |
| tomio-okamura | SRC-01 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| tomio-okamura | SRC-02 | Česká justice | medium | odkaz na autorský rozcestník /ctk/ |
| tomio-okamura | SRC-05 | Reflex | high | JSON-LD author (@type Person): ČTK |
| tomio-okamura | SRC-08 | Hospodářské noviny | high | <meta name="author" content="ČTK"> |
| tomio-okamura | SRC-10 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| tomio-okamura | SRC-11 | CNN Prima News | high | JSON-LD author (@type Person): ČTK |
| tomio-okamura | SRC-12 | Týden.cz | medium | agenturní značka: „(ČTK)" |
| tomio-okamura | SRC-13 | FORUM 24 | high | JSON-LD author (@type Person): ČTK |
| tomio-okamura | SRC-18 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24" data-next-head=""/> |
| tomio-okamura | SRC-19 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, Jáchym Novotný" data-next-head=""/> |
| tomio-okamura | SRC-20 | Romea.cz | medium | odkaz na autorský rozcestník /ctk/ |
| tomio-okamura | SRC-21 | Česká justice | medium | odkaz na autorský rozcestník /ctk/ |
| tomio-okamura | SRC-23 | ČeskéNoviny.cz (ČTK) | high | JSON-LD author (@type Organization): ČTK |
| tomio-okamura | SRC-27 | Hospodářské noviny | high | <meta name="author" content="ČTK"> |
| tunde-bartha | SRC-07 | ČT24 (Česká televize) | medium | patička: „Zdroj: ČTK/ČT24" |
| zuzana-mrazova | SRC-04 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK" data-next-head=""/> |
| zuzana-mrazova | SRC-05 | Blesk.cz | high | <meta name="author" content="ČTK"> |
| zuzana-mrazova | SRC-06 | ČT24 (Česká televize) | high | <meta name="author" content="ČTK, ČT24" data-next-head=""/> |
| zuzana-mrazova | SRC-14 | e15.cz | medium | podpis: „ČTK" |
| zuzana-mrazova | SRC-22 | Seznam Zprávy | high | JSON-LD author (@type Person): ČTK |
| zuzana-mrazova | SRC-23 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): ČTK |
| zuzana-mrazova | SRC-25 | FORUM 24 | high | JSON-LD author (@type Person): ČTK |

## Jiné navržené rodiny (0)

_(žádná)_

## Verdikt `own` — vlastní zpravodajství, rodina se nevyplňuje (187)

| Dossier | ID | Outlet | Jistota | Evidence |
|---|---|---|---|---|
| adam-vojtech | SRC-02 | Seznam Zprávy | high | JSON-LD author (@type Person): Jiří Pšenička |
| adam-vojtech | SRC-05 | Seznam Zprávy | high | JSON-LD author (@type Person): Radek Kedroň |
| adam-vojtech | SRC-06 | Aktuálně.cz | high | JSON-LD author (@type Person): Veronika Rodriguez |
| adam-vojtech | SRC-07 | Praha na dlani (přetisk anotace iROZHLAS.cz) | high | <meta name="Author" content="Praha Na Dlani"> |
| adam-vojtech | SRC-10 | Reflex | high | JSON-LD author (@type Person): Jiří Sezemský |
| adam-vojtech | SRC-12 | Echo24 | medium | podpis: „Ondřej Štindl" |
| adam-vojtech | SRC-17 | Olomoucký deník | high | JSON-LD author (@type Person): Daniela Tauberová |
| adam-vojtech | SRC-24 | Podnikatel.cz | high | <meta name="author" content="Daniel Morávek"> |
| adam-vojtech | SRC-27 | CNN Prima News | high | JSON-LD author (@type Person): Karolína Neubergerová |
| adam-vojtech | SRC-35 | Olomoucký deník | high | JSON-LD author (@type Person): Daniela Tauberová |
| adam-vojtech | SRC-38 | Deník N | high | JSON-LD author (@type Person): Barbora Němcová |
| adam-vojtech | SRC-39 | Aktuálně.cz | high | <meta content="Josef Veselka" name="author" /> |
| adam-vojtech | SRC-40 | Seznam Zprávy | high | JSON-LD author (@type Person): Jiří Pšenička |
| alena-schillerova | SRC-07 | Echo24 | high | <meta name="author" content="Jan Křovák" /> |
| alena-schillerova | SRC-10 | Echo24 | medium | podpis: „Ondřej Štindl" |
| alena-schillerova | SRC-11 | Echo24 | high | <meta name="author" content="Jan Křovák" /> |
| alena-schillerova | SRC-19 | Centrum veřejných financí (Univerzita Karlova) | high | <meta name="author" content="Aleš Bělohradský"/> |
| alena-schillerova | SRC-20 | Novinky.cz | high | JSON-LD author (@type Person): Jakub Svoboda |
| ales-juchelka | SRC-02 | FORUM 24 | high | JSON-LD author (@type Person): Mariana Balejová |
| ales-juchelka | SRC-03 | Seznam Zprávy | high | JSON-LD author (@type Person): Lukáš Valášek |
| ales-juchelka | SRC-04 | Seznam Zprávy | high | JSON-LD author (@type Person): Lukáš Valášek |
| ales-juchelka | SRC-09 | FORUM 24 | high | JSON-LD author (@type Person): Adam Opatrný |
| ales-juchelka | SRC-13 | FORUM 24 | high | JSON-LD author (@type Person): Petr Duchoslav |
| ales-juchelka | SRC-27 | Reflex | high | JSON-LD author (@type Person): Jiří Sezemský |
| ales-juchelka | SRC-28 | Praha na dlani (přetisk anotace iROZHLAS.cz) | high | <meta name="Author" content="Praha Na Dlani"> |
| andrej-babis | SRC-06 | Česká justice | high | <meta name="author" content="David Tramba" /> |
| andrej-babis | SRC-13 | Investigace.cz | high | <meta name="author" content="Zuzana Šotová" /> |
| andrej-babis | SRC-21 | ČT24 (Česká televize) | high | <meta name="author" content="Milan Gerčák" data-next-head=""/> |
| andrej-babis | SRC-25 | Ekonom | high | <meta name="author" content="Martin Mařík"> |
| andrej-babis | SRC-26 | FORUM 24 | high | JSON-LD author (@type Person): Adam Opatrný |
| andrej-babis | SRC-30 | Novinky.cz | high | JSON-LD author (@type Person): Jaroslav Soukup |
| andrej-babis | SRC-31 | Tiscali.cz | medium | odkaz na autorský rozcestník /lukas-jirovec/ |
| andrej-babis | SRC-40 | Podpůrný a garanční rolnický a lesnický fond (PGRLF) | medium | odkaz na autorský rozcestník /senfeldovapgrlf-cz/ |
| andrej-babis | SRC-44 | ČT24 (Česká televize) | high | <meta name="author" content="Milan Gerčák" data-next-head=""/> |
| andrej-babis | SRC-49 | Aktuálně.cz | high | JSON-LD author (@type Person): Jan Horák |
| andrej-babis | SRC-51 | Seznam Zprávy | high | JSON-LD author (@type Person): Radek Nohl |
| andrej-babis | SRC-56 | Aktuálně.cz | high | JSON-LD author (@type Person): Jakub Heller |
| andrej-babis | SRC-65 | Seznam Zprávy | high | JSON-LD author (@type Person): Jiří Kubík |
| andrej-babis | SRC-66 | FORUM 24 | high | JSON-LD author (@type Person): Johana Šafrová |
| andrej-babis | SRC-67 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): Jana Kodysová |
| andrej-babis | SRC-68 | Echo24 | medium | podpis: „Ondřej Štindl" |
| andrej-babis | SRC-70 | Transparency International ČR | high | <meta name="author" content="David Kotora" /> |
| andrej-babis | SRC-72 | Seznam Zprávy | high | JSON-LD author (@type Person): Lukáš Valášek |
| andrej-babis | SRC-76 | Seznam Zprávy | high | JSON-LD author (@type Person): Radek Nohl |
| boris-stastny | SRC-08 | Blesk.cz | high | JSON-LD author (@type Person): Tomáš Belica |
| boris-stastny | SRC-09 | FORUM 24 | high | JSON-LD author (@type Person): Jan Pánik |
| boris-stastny | SRC-10 | FORUM 24 | high | JSON-LD author (@type Person): Karolína Němcová |
| boris-stastny | SRC-16 | NašeTéma.cz | high | JSON-LD author: Petr Ševčík |
| boris-stastny | SRC-17 | Tiscali.cz | medium | odkaz na autorský rozcestník /lukas-jirovec/ |
| boris-stastny | SRC-18 | FORUM 24 | high | JSON-LD author (@type Person): Karolína Němcová |
| boris-stastny | SRC-22 | Seznam Zprávy | high | JSON-LD author (@type Person): Kristina Ciroková |
| igor-cerveny | SRC-03 | Seznam Zprávy | high | JSON-LD author (@type Person): Seznam Zprávy |
| igor-cerveny | SRC-08 | Blesk.cz | high | JSON-LD author (@type Person): Markéta Batulková Mikešová |
| igor-cerveny | SRC-10 | Blesk.cz | high | <meta name="author" content="Anna Johnová"> |
| igor-cerveny | SRC-16 | Deník N | high | <meta name="author" content="Karolína Blažková"> |
| igor-cerveny | SRC-20 | Deník N | high | <meta name="author" content="Zdislava Pokorná"> |
| igor-cerveny | SRC-21 | Deník N | high | <meta name="author" content="Zdislava Pokorná"> |
| igor-cerveny | SRC-22 | FORUM 24 | high | JSON-LD author (@type Person): Martin Skýpala |
| igor-cerveny | SRC-24 | Novinky.cz | high | JSON-LD author (@type Person): Karolina Brodníčková |
| igor-cerveny | SRC-25 | Novinky.cz | high | JSON-LD author (@type Person): Petr Svorník |
| igor-cerveny | SRC-28 | Seznam Zprávy | high | JSON-LD author (@type Person): Lucie Stuchlíková |
| igor-cerveny | SRC-30 | Respekt | high | JSON-LD author (@type Person): Magdaléna Fajtová |
| igor-cerveny | SRC-31 | Ekonews | high | <meta name="author" content="Martina Patočková"> |
| igor-cerveny | SRC-35 | Refresher.cz | high | JSON-LD author (@type Person): Michal Drahný |
| igor-cerveny | SRC-39 | NašeTéma.cz | high | JSON-LD author: Milan Polák |
| ivan-bednarik | SRC-02 | Ekonomický deník | high | <meta name="author" content="Jana Bartošová" /> |
| ivan-bednarik | SRC-03 | Ekonomický deník | high | <meta name="author" content="Tereza Čapková" /> |
| ivan-bednarik | SRC-04 | Echo24 | high | <meta name="author" content="Jan Křovák" /> |
| ivan-bednarik | SRC-10 | Echo24 | high | <meta name="author" content="Viktor Horák" /> |
| ivan-bednarik | SRC-15 | Transport a logistika | high | <meta name="author" content="Luděk Kortus" /> |
| ivan-bednarik | SRC-17 | Seznam Zprávy | high | JSON-LD author (@type Person): Jan Richter |
| ivan-bednarik | SRC-20 | e15.cz | high | JSON-LD author (@type Person): Jan Novotný |
| ivan-bednarik | SRC-24 | Ekonomický deník | high | <meta name="author" content="Tereza Čapková" /> |
| ivan-bednarik | SRC-25 | ČT24 (Česká televize) | high | <meta name="author" content="Vítězslav Komenda" data-next-head=""/> |
| ivan-bednarik | SRC-28 | ACRI — Asociace podniků českého železničního průmyslu | high | <meta name="author" content="Tomáš Johánek" /> |
| ivan-bednarik | SRC-30 | Ekonomický deník | high | <meta name="author" content="Tereza Čapková" /> |
| ivan-bednarik | SRC-31 | AutoRevue.cz | high | <meta name="author" content="Richard Herbich" > |
| ivan-bednarik | SRC-32 | Zdopravy.cz | high | <meta name="author" content="Jan Šindelář" /> |
| ivan-bednarik | SRC-34 | e15.cz | medium | podpis: „Jiří Liebreich" |
| jaromir-zuna | SRC-02 | e15.cz | medium | podpis: „Viliam Buchert" |
| jaromir-zuna | SRC-06 | TN.cz (TV Nova) | high | JSON-LD author (@type Person): Tomáš Vašek |
| jaromir-zuna | SRC-09 | Echo24 | medium | podpis: „Ondřej Štindl" |
| jaromir-zuna | SRC-15 | CZDEFENCE | high | JSON-LD author (@type Person): Tomáš Kolařík |
| jaromir-zuna | SRC-16 | ČT24 (Česká televize) | high | <meta name="author" content="Petr Vašek" data-next-head=""/> |
| jaromir-zuna | SRC-18 | e15.cz | medium | podpis: „Pavel Otto" |
| jaromir-zuna | SRC-22 | CZDEFENCE | high | JSON-LD author (@type Person): Katarina Přikrylová |
| jaromir-zuna | SRC-23 | Ekonomický deník | high | <meta name="author" content="Jan Hrbáček" /> |
| jaromir-zuna | SRC-24 | CNN Prima News | high | JSON-LD author (@type Person): Lukáš Cigánek |
| jaromir-zuna | SRC-25 | Security magazín | high | JSON-LD author (@type Person): Jakub Samek |
| jaromir-zuna | SRC-30 | Ekonomický deník | high | <meta name="author" content="Jan Hrbáček" /> |
| jaromir-zuna | SRC-32 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): Jiří Vojáček |
| jaromir-zuna | SRC-35 | Aktuálně.cz | high | <meta content="Ondřej Stratilík" name="author" /> |
| jaroslav-faltynek | SRC-05 | Novinky.cz | high | JSON-LD author (@type Person): Jakub Bartosz |
| jeronym-tejc | SRC-08 | Česká justice | high | <meta name="author" content="Eva Paseková" /> |
| jeronym-tejc | SRC-09 | Deník N | high | JSON-LD author (@type Person): Jana Doležalová |
| jeronym-tejc | SRC-15 | Reflex | high | JSON-LD author (@type Person): Barbora Prchalová |
| jeronym-tejc | SRC-19 | Česká justice | high | <meta name="author" content="Eva Paseková" /> |
| jeronym-tejc | SRC-20 | Echo24 | high | <meta name="author" content="Dominik Stein" /> |
| jeronym-tejc | SRC-28 | Česká justice | high | <meta name="author" content="Eva Paseková" /> |
| karel-havlicek | SRC-03 | FORUM 24 | high | JSON-LD author (@type Person): Jiří Sezemský |
| karel-havlicek | SRC-04 | FORUM 24 | high | JSON-LD author (@type Person): Jiří Sezemský |
| karel-havlicek | SRC-05 | FORUM 24 | high | JSON-LD author (@type Person): Marek Wollner |
| karel-havlicek | SRC-06 | Seznam Zprávy | high | JSON-LD author (@type Person): Martina Spěváčková |
| karel-havlicek | SRC-07 | Česká justice | high | <meta name="author" content="Alžběta Vejvodová" /> |
| karel-havlicek | SRC-08 | Česká justice | high | <meta name="author" content="Alžběta Vejvodová" /> |
| karel-havlicek | SRC-10 | Ekonomický deník | high | <meta name="author" content="Tereza Čapková" /> |
| karel-havlicek | SRC-13 | Pražský deník | high | JSON-LD author (@type Person): Milan Holakovský |
| karel-havlicek | SRC-20 | Pražský deník | high | JSON-LD author (@type Person): Denisa Novotná |
| karel-havlicek | SRC-25 | Česká justice | high | <meta name="author" content="Alžběta Vejvodová" /> |
| karel-havlicek | SRC-34 | Seznam Zprávy | high | JSON-LD author (@type Person): Vojtěch Blažek |
| karel-havlicek | SRC-35 | Hospodářské noviny | high | <meta name="author" content="Martin Ťopek"> |
| macinka-turek | SRC-01 | Echo24 | high | <meta name="author" content="Jan Křovák" /> |
| macinka-turek | SRC-03 | Info.cz | high | JSON-LD author (@type Person): Martin Schmarcz |
| macinka-turek | SRC-04 | Blesk.cz | high | <meta name="author" content="Vojtěch Jandera"> |
| macinka-turek | SRC-05 | ČT24 (Česká televize) | high | <meta name="author" content="Tereza Kořénková" data-next-head=""/> |
| macinka-turek | SRC-09 | HlídacíPes.org | high | <meta name="author" content="Aleš Rozehnal" /> |
| macinka-turek | SRC-10 | Život v Česku | high | JSON-LD author (@type Person): Rudolf Šindelář |
| macinka-turek | SRC-11 | Seznam Zprávy | high | JSON-LD author (@type Person): Barbora Kučerová |
| macinka-turek | SRC-12 | iROZHLAS.cz (Český rozhlas) | high | JSON-LD author (@type Person): Zdeňka Trachtová |
| macinka-turek | SRC-13 | Aktuálně.cz | high | JSON-LD author (@type Person): Viet Tran |
| macinka-turek | SRC-16 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): Karolína Stárková |
| macinka-turek | SRC-17 | Investigace.cz | high | <meta name="author" content="Barbora Šturmová" /> |
| macinka-turek | SRC-18 | Seznam Zprávy | high | JSON-LD author (@type Person): Radek Nohl |
| macinka-turek | SRC-22 | Seznam Zprávy | high | JSON-LD author (@type Person): Matěj Nejedlý |
| macinka-turek | SRC-34 | Manipulátoři.cz | medium | podpis: „Jan Cemper" |
| macinka-turek | SRC-36 | Aktuálně.cz | high | JSON-LD author (@type Person): Viet Tran |
| macinka-turek | SRC-37 | Neovlivní.cz | medium | odkaz na autorský rozcestník /sabina-slonkova/ |
| macinka-turek | SRC-39 | Seznam Zprávy | high | JSON-LD author (@type Person): Matěj Nejedlý |
| macinka-turek | SRC-43 | Aktuálně.cz | high | <meta content="Ondřej Stratilík" name="author" /> |
| macinka-turek | SRC-53 | ČT24 (Česká televize) | high | <meta name="author" content="Alžběta Mubeenová" data-next-head=""/> |
| macinka-turek | SRC-56 | Romea.cz | high | <meta name="author" content="Zdeněk Ryšavý"/> |
| macinka-turek | SRC-60 | Deník N | high | <meta name="author" content="Zdislava Pokorná"> |
| macinka-turek | SRC-61 | Deník N | high | <meta name="author" content="Zdislava Pokorná"> |
| martin-sebestyan | SRC-02 | HlídacíPes.org | high | <meta name="author" content="Aleš Rozehnal" /> |
| martin-sebestyan | SRC-03 | Transparency International ČR | high | <meta name="author" content="David Kotora" /> |
| martin-sebestyan | SRC-17 | Transparency International ČR | high | <meta name="author" content="David Kotora" /> |
| martin-sebestyan | SRC-18 | FORUM 24 | high | JSON-LD author (@type Person): Dan David Rafael |
| martin-sebestyan | SRC-19 | Ekonomický deník | high | <meta name="author" content="Tereza Čapková" /> |
| martin-sebestyan | SRC-27 | Deník N | high | <meta name="author" content="Zdislava Pokorná"> |
| martin-sebestyan | SRC-29 | Seznam Zprávy | high | JSON-LD author (@type Person): Lukáš Valášek |
| martin-sebestyan | SRC-30 | Seznam Zprávy | high | JSON-LD author (@type Person): Lukáš Valášek |
| martin-sebestyan | SRC-31 | Seznam Zprávy | high | JSON-LD author (@type Person): Lukáš Valášek |
| martin-sebestyan | SRC-37 | Česká justice | high | <meta name="author" content="Martin Drtina" /> |
| oto-klempir | SRC-02 | Respekt | high | JSON-LD author (@type Person): František Trojan |
| oto-klempir | SRC-05 | HlídacíPes.org | high | <meta name="author" content="Robert Břešťan" /> |
| oto-klempir | SRC-07 | Médiář | high | JSON-LD author: Jan Potůček |
| oto-klempir | SRC-10 | Deník Alarm | high | JSON-LD author: Karel Veselý |
| oto-klempir | SRC-12 | FORUM 24 | high | JSON-LD author (@type Person): Petr Hlaváček |
| oto-klempir | SRC-20 | Médiář | high | JSON-LD author: Ondřej Aust |
| oto-klempir | SRC-28 | Novinky.cz | high | JSON-LD author (@type Person): Jaroslav Soukup |
| oto-klempir | SRC-30 | Deník N | high | JSON-LD author (@type Person): Tomáš Linhart |
| petr-vencalek | SRC-01 | Investigace.cz | high | <meta name="author" content="Barbora Šturmová" /> |
| petr-vencalek | SRC-04 | Seznam Zprávy | high | JSON-LD author (@type Person): Seznam Zprávy |
| richard-chlad | SRC-03 | Aktuálně.cz | high | <meta content="Ondřej Stratilík" name="author" /> |
| robert-plaga | SRC-04 | Heroine.cz | medium | podpis: „Tereza Semotamová" |
| robert-plaga | SRC-08 | Lupa.cz | high | <meta name="author" content="David Slížek"> |
| robert-plaga | SRC-10 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): Jiří Janda |
| robert-plaga | SRC-11 | MŠMT (edu.gov.cz) | high | <meta name="author" content="Tomáš Zahradníček" /> |
| robert-plaga | SRC-12 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): Kamila Minaříková |
| robert-plaga | SRC-17 | CNN Prima News | high | JSON-LD author (@type Person): Renáta Bohuslavová |
| robert-plaga | SRC-21 | Seznam Zprávy | high | JSON-LD author (@type Person): Rozálie Hněvkovská |
| robert-plaga | SRC-26 | Seznam Zprávy | high | JSON-LD author (@type Person): Josef Mačí |
| robert-plaga | SRC-27 | Novinky.cz | high | JSON-LD author (@type Person): Marie Kuželová |
| robert-plaga | SRC-29 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): Kamila Minaříková |
| robert-plaga | SRC-35 | Deník N | high | <meta name="author" content="Markéta Boubínová"> |
| tomio-okamura | SRC-09 | Deník Referendum | high | <meta property="article:author" content="Vojtěch Petrů"> |
| tomio-okamura | SRC-14 | Respekt | medium | odkaz na autorský rozcestník /tomas-lindner/ |
| tomio-okamura | SRC-25 | Reflex | high | JSON-LD author (@type Person): Aleš Michal |
| tomio-okamura | SRC-26 | Respekt | medium | odkaz na autorský rozcestník /tomas-lindner/ |
| tunde-bartha | SRC-02 | Echo24 | medium | podpis: „Ondřej Štindl" |
| tunde-bartha | SRC-08 | HlídacíPes.org | high | <meta name="author" content="Vojtěch Berger" /> |
| tunde-bartha | SRC-10 | Echo24 | medium | podpis: „Ondřej Štindl" |
| tunde-bartha | SRC-11 | Novinky.cz | high | JSON-LD author (@type Person): Kristýna Šopfová |
| zuzana-mrazova | SRC-02 | Seznam Zprávy | high | JSON-LD author (@type Person): Christine Havranová |
| zuzana-mrazova | SRC-03 | Deník N | high | JSON-LD author (@type Person): Kateřina Libovická |
| zuzana-mrazova | SRC-07 | ČT24 (Česká televize) | high | <meta name="author" content="Martin Šnajdr" data-next-head=""/> |
| zuzana-mrazova | SRC-08 | FORUM 24 | high | JSON-LD author (@type Person): Karolína Němcová |
| zuzana-mrazova | SRC-09 | FORUM 24 | high | JSON-LD author (@type Person): Marek Wollner |
| zuzana-mrazova | SRC-10 | FORUM 24 | high | JSON-LD author (@type Person): Adam Opatrný |
| zuzana-mrazova | SRC-11 | FORUM 24 | high | JSON-LD author (@type Person): Dan David Rafael |
| zuzana-mrazova | SRC-12 | Tiscali.cz | medium | odkaz na autorský rozcestník /lukas-jirovec/ |
| zuzana-mrazova | SRC-15 | Seznam Zprávy | high | JSON-LD author (@type Person): Adéla Jelínková |
| zuzana-mrazova | SRC-16 | Deník.cz (VLTAVA LABE MEDIA) | high | JSON-LD author (@type Person): Petr Málek |
| zuzana-mrazova | SRC-17 | Novinky.cz | high | JSON-LD author (@type Person): Michael Polák |
| zuzana-mrazova | SRC-27 | Deník N | high | JSON-LD author (@type Person): Václav Ferebauer |
| zuzana-mrazova | SRC-32 | Ekonomický deník | high | <meta name="author" content="Alžběta Vejvodová" /> |
| zuzana-mrazova | SRC-34 | Česká justice | high | <meta name="author" content="Alžběta Vejvodová" /> |

## Verdikt `unknown` — nezjištěno, rodina se nevyplňuje (108)

| Dossier | ID | Outlet | HTTP | Důvod |
|---|---|---|---|---|
| adam-vojtech | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| adam-vojtech | SRC-15 | Hanácká Drbna | 200 | credits-inconclusive |
| adam-vojtech | SRC-22 | Zdravé zprávy | 200 | credits-inconclusive |
| adam-vojtech | SRC-23 | Zdravé zprávy | 404 | fetch-failed: HTTP 404 |
| adam-vojtech | SRC-30 | Zdravé zprávy | 200 | credits-inconclusive |
| adam-vojtech | SRC-34 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| adam-vojtech | SRC-41 | Fakultní nemocnice Olomouc (oficiální web) | 200 | credits-inconclusive |
| adam-vojtech | SRC-42 | Fakultní nemocnice Olomouc (oficiální web) | 200 | credits-inconclusive |
| alena-schillerova | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| alena-schillerova | SRC-13 | Ministerstvo financí ČR | 200 | no-credit |
| alena-schillerova | SRC-14 | Ministerstvo financí ČR | 200 | credits-inconclusive |
| alena-schillerova | SRC-15 | Ministerstvo financí ČR | 200 | no-credit |
| alena-schillerova | SRC-16 | Národní rozpočtová rada | 200 | credits-inconclusive |
| alena-schillerova | SRC-17 | Národní rozpočtová rada | 200 | credits-inconclusive |
| alena-schillerova | SRC-18 | Národní rozpočtová rada | 200 | credits-inconclusive |
| alena-schillerova | SRC-21 | iportal24.cz | 200 | credits-inconclusive |
| alena-schillerova | SRC-24 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| alena-schillerova | SRC-28 | ČT24 (Česká televize) | 200 | credits-inconclusive |
| ales-juchelka | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| ales-juchelka | SRC-29 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| andrej-babis | SRC-14 | Úřad vlády ČR (vlada.gov.cz) | 200 | no-credit |
| andrej-babis | SRC-18 | Evropský parlament | 200 | no-credit |
| andrej-babis | SRC-36 | Ministerstvo průmyslu a obchodu (MPO) | 200 | no-credit |
| andrej-babis | SRC-54 | Aktuálně.cz | 200 | credits-inconclusive |
| andrej-babis | SRC-75 | Vrchní soud v Praze | 200 | no-credit |
| boris-stastny | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| boris-stastny | SRC-14 | iROZHLAS.cz (Český rozhlas) | 200 | credits-inconclusive |
| boris-stastny | SRC-20 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| boris-stastny | SRC-21 | iROZHLAS.cz (Český rozhlas) | 200 | credits-inconclusive |
| igor-cerveny | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| igor-cerveny | SRC-18 | Ministerstvo životního prostředí ČR | 200 | credits-inconclusive |
| igor-cerveny | SRC-33 | Extra.cz | 400 | fetch-failed: HTTP 400 |
| igor-cerveny | SRC-37 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| igor-cerveny | SRC-40 | Ministerstvo životního prostředí ČR | 200 | credits-inconclusive |
| ivan-bednarik | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| ivan-bednarik | SRC-05 | silnice-zeleznice.cz | 200 | no-credit |
| ivan-bednarik | SRC-06 | Hospodářské noviny | 200 | credits-inconclusive |
| ivan-bednarik | SRC-07 | Ministerstvo dopravy ČR | 200 | credits-inconclusive |
| ivan-bednarik | SRC-08 | Dopravní noviny | 200 | no-credit |
| ivan-bednarik | SRC-09 | Ministerstvo dopravy ČR | 200 | credits-inconclusive |
| ivan-bednarik | SRC-11 | Česká infrastruktura | 200 | credits-inconclusive |
| ivan-bednarik | SRC-12 | RAILTARGET | 200 | no-credit |
| ivan-bednarik | SRC-14 | Ministerstvo dopravy ČR | 200 | credits-inconclusive |
| ivan-bednarik | SRC-16 | Deník VEKTOR | 200 | no-credit |
| ivan-bednarik | SRC-18 | Transport Minutes | 200 | credits-inconclusive |
| ivan-bednarik | SRC-23 | Ministerstvo dopravy ČR | 200 | credits-inconclusive |
| ivan-bednarik | SRC-27 | MHD86 | 200 | credits-inconclusive |
| jaromir-zuna | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| jaromir-zuna | SRC-20 | Vláda České republiky (vlada.gov.cz) | 200 | credits-inconclusive |
| jaromir-zuna | SRC-34 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| jaroslav-faltynek | SRC-01 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| jeronym-tejc | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| jeronym-tejc | SRC-13 | Česká justice | 200 | credits-inconclusive |
| jeronym-tejc | SRC-17 | Ministerstvo spravedlnosti ČR | 200 | no-credit |
| jeronym-tejc | SRC-21 | Ústavní soud ČR | 200 | no-credit |
| jeronym-tejc | SRC-27 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| karel-havlicek | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| karel-havlicek | SRC-11 | Ministerstvo průmyslu a obchodu (MPO) | 200 | no-credit |
| karel-havlicek | SRC-12 | Průmyslová automatizace | — | fetch-failed: fetch failed |
| karel-havlicek | SRC-17 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| karel-havlicek | SRC-24 | ČKAIT (Česká komora autorizovaných inženýrů a techniků) | 200 | no-credit |
| karel-havlicek | SRC-26 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| karel-havlicek | SRC-27 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| karel-havlicek | SRC-29 | Kurzy.cz | 200 | credits-inconclusive |
| karel-havlicek | SRC-30 | EV Magazín | 200 | credits-inconclusive |
| karel-havlicek | SRC-31 | Hospodářské noviny | 200 | credits-inconclusive |
| karel-havlicek | SRC-33 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| karel-havlicek | SRC-36 | Ústavní soud ČR | 200 | no-credit |
| lubomir-metnar | SRC-09 | Nejvyšší kontrolní úřad (nku.cz) | 200 | credits-inconclusive |
| macinka-turek | SRC-08 | iROZHLAS.cz (Český rozhlas) | 403 | fetch-failed: HTTP 403 |
| macinka-turek | SRC-29 | Blesk.cz | 200 | credits-inconclusive |
| macinka-turek | SRC-35 | FORUM 24 | 200 | credits-inconclusive |
| macinka-turek | SRC-40 | Motoristé sobě (motoristesobe.cz/udhpsh) | 200 | no-credit |
| macinka-turek | SRC-50 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| macinka-turek | SRC-55 | ARES — Administrativní registr ekonomických subjektů (Ministerstvo financí ČR) | 200 | no-credit |
| macinka-turek | SRC-57 | YouControl | 403 | fetch-failed: HTTP 403 |
| martin-sebestyan | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| martin-sebestyan | SRC-04 | iROZHLAS.cz (Český rozhlas) | 403 | fetch-failed: HTTP 403 |
| martin-sebestyan | SRC-06 | Ministerstvo zemědělství (MZe) | 200 | credits-inconclusive |
| martin-sebestyan | SRC-13 | ParlamentníListy.cz | 200 | credits-inconclusive |
| martin-sebestyan | SRC-16 | Demagog.cz | 200 | credits-inconclusive |
| martin-sebestyan | SRC-23 | Ministerstvo zemědělství ČR | 200 | credits-inconclusive |
| martin-sebestyan | SRC-24 | Ministerstvo zemědělství ČR | 200 | credits-inconclusive |
| martin-sebestyan | SRC-28 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| oto-klempir | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| oto-klempir | SRC-09 | Uměleckohistorická společnost (UHS) | 200 | credits-inconclusive |
| oto-klempir | SRC-16 | Jezdci.cz | 200 | credits-inconclusive |
| oto-klempir | SRC-25 | Taneční aktuality | 200 | credits-inconclusive |
| oto-klempir | SRC-29 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| petr-vencalek | SRC-02 | ARES — Administrativní registr ekonomických subjektů (Ministerstvo financí ČR) | 200 | no-credit |
| petr-vencalek | SRC-03 | Hlídač státu | 200 | credits-inconclusive |
| richard-chlad | SRC-01 | Hlídač státu | 200 | credits-inconclusive |
| robert-plaga | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| robert-plaga | SRC-05 | EDUin | 200 | no-credit |
| robert-plaga | SRC-06 | zdravezpravy.cz | 200 | credits-inconclusive |
| robert-plaga | SRC-13 | Ministerstvo školství, mládeže a tělovýchovy ČR | 200 | credits-inconclusive |
| robert-plaga | SRC-22 | Ministerstvo školství, mládeže a tělovýchovy ČR | 200 | credits-inconclusive |
| robert-plaga | SRC-24 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| robert-plaga | SRC-33 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
| robert-plaga | SRC-34 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| tomio-okamura | SRC-24 | Společnost pro obranu svobody projevu | 200 | credits-inconclusive |
| tunde-bartha | SRC-03 | Aktuálně.cz | 200 | credits-inconclusive |
| tunde-bartha | SRC-04 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| tunde-bartha | SRC-06 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| tunde-bartha | SRC-09 | Agrofert (agrofert.cz) | 200 | no-credit |
| zuzana-mrazova | SRC-01 | Vláda České republiky (vlada.gov.cz) | 200 | no-credit |
| zuzana-mrazova | SRC-24 | Poslanecká sněmovna PČR (stenoprotokol) | 200 | no-credit |
| zuzana-mrazova | SRC-31 | Poslanecká sněmovna Parlamentu ČR | 200 | no-credit |
