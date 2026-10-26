// 🏷️ Types

/**
 * One file that has to name every installed skill and every file a skill
 * installs elsewhere, and how it names them.
 *
 * The tools that reach `.agents/` each have their own ignore syntax, and
 * each list one skill per line rather than excluding `.agents/skills/`
 * wholesale — that is what keeps this repository's own skills in the same
 * directory formatted, measured, attributed, spell-checked, and markdown-linted.
 */
export interface SkillExclusionFile {
  /**
   * How this file opens a comment, so the markers delimiting the generated
   * block are a comment in its own syntax rather than a syntax error. Four of
   * the five files take `#`; `markdownlint-cli2.config.jsonc` is JSONC and takes `//`.
   */
  readonly commentPrefix: string;
  /** Path relative to the workspace root. */
  readonly filePath: string;
  /**
   * Renders the line one skill needs, in this file's own syntax. Absent for a
   * tool that already skips `.agents/` wholesale and needs only the files a
   * skill installs outside it.
   */
  readonly renderEntry?: (skillName: string) => string;
  /** Renders the line one vendored file glob needs, in this file's own syntax. */
  readonly renderPath: (glob: string) => string;
  /** What the entries exist to keep the skills out of. */
  readonly tool: string;
}

/** What the lists are generated from: the locked skills and their vendored files. */
export interface SkillExclusionInputs {
  /** Every skill the lockfile declares, sorted. */
  readonly skillNames: readonly string[];
  /** Every file those skills install outside `.agents/skills/`, in skill order. */
  readonly vendoredPaths: readonly string[];
}
