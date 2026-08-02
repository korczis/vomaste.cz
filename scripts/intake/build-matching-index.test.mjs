import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildMatchingIndex } from "./build-matching-index.mjs";

const SCRIPT_PATH = fileURLToPath(new URL("./build-matching-index.mjs", import.meta.url));

test("buildMatchingIndex is deterministic across two in-process calls", () => {
  const a = buildMatchingIndex({ repositoryCommit: "fixed-commit" });
  const b = buildMatchingIndex({ repositoryCommit: "fixed-commit" });
  assert.deepEqual(a, b);
});

test("every entity has the required shape and no narrative content", () => {
  const index = buildMatchingIndex({ repositoryCommit: "fixed-commit" });
  assert.ok(index.entity_count > 0);
  for (const entity of index.entities) {
    assert.equal(typeof entity.entity_id, "string");
    assert.equal(typeof entity.entity_type, "string");
    assert.equal(typeof entity.canonical_name, "string");
    assert.equal(typeof entity.normalized_name, "string");
    assert.ok(Array.isArray(entity.aliases));
    assert.ok(Array.isArray(entity.normalized_aliases));
    assert.equal(typeof entity.identifiers, "object");
    assert.ok(Array.isArray(entity.dossier_ids));
    // no narrative fields (claims, source bodies, descriptions) leak in
    assert.equal("content" in entity, false);
    assert.equal("claims" in entity, false);
    assert.equal("provenance" in entity, false);
  }
});

test("entities are stably sorted by entity_type then entity_id", () => {
  const index = buildMatchingIndex({ repositoryCommit: "fixed-commit" });
  for (let i = 1; i < index.entities.length; i += 1) {
    const prev = index.entities[i - 1];
    const curr = index.entities[i];
    const ok = prev.entity_type < curr.entity_type || (prev.entity_type === curr.entity_type && prev.entity_id <= curr.entity_id);
    assert.ok(ok, `sort order violated at ${prev.entity_id} -> ${curr.entity_id}`);
  }
});

test("only known-matchable entity types appear (no controversy/event/legal_process/role rows)", () => {
  const index = buildMatchingIndex({ repositoryCommit: "fixed-commit" });
  const allowed = new Set(["person", "company", "organization", "public_institution", "political_party"]);
  for (const entity of index.entities) assert.ok(allowed.has(entity.entity_type), entity.entity_type);
});

test("CLI produces a byte-identical index across two separate process invocations given the same commit", () => {
  const dir = mkdtempSync(join(tmpdir(), "matching-index-cli-test-"));
  try {
    const outA = join(dir, "a.json");
    const outB = join(dir, "b.json");
    execFileSync(process.execPath, [SCRIPT_PATH, "--out", outA]);
    execFileSync(process.execPath, [SCRIPT_PATH, "--out", outB]);
    assert.equal(readFileSync(outA, "utf8"), readFileSync(outB, "utf8"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
