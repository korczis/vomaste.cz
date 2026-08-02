// Safe event JSON loading (PHASE_002.md §8.2, §8.3, §24.3). Every check
// runs BEFORE the file is opened for reading, in the order a hostile path
// or oversized file would matter most: existence/type, then size, then
// content — so a 10 GB device file at the given path is never read into
// memory just to discover it isn't a plain file.
import { lstatSync, openSync, readSync, closeSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { LIMITS } from "./constants.mjs";
import { IntakeError, ERROR_CODES } from "./errors.mjs";
import { validateEventShape } from "./lib/schema-validators.mjs";

// §24.3: issue data must never be used as a filesystem path — this only
// ever receives a CLI-operator-supplied --event path, never anything
// derived from issue content.
export function loadEventFile(eventPath) {
  if (typeof eventPath !== "string" || eventPath.length === 0) {
    throw new IntakeError(ERROR_CODES.CLI_USAGE, "--event path must be a non-empty string");
  }
  const resolvedPath = isAbsolute(eventPath) ? eventPath : resolve(process.cwd(), eventPath);

  let stat;
  try {
    // lstat (not stat) so a symlink is inspected as itself first — §8.2's
    // "symlink policy" per the Phase 1 threat model is simply: refuse.
    // Following an operator-controlled symlink to an arbitrary file is
    // exactly the kind of path-confusion this loader exists to prevent.
    stat = lstatSync(resolvedPath);
  } catch {
    throw new IntakeError(ERROR_CODES.EVENT_NOT_FOUND, `event file not found: ${eventPath}`);
  }
  if (stat.isSymbolicLink()) {
    throw new IntakeError(ERROR_CODES.EVENT_NOT_REGULAR_FILE, "event path must not be a symlink");
  }
  if (!stat.isFile()) {
    throw new IntakeError(ERROR_CODES.EVENT_NOT_REGULAR_FILE, "event path must be a regular file (not a directory or device)");
  }
  if (stat.size > LIMITS.maxEventFileBytes) {
    throw new IntakeError(ERROR_CODES.EVENT_TOO_LARGE, `event file exceeds ${LIMITS.maxEventFileBytes} bytes`, { size: stat.size });
  }

  const buffer = Buffer.alloc(stat.size);
  const fd = openSync(resolvedPath, "r");
  try {
    readSync(fd, buffer, 0, stat.size, 0);
  } finally {
    closeSync(fd);
  }

  let parsed;
  try {
    parsed = JSON.parse(buffer.toString("utf8"));
  } catch {
    // §8.3: no stack trace, no partial output, no raw parser detail in the
    // normal path — the caller (CLI) decides what to print.
    throw new IntakeError(ERROR_CODES.EVENT_INVALID_JSON, "event file is not valid JSON");
  }

  const shape = validateEventShape(parsed);
  if (!shape.valid) {
    throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, "event JSON does not match the intake event schema", { errors: shape.errors });
  }

  return parsed;
}
