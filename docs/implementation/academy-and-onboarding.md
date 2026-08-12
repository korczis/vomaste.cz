# Vzdělávací a onboardingová vrstva — implementační report

**Datum:** 2026-08-11
**Rozsah:** `/start/`, `/bootcamp/`, `/akademie/`, `/prirucka/`, `/prispet/`
+ datový model, komponenty, validátor, integrace do webu a dokumentace.

---

## 1. Executive summary

Vznikla samostatná, navigovatelná a strojově kontrolovaná vrstva, která
člověka bez znalosti projektu, Gitu i datových formátů dovede od „nevím,
co to je“ k „umím bezpečně přispět“.

**92 nových stránek** v pěti sekcích, postavených nad jedním datovým
souborem a dvěma generickými šablonami. Integritu kurikula hlídá nový
validátor v kanonické bráně; cvičení běží výhradně na fiktivních datech,
jejichž únik do publikovaného datasetu shodí build.

Klíčové architektonické rozhodnutí: **vrstva nedefinuje ani jeden pojem.**
Kanonické definice vlastní `content/koncepty/*` (32 stránek, které už
existovaly); Akademie je učí používat, Příručka je pomáhá dohledat.

## 2. Repository discovery — stav před změnou

Zjištěno přímo z repozitáře, ne z dokumentace:

- **JSON-first datový model** (T-028). `data/dossiers/**` je kanonický
  zdroj, `content/dossiers/**` a `content/entities/*.md` jsou **generované
  adaptéry**. 202 dossierů, 1 159 tvrzení, 989 zdrojů, 681 entit.
- **Kanonická brána** je `npm run build` přes `scripts/build/pipeline.mjs`
  (tři režimy: build / dev / check), kroky definované jako data.
- **Existující vrstva pojmů**: `content/koncepty/` — 32 stránek pokrývajících
  všech pět stavů, čtyři registry, nezávislé doložení, procesní výsledek,
  autorizaci i třetí osoby. Řízená `data/concept-groups.toml`, hlídaná
  `validate-concepts.mjs`.
- **Existující intake**: 4 GitHub Issue formuláře, prázdné issues vypnuté,
  `CONTRIBUTING.md` renderovaný na `/dokumentace/prispivani/`.
- **Vynucené brány, do kterých se musela nová vrstva vejít**: znovupoužití
  UI komponent, jediná tabulková komponenta, JSON-LD na každé stránce,
  obousměrná kontrola `record_type` ↔ `data/seo.toml`, zákaz inline
  `style`, responzivita tabulek.
- **Chybělo**: jakákoli onboardingová vrstva. `/start/`, `/bootcamp/`,
  `/akademie/`, `/prirucka/`, `/prispet/` neexistovaly.

**Nález, který změnil návrh:** požadovaná „Knowledge Base → Concepts“ by
byla druhou definicí toho, co už `/koncepty/` kanonicky drží. Příručka
proto vznikla jako **rozcestník nad existujícím** plus to, co skutečně
chybělo (postupy, reference, řešení problémů, slovníček, FAQ).

## 3. Informační architektura

| Routa | Sekce | Stránek |
|---|---|---|
| `/start/` | zero-knowledge onboarding | 1 + 4 |
| `/bootcamp/` | praktický kurz | 1 + 9 |
| `/akademie/` | kurikulum 7 úrovní | 1 + 58 |
| `/prirucka/` | lookup | 1 + 16 |
| `/prispet/` | rozcestník příspěvků | 1 + 6 |

V navigaci **jedna** kořenová položka „Naučit se“ (hned za Domů) s
generovaným podstromem — ne pět kořenových položek, které by v panelu
přebily 202 dossierů. Podstrom staví `build-navigation.mjs`
z `data/learning.toml`, stejným tvarem jako podstrom konceptů; sekce
s desítkami položek (Akademie, Příručka) mají `nav_children = false` a
vlastní seskupený index.

## 4. Bootcamp

Devět stránek: orientace → klasifikace tvrzení → kvalita zdroje →
nezávislost → mezera → rozsah → evidence packet → příspěvek → shrnutí.

Každá lekce má cíle, výklad, **cvičení se skrytým řešením** a
**scénářovou kontrolní otázku** (nikdy definiční — „co znamená zkratka
SRC“ neměří porozumění).

Cvičný svět: fiktivní město Bukov a jeho fiktivní starostka. Cvičení
pokrývají klasifikaci stavů (5 situací), graf zdrojů s pastí na
nezávislost, rozhodování tvrzení/mezera/nepublikovat (3) a zařazení
podle rozsahu (5).

Závěrečná stránka má kopírovatelný kontrolní seznam a **čtyři konkrétní
bezpečné první úkoly** — ověření data, mrtvý odkaz, dvě položky téže
rodiny zdrojů, nesoulad tvrzení se zdrojem. Žádné bodování ani
certifikát: kdo proklikal osm tlačítek, tím nezískal způsobilost
posuzovat evidenci.

## 5. Akademie

58 lekcí v sedmi úrovních: Základy (8), Rešerše (8), Redakční práce (9),
Příspěvky (7), Datový model (8), Inženýrství (10), Governance (8).

Pět učebních cest (`Chci jen rozumět webu`, `Chci dodávat zdroje`,
`Chci dělat rešerši`, `Chci reviewovat`, `Chci programovat`) je pouhé
pořadí existujících lekcí — ne samostatný obsah.

Úrovně A5–A7 popisují **skutečný** model repozitáře: tvary kanonických
záznamů byly opsány z reálných souborů, ne z paměti.

## 6. Příručka

Sedm kategorií; dvě z nich (**Pojmy**, **Pravidla**) mají obsah jinde a
příručka pro ně dělá rozcestník — `canonical_elsewhere` v datech to
vyjadřuje explicitně a šablona to zobrazí.

Vlastní obsah: 8 postupů, 4 referenční přehledy, 2 stránky řešení
problémů (12 symptomů ve struktuře symptom → význam → příčina → diagnóza
→ oprava → prevence), slovníček a FAQ (15 otázek).

**Katalog příkazů se neopisuje** — je generovaný z repozitáře a příručka
na něj odkazuje.

## 7. Příspěvkové cesty

Šest rozcestníků podle toho, co má člověk v ruce, plus mapa schopností
(čtenář → ověřovatel → dodavatel zdrojů → rešeršista → editor →
maintainer) s explicitním „co zatím nedělat bez revize“.

**Nový issue formulář `novy-zdroj.yml`** — repozitář neměl formulář pro
příspěvek, který `CONTRIBUTING.md` sám označuje za nejužitečnější
(druhý nezávislý zdroj k tvrzení se stavem 1 ZDROJ). Ptá se i na původ
materiálu, tedy na to, co rozhoduje o stavu.

## 8. Datový model

Ručně psané Zola stránky se strukturovaným `[extra]` nad
`data/learning.toml` — přesně precedent `/koncepty/`, žádný nový
framework (§78).

```toml
[extra]
section = "akademie"
lesson_id = "A104"
level = "editorial"
estimated_minutes = 12
audience = ["editor", "research"]
objectives = ["…"]
prerequisites = ["A103"]
related_kb = ["koncepty/stav-sporne.md"]
next = "A105"
```

Komponenty ve dvou vrstvách: `macros/learning-atoms.html` (listová —
`callout`, `badge`, `checklist`) a `macros/learning.html` (složená).
Rozdělení není estetika: Tera neumí volat sourozenecké makro (`self::` se
vyhodnocuje proti volající šabloně) a self-import shodí Zolu přetečením
zásobníku.

Nově zavedené **`templates/shortcodes/`** (`callout`, `cviceni`,
`kontrola`, `cvicna_data`, `seznam`) importují tatáž makra jako šablony —
markup existuje jednou.

Interaktivita je celá na `<details>`: funguje bez JS, klávesnicí i
čtečkou obrazovky a nepřibyl žádný JS bundle.

## 9. Validace

`scripts/dossier/validate-learning.mjs`, kontroly **L1–L13**, zapojen do
`build` i `check` + záznam v katalogu příkazů.

Chytá mimo jiné: rozbitý řetěz `next`/`next_route`, prerekvizitu na
neexistující nebo cizí lekci, duplicitní `lesson_id`, kód lekce
neodpovídající úrovni, **nedosažitelnou lekci**, cestu jmenující
neexistující lekci, `related_kb` s prefixem `@/` (který `get_page()`
nepřijímá), cvičná data bez `synthetic`, cvičné URL mimo rezervovaný
jmenný prostor, odpověď cvičení neodpovídající skutečnému stavu tvrzení.

**L13** je ta podstatná: cvičný identifikátor v `data/dossiers/**` shodí
build. Bez ní by výuka mohla být zadními vrátky k rozšíření rozsahu.

Validátor našel při vývoji dvě skutečné vady (nedosažitelné vstupní lekce
úrovní A4 a A7) — což byla vada mé kontroly, ne obsahu, a byla opravena.

## 10. Testy

`tests/e2e/learning.spec.mjs`: routing všech pěti sekcí, vstup z úvodní
stránky, přítomnost cílů / kanonických pojmů / pokračování v lekci,
**odhalení řešení klávesnicí**, přítomnost obsahu v DOM i při zavřeném
`<details>`, označení cvičných dat, ovladatelnost kontrolního seznamu,
kontextová nápověda ze stránky tvrzení, nepřetékání na mobilu.

### Co našla plošná přístupnostní kontrola

Sada `a11y-sweep` (axe, WCAG 2.1 AA, jen serious/critical) běží nad
odvozenými archetypy stránek, takže nové sekce se do ní zařadily samy.
Našla **9 pádů**; po opravách zbyly **2**.

Opraveno, protože to byly skutečné vady:

- **Kontrast odznaků ve vzdělávací vrstvě** (5×). `text-white/45` dává na
  černém pozadí 4,0:1, WCAG AA chce u malého textu 4,5:1. Opraveno na
  `/65` ve všech nových šablonách.
- **Široký ASCII diagram na `/start/`** se na mobilu stal posuvnou
  oblastí bez přístupu klávesnicí. Zúžen tak, aby se vešel.
- **`text-white/45` v `templates/docs-index.html`** — táž třída chyby,
  ale **předexistující** (ověřeno proti HEAD). Jednořádková oprava,
  udělána při té příležitosti.

Zbylé 2 pády jsou **předexistující a mimo rozsah tohoto zadání**:
`/dokumentace/agents/` má posuvné `<pre>` a tabulky bez `tabindex="0"`
(pravidlo `scrollable-region-focusable`). AGENTS.md měl tabulky i před
touto změnou — moje sekce přidala třetí. Správná oprava je plošná
(doplnit `tabindex` a popisek posuvným oblastem v renderované
dokumentaci), ne úprava jednoho dokumentu.

Celá sada: **326 passed / 9 failed** před opravami, po nich
**58 passed / 2 failed** v samotném `a11y-sweep`.

## 11. Quality gate

```bash
npm run check          # 14/14 OK (12,3 s)
npm run validate:learning
# OK — 5 sekcí (Start 4, Bootcamp 9, Akademie 58, Příručka 16, Jak přispět 6),
#      7 úrovní, 6 audience, 5 cest, 7 kategorií, 2 cvičné subjekty
npm run verify:authorization-log
# OK — 217 záznamů, vše ukotveno, beze změny
npm run intake:validate-form
# OK — 6 formulářů strukturálně platných

npm run build
# pipeline: režim build OK (507,4 s) — 46/46 kroků, 5 600 vydaných stránek
# verify:export — 203/203 exportů, 9 909 uzlů, 2 055 citačních otisků
# verify:table-responsive — 3 626 tabulek napříč 5 600 stránkami

npx playwright test tests/e2e/learning.spec.mjs
# 27 passed, 5 skipped (desktop/mobile skiny)
```

**Čtyři pády, které brána cestou chytila** — všechny v Zole/Teře a všechny
stojí za zápis, protože na ně najede každý další, kdo tu bude psát obsah:

1. **Vnořené pole v šabloně** (`[["a","b"], …]`) Tera neumí. Řešení bylo
   lepší než workaround: vazba stav → stránka konceptu se dohledá z dat
   (stránky stavů nesou `badge_class`), takže v šabloně žádná mapa není.
2. **Doslovný `{% … %}` v inline kódu** se parsuje jako Tera. Escapuje se
   `{%/* … */%}`.
3. **Escapované uvozovky v argumentu shortcode** (`\"context\"`) rozbijí
   parsování. Přeformulovat bez uvozovek.
4. **Odkaz `@/zdroje/`** musí být `@/zdroje/_index.md` — Zola chce soubor,
   ne adresář.

## 12. Změněné soubory

**Nové:** `data/learning.toml`, `data/learning-fixtures.toml`,
`data/tooling/validate-learning.json`,
`scripts/dossier/validate-learning.mjs`,
`templates/learning-section.html`, `templates/learning-lesson.html`,
`templates/macros/learning.html`, `templates/macros/learning-atoms.html`,
`templates/shortcodes/` (5 souborů),
`.github/ISSUE_TEMPLATE/novy-zdroj.yml`,
`tests/e2e/learning.spec.mjs`, 92 stránek obsahu.

**Upravené:** `data/navigation.toml` (položka „Naučit se“),
`data/seo.toml` (typy `lesson`, `learningIndex`),
`scripts/dossier/build-navigation.mjs` (podstrom),
`scripts/build/pipeline.mjs` (krok validace), `package.json`,
`templates/index.html` (vstup pro nováčka),
`templates/dossier-claim.html` (kontextová nápověda u stavu),
`README.md`, `CONTRIBUTING.md`, `AGENTS.md` (sekce o údržbě — **mimo**
autorizační log), `CLAUDE.md`, `tests/e2e/accessibility.spec.mjs`.

## 13. Známá omezení

- **Vyhledávání vzdělávací vrstvu neindexuje.** Index se staví
  z kanonického datasetu, ne z ručně psaných stránek — nejsou v něm ani
  `/koncepty/`, ani `/dokumentace/`. Rozšíření by změnilo tvar indexu i
  jeho konzumenty; nedělal jsem ho. Lookup zajišťuje seskupený index
  Příručky.
- **Kontextová nápověda je zatím jen u stavu tvrzení.** Nejcennější
  místo, ale ne jediné možné — mezery, vztahy a stránky zdrojů ji nemají.
- **Odhady času nejsou měřené.** Jsou to odhady a stránky to říkají.
- **Úrovně A5–A7 popisují stav k datu vzniku.** Tabulka „co při jaké
  změně projít“ v `AGENTS.md` je jediné, co brání jejich zastarání —
  a je to procesní pojistka, ne strojová.
- **Dva přístupnostní pády zůstávají** na `/dokumentace/agents/` —
  předexistující, plošné, popsané výš.
- **Cvičení nemají vyhodnocení odpovědi.** Řešení se odhalí kliknutím,
  nikdo nekontroluje, co si čtenář myslel. Je to vědomé: skóre by
  předstíralo měření kompetence, které se takhle měřit nedá.

## 14. Doporučené navazující kroky

1. **Vyšetřit dobu běhu brány v CI.** Naměřeno 2026-08-11: lokálně ~7
   minut, v automatizaci **271 minut** — a protože úloha nemá časový
   limit, doběhne do stropu poskytovatele a skončí jako „zrušeno“. Sedm
   nasazení po sobě neprošlo; poslední úspěšné bylo 2026-08-10. Není to
   pomalejší stroj, je to porucha.
2. **Rozšířit index vyhledávání** o ručně psané stránky (koncepty,
   dokumentace, vzdělávací vrstva) — až bude jasné, jestli to za změnu
   tvaru indexu stojí.
3. **Doplnit kontextovou nápovědu** na stránky mezer, zdrojů a vztahů.
4. **Ověřit onboarding s reálným člověkem**, který projekt nezná. Žádný
   validátor nezjistí, jestli je `/start/` srozumitelný.
