import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { UpgradeNodeService } from "../upgrade-node/upgrade-node.service";
import { UpgradePnpmService } from "../upgrade-pnpm/upgrade-pnpm.service";
import { UpgradePythonService } from "../upgrade-python/upgrade-python.service";

import {
  EMPTY_TREE,
  PULL_REQUEST_BODY_FILE,
  RUNS_URL,
  TAIL_CHARACTERS,
  TAIL_LINES,
  unrestoredMessage,
  WORKFLOW_URL,
} from "./upgrade-dependencies.constants";
import {
  renderPullRequestBody,
  warningsOf,
} from "./upgrade-dependencies.utilities";

import type { Environment } from "../../integration.types";
import type {
  CapturedProcess,
  Command,
} from "../process-runner/process-runner.types";
import type {
  StepReport,
  UpgradeOutcome,
  UpgradeStep,
  UpgradeTask,
  UpgradeTaskRunner,
  UpgradeWork,
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
    upgradeNode: UpgradeNodeService,
    upgradePnpm: UpgradePnpmService,
    upgradePython: UpgradePythonService,
  ) {
    this.tasks = {
      node: upgradeNode,
      pnpm: upgradePnpm,
      python: upgradePython,
    };
  }

  // 🔐 Private Fields

  /** What carries out each task a step can name. */
  private readonly tasks: Record<UpgradeTask, UpgradeTaskRunner>;

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
   * recovery commands put the environment right. Returns why that was
   * impossible, or nothing when it was done.
   */
  private undo(
    tree: string,
    recover: readonly Command[] | undefined,
  ): string | undefined {
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

    const recovery = this.processRunner.captureSequence(recover);

    return recovery.status === 0
      ? undefined
      : `recovery exited ${String(recovery.status)}: ${this.tail(recovery)}`;
  }

  /**
   * Carries a step out: its commands run in order until one fails, and its
   * task runs in its service, which throws to say the upgrade failed.
   */
  private async work(step: UpgradeStep): Promise<UpgradeWork> {
    if (!("task" in step)) {
      return this.processRunner.captureSequence(step.commands);
    }

    try {
      const summary = await this.tasks[step.task].upgrade();

      return { status: 0, stderr: "", stdout: `${summary}\n`, summary };
    } catch (error: unknown) {
      return {
        status: 1,
        stderr: error instanceof Error ? error.message : String(error),
        stdout: "",
      };
    }
  }

  // 🌎 Public Methods

  /** Runs one upgrade, undoing it if it fails. */
  public async attempt(step: UpgradeStep): Promise<UpgradeOutcome> {
    const tree = this.snapshot();
    const result = await this.work(step);
    const output = `${result.stdout}${result.stderr}`;

    if (result.status === 0) {
      return {
        kind: "succeeded",
        output,
        report: {
          changes: this.git([
            "--attr-source",
            EMPTY_TREE,
            "diff",
            "--shortstat",
            tree,
            this.snapshot(),
          ]).stdout.trim(),
          label: step.label,
          summary: result.summary,
          warnings: warningsOf(output),
        },
      };
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
      report: {
        changes: "",
        label: step.label,
        skipped: { exitCode: result.status, tail: this.tail(result) },
        warnings: [],
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
  public finish(reports: readonly StepReport[]): boolean {
    const changed = this.git(["status", "--porcelain"]).stdout.trim() !== "";
    const output = this.configService.get("GITHUB_OUTPUT", { infer: true });
    const body = path.join(os.tmpdir(), PULL_REQUEST_BODY_FILE);
    const runId = this.configService.get("GITHUB_RUN_ID", { infer: true });

    if (changed) {
      fs.writeFileSync(
        body,
        renderPullRequestBody(
          reports,
          runId === undefined ? WORKFLOW_URL : `${RUNS_URL}/${runId}`,
        ),
      );
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
