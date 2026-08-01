// Testy JSON-first zápisu expand-entity.mjs (T-028 fáze I).
//
// Vše běží nad TEMP adresářem se syntetickými entitami — žádný test
// nesahá na reálné data/dossiers/_shared/entities/** a žádný nedělá
// síťový dotaz (testuje se plán/render nad extract()-tvarem dat).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  readEntitiesState,
  planExpansion,
  executePlan,
  renderCompany,
  renderPerson,
} from "./expand-entity.mjs";
import { validateRecordObject } from "../data/validate-shape.mjs";

const OPTS = { today: "2026-01-02", provenance: "ares-expansion-12345678-2026-01-02" };

const DATA = {
  ico: "12345678",
  name: "Example Trade s.r.o.",
  formerNames: ["Oldname s.r.o."],
  seat: "Testovní 1, Brno",
  officers: [{ kind: "person", name: "Jan Testovský", slugSource: "JAN TESTOVSKÝ", role: "jednatel" }],
  shareholders: [
    { kind: "person", name: "Jan Testovský", slugSource: "JAN TESTOVSKÝ", share: "100 %" },
  ],
};

function makeTmp(existing = {}) {
  const dir = mkdtempSync(join(tmpdir(), "expand-entity-"));
  for (const [id, record] of Object.entries(existing)) {
    writeFileSync(join(dir, `${id}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
  }
  return dir;
}

const existingEntity = (id, title, order = 5) => ({
  $schema: "https://vomaste.cz/schemas/canonical/entity.schema.json",
  schemaVersion: 1,
  "@context": "https://vomaste.cz/context/v1.jsonld",
  "@id": `https://vomaste.cz/id/entities/${id}`,
  "@type": "vomaste:Entity",
  recordType: "entity",
  identifier: id,
  entityId: id,
  title,
  entityType: "person",
  publicationRole: "context",
  dossierEnabled: false,
  dossierStatus: "not_authorized",
  coverageState: "referenced",
  dossiers: [],
  order,
});

test("plán vytváří kanonické záznamy, které projdou entity schématem", () => {
  const dir = makeTmp();
  try {
    const state = readEntitiesState(dir);
    const planned = planExpansion(DATA, OPTS).finalize(state.existingIds);
    const { created, skipped, suspected } = executePlan(planned, state, { write: true });

    assert.equal(skipped.length, 0);
    assert.equal(suspected.length, 0);
    // firma + osoba (jednatel a společník se slévají do jednoho záznamu)
    assert.equal(created.length, 2);

    const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
    assert.deepEqual(files, ["example-trade-s-r-o.json", "jan-testovsky.json"]);

    for (const f of files) {
      const record = JSON.parse(readFileSync(join(dir, f), "utf8"));
      assert.deepEqual(
        validateRecordObject(record, f),
        [],
        `záznam ${f} musí projít schématem`,
      );
      assert.equal(record.publicationRole, "context");
      assert.equal(record.dossierEnabled, false);
      assert.equal(record.dossierStatus, "not_authorized");
      assert.deepEqual(record.dossiers, []);
      assert.deepEqual(record.provenance.discoveredVia, [OPTS.provenance]);
      const raw = readFileSync(join(dir, f), "utf8");
      assert.ok(!raw.includes("datumNarozeni") && !raw.includes("adresa"), "žádná osobní data");
    }

    const person = JSON.parse(readFileSync(join(dir, "jan-testovsky.json"), "utf8"));
    assert.equal(person.entityType, "person");
    assert.match(person.content[0].value, /jednatel/);
    assert.match(person.content[0].value, /Datum narození ani adresu bydliště/);

    const company = JSON.parse(readFileSync(join(dir, "example-trade-s-r-o.json"), "utf8"));
    assert.equal(company.entityType, "company");
    assert.equal(company.externalIds.ares, "12345678");
    assert.match(company.content[0].value, /IČO 12345678/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("existující záznam se nikdy nepřepisuje; order navazuje na maximum", () => {
  const dir = makeTmp({ "jan-testovsky": existingEntity("jan-testovsky", "Jan Testovský", 7) });
  try {
    const before = readFileSync(join(dir, "jan-testovsky.json"), "utf8");
    const state = readEntitiesState(dir);
    assert.equal(state.nextOrder, 8);

    const planned = planExpansion(DATA, OPTS).finalize(state.existingIds);
    const { created, skipped } = executePlan(planned, state, { write: true });

    assert.deepEqual(skipped.map((p) => p.id), ["jan-testovsky"]);
    assert.equal(readFileSync(join(dir, "jan-testovsky.json"), "utf8"), before, "beze změny bajtu");
    assert.deepEqual(created.map((p) => p.id), ["example-trade-s-r-o"]);
    assert.equal(created[0].record.order, 8);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("kolize jmenovce pod jiným id = report člověku, žádné založení", () => {
  // Stejné příjmení pod jiným slugem — konzervativní dedupe hlásí, nezakládá.
  const dir = makeTmp({
    "jan-novak-testovsky": existingEntity("jan-novak-testovsky", "Jan Novák Testovský", 3),
  });
  try {
    const state = readEntitiesState(dir);
    const planned = planExpansion(DATA, OPTS).finalize(state.existingIds);
    const { created, suspected } = executePlan(planned, state, { write: true });

    assert.deepEqual(suspected.map((p) => p.id), ["jan-testovsky"]);
    assert.equal(suspected[0].duplicateOf, "jan-novak-testovsky");
    assert.ok(!readdirSync(dir).includes("jan-testovsky.json"), "podezřelý duplikát se nezakládá");
    assert.deepEqual(created.map((p) => p.id), ["example-trade-s-r-o"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("dry run (write=false) nic nezapisuje", () => {
  const dir = makeTmp();
  try {
    const state = readEntitiesState(dir);
    const planned = planExpansion(DATA, OPTS).finalize(state.existingIds);
    const { created } = executePlan(planned, state, { write: false });
    assert.equal(created.length, 2);
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
