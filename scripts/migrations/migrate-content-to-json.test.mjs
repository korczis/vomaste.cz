// Testy migrátoru fáze D (T-028): syntetický mini-vstup v temp adresáři,
// idempotence (druhý běh nezmění jediný bajt), parity fail při uměle
// rozbitém vstupu/výstupu a baseline mechanismus grandfathered
// sémantických porušení.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, runParityChecks } from "./migrate-content-to-json.mjs";
import { loadCanonicalTree } from "../data/load.mjs";
import { validateShapeTree } from "../data/validate-shape.mjs";
import { validateReferences } from "../data/validate-references.mjs";
import { validateSemantics } from "../data/validate-semantics.mjs";

// --- syntetický fixture repozitář ---------------------------------------
function writeFixture(root) {
  const put = (rel, content) => {
    const file = join(root, rel);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, content);
  };

  put(
    "data/dossiers.toml",
    `[[dossiers]]
slug = "example-subject"
title = "Example Subject"
dossier_type = "entity"
subject = "example"
canonical_dossier = "example-subject"
show_in_primary_navigation = true
`,
  );
  put(
    "data/authorizations.toml",
    `[[authorizations]]
id = "AUTH-TEST-1"
authorized_at = "2026-01-01"
subjects = ["example"]
agents_md_section = "Test"
scope_summary = "Testovací rozsah."
`,
  );
  put(
    "content/dossiers/example-subject/_index.md",
    `+++
title = "Example Subject"
description = "Testovací dossier pro migrační testy."
template = "entity-dossier.html"

[extra]
dossier = "example-subject"
dossier_type = "entity"
canonical_dossier = "example-subject"
subject = "example"
lang = "cs"
seo_type = "ProfilePage"
updated = "2026-08-01"

[extra.authorization]
authorized = true
record_ids = ["AUTH-TEST-1"]

[[extra.cases]]
anchor = "kauza-test"
period = "2026"
title = "Testovací kauza"
status = "status-single"
label = "Otevřeno"
summary = "Shrnutí testovací kauzy."
claims = ["CLM-01"]
subjects = ["example"]
+++

Tělo přehledu dossieru.
`,
  );
  put(
    "content/dossiers/example-subject/claims/clm-01.md",
    `+++
title = "CLM-01"
description = "První tvrzení."
template = "dossier-claim.html"
weight = 1

[extra]
dossier = "example-subject"
record_type = "claim"
lang = "cs"
clm_id = "CLM-01"
status = "status-single"
status_label = "1 ZDROJ"
summary = "První tvrzení."
sources = ["SRC-01"]
subjects = ["example"]
+++

Tělo tvrzení CLM-01.
`,
  );
  put(
    "content/dossiers/example-subject/claims/clm-02.md",
    `+++
title = "CLM-02"
description = "Druhé tvrzení."
template = "dossier-claim.html"
weight = 2

[extra]
dossier = "example-subject"
record_type = "claim"
lang = "cs"
clm_id = "CLM-02"
status = "status-corroborated"
status_label = "CORROBORATED"
summary = "Druhé tvrzení — dva zdroje z jedné rodiny (zděděný dluh)."
sources = ["SRC-02", "SRC-03"]
subjects = ["example"]
+++
`,
  );
  const source = (id, outlet, claims) => `+++
title = "${id} — Testovací zdroj"
description = "Popis zdroje ${id}."
template = "dossier-source.html"
weight = ${Number(id.slice(4))}

[extra]
subjects = ["example"]
dossier = "example-subject"
record_type = "source"
lang = "cs"
src_id = "${id}"
outlet = "${outlet}"
src_type = "zpravodajství"
url = "https://example.org/${id.toLowerCase()}"
published = "2026-07-01"
retrieved = "2026-08-01"
claims = [${claims.map((c) => `"${c}"`).join(", ")}]
+++

Tělo zdroje ${id}.
`;
  put("content/dossiers/example-subject/sources/src-01.md", source("SRC-01", "Outlet A", ["CLM-01"]));
  put("content/dossiers/example-subject/sources/src-02.md", source("SRC-02", "Shared Outlet", ["CLM-02"]));
  put("content/dossiers/example-subject/sources/src-03.md", source("SRC-03", "Shared Outlet", ["CLM-02"]));
  put(
    "content/dossiers/example-subject/cases/case-01.md",
    `+++
title = "Testovací kauza"
description = "Shrnutí testovací kauzy."
template = "dossier-case.html"
weight = 1

[extra]
dossier = "example-subject"
record_type = "case"
lang = "cs"
case_id = "CASE-01"
anchor = "kauza-test"
period = "2026"
status = "status-single"
label = "Otevřeno"
summary = "Shrnutí testovací kauzy."
claims = ["CLM-01"]
sources = ["SRC-01"]
subjects = ["example"]
+++

Tělo kauzy.
`,
  );
  put(
    "content/dossiers/example-subject/gaps/gap-01.md",
    `+++
title = "GAP-01 — Otevřená otázka"
description = "Co zdroje nedokládají."
template = "dossier-gap.html"
weight = 1

[extra]
dossier = "example-subject"
record_type = "gap"
lang = "cs"
gap_id = "GAP-01"
priority = "střední"
checked = "2026-08-01"
claims = ["CLM-01"]
subjects = ["example"]
+++

Tělo mezery.
`,
  );
  put(
    "content/dossiers/example-subject/relations/edge-example-org.md",
    `+++
title = "Example Subject — role — Example Org"
template = "dossier-relation.html"
weight = 1

[extra]
dossier = "example-subject"
record_type = "relation"
rel_id = "edge-example-org"
source = "example-person"
target = "example-org"
relation_type = "HOLDS_ROLE"
label = "role v organizaci"
status = "single"
claims = ["CLM-01"]
sources = ["SRC-01"]
subjects = ["example"]
+++

Tělo hrany.
`,
  );
  put(
    "data/dossiers/example-subject/graph.toml",
    `[[nodes]]
id = "example-person"
type = "person"
label = "Example Subject"
depth = 0
subject = true

[[nodes]]
id = "example-org"
type = "organization"
label = "Example Org"
depth = 1
subject = false
claims = ["CLM-01"]
sources = ["SRC-01"]

[[nodes]]
id = "example-court"
type = "public_institution"
label = "Example Court"
depth = 1
subject = false

[[edges]]
id = "edge-example-org"
source = "example-person"
target = "example-org"
relation = "HOLDS_ROLE"
label = "role v organizaci"
status = "single"
claims = ["CLM-01"]
sources = ["SRC-01"]
`,
  );
  put(
    "data/dossiers/example-subject/updates.toml",
    `[[updates]]
date = "2026-08-01"
summary = "Založení testovacího dossieru."
added_claims = ["CLM-01", "CLM-02"]
added_gaps = ["GAP-01"]
reviewed_sources = ["SRC-01", "SRC-02", "SRC-03"]
`,
  );
  put(
    "content/entities/example-person.md",
    `+++
title = "Example Subject"
template = "entity.html"
weight = 1
aliases = ["/dossiers/example-subject/entities/example-person/"]

[extra]
record_type = "entity"
entity_id = "example-person"
entity_type = "person"
depth = 0
subject = true
publication_role = "subject"
dossier_enabled = true
dossier_status = "authorized"
coverage_state = "full"
discovered_at = "2026-08-01"
dossiers = ["example-subject"]
+++

Hlavní subjekt testovacího dossieru.
`,
  );
  put(
    "content/entities/example-org.md",
    `+++
title = "Example Org"
template = "entity.html"
weight = 2

[extra]
record_type = "entity"
entity_id = "example-org"
entity_type = "organization"
depth = 1
subject = false
publication_role = "context"
dossier_enabled = false
dossier_status = "not_authorized"
coverage_state = "contextual"
discovered_at = "2026-08-01"
dossiers = ["example-subject"]
+++

Kontextová entita.
`,
  );
}

const freshFixture = () => {
  const root = mkdtempSync(join(tmpdir(), "vomaste-migrate-"));
  writeFixture(root);
  return root;
};

const AUTHS_OPTS = (root) => ({ root, crossCheck: false });

function hashTree(dir, prefix = "") {
  const out = new Map();
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) for (const [k, v] of hashTree(join(dir, entry.name), rel)) out.set(k, v);
    else out.set(rel, createHash("sha256").update(readFileSync(join(dir, entry.name))).digest("hex"));
  }
  return out;
}

// --- migrace syntetického vstupu ----------------------------------------

test("migrace fixture: záznamy, entity, baseline i brány", async () => {
  const root = freshFixture();
  const result = await migrate(AUTHS_OPTS(root));
  assert.deepEqual(result.errors, [], result.errors.join("\n"));

  const outRoot = join(root, "data/dossiers");
  for (const rel of [
    "example-subject/dossier.json",
    "example-subject/claims/clm-01.json",
    "example-subject/claims/clm-02.json",
    "example-subject/sources/src-01.json",
    "example-subject/cases/case-01.json",
    "example-subject/gaps/gap-01.json",
    "example-subject/relations/edge-example-org.json",
    "example-subject/updates/2026-08-01.json",
    "_shared/entities/example-person.json",
    "_shared/entities/example-org.json",
    "_shared/entities/example-court.json", // založena z graph uzlu (žádná content/entities stránka)
    "_shared/semantics-baseline.json",
  ]) {
    assert.ok(existsSync(join(outRoot, rel)), `chybí ${rel}`);
  }

  const claim = JSON.parse(readFileSync(join(outRoot, "example-subject/claims/clm-01.json"), "utf8"));
  assert.equal(claim.text, "První tvrzení."); // byte-verný summary
  assert.equal(claim["@id"], "https://vomaste.cz/id/dossiers/example-subject/claims/CLM-01");
  assert.deepEqual(claim.sources, [{ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-01" }]);
  assert.deepEqual(claim.content, [{ type: "markdown", value: "Tělo tvrzení CLM-01." }]);

  const relation = JSON.parse(readFileSync(join(outRoot, "example-subject/relations/edge-example-org.json"), "utf8"));
  assert.equal(relation.relationType, "HOLDS_ROLE");
  assert.equal(relation.directed, true);
  assert.equal(relation.sourceEntity["@id"], "https://vomaste.cz/id/entities/example-person");

  const court = JSON.parse(readFileSync(join(outRoot, "_shared/entities/example-court.json"), "utf8"));
  assert.equal(court.publicationRole, "context");
  assert.equal(court.title, "Example Court");
  assert.deepEqual(court.dossiers, ["example-subject"]);

  // grandfathered S2 dluh (CLM-02: corroborated, jedna outlet rodina)
  const baseline = JSON.parse(readFileSync(join(outRoot, "_shared/semantics-baseline.json"), "utf8"));
  assert.equal(baseline.entries.length, 1);
  assert.equal(baseline.entries[0].rule, "S2");
  assert.equal(baseline.entries[0]["@id"], "https://vomaste.cz/id/dossiers/example-subject/claims/CLM-02");

  // zapsaný strom projde tvarem, referencemi i sémantikou (s baseline)
  assert.deepEqual(validateShapeTree(outRoot).errors, []);
  const model = loadCanonicalTree(outRoot);
  assert.deepEqual(validateReferences(model), []);
  const semantics = validateSemantics(model, { authorizations: new Set(["AUTH-TEST-1"]) });
  assert.deepEqual(semantics.errors, []);
  assert.ok(semantics.warnings.some((w) => w.startsWith("baseline (grandfathered S2)")), semantics.warnings.join("\n"));

  assert.deepEqual(runParityChecks(root), []);
});

// --- idempotence ---------------------------------------------------------

test("idempotence: druhý běh nezmění jediný bajt výstupu", async () => {
  const root = freshFixture();
  const first = await migrate(AUTHS_OPTS(root));
  assert.deepEqual(first.errors, []);
  const before = hashTree(join(root, "data/dossiers"));

  const second = await migrate(AUTHS_OPTS(root));
  assert.deepEqual(second.errors, []);
  const after = hashTree(join(root, "data/dossiers"));

  assert.deepEqual([...after.entries()], [...before.entries()]);
});

// --- parity fail při rozbitém výstupu/vstupu -----------------------------

test("parita selže, když se zapsaný text liší od zdroje", async () => {
  const root = freshFixture();
  assert.deepEqual((await migrate(AUTHS_OPTS(root))).errors, []);
  const file = join(root, "data/dossiers/example-subject/claims/clm-01.json");
  const rec = JSON.parse(readFileSync(file, "utf8"));
  rec.text = "Přepsaný text — parita to musí chytit.";
  writeFileSync(file, `${JSON.stringify(rec, null, 2)}\n`);
  const errors = runParityChecks(root);
  assert.ok(errors.some((e) => e.includes("text ≠ summary")), errors.join("\n"));
});

test("parita selže, když záznam vznikl navíc", async () => {
  const root = freshFixture();
  assert.deepEqual((await migrate(AUTHS_OPTS(root))).errors, []);
  const file = join(root, "data/dossiers/example-subject/claims/clm-99.json");
  writeFileSync(file, `${JSON.stringify({ fake: true }, null, 2)}\n`);
  const errors = runParityChecks(root);
  assert.ok(errors.some((e) => e.includes("clm-99.json") && e.includes("nesmí vzniknout")), errors.join("\n"));
});

test("dva [[updates]] zápisy téhož dne dostanou deterministický pořadový sufix", async () => {
  const root = freshFixture();
  const file = join(root, "data/dossiers/example-subject/updates.toml");
  writeFileSync(
    file,
    `${readFileSync(file, "utf8")}
[[updates]]
date = "2026-08-01"
summary = "Druhá seance téhož dne."
`,
  );
  const result = await migrate(AUTHS_OPTS(root));
  assert.deepEqual(result.errors, [], result.errors.join("\n"));
  const second = JSON.parse(readFileSync(join(root, "data/dossiers/example-subject/updates/2026-08-01-2.json"), "utf8"));
  assert.equal(second.identifier, "2026-08-01-2");
  assert.equal(second.date, "2026-08-01");
  assert.equal(second.summary, "Druhá seance téhož dne.");
  assert.ok(result.anomalies.some((a) => a.includes("pořadový sufix")), result.anomalies.join("\n"));
  assert.deepEqual(runParityChecks(root), []);
});

test("kolize vstupu (clm_id neodpovídá souboru) migraci odmítne bez zápisu", async () => {
  const root = freshFixture();
  const file = join(root, "content/dossiers/example-subject/claims/clm-01.md");
  writeFileSync(file, readFileSync(file, "utf8").replace('clm_id = "CLM-01"', 'clm_id = "CLM-77"'));
  const result = await migrate(AUTHS_OPTS(root));
  assert.ok(result.errors.some((e) => e.includes("nejednoznačná identita")), result.errors.join("\n"));
  // nic se nezapsalo — kolize je odmítnutí, ne polovina výstupu
  assert.ok(!existsSync(join(root, "data/dossiers/example-subject/dossier.json")));
});

test("rozejité zrcadlo (case stránka vs. [[extra.cases]]) migraci odmítne", async () => {
  const root = freshFixture();
  const file = join(root, "content/dossiers/example-subject/cases/case-01.md");
  writeFileSync(file, readFileSync(file, "utf8").replace('label = "Otevřeno"', 'label = "Uzavřeno"'));
  const result = await migrate(AUTHS_OPTS(root));
  assert.ok(result.errors.some((e) => e.includes("zrcadla se rozešla")), result.errors.join("\n"));
});

// --- baseline mechanismus ------------------------------------------------

test("nové sémantické porušení mimo allowlist zůstává chybou", async () => {
  const root = freshFixture();
  assert.deepEqual((await migrate(AUTHS_OPTS(root))).errors, []);
  const model = loadCanonicalTree(join(root, "data/dossiers"));
  // baseline injektovaný prázdný → S2 dluh se musí vrátit jako chyba
  const semantics = validateSemantics(model, { authorizations: new Set(["AUTH-TEST-1"]), baseline: [] });
  assert.ok(semantics.errors.some((e) => e.includes("status-corroborated")), semantics.errors.join("\n"));
});

test("S5/S6 nelze grandfatherovat a mrtvý záznam allowlistu se hlásí", async () => {
  const root = freshFixture();
  assert.deepEqual((await migrate(AUTHS_OPTS(root))).errors, []);
  const model = loadCanonicalTree(join(root, "data/dossiers"));
  const forbidden = validateSemantics(model, {
    authorizations: new Set(["AUTH-TEST-1"]),
    baseline: [{ "@id": "https://vomaste.cz/id/dossiers/example-subject", rule: "S5" }],
  });
  assert.ok(forbidden.errors.some((e) => e.includes("S5/S6 grandfatherovat nelze")), forbidden.errors.join("\n"));

  const stale = validateSemantics(model, {
    authorizations: new Set(["AUTH-TEST-1"]),
    baseline: [
      { "@id": "https://vomaste.cz/id/dossiers/example-subject/claims/CLM-02", rule: "S2" },
      { "@id": "https://vomaste.cz/id/dossiers/example-subject/claims/CLM-01", rule: "S1" },
    ],
  });
  assert.deepEqual(stale.errors, []);
  assert.ok(stale.warnings.some((w) => w.includes("už žádné porušení nekryje")), stale.warnings.join("\n"));
});
