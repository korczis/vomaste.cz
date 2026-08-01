// Vládní roster z data/government.toml — kanonický vlastník
// government_office/government_party polí (fáze H: do entity.provenance
// se NEduplikují). Stejné čtení jako scripts/dossier/lib/record-tables.mjs.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const str = (block, key) =>
  (block.match(new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1]?.replace(/\\(.)/g, "$1") ?? null;

/*
 * readGovernmentRoster(repoRoot) → Map<entityId, { office, party, snapshot }>
 */
export function readGovernmentRoster(root) {
  const file = join(root, "data", "government.toml");
  const out = new Map();
  if (!existsSync(file)) return out;
  const text = readFileSync(file, "utf8");
  const snapshot = str(text.split(/\n\[\[members\]\]/)[0], "snapshot");
  for (const block of text.split(/\n\[\[members\]\]/).slice(1)) {
    const id = str(block, "entity_id");
    if (id) out.set(id, { office: str(block, "office"), party: str(block, "party") ?? "", snapshot });
  }
  return out;
}
