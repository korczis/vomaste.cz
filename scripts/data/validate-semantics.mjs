// Redakční (sémantická) pravidla kanonického datasetu (T-028 fáze C).
// Tento modul je JEDINÝ vlastník níže vyjmenovaných pravidel (jedno
// pravidlo, jeden vlastník — schemas/README.md); tvar vlastní
// schemas/canonical/, referenční existenci validate-references.mjs.
//
//   S1  claim status-single ⇒ přesně 1 citovaný zdroj (zrcadlí
//       validate-dossier.mjs, ERROR)
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
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const AUTHORIZATIONS_TOML = join(ROOT, "data/authorizations.toml");

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

const refIds = (arr) => (Array.isArray(arr) ? arr : []).map((r) => r?.["@id"]).filter((x) => typeof x === "string");

// options.authorizations: Set autorizačních id (testy si injektují
// syntetickou množinu); default se parsuje z data/authorizations.toml.
export function validateSemantics(model, options = {}) {
  const errors = [];
  const warnings = [];

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
    if (record.status === "status-single" && distinct.length !== 1) {
      errors.push(
        `${relPath}: status-single cituje ${distinct.length} zdrojů — „1 ZDROJ" znamená přesně jeden; u 2+ nezávislých zdrojů patří status-corroborated`,
      );
    }
    if (record.status === "status-corroborated") {
      const families = familiesOf(distinct);
      if (distinct.length < 2 || families.size < 2) {
        errors.push(
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
      errors.push(
        `${relPath}: hrana se statusem "${record.status}" nemá plnou evidenci (${claimIds.length} claim(ů), ${existing.length} zdroj(ů)) — každá ne-kontextová hrana nese ≥1 existující claim i zdroj`,
      );
    }
    if (record.status === "single" && sourceIds.length !== 1) {
      errors.push(
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
      errors.push(`${relPath}: entity dossier bez authorization.records — žádný dossier nesmí existovat bez skutečného autorizačního záznamu`);
      continue;
    }
    for (const authId of authRecords) {
      if (!authorizations.has(authId)) {
        errors.push(
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
      errors.push(`${relPath}: kontextová entita má subjectOf — kontextová entita nesmí být subjektem žádného dossieru`);
    }
    if (record.dossierEnabled === true) {
      errors.push(`${relPath}: kontextová entita má dossierEnabled=true — kontextová entita se nikdy sama nepovyšuje na dossier-worthy`);
    }
    if (record.dossierStatus === "authorized") {
      errors.push(`${relPath}: kontextová entita má dossierStatus "authorized" — automatika nesmí kontextové entitě přiznat autorizaci`);
    }
  }

  return { errors, warnings };
}
