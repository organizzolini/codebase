import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { parse } from "yaml";

import {
  AUTHORED_SOURCE,
  FRONT_MATTER_PATTERN,
  MAXIMUM_DESCRIPTION_WORDS,
  SKILL_FILE_NAME,
  SKILLS_DIRECTORY,
  SKILLS_LOCK_PATH,
  SKILLS_LOCK_SCHEMA,
} from "./skill-descriptions.constants";

import type {
  OverlongSkillDescription,
  SkillsLock,
} from "./skill-descriptions.types";

/**
 * Finds every skill this repository authors and says which descriptions run
 * past the word limit.
 *
 * An authored skill is a skills folder the lockfile does not name, or a locked
 * skill whose source is this repository, read at its source path rather than
 * the installed copy.
 */
@Injectable()
export class SkillDescriptionsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reads and validates the skills lockfile. */
  private readSkillsLock(workspaceRoot: string): SkillsLock {
    return SKILLS_LOCK_SCHEMA.parse(
      JSON.parse(
        readFileSync(path.join(workspaceRoot, SKILLS_LOCK_PATH), "utf8"),
      ),
    );
  }

  // 🌎 Public Methods

  /** Counts words the way `wc -w` does: runs of non-whitespace. */
  public countWords(text: string): number {
    return text.split(/\s+/u).filter((word) => word !== "").length;
  }

  /** Every authored skill whose description holds more words than the limit. */
  public findOverlongDescriptions(
    workspaceRoot: string,
    skillPaths: string[],
  ): OverlongSkillDescription[] {
    return skillPaths
      .map((skillPath) => ({
        skillPath,
        words: this.countWords(this.readDescription(workspaceRoot, skillPath)),
      }))
      .filter(({ words }) => words > MAXIMUM_DESCRIPTION_WORDS);
  }

  /** A skill file's description, or an empty string when it declares none. */
  public readDescription(workspaceRoot: string, skillPath: string): string {
    const contents = readFileSync(path.join(workspaceRoot, skillPath), "utf8");
    const frontMatter = FRONT_MATTER_PATTERN.exec(contents)?.[1];

    if (frontMatter === undefined) {
      return "";
    }

    const fields: unknown = parse(frontMatter);

    if (typeof fields !== "object" || fields === null) {
      return "";
    }

    const description: unknown = Reflect.get(fields, "description");

    return typeof description === "string" ? description : "";
  }

  /** Every authored skill file's path, relative to the workspace root, sorted. */
  public resolveAuthoredSkillPaths(workspaceRoot: string): string[] {
    const { skills } = this.readSkillsLock(workspaceRoot);
    const skillPaths: string[] = [];

    for (const entry of readdirSync(
      path.join(workspaceRoot, SKILLS_DIRECTORY),
      {
        withFileTypes: true,
      },
    )) {
      const skillPath = path.join(
        SKILLS_DIRECTORY,
        entry.name,
        SKILL_FILE_NAME,
      );

      if (
        entry.isDirectory() &&
        !(entry.name in skills) &&
        existsSync(path.join(workspaceRoot, skillPath))
      ) {
        skillPaths.push(skillPath);
      }
    }

    for (const { skillPath, source } of Object.values(skills)) {
      if (
        skillPath !== undefined &&
        source.toLowerCase() === AUTHORED_SOURCE &&
        existsSync(path.join(workspaceRoot, skillPath))
      ) {
        skillPaths.push(skillPath);
      }
    }

    return skillPaths.toSorted((left, right) => left.localeCompare(right));
  }
}
