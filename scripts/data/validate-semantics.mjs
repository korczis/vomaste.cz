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
//   S4  relation status single ⇒ ≥1 zdroj z právě 1 source family
//       (ERROR); status corroborated ⇒ ≥2 source families (WARNING,
//       zrcadlí validate-graph.mjs, který to také jen hlásí). Dřív S4
//       vyžadovalo přesně jeden ZDROJ — počítalo tedy citace, ne
//       nezávislost, a hraně doložené třemi převzetími téže agenturní
//       zprávy nedovolilo přiznat, že jde o jedno doložení, aniž by
//       zahodila dvě citace. Sjednoceno s S1 na úrovni tvrzení.
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
//  S10  týž vydavatel nikdy nezakládá nezávislé doložení: dva zdroje se
//       shodným `outlet`em, shodnou registrovanou doménou `url` nebo
//       shodnou SKUPINOU VYDAVATELŮ (`publisherGroup` v katalogu zdrojů)
//       se počítají jako JEDEN nezávislý hlas BEZ OHLEDU na `sourceFamily`
//       (ERROR u claims, WARNING u hran — zrcadlí severitu hostitelského
//       pravidla S2/S4).
//
//       Díra, kterou S10 zavírá: `familyOf` sahá po `outlet`u teprve
//       tehdy, když je `sourceFamily` prázdná. Dva články TÉHOŽ vydavatele,
//       z nichž jeden má rodinu vyplněnou a druhý ne, tak dostaly dva
//       různé klíče (`family:ctk` vs `outlet:FORUM 24`) a S2 je považovala
//       za dvě nezávislé redakce. Jedna redakce ale nepotvrzuje sama sebe:
//       badge `CORROBORATED` znamená dva NEZÁVISLÉ vydavatele, ne dvě
//       různé hodnoty jednoho pole.
//
//       Druhá díra (T-083): jeden vydavatel může držet víc titulů na víc
//       doménách — Česká justice, Ekonomický deník a Zdravotnický deník
//       vydává Media Network s.r.o., Novinky.cz a Seznam Zprávy provozuje
//       Seznam.cz. Outlet ani doména to nevidí; katalog zdrojů ano, a
//       proto je jeho `publisherGroup` třetí osou identity vydavatele.
//
//       Implementačně je S10 vlastnost společného primitivu
//       `independentPair()`: nezávislé doložení je DVOJICE zdrojů, které
//       se liší rodinou (S1/S2) A ZÁROVEŇ vydavatelem — outletem,
//       registrovanou doménou i skupinou vydavatelů (S10). Primitiv
//       používají S1, S2 i S4 — pravidlo tedy
//       platí i pro grafové hrany. Párová (ne tranzitivní) formulace je
//       záměrná: kdyby se zdroje slučovaly tranzitivně přes rodinu,
//       vlastní reportáž Blesku by splynula s ČTK jen proto, že Blesk
//       jinde ČTK přetiskuje — a pravdivá korroborace by zmizela.
//
// Baseline (T-028 fáze D, grandfathered debt): porušení zděděná 1:1
// z migrovaného obsahu se NEopravují změnou dat ani změkčením pravidel —
// místo toho žijí v explicitním allowlistu
// data/dossiers/_shared/semantics-baseline.json (generuje ho migrátor
// scripts/migrations/migrate-content-to-json.mjs): záznam (@id, rule)
// v allowlistu degraduje chybu na warning; JAKÉKOLI nové porušení mimo
// allowlist zůstává chybou. Grandfatherovat lze jen evidenční pravidla
// S1–S4 a S10; autorizační pravidla S5/S6 nikdy.
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeGraphDepths } from "./lib/graph-depth.mjs";
import { createSourceIndependence, MULTI_LABEL_PUBLIC_SUFFIXES, registeredDomain } from "./lib/source-independence.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const AUTHORIZATIONS_TOML = join(ROOT, "data/authorizations.toml");
export const SEMANTICS_BASELINE_RELPATH = "_shared/semantics-baseline.json";
export const BASELINEABLE_RULES = new Set(["S1", "S2", "S3", "S4", "S10"]);

// Výpočet nezávislosti zdrojů (rodina + vydavatel + registrovaná doména)
// vlastní lib/source-independence.mjs — tenhle modul vlastní PRAVIDLA
// S1/S2/S4/S10, ne aritmetiku, kterou z něj čte i evidenční report
// (report-evidence-plan.mjs). Re-export drží dosavadní import povrch.
export { MULTI_LABEL_PUBLIC_SUFFIXES, registeredDomain };

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

  // Rodina zdroje, nezávislá dvojice a kolize vydavatelů — jeden
  // vlastník výpočtu (lib/source-independence.mjs), viz komentář u
  // re-exportu nahoře. `familyOf`, `independentPair` a
  // `publisherCollisions` mají tutéž sémantiku jako před extrakcí.
  const { existingSources, familiesOf, independentPair, publisherCollisions } = createSourceIndependence(
    (id) => byId.get(id)?.record,
  );

  // --- S1 + S2: claims ---------------------------------------------------
  for (const wrapper of model.records) {
    if (wrapper.registry !== "claims") continue;
    const { record, relPath } = wrapper;
    const distinct = [...new Set(refIds(record.sources))];
    if (record.status === "status-single") {
      // Nezávislost přes RODINY, ne přes ID/URL (oprava 6b0bd4d): dva
      // zdroje téže rodiny jsou jedno doložení — status-single je pro ně
      // správný. Kontrola slepá k rodinám by správnou opravu zablokovala.
      // Od S10 totéž platí pro dva články TÉHOŽ vydavatele s rozdílně
      // vyplněnou rodinou: jedna redakce = jedno doložení.
      const families = familiesOf(distinct);
      const pair = independentPair(distinct);
      if (distinct.length === 0 || pair) {
        found(
          "S1",
          wrapper,
          `${relPath}: status-single cituje ${distinct.length} zdroj(ů) z ${families.size} nezávislých source families${pair ? ` (nezávislá dvojice ${pair.join(" + ")})` : ""} — „1 ZDROJ" znamená jedno nezávislé doložení; u 2+ rodin patří status-corroborated`,
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
      } else if (!independentPair(distinct)) {
        // S10: rodin je formálně dost, ale každá „nezávislá" dvojice
        // stojí na TÉMŽE vydavateli (jeden článek s rodinou, druhý bez).
        found(
          "S10",
          wrapper,
          `${relPath}: status-corroborated cituje ${distinct.length} zdroje z ${families.size} source families, ale žádná dvojice nepochází od dvou různých vydavatelů — ${publisherCollisions(distinct).join("; ")}; týž outlet, táž registrovaná doména ani táž skupina vydavatelů nezakládají nezávislé potvrzení bez ohledu na sourceFamily`,
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
    if (record.status === "single") {
      // Nezávislost přes RODINY a vydavatele, ne přes počet zdrojů —
      // táž definice jako S1 na úrovni tvrzení (6b0bd4d + S10), jen na
      // hraně. Hrana doložená třemi převzetími téže agenturní zprávy má
      // JEDNO nezávislé doložení a „single" je pro ni správný stav;
      // nutit ji zahodit dvě citace, aby prošla počtem, by ubralo
      // dohledatelnost, ne přidalo přesnost. Chybou zůstává hrana bez
      // zdroje a hrana, která se jako „single" tváří, přestože mezi
      // jejími zdroji nezávislá dvojice existuje.
      const families = familiesOf(sourceIds);
      const pair = independentPair(sourceIds);
      if (sourceIds.length === 0 || pair) {
        found(
          "S4",
          wrapper,
          `${relPath}: hrana se statusem "single" cituje ${sourceIds.length} zdroj(ů) z ${families.size} nezávislých source families${pair ? ` (nezávislá dvojice ${pair.join(" + ")})` : ""} — „single" znamená jedno nezávislé doložení; u nezávislé dvojice patří status "corroborated"`,
        );
      }
    }
    if (record.status === "corroborated") {
      // Táž definice nezávislosti jako u claims (S2 + S10), jen v
      // severitě hostitelského pravidla: hrany hlásí S4 jako warning.
      const families = familiesOf(sourceIds);
      if (!independentPair(sourceIds)) {
        warnings.push(
          families.size < 2
            ? `${relPath}: hrana se statusem "corroborated", ale všechny zdroje patří do jedné source family — podle vlastního standardu není nezávisle potvrzená`
            : `${relPath}: hrana se statusem "corroborated" a ${families.size} source families, ale žádná dvojice zdrojů nepochází od dvou různých vydavatelů (S10) — ${publisherCollisions(sourceIds).join("; ")}`,
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
