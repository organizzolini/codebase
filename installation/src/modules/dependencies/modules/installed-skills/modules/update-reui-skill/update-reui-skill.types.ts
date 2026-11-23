// 🏷️ Types

/** The skill as reui.io serves it. */
export interface SkillBundle {
  /** Every file of the skill. */
  files: SkillFile[];
  /** The version the bundle reports, for the report line. */
  version: string;
}

/** One file of the skill, in the shape the skills CLI hashes. */
export interface SkillFile {
  /** The file's bytes. */
  content: Buffer;
  /** The path inside the skill folder, with forward slashes. */
  path: string;
}

/** The lockfile and the skill's entry in it, for re-pinning in place. */
export interface SkillLock {
  /** The skill's entry, which is the object inside `skills`. */
  entry: Record<string, unknown>;
  /** The whole lockfile. */
  lock: Record<string, unknown>;
  /** Every skill's entry. */
  skills: Record<string, unknown>;
}
