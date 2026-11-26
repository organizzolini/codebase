import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { parse } from "yaml";

import {
  AUTHORED_LOCAL_PREFIX,
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

  /** Skill files in folders the lockfile does not name: written here. */
  private findLocalSkillPaths(
    workspaceRoot: string,
    skills: SkillsLock["skills"],
  ): string[] {
    return readdirSync(path.join(workspaceRoot, SKILLS_DIRECTORY), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory() && !(entry.name in skills))
      .map((entry) => path.join(SKILLS_DIRECTORY, entry.name, SKILL_FILE_NAME))
      .filter((skillPath) => existsSync(path.join(workspaceRoot, skillPath)));
  }

  /** Source files of locked skills this repository publishes, by repository or local path. */
  private findPublishedSkillPaths(
    workspaceRoot: string,
    skills: SkillsLock["skills"],
  ): string[] {
    return Object.values(skills)
      .map(({ skillPath, source }) => {
        if (source.toLowerCase() === AUTHORED_SOURCE) {
          return skillPath;
        }

        return source.startsWith(AUTHORED_LOCAL_PREFIX)
          ? path.posix.join(source.slice(2), SKILL_FILE_NAME)
          : undefined;
      })
      .filter(
        (skillPath): skillPath is string =>
          skillPath !== undefined &&
          existsSync(path.join(workspaceRoot, skillPath)),
      );
  }

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

  /** How many characters the skills' descriptions hold together. */
  public measureTotalCharacters(
    workspaceRoot: string,
    skillPaths: string[],
  ): number {
    return skillPaths.reduce(
      (total, skillPath) =>
        total + this.readDescription(workspaceRoot, skillPath).length,
      0,
    );
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

    return [
      ...this.findLocalSkillPaths(workspaceRoot, skills),
      ...this.findPublishedSkillPaths(workspaceRoot, skills),
    ].toSorted((left, right) => left.localeCompare(right));
  }
}
