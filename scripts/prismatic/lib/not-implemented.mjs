// Shared stub for every scripts/prismatic/*.mjs entry point.
//
// The Prismatic integration is a governance/architecture decision
// (AUTH-2026-08-05-PLATFORM-SCOPE in AGENTS.md,
// docs/adr/prismatic-platform-integration.md) that has NOT been built
// out yet. Per this repo's own constitution §8, a policy nothing
// enforces doesn't count as implemented — so every command here fails
// loudly instead of pretending to work, and exits non-zero so it can
// never be silently treated as a passing step in a script or CI job.
//
// When implementing a real command, delete its call to this function
// and the surrounding stub body — do not leave this import in a
// finished command.
export function notImplemented(command) {
  console.error(`prismatic:${command}: not implemented yet.`);
  console.error(
    "See docs/adr/prismatic-platform-integration.md (implementation status) " +
      "and docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md " +
      "(Fáze 2 onward) for the accepted architecture and what's left to build.",
  );
  process.exitCode = 1;
}
