# Mise: vomaste.cz jako reprodukovatelný vyšetřovací protokol (`/investigate`)

**Datum zadání**: 2026-07-30 · **Zadavatel**: vlastník webu (on the
record, v probíhající konverzaci) · **Stav**: zachyceno doslovně,
zatím nedekomponováno na coop board ani ADR.

Tento soubor uchovává vlastníkův vizní text doslovně, aby na něj mohly
navazovat další worker sessions bez ztráty kontextu — stejný vzorec jako
[`2026-07-30-workbench-master-prompt.md`](2026-07-30-workbench-master-prompt.md).

Je to **architektonická/produktová vize nad tooling a publikační
vrstvou**. Nemění editorial scope žádného subjektu a nemění append-only
autorizační log v `AGENTS.md` — o tom rozhoduje výhradně proces popsaný
tam (`scripts/dossier/authorize-entity.mjs`, interaktivní, human-typed).
Popsaný `/investigate` manifest ostatně sám vyžaduje explicitní
autorizovaný scope jako první krok pipeline, takže je s tímto pravidlem
konzistentní, ne v rozporu s ním.

Vztah k existujícím závazným dokumentům, poctivě:

- Velká část vize (identita jako otevřený Git-native systém, statická
  publikace, JSON-LD, oddělené epistemické stavy, zóna A/B, "žádný
  trust score", zákaz claimu neimplementovaných schopností) **už je
  dnes psaná** v `docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` —
  není to nová myšlenka, je to existující ústava, o kterou se dá
  opřít, ne kterou je třeba znovu obhajovat.
- Vlastní korekce v textu ("odolný/reprodukovatelný/decentralizovatelný"
  místo "unstoppable") je přesně to, co konstituce §10 už vyžaduje
  ("nikdy neoznačovat projekt nad rámec implementovaného").
- `require_human_approval: true` v navrženém manifestu je přesně to,
  co konstituce §11/§10 vyžaduje ("nenechat výstup AI obejít lidský
  přezkum") — konzistentní, ne nový závazek.
- Naproti tomu `/investigate` jako nový příkaz/skill, manifest schema,
  gating engine a most na Prismatic je **skutečně nová, netriviální
  práce** a stojí v napětí s výslovným stanoviskem v `CLAUDE.md`
  ("Why 4 skills and not a large agent/command ecosystem") — které
  samo cituje konstituci proti "doktrína/agent sprawl". To napětí je
  potřeba vyřešit vědomě (ADR), ne mlčky obejít přidáním nástroje.
- Napojení na `~/dev/prismatic-platform` je integrace externí, ~96
  aplikací velké platformy jako "epistemického enginu" — svou váhou
  je to přesně kalibr rozhodnutí, pro který tento repo už opakovaně
  používá `docs/adr/` (viz `graph-renderer.md`, kde srovnatelně velké
  návrhy stacku byly měřeně odmítnuty nebo zmenšeny na to, co dataset
  reálně potřebuje).

---

## Plné znění zadání (verbatim)

Tohle už není „statický web s dossierem“. To je **reprodukovatelný vyšetřovací protokol**, který náhodou publikuje výsledek jako statický web. A to je podstatně silnější pozice.

Jádro vize je:

```text
git clone
claude
/investigate <autorizovaný předmět>
```

Následně systém:

```text
scope check
→ vytvoření branch
→ založení investigation manifestu
→ sběr pouze povolených veřejných zdrojů
→ normalizace entit, médií, tvrzení a vztahů
→ JSON-LD knowledge graph
→ provenance a source-family deduplikace
→ epistemické gatingy
→ generování stránek, registrů a vizualizací
→ build a integrity checks
→ auditovatelný diff
→ pull request
```

## Co na tom má skutečný potenciál

**1. Vomaste není obsah. Je to formát a tooling.**

Jednotlivý dossier je jen instance. Hodnota je v tom, že další případ lze vytvořit stejným procesem, se stejnými pravidly, validátory a auditní stopou.

**2. `/investigate` je produktové rozhraní.**

Ne další pětašedesátistránkový manuál, který si nikdo nepřečte. Jeden příkaz aktivuje celý řízený workflow, ale nesmí to být magické tlačítko „vyrob obvinění“. Musí začínat autorizací rozsahu a končit PR, nikoli automatickým publikováním.

**3. Static-first je strategická výhoda.**

Výstup je:

* levný na provoz,
* snadno zrcadlitelný,
* verzovatelný,
* auditovatelný přes Git,
* čitelný bez proprietárního backendu,
* exportovatelný jako JSON-LD,
* obtížně umlčitelný jedním infrastrukturním zásahem.

Místo slova **„unstoppable“** bych veřejně používal spíš **odolný, reprodukovatelný a decentralizovatelný**. „Unstoppable“ zní efektně, dokud ho nezačne někdo citovat v předžalobní výzvě. Právníci jsou také datově řízení, pouze jejich datovým formátem bývá faktura.

**4. Whistleblower vstup nesmí kontaminovat faktografii.**

Materiál od whistleblowera není automaticky tvrzení ani důkaz. Pipeline musí mít oddělené vrstvy:

```text
private submission
→ intake record
→ authenticity assessment
→ corroboration tasks
→ public-source verification
→ publishability decision
→ public claim
```

Neověřený podklad zůstává neveřejný a nesmí se omylem propsat do JSON-LD exportu, sitemap ani stránky entity.

## Vomaste.cz ↔ Prismatic

Správné rozdělení není „Vomaste používá nějaké AI“.

Je to:

```text
Prismatic
= epistemický a agentní engine

Vomaste
= veřejný, verzovaný a auditovatelný publikační protokol

Progressus OSINT / další adaptéry
= sběr a normalizace veřejných dat
```

Prismatic může dodat:

* řízení investigation workflow,
* ClaimMap a TraceGraph,
* hodnocení evidence,
* detekci rozporů,
* source-family independence,
* provenance,
* uncertainty model,
* agentní review,
* adversarial kontrolu,
* vysvětlení, proč tvrzení prošlo nebo neprošlo gate.

Vomaste z toho publikuje pouze schválenou veřejnou projekci:

```text
private investigation graph
        ↓ explicit publication gate
public JSON-LD graph
        ↓ deterministic generator
static dossier site
```

To oddělení je zásadní. **Vomaste nesmí být veřejný dump interního Prismatic graphu.** Veřejný dataset je záměrně omezený, redakčně schválený pohled.

## Minimální kontrakt `/investigate`

Příkaz musí přijímat manifest, ne jen jméno osoby:

```yaml
investigation:
  id: gov-2026-example
  title: "..."
  subjects:
    - entity: "..."
  authorized_topics:
    - "..."
  excluded_topics:
    - "..."
  allowed_source_classes:
    - independent_media
    - public_registry
    - official_primary_source
  publication:
    mode: pull_request
    require_human_approval: true
  privacy:
    third_parties: minimize
    whistleblower_material: private
```

A musí selhat, pokud:

* není autorizovaný scope,
* není dohledatelný zdroj,
* chybí provenance,
* tvrzení nemá odpovídající status,
* `CORROBORATED` stojí na jedné zdrojové rodině,
* anonymizovaná osoba má veřejnou route,
* veřejný graph obsahuje interní podání,
* generated stránky neodpovídají JSON-LD,
* build nebo integrity gate neprojde.

## Jednovětý pitch

**Vomaste.cz je otevřený, staticky publikovaný protokol pro vytváření auditovatelných dossierů z propojených JSON-LD dat, kde každý veřejný výstup vzniká přes explicitní rozsah, zdrojovou provenienci, epistemické kontroly a verzovaný review proces.**

A strategicky tvrdší varianta:

**Nechci ručně psát další dossier. Chci dodat tooling, ve kterém lze autorizované veřejné šetření spustit jedním příkazem, ale bez jediného tvrzení, které by neprošlo zdroji, proveniencí, kontrolou nezávislosti a lidským publikačním gate.**

To je ten skutečný „hold-my-beer“ moment. Ne že web vznikl přes noc. Ale že z nočního experimentu může vzniknout **opakovatelná infrastruktura pro veřejnou epistemiku**, zatímco většina internetu stále řeší, zda má mít kartička stín `shadow-md` nebo `shadow-lg`.
