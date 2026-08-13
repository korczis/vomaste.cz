/*
 * Unit tests for the aggregation primitives behind the navigation badges.
 *
 * These test the COUNTING RULES, not the current content — a test that
 * asserted "claims.total === 666" would fail on every editorial commit and
 * would be deleted within a week. What must never regress is the semantics:
 * distinct canonical identity, order independence, one count per node.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  countDistinct,
  canonicalIdentity,
  METRIC_DEFINITIONS,
  METRICS_BY_ID,
  INTENTIONALLY_UNMEASURED,
} from "./navigation-metrics.registry.mjs";

test("empty collection counts zero, and zero is a real value", () => {
  assert.equal(countDistinct([]), 0);
});

test("a single record counts once", () => {
  assert.equal(countDistinct([{ "@id": "urn:a" }]), 1);
});

test("duplicate canonical @id collapses to one", () => {
  assert.equal(countDistinct([{ "@id": "urn:a" }, { "@id": "urn:a" }]), 1);
});

test("a multi-typed node is one record, not one per type", () => {
  // The JSON-LD graph legitimately types a node several ways, e.g.
  // ["schema:Person", "vomaste:PublicOfficial"]. That is one entity.
  const records = [{ "@id": "urn:a", "@type": ["schema:Person", "vomaste:PublicOfficial"] }];
  assert.equal(countDistinct(records), 1);
});

test("count is independent of input order", () => {
  const a = [{ "@id": "urn:1" }, { "@id": "urn:2" }, { "@id": "urn:3" }];
  const b = [{ "@id": "urn:3" }, { "@id": "urn:1" }, { "@id": "urn:2" }];
  assert.equal(countDistinct(a), countDistinct(b));
});

test("identity falls back through @id, id, url, slug in that order", () => {
  assert.equal(canonicalIdentity({ "@id": "A", id: "B", url: "C", slug: "D" }, 0), "A");
  assert.equal(canonicalIdentity({ id: "B", url: "C", slug: "D" }, 0), "B");
  assert.equal(canonicalIdentity({ url: "C", slug: "D" }, 0), "C");
  assert.equal(canonicalIdentity({ slug: "D" }, 0), "D");
});

test("records with no identity field stay distinct instead of collapsing", () => {
  // Collapsing every id-less record into one bucket would silently
  // under-count. Positional identity keeps them separate and countable.
  assert.equal(countDistinct([{ name: "x" }, { name: "y" }]), 2);
});

test("an empty-string identity is not an identity", () => {
  assert.equal(countDistinct([{ "@id": "" }, { "@id": "" }]), 2);
});

test("large collections count exactly, with no rounding", () => {
  const many = Array.from({ length: 9999 }, (_, i) => ({ "@id": `urn:${i}` }));
  assert.equal(countDistinct(many), 9999);
});

test("a non-array collection is a build error, not a zero", () => {
  // Silently returning 0 for a malformed export would render a plausible
  // badge over broken data — the single worst outcome for this feature.
  assert.throws(() => countDistinct(null), TypeError);
  assert.throws(() => countDistinct({ "@graph": [] }), TypeError);
  assert.throws(() => countDistinct("[]"), TypeError);
});

test("every metric definition is complete and uniquely identified", () => {
  const ids = new Set();
  for (const def of METRIC_DEFINITIONS) {
    for (const field of [
      "id",
      "description",
      "source",
      "semantics",
      "dedupe",
      "publication",
      "route",
    ]) {
      assert.ok(
        typeof def[field] === "string" && def[field].length > 0,
        `metric ${def.id ?? "(no id)"} is missing "${field}"`,
      );
    }
    assert.ok(!ids.has(def.id), `duplicate metric id: ${def.id}`);
    ids.add(def.id);
    assert.match(def.id, /^[a-z_]+\.[a-z_]+$/, `metric id "${def.id}" must be <collection>.<aggregate>`);
    assert.match(def.route, /^\//, `metric ${def.id} must target an absolute route`);
  }
  assert.equal(ids.size, METRICS_BY_ID.size);
});

test("navigation items without a badge carry a recorded reason", () => {
  // "Why has this item no number" must be answerable from code, so nobody
  // invents a decorative metric to fill the visual gap.
  for (const [item, reason] of Object.entries(INTENTIONALLY_UNMEASURED)) {
    assert.ok(
      typeof reason === "string" && reason.length > 20,
      `navigation item "${item}" is unmeasured without a substantive reason`,
    );
  }
});

// Invariant „každý dossier v navigaci má buď metriku, nebo zapsaný důvod“
// tady záměrně NENÍ. Čte dva generované artefakty — data/generated/
// navigation.json (build:navigation) a data/generated/navigation-metrics.json
// (data:metrics) — a krok `test` běží v pipeline před oběma. V čerstvém klonu
// jsou gitignorované, takže by se test tiše přeskočil; na stroji, kde zůstaly
// z dřívějška, by porovnával nová data se starým souborem a padal na rozdílu,
// který v datech není. Přesně tenhle tvar (kontrola nad generovaným
// artefaktem zařazená před svůj generátor) shodil 2026-08-13 čtyři nasazení
// za sebou.
//
// Vlastníkem je proto scripts/data/build-navigation-metrics.mjs, kde invariant
// běží jako součást `validate:navigation-metrics` — až za oběma generátory.
