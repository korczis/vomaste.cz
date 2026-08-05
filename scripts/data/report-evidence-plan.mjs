#!/usr/bin/env node
/*
 * Evidenční plán práce — GENEROVANÝ přehled stavu evidence per dossier.
 *
 * PROČ GENERÁTOR, NE RUČNÍ SEZNAM
 * -------------------------------
 * „Todo bod pro každý dossier" sepsaný ručně zastará první změnou dat:
 * doplní se zdroj, uzavře mezera, přibude tvrzení — a seznam už popisuje
 * repozitář, který neexistuje. Tenhle skript proto nic nepamatuje. Čte
 * kanonický model (data/dossiers/**) přes tytéž vstupy jako build
 * (loadCanonicalDataset + compileDataset), spočítá stav a plán z něj
 * ODVODÍ. Běží v `npm run data:build` i v `npm run build`, takže report
 * nemůže být starší než data.
 *
 * CO REPORT JE A CO NENÍ
 * ----------------------
 *   JE:    interní pracovní přehled — kde je evidence nejslabší a co ji
 *          konkrétně posílí. Čistá projekce kanonických dat.
 *   NENÍ:  hodnocení osob. Vysoké skóre neznamená nic o subjektu
 *          dossieru — znamená, že TENHLE WEB má u daného dossieru
 *          nejvíc nedodělané zdrojovací práce. Je to metrika naší
 *          evidence, ne jeho jednání.
 *   NENÍ:  publikovaný obsah. Výstupy jdou do reports/ a
 *          data/generated/, nikdy do content/ — neroutují se, Zola je
 *          nevidí, žádná stránka z nich nevzniká.
 *   NENÍ:  autorizační rozhodnutí ani podnět k novému dossieru.
 *
 * NEZÁVISLOST ZDROJŮ SE NEPOČÍTÁ ZNOVU
 * ------------------------------------
 * Otázku „mají tahle tvrzení dva nezávislé vydavatele?" vlastní
 * lib/source-independence.mjs — tentýž primitiv, kterým validate-semantics
 * vynucuje S1/S2/S4/S10. Kdyby si report definici opsal, ukazoval by plán
 * na jinou realitu, než jakou brána vynucuje.
 *
 * DETERMINISMUS: ŽÁDNÉ HODINY
 * ---------------------------
 * Report neobsahuje čas běhu. „Stáří" mezer se měří proti DATOVÉMU
 * HORIZONTU — nejnovějšímu datu v samotném datasetu (dossier.updated /
 * reviewedAt, gap.checked, source.retrieved / published). Výstup je tedy
 * čistá funkce dat: dva běhy nad stejným stromem dají bajt po bajtu
 * stejný soubor a `reports/evidence-plan.md` se v gitu nehýbe, dokud se
 * nehnou data. Přepsat horizont lze `--as-of=RRRR-MM-DD` (testy, „co
 * kdyby").
 *
 * Použití:
 *   npm run report:evidence-plan
 *   node scripts/data/report-evidence-plan.mjs --as-of=2026-08-05 --stale-days=30
 *   node scripts/data/report-evidence-plan.mjs --json   # výpis na stdout, nic nezapíše
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalDataset, compileDataset } from "./lib/dataset.mjs";
import { createSourceIndependence } from "./lib/source-independence.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const MARKDOWN_REL = "reports/evidence-plan.md";
export const JSON_REL = "data/generated/evidence-plan.json";

// Mezera, která nebyla zkontrolovaná déle než tolik dní od datového
// horizontu, se počítá jako zastaralá. 30 dní = měsíční revizní cyklus
// zavedený redakčním provozem; přepíše `--stale-days=`.
export const DEFAULT_STALE_DAYS = 30;

/*
 * VZOREC PRIORITY — závazný, report se ho drží beze zbytku
 * ========================================================
 *
 * Krok 1: každé tvrzení dossieru se zařadí do PRÁVĚ JEDNÉ evidenční
 * třídy podle toho, co skutečně cituje (ne podle deklarovaného statusu —
 * status je redakční popisek, tohle je měření):
 *
 *   E0   žádný citovaný zdroj
 *   E1   právě jeden citovaný zdroj
 *   E1+  ≥2 citované zdroje, ale ŽÁDNÁ nezávislá dvojice mezi nimi
 *        (všechny jedné rodiny, téhož outletu nebo téže registrované
 *        domény) — tohle je „potenciál na korroboraci": jediný nezávislý
 *        doklad navíc takové tvrzení posune na CORROBORATED
 *   E2   existuje nezávislá dvojice — evidenčně hotovo
 *
 * Krok 2: bodové skóre. Váha = JAK SLABÁ je evidence, ne jak drahá je
 * oprava (drahost není z dat zjistitelná; slabost ano):
 *
 *   riskPoints = 3·E0
 *              + 2·E1
 *              + 1·E1plus
 *              + 2·gapsOpenHigh      (otevřená mezera s prioritou „vysoká")
 *              + 1·gapsOpenRest      (ostatní otevřené mezery)
 *              + 1·gapsStale         (otevřená mezera nekontrolovaná
 *                                     déle než staleDays — připočítává se
 *                                     NAVÍC k bodu za otevřenost)
 *
 * E2 nedává body — je to hotový stav. Zdroje s nevyplněnou `sourceFamily`
 * se do skóre ZÁMĚRNĚ nepočítají: prázdná rodina není chyba evidence,
 * protože nezávislost pak spočítá fallback na `outlet` (viz
 * lib/source-independence.mjs). Je to hygienický signál — report ho měří
 * a navrhuje jako krok, ale nepřiživuje jím prioritu.
 *
 * Krok 3: pásmo priority. Ne pevné prahy (ty by byly odhad), ale Pareto
 * podíl na CELKOVÉM objemu práce. Dossiery se seřadí sestupně podle
 * riskPoints a rozhoduje `precedingShare` — podíl práce ležící NAD
 * dossierem, tedy bez něj samotného:
 *
 *   precedingShare < 50 %    → vysoká
 *   precedingShare < 80 %    → střední
 *   zbytek s riskPoints > 0  → nízká
 *   riskPoints == 0          → žádná
 *
 * Práh se počítá z předchozích, ne z kumulativu včetně sebe, protože
 * jinak by dossier, který sám drží víc než 80 % práce, spadl do „nízká" —
 * vlastní vahou by se z nejvyšší priority vyřadil. Takhle „vysoká" znamená
 * NEJMENŠÍ skupina dossierů, která dohromady drží aspoň polovinu objemu:
 * dossier, který práh překročí, do skupiny ještě patří, další už ne.
 *
 * Pásmo je relativní k repozitáři a mění se, když se práce přesune — což
 * je přesně to, co má plán práce dělat.
 */
export const RISK_WEIGHTS = Object.freeze({
  claimsNoSource: 3,
  claimsSingleSource: 2,
  claimsOneVoice: 1,
  gapsOpenHigh: 2,
  gapsOpenRest: 1,
  gapsStale: 1,
});

export const BAND_THRESHOLDS = Object.freeze({ vysoká: 0.5, střední: 0.8 });

const HIGH_GAP_PRIORITY = "vysoká";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isoDate = (v) => (typeof v === "string" && ISO_DATE.test(v) ? v : null);
const refIds = (arr) => (Array.isArray(arr) ? arr : []).map((r) => r?.["@id"]).filter((x) => typeof x === "string");
const daysBetween = (from, to) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/*
 * Datový horizont: nejnovější datum, které dataset o sobě sám tvrdí.
 * Kandidáti jsou všechna provenienční a revizní data — kdyby se bralo jen
 * dossier.updated, přidání zdroje s novějším `retrieved` by horizont
 * neposunulo a stáří mezer by zamrzlo.
 */
export function dataHorizon(compiled) {
  let max = null;
  const consider = (v) => {
    const d = isoDate(v);
    if (d && (max === null || d > max)) max = d;
  };
  for (const w of compiled.records) {
    const r = w.record;
    consider(r.updated);
    consider(r.reviewedAt);
    consider(r.checked);
    consider(r.closedAt);
    consider(r.retrieved);
    consider(r.published);
  }
  return max;
}

/*
 * buildEvidencePlan(model, { asOf, staleDays }) → serializovatelný plán.
 * `model` je surový kanonický model (loadCanonicalDataset / fixture);
 * kompilace probíhá uvnitř, aby volající nemusel skládat pipeline.
 */
export function buildEvidencePlan(model, { asOf = null, staleDays = DEFAULT_STALE_DAYS } = {}) {
  const compiled = compileDataset(model);
  const horizon = isoDate(asOf) ?? dataHorizon(compiled);
  const independence = createSourceIndependence((iri) => compiled.indexes.byId[iri]?.record);

  // Popisky stavů se čtou ze slovníku (_shared/vocabularies/claim-statuses.json),
  // ne z konstanty v tomhle souboru — jinak by nová hodnota stavu tiše
  // vypadla z reportu.
  const statusVocabulary = model.vocabularies?.find((v) => v.data?.id === "claim-statuses")?.data;
  const statusOrder = (statusVocabulary?.values ?? []).map((v) => v.value);
  const statusLabels = new Map((statusVocabulary?.values ?? []).map((v) => [v.value, v.label]));

  const dossiers = [];
  const byDossier = new Map();
  for (const w of compiled.records) {
    if (w.registry === "dossier") continue;
    const bucket = byDossier.get(w.dossier) ?? { claims: [], sources: [], cases: [], gaps: [], relations: [], updates: [] };
    byDossier.set(w.dossier, bucket);
    if (bucket[w.registry]) bucket[w.registry].push(w.record);
  }

  for (const w of compiled.records) {
    if (w.registry !== "dossier") continue;
    const d = w.record;
    const slug = w.dossier;
    const bucket = byDossier.get(slug) ?? { claims: [], sources: [], cases: [], gaps: [], relations: [], updates: [] };

    // --- tvrzení: evidenční třídy + deklarované stavy -------------------
    const evidence = { E0: 0, E1: 0, "E1+": 0, E2: 0 };
    const byStatus = new Map();
    const oneVoiceExamples = [];
    const singleSourceExamples = [];
    const noSourceExamples = [];
    for (const c of [...bucket.claims].sort((a, b) => (a.identifier < b.identifier ? -1 : 1))) {
      const ids = [...new Set(refIds(c.sources))];
      const cited = independence.existingSources(ids);
      let klass;
      if (cited.length === 0) klass = "E0";
      else if (cited.length === 1) klass = "E1";
      else klass = independence.independentPair(ids) ? "E2" : "E1+";
      evidence[klass]++;
      if (klass === "E1+" && oneVoiceExamples.length < 5) oneVoiceExamples.push(c.identifier);
      if (klass === "E1" && singleSourceExamples.length < 5) singleSourceExamples.push(c.identifier);
      if (klass === "E0" && noSourceExamples.length < 5) noSourceExamples.push(c.identifier);
      const status = typeof c.status === "string" ? c.status : "(bez stavu)";
      byStatus.set(status, (byStatus.get(status) ?? 0) + 1);
    }

    // --- zdroje ---------------------------------------------------------
    const withFamily = bucket.sources.filter(
      (s) => typeof s.sourceFamily === "string" && s.sourceFamily.trim() !== "",
    ).length;

    // --- mezery ---------------------------------------------------------
    const openGaps = bucket.gaps.filter((g) => g.status !== "closed");
    const gapsOpenHigh = openGaps.filter((g) => g.priority === HIGH_GAP_PRIORITY).length;
    const staleGaps = horizon
      ? openGaps.filter((g) => {
          const checked = isoDate(g.checked);
          return checked !== null && daysBetween(checked, horizon) > staleDays;
        })
      : [];
    const oldestChecked = openGaps
      .map((g) => isoDate(g.checked))
      .filter((x) => x !== null)
      .sort()[0] ?? null;

    // --- skóre ----------------------------------------------------------
    const breakdown = {
      claimsNoSource: evidence.E0,
      claimsSingleSource: evidence.E1,
      claimsOneVoice: evidence["E1+"],
      gapsOpenHigh,
      gapsOpenRest: openGaps.length - gapsOpenHigh,
      gapsStale: staleGaps.length,
    };
    const riskPoints = Object.entries(breakdown).reduce((sum, [k, n]) => sum + RISK_WEIGHTS[k] * n, 0);

    dossiers.push({
      slug,
      title: d.title,
      dossierType: d.dossierType,
      // Entity view (canonicalDossier ukazuje jinam) nemá vlastní registry —
      // jeho evidence se počítá u kanonického dossieru, ne dvakrát.
      role: d.canonicalDossier && d.canonicalDossier !== slug ? "view" : d.dossierType,
      canonicalDossier: d.canonicalDossier ?? null,
      updated: isoDate(d.updated),
      reviewedAt: isoDate(d.reviewedAt),
      claims: {
        total: bucket.claims.length,
        evidence,
        byStatus: Object.fromEntries(
          [...byStatus.entries()].sort(
            (a, b) => (statusOrder.indexOf(a[0]) + 1 || 99) - (statusOrder.indexOf(b[0]) + 1 || 99),
          ),
        ),
      },
      sources: {
        total: bucket.sources.length,
        withFamily,
        withoutFamily: bucket.sources.length - withFamily,
      },
      cases: bucket.cases.length,
      gaps: {
        total: bucket.gaps.length,
        open: openGaps.length,
        closed: bucket.gaps.length - openGaps.length,
        openHighPriority: gapsOpenHigh,
        stale: staleGaps.length,
        oldestChecked,
      },
      relations: bucket.relations.length,
      updates: bucket.updates.length,
      riskPoints,
      riskBreakdown: breakdown,
      examples: { noSource: noSourceExamples, singleSource: singleSourceExamples, oneVoice: oneVoiceExamples },
      nextSteps: nextStepsFor({ breakdown, staleGaps, staleDays, oldestChecked, sourcesWithoutFamily: bucket.sources.length - withFamily, examples: { noSource: noSourceExamples, singleSource: singleSourceExamples, oneVoice: oneVoiceExamples } }),
    });
  }

  // Stabilní řazení: riskPoints sestupně, při shodě slug vzestupně —
  // determinismus výstupu nesmí záviset na pořadí čtení z FS.
  dossiers.sort((a, b) => b.riskPoints - a.riskPoints || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  const totalPoints = dossiers.reduce((s, d) => s + d.riskPoints, 0);
  let cumulative = 0;
  for (const d of dossiers) {
    const preceding = cumulative;
    cumulative += d.riskPoints;
    d.share = totalPoints ? d.riskPoints / totalPoints : 0;
    d.precedingShare = totalPoints ? preceding / totalPoints : 0;
    d.cumulativeShare = totalPoints ? cumulative / totalPoints : 0;
    d.priority = bandFor(d.riskPoints, d.precedingShare);
  }

  const totals = {
    dossiers: dossiers.length,
    claims: dossiers.reduce((s, d) => s + d.claims.total, 0),
    sources: dossiers.reduce((s, d) => s + d.sources.total, 0),
    sourcesWithFamily: dossiers.reduce((s, d) => s + d.sources.withFamily, 0),
    cases: dossiers.reduce((s, d) => s + d.cases, 0),
    gaps: dossiers.reduce((s, d) => s + d.gaps.total, 0),
    gapsOpen: dossiers.reduce((s, d) => s + d.gaps.open, 0),
    gapsStale: dossiers.reduce((s, d) => s + d.gaps.stale, 0),
    relations: dossiers.reduce((s, d) => s + d.relations, 0),
    evidence: dossiers.reduce(
      (acc, d) => {
        for (const k of Object.keys(acc)) acc[k] += d.claims.evidence[k];
        return acc;
      },
      { E0: 0, E1: 0, "E1+": 0, E2: 0 },
    ),
    riskPoints: totalPoints,
  };

  return {
    schemaVersion: 1,
    generator: "scripts/data/report-evidence-plan.mjs",
    asOf: horizon,
    asOfSource: isoDate(asOf) ? "argument `--as-of`" : "nejnovější datum v datasetu",
    staleDays,
    weights: RISK_WEIGHTS,
    bandThresholds: BAND_THRESHOLDS,
    statusLabels: Object.fromEntries(statusLabels),
    totals,
    dossiers,
  };
}

/*
 * Pásmo z podílu práce ležící NAD dossierem (bez něj samotného) — viz
 * krok 3 vzorce v hlavičce modulu.
 */
export function bandFor(riskPoints, precedingShare) {
  if (riskPoints === 0) return "žádná";
  if (precedingShare < BAND_THRESHOLDS["vysoká"]) return "vysoká";
  if (precedingShare < BAND_THRESHOLDS["střední"]) return "střední";
  return "nízká";
}

/*
 * Další krok se NEVYMÝŠLÍ — každá věta je odvozená z jednoho čísla a nese
 * ho v sobě, aby šla ověřit. Pořadí = příspěvek do skóre sestupně, takže
 * první řádek je vždy ten nejvýnosnější. Kroky bez bodů (rodiny zdrojů)
 * jdou na konec.
 */
export function nextStepsFor({ breakdown, staleGaps = [], staleDays, oldestChecked, sourcesWithoutFamily, examples = {} }) {
  const steps = [];
  const push = (points, text) => steps.push({ points, text });
  const sample = (ids) => (ids?.length ? ` (např. ${ids.slice(0, 3).join(", ")})` : "");

  if (breakdown.claimsNoSource > 0) {
    push(
      RISK_WEIGHTS.claimsNoSource * breakdown.claimsNoSource,
      `${breakdown.claimsNoSource} tvrzení bez jediného citovaného zdroje${sample(examples.noSource)} → doplnit zdroj, nebo tvrzení stáhnout (redakční pravidlo 1)`,
    );
  }
  if (breakdown.claimsSingleSource > 0) {
    push(
      RISK_WEIGHTS.claimsSingleSource * breakdown.claimsSingleSource,
      `${breakdown.claimsSingleSource} tvrzení stojí na jediném zdroji${sample(examples.singleSource)} → dohledat druhého, nezávislého vydavatele`,
    );
  }
  if (breakdown.claimsOneVoice > 0) {
    push(
      RISK_WEIGHTS.claimsOneVoice * breakdown.claimsOneVoice,
      `${breakdown.claimsOneVoice} tvrzení má ≥2 zdroje, ale všechny z jedné rodiny / od jednoho vydavatele${sample(examples.oneVoice)} → dohledat jeden nezávislý doklad; tím se dostanou na CORROBORATED`,
    );
  }
  if (breakdown.gapsOpenHigh > 0) {
    push(
      RISK_WEIGHTS.gapsOpenHigh * breakdown.gapsOpenHigh,
      `${breakdown.gapsOpenHigh} otevřených mezer s prioritou „vysoká" → projít je jako první, u každé zaznamenat výsledek kontroly`,
    );
  }
  if (breakdown.gapsOpenRest > 0) {
    push(
      RISK_WEIGHTS.gapsOpenRest * breakdown.gapsOpenRest,
      `${breakdown.gapsOpenRest} dalších otevřených mezer → ověřit, jestli je nový zdroj neuzavírá`,
    );
  }
  if (breakdown.gapsStale > 0) {
    const ids = staleGaps.map((g) => g.identifier).sort();
    push(
      RISK_WEIGHTS.gapsStale * breakdown.gapsStale,
      `${breakdown.gapsStale} mezer bez kontroly déle než ${staleDays} dní${sample(ids)}${oldestChecked ? `, nejstarší kontrola ${oldestChecked}` : ""} → re-verifikace a aktualizace pole \`checked\``,
    );
  }
  if (sourcesWithoutFamily > 0) {
    push(
      0,
      `${sourcesWithoutFamily} zdrojů nemá vyplněnou \`sourceFamily\` → doplnit přes \`npm run sources:detect-family\`; bez ní se nezávislost počítá jen z outletu a přetisk agenturní zprávy může projít jako druhý hlas`,
    );
  }

  steps.sort((a, b) => b.points - a.points);
  if (steps.length === 0) {
    steps.push({ points: 0, text: "žádný odvozený krok — každé tvrzení má nezávislé doložení a žádná mezera není otevřená" });
  }
  return steps;
}

// --- render markdown -------------------------------------------------------

const pct = (x) => `${(x * 100).toFixed(1)} %`;
const cell = (v) => String(v ?? "—");

export function renderMarkdown(plan) {
  const L = [];
  L.push("# Evidenční plán práce");
  L.push("");
  L.push("> **Generováno** `npm run report:evidence-plan` (běží i v `npm run data:build`");
  L.push("> a `npm run build`) — **needitovat ručně**, ruční změna zmizí při dalším běhu.");
  L.push("> Zdroj: kanonický model `data/dossiers/**`. Strojová podoba téhož:");
  L.push(`> \`${JSON_REL}\`.`);
  L.push("");
  L.push("**Co tenhle report je.** Interní pracovní přehled evidence: kde je zdrojování");
  L.push("nejslabší a co ho konkrétně posílí. Každé číslo je spočítané z kanonických dat,");
  L.push("žádná položka není psaná rukou.");
  L.push("");
  L.push("**Co není.** Hodnocení osob. Vysoké skóre nevypovídá nic o subjektu dossieru —");
  L.push("vypovídá o tom, že **tenhle web** má u daného dossieru nejvíc nedodělané");
  L.push("zdrojovací práce. Je to metrika naší evidence, ne jeho jednání. Report se");
  L.push("neroutuje na web, nezakládá dossier a není autorizačním rozhodnutím.");
  L.push("");
  L.push(`**Datový horizont**: \`${cell(plan.asOf)}\` — ${plan.asOfSource}. Report neobsahuje čas`);
  L.push("běhu: stáří mezer se měří proti nejnovějšímu datu v datech, takže dva běhy nad");
  L.push("stejným stromem dají bajt po bajtu stejný soubor.");
  L.push("");
  L.push("## Jak se počítá priorita");
  L.push("");
  L.push("Každé tvrzení spadne do právě jedné evidenční třídy podle toho, co **skutečně");
  L.push("cituje** (ne podle deklarovaného stavu — ten je redakční popisek, tohle je");
  L.push("měření). Nezávislost dvojice zdrojů počítá `scripts/data/lib/source-independence.mjs`,");
  L.push("tentýž primitiv, kterým `validate-semantics.mjs` vynucuje S1/S2/S4/S10.");
  L.push("");
  L.push("| Třída | Význam |");
  L.push("|---|---|");
  L.push("| `E0` | žádný citovaný zdroj |");
  L.push("| `E1` | právě jeden citovaný zdroj |");
  L.push("| `E1+` | ≥2 zdroje, ale žádná nezávislá dvojice (jedna rodina / jeden vydavatel / jedna doména) — **potenciál na korroboraci**: stačí jeden nezávislý doklad |");
  L.push("| `E2` | existuje nezávislá dvojice — evidenčně hotovo |");
  L.push("");
  L.push("```");
  L.push("riskPoints = 3·E0 + 2·E1 + 1·E1+");
  L.push("           + 2·otevřené mezery s prioritou „vysoká\"");
  L.push("           + 1·ostatní otevřené mezery");
  L.push(`           + 1·otevřené mezery nekontrolované déle než ${plan.staleDays} dní`);
  L.push("```");
  L.push("");
  L.push("Váha = jak slabá je evidence. `E2` body nedává (hotový stav). Zdroje bez");
  L.push("`sourceFamily` se do skóre **záměrně nepočítají**: prázdná rodina není chyba");
  L.push("evidence, protože nezávislost pak spočítá fallback na `outlet`. Report je měří");
  L.push("a navrhuje jako krok, ale prioritu jimi nepřiživuje.");
  L.push("");
  L.push("Pásmo priority není pevný práh (ten by byl odhad), ale **Pareto podíl na celkovém");
  L.push("objemu práce**. Dossiery seřazené sestupně; rozhoduje podíl práce ležící **nad**");
  L.push("dossierem (bez něj samotného):");
  L.push(`\`< ${pct(BAND_THRESHOLDS["vysoká"])}\` → **vysoká**, \`< ${pct(BAND_THRESHOLDS["střední"])}\` → **střední**, zbytek → **nízká**, nula bodů → **žádná**.`);
  L.push("„Vysoká\" je tedy nejmenší skupina dossierů, která dohromady drží aspoň polovinu");
  L.push("veškeré nedodělané zdrojovací práce.");
  L.push("");

  const t = plan.totals;
  L.push("## Souhrn");
  L.push("");
  L.push("| Metrika | Hodnota |");
  L.push("|---|---|");
  L.push(`| Dossierů | ${t.dossiers} |`);
  L.push(`| Tvrzení | ${t.claims} |`);
  L.push(
    `| — z toho \`E0\` / \`E1\` / \`E1+\` / \`E2\` | ${t.evidence.E0} / ${t.evidence.E1} / ${t.evidence["E1+"]} / ${t.evidence.E2} |`,
  );
  L.push(`| Zdrojů (z toho s vyplněnou \`sourceFamily\`) | ${t.sources} (${t.sourcesWithFamily}) |`);
  L.push(`| Kauz | ${t.cases} |`);
  L.push(`| Mezer celkem / otevřených / zastaralých | ${t.gaps} / ${t.gapsOpen} / ${t.gapsStale} |`);
  L.push(`| Vztahů | ${t.relations} |`);
  L.push(`| Bodů rizika celkem | ${t.riskPoints} |`);
  L.push("");

  L.push("## Pořadí dossierů");
  L.push("");
  L.push("| # | Dossier | Priorita | Body | Podíl | Kumul. | Tvrzení | `E0`/`E1`/`E1+`/`E2` | Otevřené mezery | Zdroje bez rodiny | Aktualizováno |");
  L.push("|---:|---|---|---:|---:|---:|---:|---|---:|---:|---|");
  for (const [i, d] of plan.dossiers.entries()) {
    const e = d.claims.evidence;
    L.push(
      `| ${i + 1} | [${d.title}](../data/dossiers/${d.slug}/) \`${d.slug}\`${d.role === "view" ? " *(view)*" : ""} | **${d.priority}** | ${d.riskPoints} | ${pct(d.share)} | ${pct(d.cumulativeShare)} | ${d.claims.total} | ${e.E0}/${e.E1}/${e["E1+"]}/${e.E2} | ${d.gaps.open}${d.gaps.stale ? ` (${d.gaps.stale} zastaralých)` : ""} | ${d.sources.withoutFamily} | ${cell(d.updated)} |`,
    );
  }
  L.push("");

  L.push("## Plán per dossier");
  L.push("");
  for (const [i, d] of plan.dossiers.entries()) {
    const e = d.claims.evidence;
    L.push(`### ${i + 1}. ${d.title} — \`${d.slug}\``);
    L.push("");
    if (d.role === "view") {
      L.push(`> Entity view kanonického dossieru \`${d.canonicalDossier}\` — vlastní registry nemá,`);
      L.push("> jeho evidence se počítá tam a tady se nezdvojuje.");
      L.push("");
    }
    L.push(
      `**Priorita ${d.priority}** · ${d.riskPoints} bodů (${pct(d.share)} celkového objemu práce) · typ \`${d.dossierType}\` · aktualizováno \`${cell(d.updated)}\`, revidováno \`${cell(d.reviewedAt)}\``,
    );
    L.push("");
    L.push("| Tvrzení | `E0` | `E1` | `E1+` | `E2` | Zdroje | s rodinou | Kauzy | Mezery (otevřené) | Vztahy |");
    L.push("|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
    L.push(
      `| ${d.claims.total} | ${e.E0} | ${e.E1} | ${e["E1+"]} | ${e.E2} | ${d.sources.total} | ${d.sources.withFamily} | ${d.cases} | ${d.gaps.total} (${d.gaps.open}) | ${d.relations} |`,
    );
    L.push("");
    const statusEntries = Object.entries(d.claims.byStatus);
    if (statusEntries.length) {
      L.push(
        `Deklarované stavy: ${statusEntries.map(([s, n]) => `${plan.statusLabels[s] ?? s} ${n}`).join(" · ")}`,
      );
      L.push("");
    }
    L.push("Další krok:");
    L.push("");
    for (const step of d.nextSteps) L.push(`- ${step.text}`);
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("*Vygenerováno z kanonického modelu. Chceš jiné číslo? Změň data, ne tenhle soubor.*");
  return `${L.join("\n")}\n`;
}

// --- CLI -------------------------------------------------------------------

export function parseArgs(argv) {
  const get = (name) => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : null;
  };
  const staleDays = get("stale-days");
  return {
    asOf: get("as-of"),
    staleDays: staleDays === null ? DEFAULT_STALE_DAYS : Number.parseInt(staleDays, 10),
    json: argv.includes("--json"),
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { asOf, staleDays, json } = parseArgs(process.argv.slice(2));
  if (!Number.isInteger(staleDays) || staleDays < 0) {
    console.error("report:evidence-plan: --stale-days musí být nezáporné celé číslo.");
    process.exit(2);
  }
  const model = await loadCanonicalDataset();
  const plan = buildEvidencePlan(model, { asOf, staleDays });

  if (json) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    const jsonFile = join(REPO_ROOT, ...JSON_REL.split("/"));
    const mdFile = join(REPO_ROOT, ...MARKDOWN_REL.split("/"));
    mkdirSync(dirname(jsonFile), { recursive: true });
    mkdirSync(dirname(mdFile), { recursive: true });
    writeFileSync(jsonFile, `${JSON.stringify(plan, null, 2)}\n`);
    writeFileSync(mdFile, renderMarkdown(plan));
    const top = plan.dossiers[0];
    console.log(
      `Evidenční plán: ${plan.totals.dossiers} dossierů, ${plan.totals.riskPoints} bodů rizika, ` +
        `horizont ${plan.asOf} → ${MARKDOWN_REL} + ${JSON_REL}`,
    );
    if (top) console.log(`  Nejvyšší priorita: ${top.slug} (${top.riskPoints} bodů, ${pct(top.share)}).`);
    console.log("OK");
  }
}
