// Local artifact source for duplicate detection (PHASE_003.md §11.4). No
// committed manifest store exists (Phase 2 explicitly did not create
// one) — this is a read-only directory adapter over whatever manifests
// happen to already be on disk (e.g. a prior `npm run intake:fixture`
// output directory), never a new production store. If no directory is
// configured, callers pass [] to detect-duplicate-intake.mjs and get
// "no_duplicate" every time — this is the honest baseline until a real
// artifact strategy exists (Phase 1's own "artifact strategy" open item).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Loads every `manifest.json` found directly under one level of
// subdirectories of `rootDir` (the same `<output-dir>/<intake-id>/`
// shape process-issue.mjs writes) plus, defensively, `rootDir` itself if
// it directly contains a manifest.json. Skips anything unreadable or not
// valid JSON rather than failing the whole load — one corrupt prior
// artifact must never block processing a new submission.
export function loadPriorManifestsFromDirectory(rootDir) {
  const manifests = [];
  let entries;
  try {
    entries = readdirSync(rootDir);
  } catch {
    return manifests;
  }

  const tryLoad = (path) => {
    try {
      const parsed = JSON.parse(readFileSync(path, "utf8"));
      if (parsed && typeof parsed.id === "string") manifests.push(parsed);
    } catch {
      // corrupt/foreign file — skip, don't fail the whole load
    }
  };

  const directManifest = join(rootDir, "manifest.json");
  try {
    if (statSync(directManifest).isFile()) tryLoad(directManifest);
  } catch {
    // no manifest.json directly in rootDir — normal case
  }

  for (const name of entries.sort()) {
    const full = join(rootDir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (!stat.isDirectory()) continue;
    tryLoad(join(full, "manifest.json"));
  }

  return manifests;
}
