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
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalTree } from "../data/load.mjs";
import { collectSemanticsFindings, registeredDomain } from "../data/validate-semantics.mjs";
import { czechRegistryOrigin, createSourceIndependence } from "../data/lib/source-independence.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Táž sémantika, jakou používá brána scripts/data/validate-semantics.mjs
// (S1/S2). Kdyby se rozešly, hlásila by brána jinou nezávislost než
// dokumentace — proto celodatasetová kontrola níž volá PŘÍMO bránu a
// nekopíruje si její pravidla. Tenhle čítač zůstává jen jako čitelná
// specifikace rodinového primitivu.
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

// S10 (T-060): rodina není jediná osa nezávislosti. Dva články TÉHOŽ
// vydavatele — jeden s vyplněnou rodinou, druhý bez — dostanou dva různé
// rodinové klíče, ale jsou jedna redakce. Odznak CORROBORATED znamená dva
// nezávislé VYDAVATELE, ne dvě různé hodnoty jednoho pole.
test("S10: registrovaná doména sjednocuje redakční subdomény, ne instituce pod veřejným sufixem", () => {
  assert.equal(registeredDomain("https://domaci.hn.cz/c1-1"), registeredDomain("https://archiv.hn.cz/c1-2"));
  assert.equal(registeredDomain("https://prazsky.denik.cz/a"), registeredDomain("https://www.denik.cz/b"));
  // gov.cz je veřejný sufix — MŠMT a Ministerstvo zemědělství nesmí splynout.
  assert.notEqual(registeredDomain("https://edu.gov.cz/x"), registeredDomain("https://mze.gov.cz/y"));
});

test("žádné tvrzení netvrdí nezávislé potvrzení, které data nedokládají", () => {
  // T-028 fáze H: čte se KANONICKÝ model (data/dossiers/**/*.json) —
  // content/** je generovaný adaptér bez doménových polí.
  //
  // Kontrola volá PŘÍMO bránu (collectSemanticsFindings), místo aby si
  // pravidla S1/S2/S10 kopírovala: dvě implementace téhož pravidla se už
  // jednou rozešly a tenhle test hlídal minulost brány, ne data.
  const model = loadCanonicalTree(join(ROOT, "data/dossiers"));
  const { findings } = collectSemanticsFindings(model);

  const kontrolovano = model.records.filter(
    (w) => w.registry === "claims" && w.record.status === "status-corroborated",
  ).length;
  const problemy = findings
    .filter((f) => f.rule === "S1" || f.rule === "S2" || f.rule === "S10")
    .map((f) => `${f.rule}: ${f.message}`);

  // Bez tohohle by test prošel i tehdy, kdyby čtečka přestala cokoli najít.
  assert.ok(kontrolovano > 50, `zkontrolováno jen ${kontrolovano} tvrzení — čtečka nejspíš nic nenašla`);
  assert.deepEqual(problemy, [], "\n" + problemy.join("\n"));
});


// --- S10b: registr a jeho vlastní agregátor -------------------------------
//
// Dvojice ARES + Podnikatel.cz projde rodinou, outletem i doménou, a přesto
// není dvojí doložení: agregátor rejstříková data z registru přebírá, takže
// mu nemůže odporovat. Nalezeno živě 2026-08-05 na dossieru martin-pavlik
// (tři tvrzení a tři hrany grafu s odznakem CORROBORATED), opraveno
// v 16c072ff. Testuje se pravidlo, ne dnešní data.

const ares = {
  "@id": "src:ares", identifier: "SRC-ARES", recordType: "source",
  outlet: "ARES — Administrativní registr ekonomických subjektů (Ministerstvo financí ČR)",
  sourceType: "primární úřední záznam", url: "https://ares.gov.cz/ekonomicke-subjekty?ico=04449461",
  sourceFamily: "ares-gov-cz",
};
const agregator = {
  "@id": "src:agg", identifier: "SRC-AGG", recordType: "source",
  outlet: "Podnikatel.cz", sourceType: "sekundární rejstříkový agregátor",
  url: "https://www.podnikatel.cz/rejstrik/osoby/x/", sourceFamily: "podnikatel-cz-rejstrik",
};
const redakce = {
  "@id": "src:news", identifier: "SRC-NEWS", recordType: "source",
  outlet: "Deník N", sourceType: "investigativní zpravodajství",
  url: "https://denikn.cz/clanek/", sourceFamily: "denik-n",
};
const indep = (...records) => {
  const by = new Map(records.map((r) => [r["@id"], r]));
  return createSourceIndependence((iri) => by.get(iri));
};

test("czechRegistryOrigin pozná registr i jeho přetisk, redakci ne", () => {
  assert.equal(czechRegistryOrigin(ares), "ARES");
  assert.equal(czechRegistryOrigin(agregator), "Podnikatel.cz (rejstřík)");
  assert.equal(czechRegistryOrigin(redakce), null);
  // Redakce, která o rejstříku píše, udělala vlastní práci.
  assert.equal(
    czechRegistryOrigin({ outlet: "Česká justice", sourceType: "odborné právní zpravodajství", url: "https://ceska-justice.cz/x" }),
    null,
  );
});

test("registr + jeho agregátor NENÍ nezávislá dvojice, přestože se liší rodinou, outletem i doménou", () => {
  const i = indep(ares, agregator);
  assert.notEqual(i.familyOf(ares["@id"]), i.familyOf(agregator["@id"]), "rodiny se opravdu liší");
  assert.match(i.collisionReason(ares, agregator), /týž český veřejný rejstřík/);
  assert.equal(i.independentPair([ares["@id"], agregator["@id"]]), null);
});

test("registr + nezávislá redakce nezávislá dvojice JE", () => {
  const i = indep(ares, redakce);
  assert.equal(i.collisionReason(ares, redakce), null);
  assert.deepEqual(i.independentPair([ares["@id"], redakce["@id"]]), ["SRC-ARES", "SRC-NEWS"]);
});

test("registr + agregátor + redakce: redakce je ten druhý hlas, dvojice se veze s ní", () => {
  const i = indep(ares, agregator, redakce);
  assert.notEqual(i.independentPair([ares["@id"], agregator["@id"], redakce["@id"]]), null);
});
