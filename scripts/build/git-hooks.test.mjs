// Struktura .githooks/{post-commit,post-merge} vs. sdílená
// .githooks/lib/auto-push-master.sh.
//
// Přidáno 2026-08-06 po nálezu, že `git merge`/`git pull` spouští úplně
// jiný pár hooků (pre-merge-commit/post-merge) než `git commit`
// (pre-commit/post-commit) — auto-push žil jen v post-commit a coop
// merge (`git merge --no-ff task/T-###`, přesný krok, kterým ORCH
// integruje hotovou práci) ho tím pádem úplně obcházel. Oprava přesunula
// sdílenou logiku do lib/auto-push-master.sh, volanou z obou hooků. Tenhle
// test hlídá strukturální předpoklad té opravy — kdyby někdo příště upravil
// jen jeden hook a zapomněl na druhý, spadne tu, ne až při dalším živém
// mergi.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LIB = join(ROOT, ".githooks/lib/auto-push-master.sh");

test("sdílená auto-push knihovna existuje a definuje auto_push_master()", () => {
  assert.ok(existsSync(LIB), "chybí .githooks/lib/auto-push-master.sh");
  assert.match(readFileSync(LIB, "utf8"), /^auto_push_master\(\)\s*\{/m);
});

for (const hook of ["post-commit", "post-merge"]) {
  test(`.githooks/${hook} zdrojuje sdílenou knihovnu a volá auto_push_master s vlastním jménem`, () => {
    const p = join(ROOT, ".githooks", hook);
    assert.ok(existsSync(p), `chybí .githooks/${hook}`);
    const src = readFileSync(p, "utf8");
    assert.match(src, /source ".*lib\/auto-push-master\.sh"/, `${hook} nezdrojuje lib/auto-push-master.sh`);
    assert.match(
      src,
      new RegExp(`auto_push_master "${hook}"`),
      `${hook} nevolá auto_push_master se svým vlastním jménem (log prefix by ukazoval na špatný hook)`,
    );
  });
}

test("auto-push knihovna sama sebe nikdy nepushuje bez ověření branch==master", () => {
  const src = readFileSync(LIB, "utf8");
  assert.match(src, /branch.*!=.*master/, "chybí branch guard — hook by mohl pushnout z jiné větve");
});
