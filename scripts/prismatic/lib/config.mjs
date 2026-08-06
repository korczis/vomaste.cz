// Config resolution for the Prismatic Platform integration (Fáze 2.1,
// docs/adr/prismatic-platform-integration.md). Real implementation —
// unlike most of scripts/prismatic/, this module is not a stub.
//
// Resolution order for the sibling repo path (first hit wins):
//   1. PRISMATIC_PLATFORM_PATH environment variable
//   2. platform_path in .prismatic-local.toml (gitignored, local-only)
//   3. default_sibling_relative_path from config/prismatic-integration.toml
//      (versioned default: "../prismatic-platform")
//
// This module never reads or logs credentials — it only resolves a path
// and reads Git metadata (commit SHA) from it.
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const VERSIONED_CONFIG_PATH = join(ROOT, "config", "prismatic-integration.toml");
export const LOCAL_CONFIG_PATH = join(ROOT, ".prismatic-local.toml");

// Minimal flat-TOML reader (string/number values only, no tables/arrays)
// — this repo hand-rolls small parsers scoped to a known shape rather
// than taking a generic TOML dependency (same pattern as
// scripts/dossier/validate-authorization.mjs's authorizations.toml
// reader). Comments (#) and blank lines are skipped.
export function parseFlatToml(text) {
  const out = {};
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    const value = rawValue.trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      out[key] = value.slice(1, -1).replace(/\\(.)/g, "$1");
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      out[key] = Number(value);
    } else if (value === "true" || value === "false") {
      out[key] = value === "true";
    } else {
      out[key] = value;
    }
  }
  return out;
}

let cachedVersionedConfig = null;
export function loadVersionedConfig() {
  if (cachedVersionedConfig) return cachedVersionedConfig;
  const text = readFileSync(VERSIONED_CONFIG_PATH, "utf8");
  cachedVersionedConfig = parseFlatToml(text);
  return cachedVersionedConfig;
}

function loadLocalConfig() {
  if (!existsSync(LOCAL_CONFIG_PATH)) return {};
  return parseFlatToml(readFileSync(LOCAL_CONFIG_PATH, "utf8"));
}

/**
 * Resolves the local prismatic-platform checkout path, without
 * validating it exists. Returns { path, source } where source is
 * "env" | "local-config" | "default".
 */
export function resolvePlatformPath(env = process.env) {
  if (env.PRISMATIC_PLATFORM_PATH) {
    return { path: resolve(env.PRISMATIC_PLATFORM_PATH), source: "env" };
  }
  const local = loadLocalConfig();
  if (local.platform_path) {
    return { path: resolve(ROOT, local.platform_path), source: "local-config" };
  }
  const versioned = loadVersionedConfig();
  const rel = versioned.default_sibling_relative_path ?? "../prismatic-platform";
  return { path: resolve(ROOT, rel), source: "default" };
}

/**
 * Validates a resolved platform path: exists, is a readable Git repo,
 * and returns its current commit SHA. Never throws for an expected
 * "not there" condition — returns a structured result instead, since
 * "Prismatic absent" is a normal, supported state (the public build must
 * work without it).
 *
 * @returns {{ok: true, path: string, commit: string} | {ok: false, path: string, reason: string}}
 */
export function validatePlatformPath(path) {
  if (!existsSync(path)) {
    return { ok: false, path, reason: "path-not-found" };
  }
  if (!existsSync(join(path, ".git"))) {
    return { ok: false, path, reason: "not-a-git-repo" };
  }
  try {
    const commit = execFileSync("git", ["-C", path, "rev-parse", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return { ok: true, path, commit };
  } catch {
    return { ok: false, path, reason: "git-rev-parse-failed" };
  }
}

export function contractVersionSupported() {
  return String(loadVersionedConfig().contract_version_supported ?? "1.0");
}

export function defaultConcurrency() {
  return Number(loadVersionedConfig().default_concurrency ?? 2);
}
