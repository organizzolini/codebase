import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  PULL_REQUEST_BODY_FILE,
  SCRIPT_OPTIONS,
  TAIL_CHARACTERS,
  TAIL_LINES,
  unrestoredMessage,
  WORKFLOW_URL,
} from "./upgrade-dependencies.constants";
import { renderPullRequestBody } from "./upgrade-dependencies.utilities";

import type { Environment } from "../../integration.types";
import type { CapturedProcess } from "../process-runner/process-runner.types";
import type {
  SkippedStep,
  UpgradeOutcome,
  UpgradeStep,
} from "./upgrade-dependencies.types";

/**
 * Runs the weekly dependency upgrades, one step at a time, so that none of
 * them can fail the job or leave a half-applied change behind.
 *
 * Before each step it records the whole working tree as a git tree, files not
 * yet tracked included. A step that fails is undone by restoring that tree,
 * which is the state the previous step left, never the committed one, so a
 * later failure cannot undo an earlier success. Ignored files, such as
 * `node_modules`, are left alone.
 */
@Injectable()
export class UpgradeDependenciesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Runs one git command in the working directory. */
  private git(args: readonly string[]): CapturedProcess {
    return this.processRunner.capture("git", args);
  }

  /** Records the working tree, untracked files included, as a git tree. */
  private snapshot(): string {
    const added = this.git(["add", "-A"]);
    const written = this.git(["write-tree"]);

    if (added.status !== 0 || written.status !== 0) {
      throw new Error(
        `Could not record the working tree: ${added.stderr}${written.stderr}`.trim(),
      );
    }

    return written.stdout.trim();
  }

  /** The end of what a failed step printed, which names why it failed. */
  private tail(result: CapturedProcess): string {
    const text = result.stderr.trim() === "" ? result.stdout : result.stderr;

    return text
      .trim()
      .split("\n")
      .slice(-TAIL_LINES)
      .join("\n")
      .slice(-TAIL_CHARACTERS);
  }

  /**
   * Undoes a failed step: the working tree goes back to the snapshot, then its
   * recovery script puts the environment right. Returns why that was
   * impossible, or nothing when it was done.
   */
  private undo(tree: string, recover: string | undefined): string | undefined {
    for (const args of [
      ["read-tree", "--reset", "-u", tree],
      ["clean", "-fdq"],
    ]) {
      const result = this.processRunner.capture("git", args);

      if (result.status !== 0) {
        return `git ${args.join(" ")} exited ${String(result.status)}: ${result.stderr.trim()}`;
      }
    }

    if (recover === undefined) {
      return undefined;
    }

    const recovery = this.processRunner.capture("bash", [
      ...SCRIPT_OPTIONS,
      recover,
    ]);

    return recovery.status === 0
      ? undefined
      : `recovery exited ${String(recovery.status)}: ${this.tail(recovery)}`;
  }

  // 🌎 Public Methods

  /** Runs one upgrade, undoing it if it fails. */
  public attempt(step: UpgradeStep): UpgradeOutcome {
    const tree = this.snapshot();
    const result = this.processRunner.capture("bash", [
      ...SCRIPT_OPTIONS,
      step.script,
    ]);
    const output = `${result.stdout}${result.stderr}`;

    if (result.status === 0) {
      return { kind: "succeeded", output };
    }

    const problem = this.undo(tree, step.recover);

    if (problem !== undefined) {
      return {
        kind: "unrestored",
        message: unrestoredMessage(step.label, problem),
        output,
      };
    }

    return {
      kind: "skipped",
      output,
      skipped: {
        exitCode: result.status,
        label: step.label,
        tail: this.tail(result),
      },
    };
  }

  /**
   * Ends the run: when the upgrades changed anything, writes the pull request
   * that reports them, and tells the workflow whether there is one to open and
   * where its body is.
   *
   * @returns Whether anything changed, untracked files included.
   */
  public finish(skipped: readonly SkippedStep[]): boolean {
    const changed = this.git(["status", "--porcelain"]).stdout.trim() !== "";
    const output = this.configService.get("GITHUB_OUTPUT", { infer: true });
    const body = path.join(os.tmpdir(), PULL_REQUEST_BODY_FILE);

    if (changed) {
      fs.writeFileSync(body, renderPullRequestBody(skipped, WORKFLOW_URL));
    }

    if (output !== undefined && output !== "") {
      fs.appendFileSync(
        output,
        `has_dependency_updates=${String(changed)}\nbody_path=${body}\n`,
      );
    }

    return changed;
  }
}
