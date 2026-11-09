// 🏷️ Types

/**
 * One file naming every installed skill and the files they install elsewhere,
 * one line per skill in each tool's own syntax.
 */
export interface SkillExclusionFile {
  /**
   * The comment syntax this file opens with, so the block markers stay valid:
   * `#` for four files, `//` for markdownlint's JSONC.
   */
  readonly commentPrefix: string;
  /** Path relative to the workspace root. */
  readonly filePath: string;
  /**
   * Renders one skill's line in this file's syntax. Absent for a tool that
   * already skips `.agents/`, which needs only vendored files.
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
