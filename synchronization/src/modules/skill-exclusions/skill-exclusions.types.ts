// 🏷️ Types

/** A file listing each installed skill, in tool syntax. */
export interface SkillExclusionFile {
  /**
   * The comment syntax this file opens with, so the block markers stay valid:
   * `#` for four files, `//` for markdownlint's JSONC.
   */
  readonly commentPrefix: string;
  /** Path relative to the workspace root. */
  readonly filePath: string;
  /** Renders one skill's line in this file's syntax. */
  readonly renderEntry: (skillName: string) => string;
  /** What the entries exist to keep the skills out of. */
  readonly tool: string;
}

/** Source of the lists: the locked skills. */
export interface SkillExclusionInputs {
  /** Every skill the lockfile declares, sorted. */
  readonly skillNames: readonly string[];
}
