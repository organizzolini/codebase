import type { SKILLS_LOCK_SCHEMA } from "./skill-descriptions.constants";
import type { z } from "zod";

// 🏷️ Types

/** One authored skill whose description runs past the word limit. */
export interface OverlongSkillDescription {
  /** The skill file's path, relative to the workspace root. */
  readonly skillPath: string;
  /** How many words its description holds. */
  readonly words: number;
}

/** The parts of `skills-lock.json` this check reads. */
export type SkillsLock = z.infer<typeof SKILLS_LOCK_SCHEMA>;
