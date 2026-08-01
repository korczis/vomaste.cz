// Testy BFS hloubky kurátorovaného grafu (T-028 fáze H) — hloubka se od
// zrušení graph.toml POČÍTÁ, ne kurátoruje; tyhle testy jsou vlastníkem
// definice: subjekt = 0, soused = +1, bez cesty = null, plný determinismus.
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeGraphDepths } from "./lib/graph-depth.mjs";

test("BFS: subjekt 0, řetěz +1 na každý krok, neorientovaně", () => {
  const depths = computeGraphDepths(
    ["s", "a", "b", "c"],
    ["s"],
    [
      { from: "s", to: "a" },
      { from: "b", to: "a" }, // obrácený směr — hrany jsou neorientované
      { from: "b", to: "c" },
    ],
  );
  assert.deepEqual([...depths.entries()], [["s", 0], ["a", 1], ["b", 2], ["c", 3]]);
});

test("BFS: víc subjektů — hloubka je minimum přes všechny subjekty", () => {
  const depths = computeGraphDepths(
    ["s1", "s2", "x"],
    ["s1", "s2"],
    [
      { from: "s1", to: "x" },
      { from: "s2", to: "x" },
    ],
  );
  assert.equal(depths.get("s1"), 0);
  assert.equal(depths.get("s2"), 0);
  assert.equal(depths.get("x"), 1);
});

test("BFS: uzel bez cesty k subjektu má hloubku null (S8 ho hlásí)", () => {
  const depths = computeGraphDepths(["s", "a", "orphan"], ["s"], [{ from: "s", to: "a" }]);
  assert.equal(depths.get("orphan"), null);
});

test("BFS: hrany na neznámé uzly se ignorují, výsledek je deterministický", () => {
  const run = () =>
    computeGraphDepths(
      ["s", "a", "b"],
      ["s"],
      [
        { from: "s", to: "ghost" }, // mimo množinu uzlů — nezpůsobí pád ani únik
        { from: "s", to: "a" },
        { from: "a", to: "b" },
        { from: "s", to: "b" }, // kratší cesta objevená později v pořadí hran
      ],
    );
  const first = [...run().entries()];
  const second = [...run().entries()];
  assert.deepEqual(first, second);
  assert.deepEqual(first, [["s", 0], ["a", 1], ["b", 1]]);
});

test("BFS: prázdný graf a graf bez subjektů", () => {
  assert.deepEqual([...computeGraphDepths([], [], []).entries()], []);
  const noSubject = computeGraphDepths(["a", "b"], [], [{ from: "a", to: "b" }]);
  assert.deepEqual([...noSubject.entries()], [["a", null], ["b", null]]);
});
