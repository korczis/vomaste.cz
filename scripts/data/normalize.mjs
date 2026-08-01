// Normalizace kanonického datasetu (T-028 fáze C): deterministické
// řazení, dokumentované defaulty a odvození rout. ŽÁDNÉ nové faktické
// pole — všechno tady je čistá projekce už existujících dat.
import { sep } from "node:path";

// Kanonické pořadí registrů uvnitř dossieru (dossier.json první, pak
// registry v pořadí, ve kterém je čtou dnešní stránky).
export const REGISTRY_ORDER = Object.freeze(["dossier", "claims", "sources", "cases", "gaps", "relations", "updates"]);

const NUMERIC_ID_RE = /^(CLM|SRC|CASE|GAP)-(\d+)$/;

// Řadicí klíč identifieru: numerické identifiery (CLM-2 < CLM-10) se
// řadí podle čísla, ostatní (edge-*, data updates, slugy) prostým
// codepoint porovnáním — žádné locale, plná determinismus.
export function identifierSortKey(identifier) {
  const m = NUMERIC_ID_RE.exec(identifier ?? "");
  return m ? { prefix: m[1], num: Number(m[2]), text: identifier ?? "" } : { prefix: null, num: null, text: identifier ?? "" };
}

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export function compareIdentifiers(a, b) {
  const ka = identifierSortKey(a);
  const kb = identifierSortKey(b);
  if (ka.num !== null && kb.num !== null && ka.prefix === kb.prefix) return ka.num - kb.num || cmp(ka.text, kb.text);
  return cmp(ka.text, kb.text);
}

// Pořadí wrapperů: dossier slug → registry (kanonické pořadí) → identifier.
export function compareWrappers(a, b) {
  return (
    cmp(a.dossier ?? "", b.dossier ?? "") ||
    REGISTRY_ORDER.indexOf(a.registry) - REGISTRY_ORDER.indexOf(b.registry) ||
    compareIdentifiers(a.record?.identifier, b.record?.identifier)
  );
}

// Dokumentované defaulty ze schémat (JSON Schema default je anotace —
// doplnit je při čtení je práce konzumenta, viz $comment
// v relation.schema.json a gap.schema.json). Vrací NOVÝ záznam, vstup
// se nemutuje.
export function normalizeRecord(record) {
  const out = structuredClone(record);
  if (out.recordType === "relation" && out.directed === undefined) out.directed = true;
  if (out.recordType === "gap" && out.status === undefined) out.status = "open";
  return out;
}

/*
 * Route záznamu — stejný tvar jako dnešní build-route-manifest.mjs:
 *   dossier             → /dossiers/<slug>/
 *   claim/source/case/gap/relation → /dossiers/<slug>/<registry>/<lower-id>/
 *   entity              → /entities/<entityId>/
 *   update              → null (updates dnes nemají vlastní veřejnou
 *                          routu — updates.toml se renderuje uvnitř
 *                          dossier stránky; vymyslet jim routu by nebyla
 *                          projekce, ale nové rozhodnutí pro fázi G)
 */
export function routeFor(wrapper) {
  const { registry, dossier, record } = wrapper;
  if (registry === "dossier") return `/dossiers/${dossier}/`;
  if (registry === "entities") return `/entities/${record.identifier}/`;
  if (registry === "updates") return null;
  return `/dossiers/${dossier}/${registry}/${String(record.identifier).toLowerCase()}/`;
}

export const toPosixPath = (p) => p.split(sep).join("/");
