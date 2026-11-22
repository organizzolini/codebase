import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import {
  appendFileSync,
  lstatSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { setTimeout } from "node:timers/promises";

import { Injectable } from "@nestjs/common";

import {
  OPENWIKI_ARGUMENTS,
  OPENWIKI_ATTEMPTS,
  OPENWIKI_COMMITTED_PATHS,
  OPENWIKI_EXECUTABLE,
  OPENWIKI_LEFTOVER_FILE,
  OPENWIKI_LINK,
  OPENWIKI_STORAGE,
  STEP_OUTPUT_VARIABLE,
  STEP_SUMMARY_VARIABLE,
} from "./refresh-documentation.constants";
import {
  classifyChanges,
  parseChangedPaths,
  renderSummary,
  retryDelay,
  scanOutput,
} from "./refresh-documentation.utilities";

import type {
  OpenWikiAttempt,
  WikiChange,
} from "./refresh-documentation.types";

/**
 * Regenerates the OpenWiki pages under `documentation/openwiki`.
 *
 * Runs from the workspace root, since OpenWiki writes to `openwiki` beneath the
 * working directory. It refuses a symlink there, so the root symlink gives way
 * to its target for the run.
 */
@Injectable()
export class RefreshDocumentationService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Appends to the file a GitHub Actions variable names, when it names one. */
  private appendToStepFile(variable: string, text: string): void {
    const file = process.env[variable] ?? "";

    if (file === "") {
      return;
    }

    try {
      appendFileSync(file, text, "utf8");
    } catch (error: unknown) {
      process.stderr.write(
        `⚠️ Unable to write to ${variable}: ${String(error)}\n`,
      );
    }
  }

  /** Whether the run changed the wiki's pages, only its bookkeeping, or nothing. */
  private classifyWikiChanges(): WikiChange {
    const status = spawnSync(
      "git",
      [
        "status",
        "--porcelain",
        "--untracked-files=all",
        "--",
        ...OPENWIKI_COMMITTED_PATHS,
      ],
      { encoding: "utf8" },
    );

    // A status that cannot be read is treated as a change, so a pull request opens.
    return status.status === 0
      ? classifyChanges(parseChangedPaths(status.stdout))
      : "content";
  }

  /**
   * Replaces the root `openwiki` symlink with the directory it points at.
   *
   * @returns Whether a symlink was replaced, and so must be put back.
   */
  private exposeWiki(): boolean {
    if (
      !lstatSync(OPENWIKI_LINK, { throwIfNoEntry: false })?.isSymbolicLink()
    ) {
      return false;
    }

    unlinkSync(OPENWIKI_LINK);
    renameSync(OPENWIKI_STORAGE, OPENWIKI_LINK);
    return true;
  }

  /** Writes the job summary and, after a successful run, the `wiki-changed` output. */
  private report(attempts: readonly OpenWikiAttempt[]): void {
    const change = attempts.some(({ succeeded }) => succeeded)
      ? this.classifyWikiChanges()
      : undefined;

    this.appendToStepFile(
      STEP_SUMMARY_VARIABLE,
      renderSummary(attempts, change),
    );

    if (change !== undefined) {
      this.appendToStepFile(
        STEP_OUTPUT_VARIABLE,
        `wiki-changed=${String(change === "content")}\n`,
      );
    }
  }

  /** Moves the pages back to where they are committed and restores the symlink. */
  private restoreWiki(): void {
    renameSync(OPENWIKI_LINK, OPENWIKI_STORAGE);
    symlinkSync(OPENWIKI_STORAGE, OPENWIKI_LINK);
  }

  /** Runs OpenWiki once, relaying its output as it prints and reading it afterward. */
  private async run(): Promise<OpenWikiAttempt> {
    const child = spawn(OPENWIKI_EXECUTABLE, [...OPENWIKI_ARGUMENTS], {
      cwd: process.cwd(),
      stdio: ["inherit", "pipe", "pipe"],
    });
    let printed = "";
    const relay =
      (destination: NodeJS.WriteStream) =>
      (chunk: Buffer): void => {
        destination.write(chunk);
        printed += chunk.toString();
      };

    child.stdout.on("data", relay(process.stdout));
    child.stderr.on("data", relay(process.stderr));

    try {
      await once(child, "close");
    } catch (error: unknown) {
      process.stderr.write(`${String(error)}\n`);

      return { pages: 0, rateLimitResetAt: undefined, succeeded: false };
    }

    return { ...scanOutput(printed), succeeded: child.exitCode === 0 };
  }

  /** Runs OpenWiki until it succeeds or the attempts run out, recording each. */
  private async runWithRetries(attempts: OpenWikiAttempt[]): Promise<boolean> {
    for (let attempt = 1; ; attempt++) {
      const result = await this.run();

      attempts.push(result);

      if (result.succeeded) {
        return true;
      }

      const delay = retryDelay(attempt, result.rateLimitResetAt, Date.now());

      if (attempt === OPENWIKI_ATTEMPTS || delay === undefined) {
        return false;
      }

      await setTimeout(delay);
    }
  }

  // 🌎 Public Methods

  /**
   * Runs OpenWiki, retrying past a reported rate limit, then restores the
   * `openwiki` symlink and deletes the leftover instruction file.
   */
  public async refresh(): Promise<boolean> {
    const exposed = this.exposeWiki();
    const attempts: OpenWikiAttempt[] = [];

    try {
      return await this.runWithRetries(attempts);
    } finally {
      if (exposed) {
        this.restoreWiki();
      }

      rmSync(OPENWIKI_LEFTOVER_FILE, { force: true });
      this.report(attempts);
    }
  }
}
