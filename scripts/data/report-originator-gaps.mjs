#!/usr/bin/env node
/*
 * Detektor původního zjišťovatele — GENEROVANÝ seznam tvrzení, u nichž
 * chybí ten zdroj, který věc zjistil jako první.
 *
 * PROBLÉM, KTERÝ ŘEŠÍ
 * -------------------
 * Rešerše přirozeně sbírá to, co je vidět: agenturní zprávu a její
 * přetisky. Vznikne tak tvrzení, které cituje čtyři různé outlety a
 * vypadá bohatě zdrojované — jenže všechny čtyři přetiskly tentýž text
 * ČTK. Pravidlo S10 to správně odmítne uznat jako nezávislé doložení
 * (`validate-semantics.mjs`), ale neřekne, KDE nezávislý hlas hledat.
 *
 * Tenhle report to řekne. Vychází z pozorování, které se v datech
 * potvrzuje: takové tvrzení skoro vždy samo JMENUJE toho, kdo věc
 * zjistil — „podle zjištění Seznam Zpráv", „jak napsal Deník N",
 * „s odkazem na iROZHLAS". Ten jmenovaný outlet je hledaný původní
 * zdroj, a když mezi citovanými zdroji chybí, je to konkrétní,
 * dohledatelná stopa, ne obecné „dohledat druhý zdroj".
 *
 * CO REPORT JE A CO NENÍ
 * ----------------------
 *   JE:   seznam stop k ověření. Každá říká: tohle tvrzení stojí na
 *         jednom hlasu a samo jmenuje outlet, který mezi jeho zdroji
 *         není.
 *   NENÍ: závěr, že ten outlet tvrzení doloží. Jmenování je stopa —
 *         konkrétní článek se musí najít, otevřít a přečíst, a když
 *         nesedí, zdroj se NEPŘIPOJÍ. Ověřeno v praxi: u jedné stopy
 *         se článek nenašel vůbec, u jiné byl za paywallem právě v té
 *         části, kde leželo jádro tvrzení.
 *   NENÍ: publikovaný obsah. Výstupy jdou do reports/ a
 *         data/generated/, nikdy do content/.
 *
 * PROČ SE OUTLETY POROVNÁVAJÍ PŘESNĚ
 * ----------------------------------
 * První, ruční verze tohohle detektoru porovnávala název outletu podle
 * prvního slova malými písmeny — a „Deník N" se jí shodovalo s
 * „Deník.cz", „Ekonomický deník" i „Jihlavský deník". Výsledek byl
 * nafouknutý o třetinu. Porovnává se proto normalizovaný celý název
 * (bez diakritiky a nealfanumerických znaků) na PREFIX, aby „Seznam
 * Zprávy" sedlo na „Seznam Zprávy: …" v titulku, ale ne na cizí
 * vydavatele.
 *
 * NEZÁVISLOST SE NEPOČÍTÁ ZNOVU
 * -----------------------------
 * Otázku „stojí tohle tvrzení na jednom hlasu?" vlastní
 * lib/source-independence.mjs — tentýž primitiv, kterým
 * validate-semantics vynucuje S1/S2/S4/S10.
 *
 * DETERMINISMUS: report neobsahuje čas běhu, takže dva běhy nad stejným
 * stromem dají bajt po bajtu stejný soubor.
 *
 * Použití:
 *   npm run report:originator-gaps
 *   node scripts/data/report-originator-gaps.mjs --json   # stdout, nic nezapíše
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalDataset, compileDataset } from "./lib/dataset.mjs";
import { createSourceIndependence } from "./lib/source-independence.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const MARKDOWN_REL = "reports/originator-gaps.md";
export const JSON_REL = "data/generated/originator-gaps.json";

/*
 * Outlety, jejichž jmenování v textu tvrzení je smysluplná stopa.
 * Záměrně NE seznam „všech médií": hledá se redakce, která si zjištění
 * připisuje a bývá tak v textu citovaná. Varianty pokrývají české
 * skloňování, protože tvrzení píšou lidé, ne stroj.
 *
 * Seznam je jediné místo v tomhle souboru, které je věcným rozhodnutím,
 * ne odvozením z dat — proto je nahoře a okomentovaný, ne schovaný v
 * kódu níž.
 */
export const ORIGINATORS = [
  { canonical: "Seznam Zprávy", mentions: ["Seznam Zprávy", "Seznam Zpráv", "Seznamu Zpráv", "Seznam Zprávám"] },
  { canonical: "Deník N", mentions: ["Deník N", "Deníku N", "Deníkem N", "Deníkem N"] },
  { canonical: "iROZHLAS", mentions: ["iROZHLAS", "iRozhlas", "Radiožurnál"] },
  { canonical: "Hospodářské noviny", mentions: ["Hospodářské noviny", "Hospodářských novin", "Hospodářským novinám"] },
  { canonical: "Investigace.cz", mentions: ["Investigace.cz"] },
  { canonical: "HlídacíPes.org", mentions: ["HlídacíPes", "Hlídací pes", "HlídacíPes.org"] },
  { canonical: "Respekt", mentions: ["Respekt", "Respektu"] },
  { canonical: "FORUM 24", mentions: ["FORUM 24", "Forum 24", "Forum24"] },
  { canonical: "Reflex", mentions: ["Reflex", "Reflexu"] },
  { canonical: "Česká justice", mentions: ["Česká justice", "České justice", "Českou justici"] },
  { canonical: "ČT24", mentions: ["ČT24", "Interview ČT24"] },
  { canonical: "Romea.cz", mentions: ["Romea.cz", "Romea"] },
  { canonical: "Médiář", mentions: ["Médiář", "Médiáře"] },
  { canonical: "Ekonomický deník", mentions: ["Ekonomický deník", "Ekonomického deníku"] },
];

const normalize = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const refIds = (refs) => (Array.isArray(refs) ? refs : []).map((r) => r?.["@id"]).filter(Boolean);

const claimText = (claim) =>
  [claim.text, ...(Array.isArray(claim.content) ? claim.content.map((b) => b?.value) : [])]
    .filter((v) => typeof v === "string")
    .join("\n");

/*
 * buildOriginatorGaps(model) → serializovatelný report.
 * `model` je surový kanonický model (loadCanonicalDataset / fixture);
 * kompilace probíhá uvnitř, aby volající neskládal pipeline.
 */
export function buildOriginatorGaps(model) {
  const compiled = compileDataset(model);
  const independence = createSourceIndependence((iri) => compiled.indexes.byId[iri]?.record);

  // zdroje per dossier — kvůli otázce „leží ten outlet už v dossieru?"
  const sourcesByDossier = new Map();
  for (const w of compiled.records) {
    if (w.registry !== "sources") continue;
    const list = sourcesByDossier.get(w.dossier) ?? [];
    list.push(w.record);
    sourcesByDossier.set(w.dossier, list);
  }

  const findings = [];
  for (const w of compiled.records) {
    if (w.registry !== "claims") continue;
    const claim = w.record;
    const ids = [...new Set(refIds(claim.sources))];
    const cited = independence.existingSources(ids);
    if (cited.length === 0) continue;
    // Zajímají jen tvrzení stojící na jednom hlasu. Kde už nezávislá
    // dvojice je, není co doplňovat.
    if (independence.independentPair(ids)) continue;

    const citedRecords = ids.map((id) => compiled.indexes.byId[id]?.record).filter(Boolean);
    const citedOutlets = citedRecords.map((r) => normalize(r.outlet));
    const text = claimText(claim);

    for (const originator of ORIGINATORS) {
      if (!originator.mentions.some((m) => text.includes(m))) continue;
      const target = normalize(originator.canonical);
      // už citovaný? pak to není mezera
      if (citedOutlets.some((o) => o.startsWith(target))) continue;

      const inDossier = (sourcesByDossier.get(w.dossier) ?? [])
        .filter((s) => normalize(s.outlet).startsWith(target))
        .map((s) => ({ identifier: s.identifier, published: s.published ?? null, title: s.title ?? null }));

      findings.push({
        dossier: w.dossier,
        claim: claim.identifier,
        status: claim.statusLabel ?? claim.status ?? null,
        missingOriginator: originator.canonical,
        citedSources: citedRecords.map((r) => ({ identifier: r.identifier, outlet: r.outlet ?? null })),
        // Kandidáti od téhož vydavatele, kteří v dossieru už jsou.
        // POZOR: shoda vydavatele NENÍ shoda článku — ověřeno, že
        // většina takových kandidátů je o jiném tématu nebo z jiného
        // roku. Slouží jen k tomu, aby se nejdřív hledalo doma.
        candidatesAlreadyInDossier: inDossier,
      });
    }
  }

  findings.sort((a, b) =>
    a.dossier < b.dossier ? -1 : a.dossier > b.dossier ? 1 : a.claim < b.claim ? -1 : a.claim > b.claim ? 1 : 0,
  );

  const byOriginator = {};
  for (const f of findings) byOriginator[f.missingOriginator] = (byOriginator[f.missingOriginator] ?? 0) + 1;
  const byDossier = {};
  for (const f of findings) byDossier[f.dossier] = (byDossier[f.dossier] ?? 0) + 1;

  return {
    schemaVersion: 1,
    generator: "scripts/data/report-originator-gaps.mjs",
    totals: {
      findings: findings.length,
      withCandidateInDossier: findings.filter((f) => f.candidatesAlreadyInDossier.length > 0).length,
      dossiers: Object.keys(byDossier).length,
    },
    byOriginator,
    byDossier,
    findings,
  };
}

function renderMarkdown(report) {
  const L = [];
  L.push("# Detektor původního zjišťovatele");
  L.push("");
  L.push("> **Generováno** `npm run report:originator-gaps` — **needitovat ručně**,");
  L.push("> ruční změna zmizí při dalším běhu. Zdroj: kanonický model");
  L.push("> `data/dossiers/**`. Strojová podoba: `data/generated/originator-gaps.json`.");
  L.push("");
  L.push("**Co tenhle report je.** Seznam tvrzení, která stojí na jediném hlasu");
  L.push("(všechny citované zdroje spadají do jedné rodiny podle pravidla S10) a která");
  L.push("přitom sama **jmenují** outlet, jenž mezi jejich zdroji chybí. Ten jmenovaný");
  L.push("je typicky ten, kdo věc zjistil jako první — tedy konkrétní stopa, kde hledat");
  L.push("nezávislé doložení.");
  L.push("");
  L.push("**Co není.** Závěr. Jmenování outletu nedokazuje, že ten outlet tvrzení");
  L.push("doloží: konkrétní článek se musí najít, otevřít a přečíst. Když nesedí nebo");
  L.push("je jádro tvrzení za paywallem, zdroj se **nepřipojí** a tvrzení zůstane na");
  L.push("jednom zdroji — to je správný výsledek, ne selhání.");
  L.push("");
  L.push(`**Nalezeno:** ${report.totals.findings} stop ve ${report.totals.dossiers} dossierech.`);
  L.push("");
  L.push("## Podle chybějícího zjišťovatele");
  L.push("");
  L.push("| Outlet | Stop |");
  L.push("|---|---|");
  for (const [outlet, count] of Object.entries(report.byOriginator).sort((a, b) => b[1] - a[1])) {
    L.push(`| ${outlet} | ${count} |`);
  }
  L.push("");
  L.push("## Stopy");
  L.push("");
  let currentDossier = null;
  for (const f of report.findings) {
    if (f.dossier !== currentDossier) {
      currentDossier = f.dossier;
      L.push("");
      L.push(`### ${currentDossier}`);
      L.push("");
      L.push("| Tvrzení | Stav | Chybí | Cituje dnes | Kandidáti v dossieru |");
      L.push("|---|---|---|---|---|");
    }
    const cited = f.citedSources.map((s) => `${s.identifier} (${s.outlet ?? "?"})`).join(", ");
    const cand = f.candidatesAlreadyInDossier.length
      ? f.candidatesAlreadyInDossier.map((c) => `${c.identifier}${c.published ? ` ${c.published}` : ""}`).join(", ")
      : "—";
    L.push(`| ${f.claim} | ${f.status ?? "—"} | ${f.missingOriginator} | ${cited} | ${cand} |`);
  }
  L.push("");
  L.push("## Poznámka ke sloupci „kandidáti v dossieru\"");
  L.push("");
  L.push("Uvádí zdroje od hledaného vydavatele, které v tomtéž dossieru **už jsou**.");
  L.push("Je to zkratka, kde začít hledat — **ne** návrh, co připojit. Shoda vydavatele");
  L.push("není shoda článku: při ověření se ukázalo, že většina takových kandidátů se");
  L.push("týká jiného tématu nebo je o měsíce až roky vedle. Zvlášť pozor na kandidáty,");
  L.push("kteří jsou sami agenturní přetisk — připojení takového zdroje nevyrobí");
  L.push("nezávislé doložení, jen iluzi druhého hlasu.");
  return `${L.join("\n")}\n`;
}

async function main() {
  const jsonOnly = process.argv.includes("--json");
  const model = await loadCanonicalDataset();
  const report = buildOriginatorGaps(model);

  if (jsonOnly) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  const jsonFile = join(REPO_ROOT, JSON_REL);
  const mdFile = join(REPO_ROOT, MARKDOWN_REL);
  mkdirSync(dirname(jsonFile), { recursive: true });
  mkdirSync(dirname(mdFile), { recursive: true });
  writeFileSync(jsonFile, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(mdFile, renderMarkdown(report));
  console.log(
    `Wrote ${JSON_REL} and ${MARKDOWN_REL}: ${report.totals.findings} stop, ` +
      `z toho ${report.totals.withCandidateInDossier} má kandidáta téhož vydavatele už v dossieru.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
