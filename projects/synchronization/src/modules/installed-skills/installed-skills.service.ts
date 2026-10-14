import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  SKILL_FILE,
  SKILLS_DIRECTORY,
  SKILLS_LOCKFILE,
} from "./installed-skills.constants";

import type { MissingSkillsResult } from "./installed-skills.types";

/**
 * Compares the skills `skills-lock.json` declares against the ones on disk.
 *
 * A skill counts as installed when its `SKILL.md` exists, not merely its
 * folder: an interrupted restore can leave an empty folder behind, and an
 * agent harness registers nothing from it.
 */
@Injectable()
export class InstalledSkillsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The skill names the lockfile declares, in its own order. */
  private readLockedSkillNames(lockfilePath: string): string[] {
    const parsed: unknown = JSON.parse(readFileSync(lockfilePath, "utf8"));

    if (typeof parsed !== "object" || parsed === null) {
      throw new TypeError("the lockfile is not a JSON object");
    }

    const { skills = {} } = parsed as { skills?: Record<string, unknown> };

    return Object.keys(skills);
  }

  // 🌎 Public Methods

  /**
   * Lists the locked skills whose `SKILL.md` is absent, in the workspace the
   * process runs in.
   *
   * @returns The missing names, or why the lockfile could not be listed.
   */
  public findMissingSkills(): MissingSkillsResult {
    const workspaceRoot = process.cwd();
    const lockfilePath = path.join(workspaceRoot, SKILLS_LOCKFILE);

    if (!existsSync(lockfilePath)) {
      return { kind: "no-lockfile" };
    }

    try {
      const missing = this.readLockedSkillNames(lockfilePath).filter(
        (name) =>
          !existsSync(
            path.join(workspaceRoot, SKILLS_DIRECTORY, name, SKILL_FILE),
          ),
      );

      return { kind: "read", missing };
    } catch (error) {
      return {
        kind: "unreadable",
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
