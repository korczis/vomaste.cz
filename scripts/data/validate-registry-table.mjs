// Parita přehledové tabulky dossieru s kanonickými záznamy (T-028 fáze H).
//
// Dossier _index záměrně drží DVĚ reprezentace každého tvrzení: ručně
// psanou řádku v tabulce „Registr tvrzení“ (markdown v dossier.json
// contentBlocks) a kanonický claim záznam. Do fáze H tuhle paritu
// vynucoval scripts/dossier/validate-dossier.mjs nad content/** — od
// fáze H je content generovaný a JEDINÝM vlastníkem těchto pravidel je
// tento modul, který čte výhradně kanonický model:
//
//   T1  každá CLM řádka tabulky má <a id="clm-##"> kotvu se shodným
//       číslem a odkaz na svou detailní stránku (@/dossiers/<slug>/
//       claims/clm-##.md) se shodným slugem
//   T2  množina řádek tabulky == množina kanonických claim záznamů (1:1,
//       žádný duplicitní CLM v tabulce)
//   T3  řádka a záznam se shodují byte-verně: text == claim.text, status
//       badge == claim.status, label == claim.statusLabel, SRC reference
//       řádky == claim.sources (množinově)
//   T4  status badge v tabulce je ze známého slovníku (překlep v ručně
//       psané tabulce nesmí projít)
//   T5  status-corroborated s ≥2 SRC musí vést na ≥2 RŮZNÉ URL — týž
//       článek citovaný dvakrát je jeden zdroj, ne nezávislé potvrzení
//       (rodinovou nezávislost vlastní S2; tohle je URL dedup)
//   T6  interní odkazy těla na zdroje (@/…/sources/src-##.md) a mezery
//       (@/…/gaps/gap-##.md) vedou na existující záznamy; text odkazu
//       SRC-## se shoduje s cílem
//   T7  zdroj: plnostránková doktrína — markdown tělo kanonického source
//       záznamu má ≥150 znaků (redakční kontext, ne holý metadata stub)
//   T8  (warning) CLM řádka bez SRC reference; context-only zdroj
//       (claims = []) neodkázaný z těla dossieru; duplicitní kanonická
//       URL dvou zdrojů
//
// Rozpuštěná pravidla dřívějšího validate-dossier.mjs (bez náhrady,
// důvod = jediný zdroj pravdy): parita claim/case stránek s tabulkou a
// [[extra.cases]] bloky (stránky i bloky se GENERUJÍ z kanonických
// záznamů), tvary front matter polí (vlastní schemas/canonical/ +
// validate-references R3).
const refIds = (arr) => (Array.isArray(arr) ? arr : []).map((r) => r?.["@id"]).filter((x) => typeof x === "string");
const localPart = (iri) => (typeof iri === "string" ? iri.split("/").pop() : null);

const KNOWN_STATUSES = new Set([
  "status-corroborated",
  "status-single",
  "status-quote",
  "status-disputed",
  "status-opinion",
]);

const mdBody = (blocks) =>
  (Array.isArray(blocks) ? blocks : [])
    .filter((b) => b?.type === "markdown")
    .map((b) => b.value)
    .join("\n\n");

export function validateRegistryTables(model) {
  const errors = [];
  const warnings = [];

  const bySlug = new Map(); // slug -> { claims: [], sources: [] }
  for (const w of model.records) {
    if (w.registry !== "claims" && w.registry !== "sources") continue;
    const bucket = bySlug.get(w.dossier) ?? { claims: [], sources: [] };
    bySlug.set(w.dossier, bucket);
    bucket[w.registry].push(w);
  }

  for (const wrapper of model.records) {
    if (wrapper.registry !== "dossier") continue;
    const slug = wrapper.record.slug;
    const bucket = bySlug.get(slug);
    if (!bucket || bucket.claims.length === 0) continue; // dossier bez vlastních tvrzení tabulku nemá
    const tag = (msg) => `[${slug}] ${msg}`;
    const err = (msg) => errors.push(tag(msg));
    const warn = (msg) => warnings.push(tag(msg));

    const body = mdBody(wrapper.record.contentBlocks);
    const claimById = new Map(bucket.claims.map((w) => [w.record.identifier, w.record]));
    const sourceById = new Map(bucket.sources.map((w) => [w.record.identifier, w.record]));

    // --- T1 + T2 + T3 + T4: řádky tabulky --------------------------------
    const clmRowRe = /^\|\s*(?:<a id="clm-(\d+)"><\/a>)?\[?(CLM-\d+)\]?(?:\(@\/dossiers\/([a-z0-9-]+)\/claims\/(clm-\d+)\.md\))?\s*\|\s*(.+?)\s*\|\s*<span class="status-badge (status-[a-z]+)">([^<]+)<\/span>\s*\|(.+)\|$/gm;
    const seenRows = new Set();
    let m;
    while ((m = clmRowRe.exec(body))) {
      const [, anchorNum, id, linkDossier, linkSlug, text, statusClass, statusLabel, sourcesCell] = m;
      if (seenRows.has(id)) err(`Duplicitní CLM řádka v tabulce: ${id}`);
      seenRows.add(id);

      if (!anchorNum) err(`${id}: řádka tabulky nemá <a id="clm-##"></a> kotvu — není přímo odkazovatelná`);
      else if (`CLM-${anchorNum}` !== id) err(`${id}: kotva id="clm-${anchorNum}" nesedí na id řádky`);

      const expectedSlug = "clm-" + id.match(/CLM-(\d+)/)[1];
      if (!linkSlug) err(`${id}: buňka id není odkaz na detailní stránku (očekávám [${id}](@/dossiers/${slug}/claims/${expectedSlug}.md))`);
      else {
        if (linkSlug !== expectedSlug) err(`${id}: řádka odkazuje na ${linkSlug}.md, očekávám ${expectedSlug}.md`);
        if (linkDossier !== slug) err(`${id}: řádka odkazuje do dossieru "${linkDossier}", očekávám "${slug}"`);
      }

      if (!KNOWN_STATUSES.has(statusClass)) err(`${id}: neznámý status "${statusClass}" — povolené: ${[...KNOWN_STATUSES].join(", ")}`);

      const record = claimById.get(id);
      if (!record) {
        err(`${id}: řádka tabulky nemá kanonický claim záznam`);
        continue;
      }
      if (record.text !== text) err(`${id}: text řádky se neshoduje byte-verně s claim.text (rozjetá kopie)`);
      if (record.status !== statusClass) err(`${id}: status tabulky "${statusClass}" ≠ claim.status "${record.status}"`);
      if (record.statusLabel !== statusLabel.trim()) err(`${id}: label tabulky "${statusLabel.trim()}" ≠ claim.statusLabel "${record.statusLabel}"`);

      const rowSrcs = new Set([...sourcesCell.matchAll(/SRC-\d+/g)].map((x) => x[0]));
      const recordSrcs = new Set(refIds(record.sources).map(localPart));
      if (rowSrcs.size !== recordSrcs.size || [...rowSrcs].some((s) => !recordSrcs.has(s))) {
        err(`${id}: zdroje řádky [${[...rowSrcs].join(", ")}] ≠ claim.sources [${[...recordSrcs].join(", ")}]`);
      }
      if (rowSrcs.size === 0) warn(`${id}: řádka tabulky bez SRC-## reference`);

      // T5 — URL dedup u corroborated (rodiny vlastní S2, tohle je URL rovina).
      if (statusClass === "status-corroborated" && recordSrcs.size >= 2) {
        const urls = new Set([...recordSrcs].map((s) => sourceById.get(s)?.url).filter(Boolean));
        if (urls.size < 2) {
          err(`${id}: status-corroborated cituje ${recordSrcs.size} zdroj(e) vedoucí na ${urls.size} URL — týž článek dvakrát není nezávislé potvrzení`);
        }
      }
    }
    if (seenRows.size === 0) err(`V těle dossieru nenalezena žádná CLM-## řádka — formát tabulky se možná změnil.`);
    for (const id of claimById.keys()) {
      if (!seenRows.has(id)) err(`${id}: kanonický claim záznam nemá řádku v tabulce Registr tvrzení`);
    }

    // --- T6: interní odkazy těla na zdroje a mezery ----------------------
    const linkedSrcIds = new Set();
    const linkedSrcRe = new RegExp(`\\[([^\\]]*)\\]\\(@/dossiers/${slug}/sources/src-(\\d+)\\.md\\)`, "g");
    while ((m = linkedSrcRe.exec(body))) {
      const [, linkText, targetNum] = m;
      const textAsSrc = linkText.match(/^SRC-(\d+)$/);
      if (textAsSrc && textAsSrc[1] !== targetNum) err(`Text odkazu SRC-${textAsSrc[1]} vede na src-${targetNum}.md — nesouhlasí id v odkazu.`);
      const srcId = `SRC-${targetNum.padStart(2, "0")}`;
      linkedSrcIds.add(srcId);
      if (!sourceById.has(srcId)) err(`Tělo dossieru odkazuje ${srcId}, ale žádný takový kanonický zdroj neexistuje`);
    }
    const gapIds = new Set(model.records.filter((w) => w.dossier === slug && w.registry === "gaps").map((w) => w.record.identifier));
    const linkedGapRe = new RegExp(`\\[(GAP-\\d+)\\]\\(@/dossiers/${slug}/gaps/gap-\\d+\\.md\\)`, "g");
    while ((m = linkedGapRe.exec(body))) {
      if (!gapIds.has(m[1])) err(`Tělo dossieru odkazuje ${m[1]}, ale žádná taková kanonická mezera neexistuje`);
    }

    // --- T7 + T8: zdroje --------------------------------------------------
    const urlToSrc = new Map();
    for (const sw of bucket.sources) {
      const r = sw.record;
      const bodyLength = mdBody(r.content).trim().length;
      if (bodyLength < 150) {
        err(`${r.identifier}: tělo zdroje má ${bodyLength} znaků (<150) — plnostránková doktrína vyžaduje redakční poznámku (co dokládá, nezávislost, limity), ne holý metadata stub`);
      }
      if (r.url) {
        if (urlToSrc.has(r.url) && urlToSrc.get(r.url) !== r.identifier) {
          warn(`Duplicitní kanonická URL: ${r.url} nesou ${urlToSrc.get(r.url)} i ${r.identifier} — potvrdit záměr, nebo sloučit.`);
        } else {
          urlToSrc.set(r.url, r.identifier);
        }
      }
      if (refIds(r.claims).length === 0 && !linkedSrcIds.has(r.identifier)) {
        warn(`${r.identifier} je claims = [] (context-only) a tělo dossieru na něj neodkazuje — mrtvá stránka?`);
      }
    }
  }

  return { errors, warnings };
}
