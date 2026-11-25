import { z } from "zod";

// ♟️ Constants

/** Most words a skill description may hold before agent listings truncate. */
export const MAXIMUM_DESCRIPTION_WORDS = 128;

/** Where every installed skill lives, relative to the workspace root. */
export const SKILLS_DIRECTORY = ".agents/skills";

/** The lockfile naming each skill installed from a source. */
export const SKILLS_LOCK_PATH = "skills-lock.json";

/** The lockfile source of a skill this repository authors and publishes. */
export const AUTHORED_SOURCE = "organizzolini/codebase";

/** The file each skill folder holds its front matter in. */
export const SKILL_FILE_NAME = "SKILL.md";

/** Matches a front matter block and captures its contents. */
export const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---/u;

/** Schema for the parts of `skills-lock.json` this check reads. */
export const SKILLS_LOCK_SCHEMA = z.looseObject({
  skills: z.record(
    z.string(),
    z.looseObject({
      skillPath: z.string().optional(),
      source: z.string(),
    }),
  ),
});
