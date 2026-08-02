// In-memory fake GitHub API adapter (PHASE_006.md §18.1, §26) — the same
// interface shape the production adapter implements, so every
// scripts/intake/github/*.mjs module (comment lookup, upsert, label
// sync, notification policy) is fully testable with zero network and
// zero token. Never imported by production code paths.
let nextCommentId = 1000;

export function createMockGithubAdapter({ issue, comments = [], labels = [] } = {}) {
  const state = {
    issue: { number: issue?.number ?? 1, updated_at: issue?.updated_at ?? "2026-08-02T00:00:00Z", state: issue?.state ?? "open" },
    comments: comments.map((c) => ({ ...c })),
    labels: [...labels],
    calls: [], // audit trail for assertions — e.g. did removeLabel actually run
  };

  return {
    _state: state,
    async getIssue() {
      state.calls.push({ op: "getIssue" });
      return { ...state.issue };
    },
    async listComments() {
      state.calls.push({ op: "listComments" });
      return state.comments.map((c) => ({ ...c }));
    },
    async createComment(body) {
      state.calls.push({ op: "createComment", body });
      const comment = { id: nextCommentId++, author_login: "github-actions[bot]", author_is_bot: true, body, created_at: "2026-08-02T00:00:00Z" };
      state.comments.push(comment);
      return { ...comment };
    },
    async updateComment(commentId, body) {
      state.calls.push({ op: "updateComment", commentId, body });
      const comment = state.comments.find((c) => c.id === commentId);
      if (!comment) throw new Error(`mock adapter: no comment with id ${commentId}`);
      comment.body = body;
      return { ...comment };
    },
    async listLabels() {
      state.calls.push({ op: "listLabels" });
      return [...state.labels];
    },
    async addLabels(names) {
      state.calls.push({ op: "addLabels", names });
      for (const name of names) if (!state.labels.includes(name)) state.labels.push(name);
      return [...state.labels];
    },
    async removeLabel(name) {
      state.calls.push({ op: "removeLabel", name });
      state.labels = state.labels.filter((l) => l !== name);
    },
  };
}

// A label-set-aware variant: repository labels that actually "exist" —
// addLabels rejects (mirrors real GitHub REST behavior, §14) any name
// not in this allowlist, letting §14 Varianta A's graceful-degradation
// path be tested honestly.
export function createMockGithubAdapterWithRepoLabels({ issue, comments, labels, existingRepoLabels }) {
  const base = createMockGithubAdapter({ issue, comments, labels });
  const allowed = new Set(existingRepoLabels);
  return {
    ...base,
    async addLabels(names) {
      const missing = names.filter((n) => !allowed.has(n));
      const applicable = names.filter((n) => allowed.has(n));
      base._state.calls.push({ op: "addLabels", names, missing });
      for (const name of applicable) if (!base._state.labels.includes(name)) base._state.labels.push(name);
      if (missing.length > 0) {
        const err = new Error(`mock adapter: label(s) do not exist in repository: ${missing.join(", ")}`);
        err.code = "label_not_found";
        err.missingLabels = missing;
        throw err;
      }
      return [...base._state.labels];
    },
  };
}
