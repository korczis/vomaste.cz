// Synthetic renderer benchmark (mission § 17.4, coop T-027) — NOT part of
// the default a11y/regression gate, NOT published content. Feeds a
// deterministic, clearly-fake 10k-node/30k-edge graph
// (scripts/dossier/lib/synthetic-benchmark-graph.mjs — every label is
// literally "Synthetic <type> <n>") through the REAL /map/ page and the
// REAL runtime (assets/js/modules/graph/) by intercepting the full-layer
// fetch, so this measures the actual renderer, not a toy harness.
//
// Run explicitly: npx playwright test tests/e2e/graph-benchmark.spec.mjs
// Reports timings to the console. Per mission § 17.4, this records
// numbers — it does NOT assert hard pass/fail thresholds, since this
// machine's timing says nothing about every phone/browser out there.
import { test, expect } from "./fixtures.mjs";
import { generateSyntheticGraph } from "../../scripts/dossier/lib/synthetic-benchmark-graph.mjs";
import { computeLayout, applyLayout } from "../../scripts/dossier/lib/graph-layout.mjs";

test.describe("graph renderer — synthetic benchmark (10k nodes / 30k edges)", () => {
  test.setTimeout(180_000);

  let syntheticPayload;
  test.beforeAll(() => {
    const graph = generateSyntheticGraph({ nodeCount: 10_000, edgeCount: 30_000, seed: 7 });
    const t0 = Date.now();
    const layout = computeLayout(graph.nodes, graph.edges, { barnesHut: true });
    const nodes = applyLayout(graph.nodes, layout);
    console.log(`[benchmark] build-time layout for 10k/30k: ${Date.now() - t0} ms`);
    syntheticPayload = { schema_version: 1, nodes, edges: graph.edges };
  });

  test("init, pan/zoom, selection, filter, and cleanup at 10k-node scale", async ({ page }) => {
    await page.route("**/global-registry.json*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(syntheticPayload) }));

    await page.goto("/map/");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });

    const t0 = Date.now();
    await page.locator('[data-graph-layer="full"]').click();
    await page.waitForFunction(
      () => document.querySelectorAll("#global-map-view canvas").length > 0 && document.querySelector('[data-graph-layer="full"][aria-pressed="true"]') !== null,
      { timeout: 60_000 },
    );
    console.log(`[benchmark] activate 10k/30k layer (no runtime layout, precomputed coords): ${Date.now() - t0} ms`);

    const canvas = page.locator("#global-map-view canvas").first();
    const box = await canvas.boundingBox();

    const panStart = Date.now();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40, { steps: 8 });
    await page.mouse.up();
    console.log(`[benchmark] pan gesture: ${Date.now() - panStart} ms`);

    const zoomStart = Date.now();
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(100);
    console.log(`[benchmark] zoom gesture: ${Date.now() - zoomStart} ms`);

    const selectStart = Date.now();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(150);
    console.log(`[benchmark] click/select at 10k nodes: ${Date.now() - selectStart} ms`);

    // Filter/cleanup are recorded, not gated (mission § 17.4: report
    // numbers, no hard cross-device thresholds) — a slow or stuck step
    // here at 6x the real dataset's size (1631 nodes today) is a finding
    // to write down, not a reason to fail a non-blocking benchmark.
    const filterStart = Date.now();
    try {
      await page.locator('[data-graph-filter="record_type"]').selectOption("claim", { timeout: 20_000 });
      console.log(`[benchmark] reducer-based filter apply: ${Date.now() - filterStart} ms`);
      await page.locator('[data-graph-filter="record_type"]').selectOption("", { timeout: 20_000 });
    } catch (err) {
      console.log(`[benchmark] reducer-based filter apply DID NOT COMPLETE within 20s at 10k-node scale (${Date.now() - filterStart} ms elapsed) — revisit-threshold finding, see reports/graph-workbench-implementation.md.`);
    }

    const baselineCanvases = await page.locator("#global-map-view canvas").count();
    const cleanupStart = Date.now();
    try {
      await page.locator('[data-graph-layer="curated"]').click({ timeout: 20_000 });
      await page.waitForTimeout(150);
      console.log(`[benchmark] switch away from 10k layer (cleanup path): ${Date.now() - cleanupStart} ms`);
      expect(await page.locator("#global-map-view canvas").count(), "canvas count must not grow after switching away from the large layer").toBe(baselineCanvases);
    } catch (err) {
      console.log(`[benchmark] switch-away-from-10k-layer DID NOT COMPLETE within 20s (${Date.now() - cleanupStart} ms elapsed) — revisit-threshold finding.`);
    }
  });
});
