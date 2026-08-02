// Redakční (sémantická) pravidla kanonického datasetu (T-028 fáze C).
// Tento modul je JEDINÝ vlastník níže vyjmenovaných pravidel (jedno
// pravidlo, jeden vlastník — schemas/README.md); tvar vlastní
// schemas/canonical/, referenční existenci validate-references.mjs.
//
//   S1  claim status-single ⇒ ≥1 citovaný zdroj a všechny citované
//       zdroje z JEDNÉ source family (ERROR). Nezávislost se počítá
//       přes rodiny, ne přes ID/URL: dva zdroje téže rodiny (převzatá
//       agenturní zpráva) jsou jedno doložení, takže status-single je
//       pro ně správný; 2+ rodin evidenci podhodnocuje a patří
//       status-corroborated (sémantika opravy 6b0bd4d, dříve
//       validate-dossier.mjs)
//   S2  claim status-corroborated ⇒ ≥2 zdroje z ≥2 různých source
//       families; rodina = neprázdné sourceFamily, jinak outlet, jinak
//       zdroj sám za sebe (ERROR — zrcadlí validate-dossier.mjs)
//   S3  relation se statusem != contextual ⇒ ≥1 existující claim
//       i ≥1 existující zdroj (tvarové minItems na polích vlastní
//       relation.schema.json; tady se vlastní sémantika „hrana má
//       skutečnou evidenci", tedy počítají se jen rozložitelné cíle)
//   S4  relation status single ⇒ přesně 1 zdroj (ERROR, zrcadlí
//       validate-graph.mjs); status corroborated ⇒ ≥2 source families
//       (WARNING, zrcadlí validate-graph.mjs, který to také jen hlásí)
//   S5  autorizace: každý dossier s dossierType=entity má neprázdné
//       authorization.records a každý záznam existuje
//       v data/authorizations.toml (transkripce append-only logu
//       v AGENTS.md — parsuje se přímo, žádný druhý ručně udržovaný
//       registr nevzniká; stejný princip jako validate-authorization.mjs)
//   S6  žádná kontextová entita (publicationRole=context) nesmí být
//       subjektem dossieru — nesmí mít subjectOf, dossierEnabled=true
//       ani dossierStatus=authorized (zrcadlí validate-authorization.mjs)
//   S7  subjektové uzly grafu (dossier.graph, fáze H — dřívější
//       validate-graph.mjs): množina uzlů se subject=true se přesně
//       rovná autorizovaným subjektům dossieru (dossier.subject, u
//       agregátu sjednocení subjektů agregovaných dossierů)
//   S8  souvislost grafu (dřívější validate-graph.mjs): každý uzel má
//       cestu k subjektovému uzlu — BFS hloubka
//       (scripts/data/lib/graph-depth.mjs) nesmí být null
//   S9  provenance refs entit se rozliší: každé CLM-##/SRC-## v
//       provenance.claimRefs/sourceRefs sdílené entity musí existovat
//       aspoň v jednom dossieru z jejího pole `dossiers` (composite-key
//       sémantika dle entity.schema.json) — jinak jde o zamrzlý odkaz
//       po smazání/sloučení zdroje nebo o chybný zápis při extrakci
//
// Baseline (T-028 fáze D, grandfathered debt): porušení zděděná 1:1
// z migrovaného obsahu se NEopravují změnou dat ani změkčením pravidel —
// místo toho žijí v explicitním allowlistu
// data/dossiers/_shared/semantics-baseline.json (generuje ho migrátor
// scripts/migrations/migrate-content-to-json.mjs): záznam (@id, rule)
// v allowlistu degraduje chybu na warning; JAKÉKOLI nové porušení mimo
// allowlist zůstává chybou. Grandfatherovat lze jen evidenční pravidla
// S1–S4; autorizační pravidla S5/S6 nikdy.
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeGraphDepths } from "./lib/graph-depth.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const AUTHORIZATIONS_TOML = join(ROOT, "data/authorizations.toml");
export const SEMANTICS_BASELINE_RELPATH = "_shared/semantics-baseline.json";
export const BASELINEABLE_RULES = new Set(["S1", "S2", "S3", "S4"]);

// Jednoduchý parser [[authorizations]] bloků — čte identická data jako
// scripts/dossier/validate-authorization.mjs (týž soubor, týž tvar);
// registr samotný je data/authorizations.toml, tady se jen čte.
export function loadAuthorizationIds(tomlPath = AUTHORIZATIONS_TOML) {
  const text = readFileSync(tomlPath, "utf8");
  const ids = new Set();
  const re = /\[\[authorizations\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g;
  let m;
  while ((m = re.exec(text))) {
    const id = m[1].match(/^id\s*=\s*"((?:[^"\\]|\\.)*)"/m);
    if (id) ids.add(id[1]);
  }
  return ids;
}

// Allowlist grandfathered porušení: { entries: [{ "@id", rule, reason? }] }.
// Chybějící soubor = prázdný allowlist (výchozí stav před migrací).
export function loadSemanticsBaseline(path) {
  if (!path || !existsSync(path)) return [];
  const doc = JSON.parse(readFileSync(path, "utf8"));
  return Array.isArray(doc?.entries) ? doc.entries : [];
}

const refIds = (arr) => (Array.isArray(arr) ? arr : []).map((r) => r?.["@id"]).filter((x) => typeof x === "string");

/*
 * Nálezy s identitou pravidla a záznamu — nižší vrstva pro
 * validateSemantics (aplikuje baseline) a pro migrátor fáze D (baseline
 * generuje). Vrací { findings: [{ rule, id, relPath, message }],
 * warnings: [string] }. options.authorizations: Set autorizačních id
 * (testy si injektují syntetickou množinu); default se parsuje
 * z options.authorizationsPath / data/authorizations.toml.
 */
export function collectSemanticsFindings(model, options = {}) {
  const findings = [];
  const warnings = [];
  const found = (rule, wrapper, message) =>
    findings.push({ rule, id: wrapper.record?.["@id"] ?? null, relPath: wrapper.relPath, message });

  const byId = new Map();
  for (const wrapper of [...model.records, ...model.entities]) {
    if (typeof wrapper.record?.["@id"] === "string") byId.set(wrapper.record["@id"], wrapper);
  }

  // Rodina zdroje: sourceFamily > outlet > zdroj sám za sebe. Zdroje se
  // stejnou rodinou se počítají jako JEDEN nezávislý zdroj (převzetí téže
  // agenturní zprávy) — definice z schemas/canonical/source.schema.json.
  const familyOf = (sourceId) => {
    const source = byId.get(sourceId)?.record;
    if (!source) return sourceId; // neexistenci hlásí validate-references
    const family = typeof source.sourceFamily === "string" ? source.sourceFamily.trim() : "";
    if (family) return `family:${family}`;
    const outlet = typeof source.outlet === "string" ? source.outlet.trim() : "";
    if (outlet) return `outlet:${outlet}`;
    return sourceId;
  };
  const existingSources = (ids) => ids.filter((id) => byId.get(id)?.record.recordType === "source");
  const familiesOf = (ids) => new Set(existingSources(ids).map(familyOf));

  // --- S1 + S2: claims ---------------------------------------------------
  for (const wrapper of model.records) {
    if (wrapper.registry !== "claims") continue;
    const { record, relPath } = wrapper;
    const distinct = [...new Set(refIds(record.sources))];
    if (record.status === "status-single") {
      // Nezávislost přes RODINY, ne přes ID/URL (oprava 6b0bd4d): dva
      // zdroje téže rodiny jsou jedno doložení — status-single je pro ně
      // správný. Kontrola slepá k rodinám by správnou opravu zablokovala.
      const families = familiesOf(distinct);
      if (distinct.length === 0 || families.size > 1) {
        found(
          "S1",
          wrapper,
          `${relPath}: status-single cituje ${distinct.length} zdroj(ů) z ${families.size} nezávislých source families — „1 ZDROJ" znamená jedno nezávislé doložení; u 2+ rodin patří status-corroborated`,
        );
      }
    }
    if (record.status === "status-corroborated") {
      const families = familiesOf(distinct);
      if (distinct.length < 2 || families.size < 2) {
        found(
          "S2",
          wrapper,
          `${relPath}: status-corroborated cituje ${distinct.length} zdroj(e) z ${families.size} source family/families — definice badge vyžaduje ≥2 zdroje z ≥2 nezávislých rodin`,
        );
      }
    }
  }

  // --- S3 + S4: relations ------------------------------------------------
  for (const wrapper of model.records) {
    if (wrapper.registry !== "relations") continue;
    const { record, relPath } = wrapper;
    const claimIds = [...new Set(refIds(record.claims))].filter((id) => byId.get(id)?.record.recordType === "claim");
    const sourceIds = [...new Set(refIds(record.sources))];
    const existing = existingSources(sourceIds);

    if (record.status !== "contextual" && (claimIds.length < 1 || existing.length < 1)) {
      found(
        "S3",
        wrapper,
        `${relPath}: hrana se statusem "${record.status}" nemá plnou evidenci (${claimIds.length} claim(ů), ${existing.length} zdroj(ů)) — každá ne-kontextová hrana nese ≥1 existující claim i zdroj`,
      );
    }
    if (record.status === "single" && sourceIds.length !== 1) {
      found(
        "S4",
        wrapper,
        `${relPath}: hrana se statusem "single" cituje ${sourceIds.length} zdrojů — buď zdroje nejsou nezávislé (zdokumentovat), nebo patří status "corroborated"`,
      );
    }
    if (record.status === "corroborated") {
      const families = familiesOf(sourceIds);
      if (families.size < 2) {
        warnings.push(
          `${relPath}: hrana se statusem "corroborated", ale všechny zdroje patří do jedné source family — podle vlastního standardu není nezávisle potvrzená`,
        );
      }
    }
  }

  // --- S5: autorizace ----------------------------------------------------
  const hasEntityDossier = model.records.some(
    (w) => w.registry === "dossier" && w.record.dossierType === "entity",
  );
  const authorizations =
    options.authorizations ?? (hasEntityDossier ? loadAuthorizationIds(options.authorizationsPath) : new Set());
  for (const wrapper of model.records) {
    if (wrapper.registry !== "dossier") continue;
    const { record, relPath } = wrapper;
    if (record.dossierType !== "entity") continue;
    const authRecords = record.authorization?.records;
    if (!Array.isArray(authRecords) || authRecords.length === 0) {
      found("S5", wrapper, `${relPath}: entity dossier bez authorization.records — žádný dossier nesmí existovat bez skutečného autorizačního záznamu`);
      continue;
    }
    for (const authId of authRecords) {
      if (!authorizations.has(authId)) {
        found(
          "S5",
          wrapper,
          `${relPath}: authorization.records odkazuje na "${authId}", který v data/authorizations.toml neexistuje — autorizace vzniká jen zápisem do append-only logu v AGENTS.md a jeho transkripce`,
        );
      }
    }
  }

  // --- S6: kontextová entita nikdy subjektem dossieru --------------------
  for (const wrapper of model.entities) {
    const { record, relPath } = wrapper;
    if (record.publicationRole !== "context") continue;
    if (refIds(record.subjectOf).length > 0) {
      found("S6", wrapper, `${relPath}: kontextová entita má subjectOf — kontextová entita nesmí být subjektem žádného dossieru`);
    }
    if (record.dossierEnabled === true) {
      found("S6", wrapper, `${relPath}: kontextová entita má dossierEnabled=true — kontextová entita se nikdy sama nepovyšuje na dossier-worthy`);
    }
    if (record.dossierStatus === "authorized") {
      found("S6", wrapper, `${relPath}: kontextová entita má dossierStatus "authorized" — automatika nesmí kontextové entitě přiznat autorizaci`);
    }
  }

  // --- S7 + S8: kurátorovaný graf dossieru -------------------------------
  {
    const localPart = (iri) => (typeof iri === "string" ? iri.split("/").pop() : null);
    const dossierBySlug = new Map(
      model.records.filter((w) => w.registry === "dossier").map((w) => [w.record.slug, w]),
    );
    for (const wrapper of model.records) {
      if (wrapper.registry !== "dossier") continue;
      const { record, relPath } = wrapper;
      const graph = record.graph;
      if (!graph) continue;

      // Autorizované subjekty dossieru: vlastní subject, u agregátu
      // sjednocení subjektů agregovaných dossierů.
      const expectedSubjects = new Set();
      if (record.subject) expectedSubjects.add(record.subject);
      for (const slug of record.aggregates ?? []) {
        const agg = dossierBySlug.get(slug)?.record;
        if (agg?.subject) expectedSubjects.add(agg.subject);
      }
      const subjectNodes = new Set((graph.nodes ?? []).filter((n) => n.subject === true).map((n) => n.entity));
      for (const id of subjectNodes) {
        if (!expectedSubjects.has(id)) {
          found("S7", wrapper, `${relPath}: graph uzel "${id}" má subject=true, ale není autorizovaným subjektem dossieru — nový subjekt vyžaduje samostatnou, explicitní autorizaci v AGENTS.md`);
        }
      }
      for (const id of expectedSubjects) {
        if (!subjectNodes.has(id)) {
          found("S7", wrapper, `${relPath}: autorizovaný subjekt "${id}" nemá v grafu uzel se subject=true`);
        }
      }

      // S8: každý uzel má cestu k subjektu (BFS hloubka != null).
      const edges = model.records
        .filter((w) => w.dossier === record.slug && w.registry === "relations")
        .map((w) => ({
          from: localPart(w.record.sourceEntity?.["@id"]),
          to: localPart(w.record.targetEntity?.["@id"]),
        }));
      const depths = computeGraphDepths(
        (graph.nodes ?? []).map((n) => n.entity),
        [...subjectNodes],
        edges,
      );
      for (const [id, depth] of depths) {
        if (depth === null) {
          found("S8", wrapper, `${relPath}: graph uzel "${id}" nemá cestu k žádnému subjektovému uzlu — osiřelý od subjektů dossieru`);
        }
      }
    }
  }

  // --- S9: provenance refs entit se rozliší v jejich dossierech ----------
  {
    const idsByDossier = new Map();
    for (const w of model.records) {
      if (w.registry !== "claims" && w.registry !== "sources") continue;
      if (!idsByDossier.has(w.dossier)) idsByDossier.set(w.dossier, new Set());
      idsByDossier.get(w.dossier).add(w.record.identifier);
    }
    for (const wrapper of model.entities) {
      const { record, relPath } = wrapper;
      const prov = record.provenance;
      if (!prov) continue;
      const dossiers = Array.isArray(record.dossiers) ? record.dossiers : [];
      for (const key of ["claimRefs", "sourceRefs"]) {
        for (const rid of prov[key] ?? []) {
          const ok = dossiers.some((d) => idsByDossier.get(d)?.has(rid));
          if (!ok) {
            found(
              "S9",
              wrapper,
              `${relPath}: provenance.${key} "${rid}" neexistuje v žádném dossieru entity (${dossiers.join(", ") || "žádný dossier"}) — zamrzlý odkaz po smazání/sloučení zdroje, nebo chybný zápis při extrakci`,
            );
          }
        }
      }
    }
  }

  return { findings, warnings };
}

/*
 * Veřejná brána: nálezy → aplikace baseline allowlistu → { errors,
 * warnings }. options:
 *   authorizations / authorizationsPath — viz collectSemanticsFindings
 *   baseline      — pole záznamů allowlistu (testy); default se čte
 *                   z options.baselinePath, jinak z
 *                   <model.root>/_shared/semantics-baseline.json
 */
export function validateSemantics(model, options = {}) {
  const { findings, warnings } = collectSemanticsFindings(model, options);
  const baselinePath =
    options.baselinePath ?? (model?.root ? join(model.root, SEMANTICS_BASELINE_RELPATH) : null);
  const baseline = options.baseline ?? loadSemanticsBaseline(baselinePath);

  const errors = [];
  const allowed = new Set();
  for (const entry of baseline) {
    const rule = entry?.rule;
    const id = entry?.["@id"];
    if (!BASELINEABLE_RULES.has(rule) || typeof id !== "string") {
      errors.push(
        `semantics-baseline: neplatný záznam ${JSON.stringify(entry)} — allowlist smí obsahovat jen pravidla ${[...BASELINEABLE_RULES].join("/")} s konkrétním @id (S5/S6 grandfatherovat nelze)`,
      );
      continue;
    }
    allowed.add(`${rule} ${id}`);
  }

  const used = new Set();
  for (const f of findings) {
    const key = `${f.rule} ${f.id}`;
    if (f.id && allowed.has(key)) {
      used.add(key);
      warnings.push(`baseline (grandfathered ${f.rule}): ${f.message}`);
    } else {
      errors.push(f.message);
    }
  }
  for (const key of allowed) {
    if (!used.has(key)) {
      warnings.push(`semantics-baseline: záznam "${key}" už žádné porušení nekryje — odmazat z allowlistu (dluh splacen)`);
    }
  }

  return { errors, warnings };
}
