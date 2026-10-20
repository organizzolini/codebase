import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ReporterService } from "../reporter/reporter.service";

import {
  bundleSchema,
  DEFAULT_BUNDLE_URL,
  LOCKFILE_NAME,
  recordSchema,
  RETRY_HINT,
  SKILL_DIRECTORY,
  SKILL_ENTRY_FILE,
  SKILL_NAME,
} from "./update-reui-skill.constants";

import type {
  SkillBundle,
  SkillFile,
  SkillLock,
} from "./update-reui-skill.types";

/**
 * Refreshes the vendored ReUI skill from the bundle reui.io serves.
 *
 * `skills update` skips a skill locked as `local`, which is how ReUI is locked
 * because it publishes only a JSON bundle. This is that missing step:
 *
 * - Idempotent. The bundle is hashed the way the skills CLI hashes a skill
 *   folder, and nothing is written when that equals both the lockfile pin and
 *   the folder on disk, so local drift is healed too.
 * - Safe to extract. A bundle path that resolves outside the skill folder
 *   aborts before anything is deleted or written.
 * - Non-fatal. Any failure prints the retry command and the run exits 0.
 */
@Injectable()
export class UpdateReuiSkillService {
  // 🏗 Dependency Injection

  constructor(
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdateReuiSkillService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Fetches the bundle and refuses one that is empty, unsafe, or without `SKILL.md`. */
  private async fetchBundle(skillDirectory: string): Promise<SkillBundle> {
    const response = await fetch(
      process.env["REUI_SKILL_URL"] || DEFAULT_BUNDLE_URL,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const parsed = bundleSchema.safeParse(await response.json());

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "the bundle is malformed",
      );
    }

    const bundle = parsed.data;
    const files = bundle.files.map((file) => ({
      content: Buffer.from(file.content),
      path: file.path,
    }));
    const escaping = files.find(
      (file) =>
        !path
          .resolve(skillDirectory, file.path)
          .startsWith(skillDirectory + path.sep),
    );

    if (escaping) {
      throw new Error(`"${escaping.path}" resolves outside ${skillDirectory}`);
    }
    if (!files.some((file) => file.path === SKILL_ENTRY_FILE)) {
      throw new Error(`the bundle has no ${SKILL_ENTRY_FILE}`);
    }

    return { files, version: bundle.version };
  }

  /** The skills CLI's folder hash: sorted relative paths, each followed by its bytes. */
  private hashFiles(files: SkillFile[]): string {
    const hash = crypto.createHash("sha256");

    for (const file of files.toSorted((a, b) => a.path.localeCompare(b.path))) {
      hash.update(file.path);
      hash.update(file.content);
    }

    return Array.from(hash.digest(), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }

  /** Replaces the skill folder with the bundle's files. */
  private install(skillDirectory: string, files: SkillFile[]): void {
    fs.rmSync(skillDirectory, { force: true, recursive: true });
    for (const file of files) {
      const target = path.resolve(skillDirectory, file.path);

      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.content);
    }
  }

  /** The files now in the skill folder, in the shape the bundle uses. */
  private readInstalledFiles(skillDirectory: string): SkillFile[] {
    if (!fs.existsSync(skillDirectory)) {
      return [];
    }

    return fs
      .readdirSync(skillDirectory, { recursive: true, withFileTypes: true })
      .filter((item) => !item.isDirectory())
      .map((item) => {
        const full = path.join(item.parentPath, item.name);

        return {
          content: fs.readFileSync(full),
          path: path.relative(skillDirectory, full).split(path.sep).join("/"),
        };
      });
  }

  /** Reads the lockfile, keeping the key order of everything it holds. */
  private readLock(lockfile: string): SkillLock {
    const lock = recordSchema.parse(
      JSON.parse(fs.readFileSync(lockfile, "utf8")),
    );
    const skills = recordSchema.parse(lock["skills"]);
    const entry = recordSchema.safeParse(skills[SKILL_NAME]);

    if (!entry.success) {
      throw new Error(`${LOCKFILE_NAME} has no ${SKILL_NAME} entry`);
    }

    return { entry: entry.data, lock, skills };
  }

  /** Fetches, compares, and writes only when the pin or the folder differs. */
  private async refresh(root: string): Promise<void> {
    const skillDirectory = path.resolve(root, SKILL_DIRECTORY);
    const bundle = await this.fetchBundle(skillDirectory);
    const lockfile = path.join(root, LOCKFILE_NAME);
    const { entry, lock, skills } = this.readLock(lockfile);
    const computedHash = this.hashFiles(bundle.files);

    if (
      entry["computedHash"] === computedHash &&
      this.hashFiles(this.readInstalledFiles(skillDirectory)) === computedHash
    ) {
      this.reporter.print(
        `🤹 The reui skill is current (version ${bundle.version})`,
      );

      return;
    }

    this.install(skillDirectory, bundle.files);
    entry["computedHash"] = computedHash;
    skills[SKILL_NAME] = entry;
    lock["skills"] = skills;
    fs.writeFileSync(lockfile, `${JSON.stringify(lock, null, 2)}\n`);
    this.reporter.print(
      `🤹 Updated the reui skill to version ${bundle.version} (${bundle.files.length} files)`,
    );
  }

  // 🌎 Public Methods

  /**
   * Refreshes the skill, printing the retry command instead of failing.
   *
   * Does nothing in a workspace with no `skills-lock.json`.
   */
  public async update(): Promise<void> {
    const root = process.cwd();

    if (!fs.existsSync(path.join(root, LOCKFILE_NAME))) {
      return;
    }

    try {
      await this.refresh(root);
    } catch (error) {
      this.reporter.print(
        `⚠️  The reui skill was not updated: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.reporter.print(RETRY_HINT);
    }
  }
}
