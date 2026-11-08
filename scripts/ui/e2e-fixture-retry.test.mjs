#!/usr/bin/env node
// Testy přeposílání v tests/e2e/fixtures.mjs (localGet). Záruka: opakuje
// se jen transportní chyba lokálního serveru, nikdy jiná chyba, a po
// vyčerpání pokusů chyba propadne — flaky test se nesmí tiše zazelenat.
import { test } from "node:test";
import assert from "node:assert/strict";
import { localGet } from "../../tests/e2e/fixtures.mjs";

const fake = (script) => {
  let calls = 0;
  return {
    get calls() { return calls; },
    async get() {
      const step = script[calls++];
      if (step instanceof Error) throw step;
      return step;
    },
  };
};

test("ECONNRESET se zopakuje a projde druhý pokus", async () => {
  const req = fake([new Error("apiRequestContext.get: read ECONNRESET"), { ok: true }]);
  assert.deepEqual(await localGet(req, "http://x/"), { ok: true });
  assert.equal(req.calls, 2);
});

test("netransportní chyba se neopakuje", async () => {
  const req = fake([new Error("Request context disposed"), { ok: true }]);
  await assert.rejects(localGet(req, "http://x/"), /disposed/);
  assert.equal(req.calls, 1);
});

test("po vyčerpání pokusů chyba propadne", async () => {
  const e = new Error("socket hang up");
  const req = fake([e, e, e, { ok: true }]);
  await assert.rejects(localGet(req, "http://x/"), /socket hang up/);
  assert.equal(req.calls, 3);
});
