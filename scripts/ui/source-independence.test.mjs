// Nezávislost doložení se počítá přes RODINY (coop T-035).
//
// Odznak CORROBORATED je na stránce definován jako „potvrzeno nezávisle
// více médii". Dva zdroje se dvěma různými ID i dvěma různými URL ale
// mohou být totéž převzetí jedné agenturní zprávy — a pak je nezávislé
// doložení JEDNO, ne dvě.
//
// Přesně to se v datech stalo: dvě tvrzení citovala dvě převzetí téže
// zprávy ČTK a nesla odznak nezávislého potvrzení. Kontrola podle ID
// i podle URL prošla, protože ID i URL se skutečně lišily.
//
// Testuje se PRAVIDLO, ne dnešní čísla: konkrétní tvrzení se mění každým
// rešeršním kolem a test vázaný na jejich seznam by za týden hlídal
// minulost.
//
// Použití: node --test scripts/ui/source-independence.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Táž sémantika, jakou používá brána scripts/data/validate-semantics.mjs
// (S1/S2). Kdyby se rozešly, hlásila by brána jinou nezávislost než
// dokumentace.
function countIndependent(srcIds, familyOf) {
  const rodiny = new Set();
  for (const id of srcIds) {
    const f = familyOf.get(id);
    rodiny.add(f ? `family:${f}` : `self:${id}`);
  }
  return rodiny.size;
}

test("dva zdroje téže rodiny jsou jedno nezávislé doložení", () => {
  const fam = new Map([["SRC-01", "ctk"], ["SRC-02", "ctk"]]);
  assert.equal(countIndependent(["SRC-01", "SRC-02"], fam), 1);
});

test("zdroje bez rodiny se počítají každý zvlášť", () => {
  assert.equal(countIndependent(["SRC-01", "SRC-02"], new Map()), 2);
});

test("smíšený případ: převzetí + samostatná reportáž = dvě doložení", () => {
  const fam = new Map([["SRC-01", "ctk"], ["SRC-02", "ctk"], ["SRC-03", ""]]);
  assert.equal(countIndependent(["SRC-01", "SRC-02", "SRC-03"], fam), 2);
});

test("žádné tvrzení netvrdí nezávislé potvrzení, které data nedokládají", () => {
  // T-028 fáze H: čte se KANONICKÝ model (data/dossiers/**/*.json) —
  // content/** je generovaný adaptér bez doménových polí. Rodina zdroje
  // následuje sémantiku brány: sourceFamily > outlet > zdroj sám za sebe.
  const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
  const localId = (ref) => (typeof ref?.["@id"] === "string" ? ref["@id"].split("/").pop() : "");

  const base = join(ROOT, "data/dossiers");
  const problemy = [];
  let kontrolovano = 0;

  for (const slug of readdirSync(base)) {
    const cd = join(base, slug, "claims"), sd = join(base, slug, "sources");
    if (!existsSync(cd) || !existsSync(sd)) continue;

    const fam = new Map();
    for (const f of readdirSync(sd).filter((x) => /^src-\d+\.json$/.test(x))) {
      const r = readJson(join(sd, f));
      const family = (typeof r.sourceFamily === "string" && r.sourceFamily.trim()) || (typeof r.outlet === "string" && r.outlet.trim()) || "";
      fam.set(r.identifier, family);
    }

    for (const f of readdirSync(cd).filter((x) => /^clm-\d+\.json$/.test(x))) {
      const r = readJson(join(cd, f));
      const status = r.status;
      const ids = [...new Set((r.sources ?? []).map(localId))];
      if (status === "status-corroborated") {
        kontrolovano++;
        const n = countIndependent(ids, fam);
        if (n < 2) problemy.push(`${slug}/${r.identifier}: ${ids.length} zdrojů → ${n} nezávislá rodina [${ids.join(", ")}]`);
      }
      if (status === "status-single" && countIndependent(ids, fam) > 1) {
        problemy.push(`${slug}/${r.identifier}: status-single, ale ${countIndependent(ids, fam)} nezávislé rodiny — podceňuje doložení`);
      }
    }
  }

  // Bez tohohle by test prošel i tehdy, kdyby čtečka přestala cokoli najít.
  assert.ok(kontrolovano > 50, `zkontrolováno jen ${kontrolovano} tvrzení — čtečka nejspíš nic nenašla`);
  assert.deepEqual(problemy, [], "\n" + problemy.join("\n"));
});
