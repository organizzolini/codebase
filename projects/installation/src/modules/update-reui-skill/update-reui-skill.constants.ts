import { z } from "zod";

// ♟️ Constants

/** Where reui.io serves its skill, as a JSON bundle; `REUI_SKILL_URL` overrides it. */
export const DEFAULT_BUNDLE_URL = "https://mcp.reui.io/api/skills/download";

/** The lockfile that pins the skill's hash, at the workspace root. */
export const LOCKFILE_NAME = "skills-lock.json";

/** The skill's name in the lockfile. */
export const SKILL_NAME = "reui";

/** The vendored skill folder, relative to the workspace root. */
export const SKILL_DIRECTORY = ".agents/skills/reui";

/** The file every skill must carry. */
export const SKILL_ENTRY_FILE = "SKILL.md";

/** Printed after a failure, which never fails the run. */
export const RETRY_HINT =
  "💡 Retry with 'pnpm exec nx run installation:start:update-reui-skill'";

/** What reui.io serves: a version and the skill's files as text. */
export const bundleSchema = z.object({
  files: z
    .array(z.object({ content: z.string(), path: z.string() }))
    .min(1, "the bundle holds no files"),
  version: z
    .union([z.string(), z.number()])
    .optional()
    .transform((version) =>
      version === undefined ? "unknown" : String(version),
    ),
});

/** A record that keeps the key order of what it parses, unlike an object. */
export const recordSchema = z.record(z.string(), z.unknown());
