import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/logging";

import { InstalledSkillsProcessService } from "./installed-skills-process.service";
import {
  LOCAL_SKILLS_BINARY,
  RESTORE_ARGUMENTS,
  RETRY_HINT,
  SKILL_FILE,
  SKILLS_DIRECTORY,
  SKILLS_LOCKFILE,
} from "./installed-skills.constants";

import type {
  MissingSkillsResult,
  ProcessResult,
} from "./installed-skills.types";

/**
 * Compares the skills `skills-lock.json` declares against the ones on disk.
 *
 * A skill counts as installed when its `SKILL.md` exists, not merely its
 * folder: an interrupted restore can leave an empty folder behind, and an
 * agent harness registers nothing from it.
 *
 * Restoring leaves tracked files alone. `skills experimental_install`
 * rewrites both the lockfile and every skill folder, and one absent folder
 * refreshes them all; left in place that dirties the tree on every CI job and
 * makes the dependency-upgrade workflow open an empty pull request. Moving the
 * pins forward is `skills update`, never a restore.
 */
@Injectable()
export class InstalledSkillsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processService: InstalledSkillsProcessService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(InstalledSkillsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Runs one `git` query or command, without printing anything. */
  private git(...args: string[]): ProcessResult {
    return this.processService.run({ args, executable: "git" });
  }

  /** Whether `git` reports uncommitted changes under one path. */
  private hasChanges(target: string): boolean {
    return this.git("diff", "--quiet", "--", target).status !== 0;
  }

  /** The skill names the lockfile declares, in its own order. */
  private readLockedSkillNames(lockfilePath: string): string[] {
    const parsed: unknown = JSON.parse(readFileSync(lockfilePath, "utf8"));

    if (typeof parsed !== "object" || parsed === null) {
      throw new TypeError("the lockfile is not a JSON object");
    }

    const { skills = {} } = parsed as { skills?: Record<string, unknown> };

    return Object.keys(skills);
  }

  /**
   * Returns what a restore rewrote to the content this repository pins.
   *
   * The lockfile is reverted only when it started clean, so a pin somebody
   * is moving by hand survives. The skill folders are checked out whole: a
   * folder the repository has not committed yet is untracked, so it survives,
   * and a committed one reappears even when the fetch failed outright.
   */
  private revertTrackedChanges(lockfileWasClean: boolean): void {
    if (lockfileWasClean && this.hasChanges(SKILLS_LOCKFILE)) {
      this.git("checkout", "--", SKILLS_LOCKFILE);
      this.logger.log(
        `🤹 Reverted the hashes rewritten in ${SKILLS_LOCKFILE}`,
        undefined,
        { hint: "'skills update' moves the pins" },
      );
    }

    if (this.hasChanges(SKILLS_DIRECTORY)) {
      this.git("checkout", "--", SKILLS_DIRECTORY);
      this.logger.log("🤹 Returned the skill folders to the committed content");
    }
  }

  /**
   * Runs the restore through the linked skills binary, or through `pnpm exec`
   * when it is not linked yet.
   */
  private runRestore(): ProcessResult {
    const localBinary = path.join(process.cwd(), LOCAL_SKILLS_BINARY);

    return existsSync(localBinary)
      ? this.processService.run({
          args: RESTORE_ARGUMENTS,
          executable: localBinary,
          streamOutput: true,
        })
      : this.processService.run({
          args: ["exec", "skills", ...RESTORE_ARGUMENTS],
          executable: "pnpm",
          streamOutput: true,
        });
  }

  /** Confirms every locked skill is on disk once a restore has run. */
  private verifyRestoration(): void {
    const result = this.findMissingSkills();

    // A lockfile gone after the restore is no more a success than a
    // corrupted one: either way nothing was confirmed.
    if (result.kind !== "read") {
      this.logger.warn(
        `⚠️ Failed re-reading ${SKILLS_LOCKFILE} to confirm the restoration`,
        undefined,
        { hint: RETRY_HINT },
      );
      return;
    }

    if (result.missing.length > 0) {
      this.logger.warn(
        "⚠️ Detected skills still missing after the restoration",
        undefined,
        { hint: RETRY_HINT, skills: [...result.missing] },
      );
      return;
    }

    this.logger.log(`✅ Restored every skill declared in ${SKILLS_LOCKFILE}`);
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
        reason: String(error),
      };
    }
  }

  /**
   * Restores every locked skill from its source, then undoes whatever the
   * restore rewrote in tracked files.
   *
   * Never throws and never fails: skills are agent context, not a build
   * input, so an outage only warns with the command that retries it.
   */
  public restoreSkills(): void {
    const inWorkTree =
      this.git("rev-parse", "--is-inside-work-tree").status === 0;
    const lockfileWasClean = inWorkTree && !this.hasChanges(SKILLS_LOCKFILE);
    const restore = this.runRestore();

    if (!restore.available) {
      this.logger.warn(
        "⚠️ Failed starting the skills CLI, so the locked skills stay missing",
        undefined,
        { hint: RETRY_HINT },
      );
      return;
    }

    if (restore.status !== 0) {
      this.logger.warn("⚠️ Failed completing the skill restoration");
    }

    if (inWorkTree) {
      this.revertTrackedChanges(lockfileWasClean);
    }

    this.verifyRestoration();
  }
}
