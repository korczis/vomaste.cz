import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { dump, load } from "js-yaml";
import { validateIntakeWorkflow } from "./validate-intake-workflow.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REAL_WORKFLOW = join(ROOT, ".github/workflows/dossier-intake.yml");

function withMutatedWorkflow(mutate, fn) {
  const doc = load(readFileSync(REAL_WORKFLOW, "utf8"));
  mutate(doc);
  const dir = mkdtempSync(join(tmpdir(), "workflow-validate-test-"));
  try {
    const path = join(dir, "mutated.yml");
    writeFileSync(path, dump(doc));
    return fn(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("the real, committed workflow passes every static check", () => {
  const { errors } = validateIntakeWorkflow(REAL_WORKFLOW);
  assert.deepEqual(errors, []);
});

test("catches a trigger that isn't issues-only", () => {
  withMutatedWorkflow(
    (doc) => (doc.on = { push: { branches: ["master"] } }),
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("trigger must be exactly")));
    }
  );
});

test("catches pull_request_target as a trigger", () => {
  withMutatedWorkflow(
    (doc) => (doc.on = { ...doc.on, pull_request_target: {} }),
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("pull_request_target")));
    }
  );
});

test("catches contents: write", () => {
  withMutatedWorkflow(
    (doc) => (doc.permissions.contents = "write"),
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("permissions.contents")));
    }
  );
});

test("catches pull-requests: write", () => {
  withMutatedWorkflow(
    (doc) => (doc.permissions["pull-requests"] = "write"),
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("pull-requests")));
    }
  );
});

test("catches deployments/pages/id-token write", () => {
  for (const key of ["deployments", "pages", "id-token"]) {
    withMutatedWorkflow(
      (doc) => (doc.permissions[key] = "write"),
      (path) => {
        const { errors } = validateIntakeWorkflow(path);
        assert.ok(errors.some((e) => e.includes(key)), `expected an error mentioning "${key}"`);
      }
    );
  }
});

test("catches a checkout step missing persist-credentials: false", () => {
  withMutatedWorkflow(
    (doc) => {
      const step = doc.jobs.intake.steps.find((s) => s.uses?.startsWith("actions/checkout"));
      delete step.with["persist-credentials"];
    },
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("persist-credentials")));
    }
  );
});

test("catches a missing timeout-minutes", () => {
  withMutatedWorkflow(
    (doc) => delete doc.jobs.intake["timeout-minutes"],
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("timeout")));
    }
  );
});

test("catches a missing concurrency group", () => {
  withMutatedWorkflow(
    (doc) => delete doc.concurrency,
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("concurrency")));
    }
  );
});

test("catches issue.body interpolated directly into a shell run: block", () => {
  withMutatedWorkflow(
    (doc) => {
      doc.jobs.intake.steps.push({ name: "evil", run: 'echo "${{ github.event.issue.body }}"' });
    },
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("issue.body")));
    }
  );
});

test("catches issue.title interpolated directly into a shell run: block", () => {
  withMutatedWorkflow(
    (doc) => {
      doc.jobs.intake.steps.push({ name: "evil", run: 'echo "${{ github.event.issue.title }}"' });
    },
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("issue.title")));
    }
  );
});

test("catches a secret other than GITHUB_TOKEN", () => {
  withMutatedWorkflow(
    (doc) => {
      const step = doc.jobs.intake.steps.find((s) => s.run?.includes("publish-github-result.mjs"));
      step.env = { ...step.env, PRISMATIC_API_KEY: "${{ secrets.PRISMATIC_API_KEY }}" };
    },
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("PRISMATIC_API_KEY")));
    }
  );
});

test("catches the processing step being given GITHUB_TOKEN (privilege-separation violation)", () => {
  withMutatedWorkflow(
    (doc) => {
      const step = doc.jobs.intake.steps.find((s) => s.run?.includes("process-github-event.mjs"));
      step.env = { GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" };
    },
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("privilege separation")));
    }
  );
});

test("catches a git push in the workflow text", () => {
  withMutatedWorkflow(
    (doc) => doc.jobs.intake.steps.push({ name: "evil", run: "git push origin master" }),
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("git push")));
    }
  );
});

test("catches a gh pr create in the workflow text", () => {
  withMutatedWorkflow(
    (doc) => doc.jobs.intake.steps.push({ name: "evil", run: 'gh pr create --title "x"' }),
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("gh pr create")));
    }
  );
});

test("catches a deploy-looking action reference", () => {
  withMutatedWorkflow(
    (doc) => doc.jobs.intake.steps.push({ name: "evil", uses: "actions/deploy-pages@v5" }),
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("deploy action")));
    }
  );
});

test("catches an artifact name derived from issue title/body", () => {
  withMutatedWorkflow(
    (doc) => {
      const step = doc.jobs.intake.steps.find((s) => s.uses?.startsWith("actions/upload-artifact"));
      step.with.name = "dossier-intake-${{ github.event.issue.title }}";
    },
    (path) => {
      const { errors } = validateIntakeWorkflow(path);
      assert.ok(errors.some((e) => e.includes("issue title/body")));
    }
  );
});
