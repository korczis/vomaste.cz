# Rešerše: Martin Pavlík, Brno — kandidát na dossier

**Datum rešerše**: 2026-08-05 (vstupní stopy pořízeny 2026-08-02)
**Stav**: `PASS` — s úzce vymezeným rozsahem
**Doporučení**: autorizovat dvě témata, dossier založit až po interaktivní autorizaci
**Rešerši provedl**: agent, na zadání vlastníka projektu

> Interní rešeršní záznam, ne publikovaný obsah. Neuvádí přesnou adresu
> bydliště. Neobsahuje tvrzení o pochybení — žádné doloženo nebylo.

---

## Revize předchozího závěru

První verze tohoto dokumentu uzavírala rešerši jako `INSUFFICIENT_EVIDENCE`.
**Ten závěr byl chybný** a stál na nedodělané fázi B: ověřen byl pouze subjekt
01529820, u zbývajících tří se opíral o vyhledávání místo o přímý rejstříkový
výpis. Po dokončení fáze B (`scripts/osint/expand-entity.mjs`, dry run,
2026-08-05) se obraz podstatně změnil — viz sekce B a C.

Součástí revize je i oprava vlastní chyby: dřívější poznámka, že HYDROPROGRESS
figuruje ve veřejné zakázce, vycházela z výsledku patřícího **HYDROPROJEKT a.s.**
(IČO 45274576), což je jiná firma. Údaje níže jsou ověřené proti IČO 04449461.

---

## A. Identifikační závěr

**Doloženo**: v ARES je táž osoba zapsána ve statutárních orgánech čtyř
subjektů, ověřeno přímým výpisem přes nástroj projektu:

| Subjekt | IČO | Role | Zdroj |
|---|---|---|---|
| MEDIA PROJECT CZ s.r.o. | 01529820 | jednatel | ARES |
| HYDROPROGRESS, s.r.o. | 04449461 | jednatel od 2015-10-01; **společník, podíl 80 %** | ARES |
| Nadační fond FIDUCIA | 26228548 | člen orgánu | ARES |
| Bydlíme v Králově Poli, z.s. | 02922703 | 1. místopředseda | ARES |

**Zůstává nejisté**: že jde ve všech čtyřech případech o tutéž fyzickou osobu.
ARES vrací shodné jméno; nástroj projektu záměrně nepřebírá datum narození, což
je pro ochranu soukromí správné, ale znamená to, že spojení stojí na shodě
jména a na sdíleném sídle tří ze čtyř subjektů. **Před publikací je nutné toto
ověřit ve Sbírce listin nebo v úplném výpisu z OR.**

### Vyloučené osoby téhož jména

Vyhledávání vyneslo nejméně pět odlišných nositelů jména:

| Osoba | Rozlišovací znak |
|---|---|
| novinář, e15.cz | autorský profil |
| novinář, Seznam Zprávy | autorský profil |
| vědecký pracovník AV ČR | Ústav výzkumu globální změny |
| hráč U18, FC Zbrojovka Brno | sportovní profil |
| advokát | Hrdina & Pavlík |

Dva z nich jsou novináři. Záměna by byla obzvlášť škodlivá.

### K výrazu „Padělíky"

Původní čtení jako „padělky" (padělané zboží) bylo **mylné**. `Padělíky` je
obytná ulice v Brně a rejstříkové agregátory ji uvádějí jako **adresu bydliště**.
Podle sekce 3.2 zadání je to výhradně interní disambiguační stopa: nevstupuje do
titulku, slugu, popisu, narativu ani grafu. Číslo popisné se zde neuvádí.
**Adresa není kauza.**

---

## B. Ověřené právnické osoby

### HYDROPROGRESS, s.r.o. — `include`

- IČO 04449461, vznik 2015-10-01, sídlo Sevastopolská 338/6, Starý Lískovec, Brno
- základní kapitál 500 000 Kč
- **Martin Pavlík: jednatel od 2015-10-01, společník s podílem 80 % (vklad 400 000 Kč, splaceno)**
- Ing. Marek Viskot: jednatel od 2022-05-19, společník 20 % (100 000 Kč)
- oba jednatelé jednají samostatně
- předmět: projektová činnost ve výstavbě; provádění staveb; výroba, instalace
  a opravy elektrických strojů a přístrojů, elektronických a telekomunikačních
  zařízení; výroba, obchod a služby neuvedené v přílohách 1–3

**Veřejné plnění** (Hlídač státu, IČO 04449461):

- **117 smluv v registru smluv, celkem 56 mil. Kč**
- **24 veřejných zakázek v roli dodavatele**
- rok 2026: 14 smluv za 23 mil. Kč
- protistrany mj.: Povodí Odry s.p., Lesy ČR s.p., Povodí Labe s.p.,
  Státní pozemkový úřad, statutární město Olomouc, město Vsetín

### MEDIA PROJECT CZ s.r.o. — `context only`

- IČO 01529820, vznik 2013-05-01, forma 112, DIČ CZ01529820,
  spisová značka C 78480/KSBR, NACE 56110 (stravování v restauracích)
- sídlo shodné s HYDROPROGRESSem
- `seznamRegistraci` neuvádí záznam v insolvenčním rejstříku ani v centrální
  evidenci úpadců — **doložitelný negativní nález**
- žádné veřejné plnění nedoloženo

### Nadační fond FIDUCIA — `context only`

- IČO 26228548, sídlo shodné s HYDROPROGRESSem
- členové orgánu: Martin Pavlík, Martin Korec, **František Pavlík**
- Shodu příjmení označil nástroj sám. **Rodinná vazba není doložena a nesmí se
  předpokládat.** František Pavlík je pro účely tohoto dossieru soukromá třetí
  osoba a nesmí být předmětem tvrzení.

### Bydlíme v Králově Poli, z.s. — `context only`, podmíněně

- IČO 02922703, spolek působící v městské části Brno-Královo Pole
- předseda: Michal Vít
- 1. místopředseda: **Martin Pavlík**
- 2. místopředseda: **Josef Nerušil**

Jméno Josef Nerušil nese i veřejně známý politik: poslanec za SPD od března 2026,
předseda pražské krajské organizace SPD od dubna 2022, zastupitel hl. m. Prahy
2022–2026, člen Rady ČRo 2020–2021, absolvent gymnázia Brno-Bystrc a FSS MU.
Brněnská vazba je tedy plauzibilní.

**Totožnost však doložena NENÍ.** Dokud ji nepotvrdí rejstříkový identifikátor
nebo veřejný zdroj, který obojí spojuje, **spolek do autorizovaného rozsahu
nepatří**. Členství ve spolku navíc samo o sobě podle sekce 6 zadání
nedostačuje.

---

## C. Matice kandidátních témat

### T1 — HYDROPROGRESS jako dodavatel veřejného sektoru

| | |
|---|---|
| **Co je doloženo** | 117 smluv za 56 mil. Kč v registru smluv; 24 veřejných zakázek; protistrany jsou státní podniky a města; Martin Pavlík je 80% společník a jednatel od založení |
| **Co doloženo NENÍ** | jakékoli pochybení, zvýhodnění, střet zájmů, vada zadávacího řízení nebo hodnocení kvality plnění |
| **Primární zdroje** | ARES (rejstříkové role a podíly); registr smluv; věstník / profily zadavatelů |
| **Sekundární** | Hlídač státu (agregace registru smluv) — **musí být ověřeno proti primárnímu registru smluv, než se z toho stane tvrzení** |
| **Nezávislé zpravodajství** | **žádné nenalezeno** |
| **Zdrojové rodiny** | 1 (rejstříkové/registrové); žádná novinářská |
| **Navržený status** | `1 ZDROJ` pro každý rejstříkový a registrový fakt. Na `CORROBORATED` chybí druhá nezávislá rodina. |
| **Procesní stav** | neaplikovatelné — nejde o řízení |
| **Riziko** | střední. Riziko není ve faktech, ale v rámování: dodávat státním podnikům je legální a běžné. Bez explicitního rámování hrozí, že čtenář vyčte obvinění, které data nenesou. |
| **Práh** | **splněn** — konstituce §7 uvádí „veřejný zdroj" jako důvod veřejného zájmu; 56 mil. Kč veřejných prostředků je významné plnění |

### T2 — Rejstříkové role a majetkové podíly

| | |
|---|---|
| **Co je doloženo** | role a podíly ve čtyřech subjektech, viz sekce A a B |
| **Co doloženo NENÍ** | že jde ve všech případech o tutéž osobu (viz A); rodinné vazby; jakékoli pochybení |
| **Primární zdroje** | ARES |
| **Navržený status** | `1 ZDROJ` |
| **Práh** | splněn jako doprovodné téma k T1 — bez něj není zřejmé, proč je T1 spojeno s touto osobou |

### Témata pod prahem

- **spolek Bydlíme v Králově Poli** — členství nedostačuje; vazba na Nerušila
  neověřená. Nezařazovat, dokud nebude potvrzena totožnost a nalezen důvod
  veřejného zájmu.
- **Nadační fond FIDUCIA** — žádné veřejné plnění, žádné zpravodajství.
- **MEDIA PROJECT CZ** — restaurační činnost, žádné veřejné plnění.
- **sdílené sídlo tří subjektů** — strukturální pozorování, ne kauza.

---

## D. Negativní zjištění

- **Žádné nezávislé zpravodajství** o této osobě. Ani jeden článek.
- **Žádná veřejná funkce.** Kandidátní listiny komunálních voleb 2022
  v Brně-Králově Poli jméno nevracejí.
- **Žádné rozhodnutí veřejného orgánu** — soudní, správní ani ÚOHS.
- **Žádné politické financování** ani stranická funkce.
- **Žádná insolvence ani úpadek** u MEDIA PROJECT CZ (`seznamRegistraci`).
- **Žádné doložené pochybení** kdekoli. Veškeré nalezené jednání je běžné
  a legální podnikání.
- Většina webových zásahů patřila **jiným osobám téhož jména**.
- Vazba na Josefa Nerušila je **neověřená shoda jména**, ne doložený fakt.

---

## E. Doporučení

**`PASS` s úzkým rozsahem.** Autorizovat T1 a T2, nic dalšího.

Základ veřejného zájmu: 80% vlastník a jednatel společnosti, která podle
registru smluv přijala **56 mil. Kč ve 117 smlouvách od státních podniků a měst**
a figuruje ve **24 veřejných zakázkách**. Dohledatelnost toku veřejných peněz
je jádrem poslání tohoto webu.

**Před publikací je nutné:**

1. ověřit totožnost osoby napříč čtyřmi subjekty ve Sbírce listin nebo
   v úplném výpisu z OR — dnes stojí na shodě jména,
2. ověřit údaje o smlouvách **přímo v registru smluv**, ne přes agregátor,
3. u každého tvrzení uvést, že jde o legální podnikatelskou činnost bez
   doloženého pochybení.

---

## Návrh autorizačního textu

K ručnímu vložení vlastníkem projektu přes interaktivní nástroj. Agent jej
nezapisuje.

```
### Authorized subject: Martin Pavlík (on the record)

Datum: <doplní vlastník>

Subjekt: Martin Pavlík, identifikovaný jako jednatel a 80% společník
společnosti HYDROPROGRESS, s.r.o. (IČO 04449461, sídlo Brno). Nikoli
kterýkoli jiný nositel téhož jména — zejména nikoli novináři píšící pro
e15.cz a Seznam Zprávy, pracovník Ústavu výzkumu globální změny AV ČR,
hráč FC Zbrojovka Brno ani advokát kanceláře Hrdina & Pavlík.

Základ veřejného zájmu: veřejné prostředky. HYDROPROGRESS, s.r.o. je
podle registru smluv příjemcem 117 smluv v celkové hodnotě 56 mil. Kč
od státních podniků (Povodí Odry, Povodí Labe, Lesy ČR, Státní pozemkový
úřad) a měst (Olomouc, Vsetín), a figuruje ve 24 veřejných zakázkách jako
dodavatel. Autorizovaná osoba je jejím většinovým vlastníkem a jednatelem
od založení.

Pokrytí je omezeno na tato témata:
  1. rejstříkové role a majetkové podíly ve společnostech HYDROPROGRESS,
     s.r.o. (04449461), MEDIA PROJECT CZ s.r.o. (01529820), Nadační fond
     FIDUCIA (26228548) a Bydlíme v Králově Poli, z.s. (02922703), včetně
     období výkonu funkce,
  2. plnění veřejných zakázek a smluv HYDROPROGRESS, s.r.o. z veřejných
     rozpočtů, doložené registrem smluv a profily zadavatelů.

Povinné rámování při každé zmínce:
  - dodávání státním podnikům a městům je legální a běžná podnikatelská
    činnost; žádný zdroj neuvádí pochybení a žádné se nesmí naznačovat,
  - žádné z tvrzení nesmí spojovat rejstříkovou funkci s hodnocením kvality
    plnění nebo se zadávacím řízením, pokud to konkrétní zdroj nedokládá,
  - údaje z agregátorů (Hlídač státu) se uvádějí až po ověření proti
    primárnímu registru smluv.

Výslovně vyloučeno z pokrytí:
  - spolek Bydlíme v Králově Poli jako téma; vazba na Josefa Nerušila není
    doložena a nesmí být uvedena, dokud ji nepotvrdí zdroj spojující obě
    identity,
  - Nadační fond FIDUCIA nad rámec prostého záznamu členství v orgánu,
  - jakékoli tvrzení o Františku Pavlíkovi, Marku Viskotovi, Michalu Vítovi,
    Martinu Korcovi a Josefu Nerušilovi; jsou to soukromé třetí osoby
    a zůstávají mimo pokrytí,
  - rodinné vazby; shoda příjmení není důkaz,
  - adresa bydliště v jakékoli podobě, včetně názvu ulice,
  - soukromý život, majetkové poměry mimo rejstříkové podíly, zdravotní
    a jiné osobní údaje.

Autorizace se nerozšiřuje automaticky na další osoby, další subjekty ani
další témata. Každé rozšíření vyžaduje nový datovaný záznam.
```

---

## Stav před autorizací

Repozitář zůstal beze změny kromě tohoto dokumentu. Nebyla vytvořena
autorizace, dossier ani jediné tvrzení. Entita `martin-pavlik` je nadále
`publicationRole: "context"`, `dossierEnabled: false`.

Nic z tohoto dokumentu není určeno k publikaci na webu.
