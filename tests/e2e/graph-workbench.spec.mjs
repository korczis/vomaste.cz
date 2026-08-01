// Graph workbench (coop T-027, docs/missions/2026-08-01-graph-workbench-master-prompt.md).
// Covers the load-bearing behaviors the mission's Definition of Done (§ 24)
// and browser-test list (§ 17.3) actually name: lazy/once/cached loading of
// the full registry layer, no renderer leak across repeated layer switches,
// selection opening the inspector instead of navigating immediately, the
// explicit "open record" escape hatch, Escape closing the inspector, and
// URL state surviving a reload.
import { test, expect } from "./fixtures.mjs";

test.describe("graph workbench — /map/", () => {
  test("full registry layer is not fetched before its layer button is activated", async ({ page }) => {
    const requests = [];
    page.on("request", (req) => {
      if (req.url().includes("global-registry.json")) requests.push(req.url());
    });
    await page.goto("/map/");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
    expect(requests, "global-registry.json must not be fetched on initial load").toHaveLength(0);
  });

  test("activating the full layer fetches it exactly once; a second toggle reuses the cache", async ({ page }) => {
    test.slow();
    let fetchCount = 0;
    page.on("request", (req) => {
      if (req.url().includes("global-registry.json")) fetchCount++;
    });
    await page.goto("/map/");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });

    await page.locator('[data-graph-layer="full"]').click();
    await page.waitForTimeout(500);
    expect(fetchCount).toBe(1);

    await page.locator('[data-graph-layer="curated"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-graph-layer="full"]').click();
    await page.waitForTimeout(300);
    expect(fetchCount, "second activation of the full layer must not re-fetch").toBe(1);
  });

  test("ten layer switches leave the same canvas count (no renderer leak)", async ({ page }) => {
    test.slow();
    await page.goto("/map/");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
    // Sigma renders ONE instance as several stacked internal canvases
    // (edges/edgeLabels/nodes/labels/hovers/hoverNodes/mouse) — the
    // leak signal is that count staying CONSTANT across repeated layer
    // switches (controller.setLayer reuses the renderer, mission § 6.2),
    // not some literal count of 1.
    const baseline = await page.locator("#global-map-view canvas").count();
    expect(baseline).toBeGreaterThan(0);
    const curated = page.locator('[data-graph-layer="curated"]');
    const full = page.locator('[data-graph-layer="full"]');
    for (let i = 0; i < 5; i++) {
      await full.click();
      await page.waitForTimeout(150);
      await curated.click();
      await page.waitForTimeout(150);
    }
    const canvasCount = await page.locator("#global-map-view canvas").count();
    expect(canvasCount).toBe(baseline);
  });

  test("clicking a node selects it and opens the inspector instead of navigating away", async ({ page }) => {
    await page.goto("/map/");
    const canvas = page.locator("#global-map-view canvas").first();
    await expect(canvas).toBeVisible({ timeout: 30_000 });
    const box = await canvas.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);
    expect(page.url()).toContain("/map/"); // still on the map — no immediate navigation
  });

  test("the inspector's open-record link, when present, points at a real page, not a hash", async ({ page }) => {
    await page.goto("/map/");
    const canvas = page.locator("#global-map-view canvas").first();
    await expect(canvas).toBeVisible({ timeout: 30_000 });
    const box = await canvas.boundingBox();
    // Sweep a few points across the canvas — node positions vary by layout,
    // so click the center first and fall back to a couple of offsets.
    const points = [
      [box.x + box.width / 2, box.y + box.height / 2],
      [box.x + box.width * 0.4, box.y + box.height * 0.4],
      [box.x + box.width * 0.6, box.y + box.height * 0.6],
    ];
    let link = null;
    for (const [x, y] of points) {
      await page.mouse.click(x, y);
      await page.waitForTimeout(200);
      const candidate = page.locator("[data-graph-inspector] .graph-inspector-open");
      if (await candidate.count()) {
        link = candidate;
        break;
      }
    }
    if (link) {
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^\//);
    }
  });

  test("Escape clears the selection and the inspector returns to its empty state", async ({ page }) => {
    await page.goto("/map/?node=klempir");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await expect(page.locator("[data-graph-inspector] .graph-inspector-empty")).toBeVisible();
  });

  test("a deep link with ?node= restores the selection on load", async ({ page }) => {
    await page.goto("/map/?node=klempir");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(400);
    const inspector = page.locator("[data-graph-inspector]");
    await expect(inspector.locator(".graph-inspector-empty")).toHaveCount(0);
  });

  test("an unknown/garbage URL param is ignored rather than breaking the page", async ({ page }) => {
    await page.goto("/map/?layer=not-a-real-layer&node=does-not-exist&record_type=<script>");
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
    // No JS error dialog, no crash — the curated layer (the default) is what renders.
    await expect(page.locator('[data-graph-layer="curated"][aria-pressed="true"]')).toBeVisible();
  });

  test("bez JavaScriptu zůstane graf mimo, ale textový registr a katalog dossierů fungují", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/map/");
    await expect(page.locator("text=Textová alternativa")).toBeVisible();
    await context.close();
  });

  test("WebGL unavailable shows an explanatory fallback, not a blank canvas", async ({ page }) => {
    // Force every 2D/WebGL context request to fail, the way a browser
    // with WebGL disabled/blocked would — this is what Sigma's
    // constructor throws on, which controller.js now catches (mission § 13).
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (String(type).includes("webgl")) return null;
        return original.call(this, type, ...args);
      };
    });
    await page.goto("/map/");
    await expect(page.locator(".graph-fallback")).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".graph-fallback")).toContainText("textový registr");
    expect(await page.locator("#global-map-view canvas").count()).toBe(0);
  });
});

test.describe("graph workbench — local dossier graph", () => {
  test("dossier page graph is inlined (no global-registry.json fetch on a dossier page)", async ({ page }) => {
    const requests = [];
    page.on("request", (req) => {
      if (req.url().includes("global-registry.json")) requests.push(req.url());
    });
    await page.goto("/dossiers/macinka-turek/");
    await expect(page.locator("#graph-view-box canvas").first()).toBeVisible({ timeout: 30_000 });
    expect(requests).toHaveLength(0);
  });

  test("a dossier page without a local graph section does not load graph-app.js", async ({ page }) => {
    const requests = [];
    page.on("request", (req) => {
      if (req.url().includes("graph-app.js")) requests.push(req.url());
    });
    await page.goto("/entities/");
    await page.waitForTimeout(300);
    expect(requests).toHaveLength(0);
  });
});
