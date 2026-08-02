// The ONLY module in this repo that calls the real GitHub REST API
// (PHASE_006.md §18.1, §20) — every other scripts/intake/github/*.mjs
// module takes an adapter object and never imports this file or `fetch`
// itself. Uses Node's built-in `fetch` (no new dependency: `actions/
// github-script`'s Octokit was an option, but this repo's ESM module
// layout and existing "small Node entrypoint with GITHUB_TOKEN" pattern
// from Phase 4 fit a plain REST client better — PHASE_006.md §19
// explicitly allows either).
//
// The token is read from `token` at construction time, never logged,
// never placed in a URL or CLI argument — only ever sent as the
// Authorization header of a request this module itself makes.
const API_BASE = "https://api.github.com";
const API_VERSION = "2022-11-28";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "vomaste-cz-dossier-intake",
  };
}

async function githubRequest(token, method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...authHeaders(token), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`GitHub API ${method} ${path} failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text.slice(0, 500); // bounded — never log/store an unbounded response body
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// `owner`/`repo`/`issueNumber` are GitHub-controlled workflow context
// (github.repository / github.event.issue.number), never raw issue body
// content — see process-github-event.mjs's adapter for where that
// distinction is actually enforced.
export function createProductionGithubAdapter({ token, owner, repo, issueNumber }) {
  if (!token) throw new Error("createProductionGithubAdapter: token is required");
  const base = `/repos/${owner}/${repo}/issues/${issueNumber}`;
  return {
    async getIssue() {
      const issue = await githubRequest(token, "GET", base);
      return { number: issue.number, updated_at: issue.updated_at, state: issue.state };
    },
    async listComments() {
      const comments = await githubRequest(token, "GET", `${base}/comments?per_page=100`);
      return comments.map((c) => ({ id: c.id, author_login: c.user?.login, author_is_bot: c.user?.type === "Bot", body: c.body, created_at: c.created_at }));
    },
    async createComment(body) {
      const c = await githubRequest(token, "POST", `${base}/comments`, { body });
      return { id: c.id, author_login: c.user?.login, author_is_bot: c.user?.type === "Bot", body: c.body, created_at: c.created_at };
    },
    async updateComment(commentId, body) {
      const c = await githubRequest(token, "PATCH", `/repos/${owner}/${repo}/issues/comments/${commentId}`, { body });
      return { id: c.id, author_login: c.user?.login, author_is_bot: c.user?.type === "Bot", body: c.body, created_at: c.created_at };
    },
    async listLabels() {
      const labels = await githubRequest(token, "GET", `${base}/labels?per_page=100`);
      return labels.map((l) => l.name);
    },
    async addLabels(names) {
      const result = await githubRequest(token, "POST", `${base}/labels`, { labels: names });
      return result.map((l) => l.name);
    },
    async removeLabel(name) {
      try {
        await githubRequest(token, "DELETE", `${base}/labels/${encodeURIComponent(name)}`);
      } catch (err) {
        if (err.status === 404) return; // already absent — not a failure
        throw err;
      }
    },
  };
}
