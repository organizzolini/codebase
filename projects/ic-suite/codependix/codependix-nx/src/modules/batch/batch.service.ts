import { spawn } from "node:child_process";
import { once } from "node:events";
import os from "node:os";
import { PassThrough } from "node:stream";
import { text } from "node:stream/consumers";

import { Injectable } from "@nestjs/common";

import { UNCACHEABLE_SELECTION_MESSAGE } from "../gate/gate.constants";
import { GateService } from "../gate/gate.service";

import {
  MAX_PARALLEL_RUNS,
  MAX_PROJECTS_ARGUMENT_BYTES,
} from "./batch.constants";
import {
  describeError,
  readChargedProjects,
  splitProjects,
} from "./batch.utilities";

import type { GateSelection } from "../gate/gate.types";
import type {
  CapturedRun,
  GateBatchTaskResult,
  GateRunGroup,
  JudgedTask,
  RunGateBatchArguments,
  RunGateBatchTask,
} from "./batch.types";

/**
 * Judges many gate tasks from as few command line runs as it can.
 *
 * One gate per project started the codependix command line once per project,
 * and most of what that costs is the start: a run over forty projects took 22
 * seconds where one took 4. This asks the command line about every project of
 * a group at once, reads from its JSON report which projects each finding is
 * charged to, and gives every task the verdict of its own project alone, so
 * each still passes, fails and is cached by itself.
 *
 * Kept shallow: every method calls the next at most a few layers down, because
 * the long chain that resolves a configuration path lives in the executor, and
 * nothing here may sit on top of it.
 */
@Injectable()
export class BatchService {
  // 🏗 Dependency Injection

  constructor(private readonly gateService: GateService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Starts the command line and keeps what it printed, rather than showing it.
   *
   * Standard output is kept because a `--format json` run prints its verdicts
   * there. Standard error is shown as it arrives when asked to, so a long
   * container boot still reports progress, and is kept either way. Read with
   * the stream consumers rather than event handlers: the process ending and
   * its output being read are waited on together, so a run that ends before
   * its last chunk has been read is not read short, and no callback of this
   * method's own sits on top of the stack. A process that cannot be started
   * settles with the reason rather than rejecting, so one failed run costs the
   * tasks it judged and not the whole batch.
   */
  private async captureCommandLine(args: {
    argv: string[];
    forwardErrors: boolean;
    workspaceRoot: string;
  }): Promise<CapturedRun> {
    const child = spawn(process.execPath, args.argv, {
      cwd: args.workspaceRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const keptError = new PassThrough();

    child.stderr.pipe(keptError);

    if (args.forwardErrors) {
      child.stderr.pipe(process.stderr, { end: false });
    }

    const closing: Promise<unknown[]> = once(child, "close");

    try {
      const [closed, standardOutput, standardError] = await Promise.all([
        closing,
        text(child.stdout),
        text(keptError),
      ]);
      const [exitCode] = closed;

      return {
        exitCode: typeof exitCode === "number" ? exitCode : null,
        standardError,
        standardOutput,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        exitCode: null,
        standardError: "",
        standardOutput: "",
      };
    }
  }

  /**
   * Gets a failed task's own report by running its project alone.
   *
   * A batch knows which project a finding is charged to but prints JSON, so
   * the failing project is run again by itself to get exactly what a single
   * gate prints. A second run that passes does not clear the task: the batch
   * charged the project, and a pass found by looking again must never hide a
   * finding, so the disagreement is stated beside whatever the run printed.
   */
  private async explainFailure(args: {
    judged: JudgedTask;
    workspaceRoot: string;
  }): Promise<GateBatchTaskResult> {
    const alone = await this.captureCommandLine({
      argv: args.judged.singleArguments,
      forwardErrors: false,
      workspaceRoot: args.workspaceRoot,
    });
    const printed = (
      alone.error ?? `${alone.standardOutput}${alone.standardError}`
    ).trim();

    return {
      success: false,
      terminalOutput:
        alone.exitCode === 0 && alone.error === undefined
          ? `${args.judged.task.id}: findings were charged to this project in a batch that a run of its own did not reproduce.\n${printed}`.trim()
          : printed,
    };
  }

  /** A failed result for every task, for a run that gave no verdict at all. */
  private failAll(
    judged: readonly JudgedTask[],
    terminalOutput: string,
  ): Record<string, GateBatchTaskResult> {
    return Object.fromEntries(
      judged.map(({ task }) => [task.id, { success: false, terminalOutput }]),
    );
  }

  /**
   * Puts a task in the group it can be judged with, or settles it outright.
   *
   * A task that judges other projects or tags is run on its own, as a single
   * gate would be, unless its target is cached, which a single gate refuses
   * too. One that cannot be run at all fails without a throw, so neither costs
   * the rest of the batch. A task judging only its own project joins the group
   * sharing its configuration and dependencies setting and is left for
   * `runGroup`, which is signalled by returning nothing.
   */
  private async groupOrSettle(args: {
    groups: Map<string, GateRunGroup>;
    task: RunGateBatchTask;
    workspaceRoot: string;
  }): Promise<GateBatchTaskResult | undefined> {
    const { task } = args;

    try {
      const selection = this.gateService.resolveSelection({
        options: task.options,
        projectName: task.project,
      });

      if (
        !this.gateService.judgesOwnProject({
          projectName: task.project,
          selection,
        })
      ) {
        return task.cached
          ? { success: false, terminalOutput: UNCACHEABLE_SELECTION_MESSAGE }
          : await this.runAlone({
              selection,
              task,
              workspaceRoot: args.workspaceRoot,
            });
      }

      const dependencies = task.options.dependencies !== false;
      const key = `${task.configurationPath}\u0000${String(dependencies)}`;
      const group = args.groups.get(key) ?? {
        configuration: task.configurationPath,
        dependencies,
        tasks: [],
      };

      group.tasks.push(task);
      args.groups.set(key, group);

      return undefined;
    } catch (error) {
      return {
        success: false,
        terminalOutput: describeError(error),
      };
    }
  }

  /**
   * Judges one run's worth of tasks from a single boundary check.
   *
   * The check is asked about every project at once and prints JSON naming the
   * projects each finding is charged to. A task fails when a finding names its
   * own project, and only then: a finding charged to another project of the
   * batch is that project's, and one in a dependency is a note.
   *
   * A run is never read as a pass it did not earn. Output that is not the
   * report, or a failing exit with no finding charged to any task judged,
   * fails every task, since nothing says which of them the run was about.
   */
  private async judgeRun(args: {
    argv: string[];
    judged: readonly JudgedTask[];
    workspaceRoot: string;
  }): Promise<Record<string, GateBatchTaskResult>> {
    const captured = await this.captureCommandLine({
      argv: [...args.argv, "--format", "json"],
      forwardErrors: true,
      workspaceRoot: args.workspaceRoot,
    });

    if (captured.error !== undefined) {
      return this.failAll(args.judged, captured.error);
    }

    const charged = readChargedProjects(captured.standardOutput);

    if (charged === undefined) {
      return this.failAll(
        args.judged,
        `The codependix command line did not print a boundary report.\n${captured.standardOutput}${captured.standardError}`.trim(),
      );
    }

    if (
      captured.exitCode !== 0 &&
      !args.judged.some(({ task }) => charged.has(task.project))
    ) {
      return this.failAll(
        args.judged,
        `The codependix command line exited ${String(captured.exitCode)} but charged no finding to a project judged here.\n${captured.standardError}`.trim(),
      );
    }

    const results: Record<string, GateBatchTaskResult> = {};

    for (const judged of args.judged) {
      results[judged.task.id] = charged.has(judged.task.project)
        ? await this.explainFailure({
            judged,
            workspaceRoot: args.workspaceRoot,
          })
        : { success: true, terminalOutput: "" };
    }

    return results;
  }

  /**
   * Deals a group's projects into the runs that will judge them, and builds
   * each run's command line and the one that explains each of its projects.
   *
   * Plain loops rather than callbacks: each command line is built a few calls
   * below here, and a callback in between would put that over the depth limit.
   */
  private planShares(args: {
    concurrency: number;
    group: GateRunGroup;
    workspaceRoot: string;
  }): { argv: string[]; judged: JudgedTask[] }[] {
    const { group, workspaceRoot } = args;
    const shares: { argv: string[]; judged: JudgedTask[] }[] = [];

    for (const projects of splitProjects(
      group.tasks.map((task) => task.project),
      MAX_PROJECTS_ARGUMENT_BYTES,
      args.concurrency,
    )) {
      const judged: JudgedTask[] = [];

      for (const task of group.tasks) {
        if (projects.includes(task.project)) {
          judged.push({
            singleArguments: this.gateService.buildBatchArguments({
              configurationPath: group.configuration,
              dependencies: group.dependencies,
              projects: [task.project],
              tags: [],
              workspaceRoot,
            }),
            task,
          });
        }
      }

      shares.push({
        argv: this.gateService.buildBatchArguments({
          configurationPath: group.configuration,
          dependencies: group.dependencies,
          projects,
          tags: [],
          workspaceRoot,
        }),
        judged,
      });
    }

    return shares;
  }

  /** Runs one task's gate by itself, keeping what it printed for the task. */
  private async runAlone(args: {
    selection: GateSelection;
    task: RunGateBatchTask;
    workspaceRoot: string;
  }): Promise<GateBatchTaskResult> {
    const alone = await this.captureCommandLine({
      argv: this.gateService.buildBatchArguments({
        configurationPath: args.task.configurationPath,
        dependencies: args.task.options.dependencies !== false,
        projects: args.selection.projects,
        tags: args.selection.tags,
        workspaceRoot: args.workspaceRoot,
      }),
      forwardErrors: false,
      workspaceRoot: args.workspaceRoot,
    });

    return {
      success: alone.exitCode === 0 && alone.error === undefined,
      terminalOutput: (
        alone.error ?? `${alone.standardOutput}${alone.standardError}`
      ).trim(),
    };
  }

  /**
   * Judges a group's tasks from runs that go at once, each over its own share.
   *
   * The projects are dealt across `concurrency` runs, more when an argument
   * would pass `MAX_PROJECTS_ARGUMENT_BYTES`. Every run is started before any
   * is waited on, so the group takes as long as its slowest share rather than
   * the sum of them — the parallelism separate tasks had, kept.
   */
  private async runGroup(args: {
    concurrency: number;
    group: GateRunGroup;
    workspaceRoot: string;
  }): Promise<Record<string, GateBatchTaskResult>> {
    const pending: Promise<Record<string, GateBatchTaskResult>>[] = [];
    const results: Record<string, GateBatchTaskResult> = {};

    for (const share of this.planShares(args)) {
      pending.push(
        this.judgeRun({ ...share, workspaceRoot: args.workspaceRoot }),
      );
    }

    for (const verdicts of await Promise.all(pending)) {
      Object.assign(results, verdicts);
    }

    return results;
  }

  // 🌎 Public Methods

  /**
   * Judges every task of a batch, each by its own project, from as few
   * command line runs as it can.
   *
   * Tasks that judge only their own project, with the same configuration and
   * the same dependencies setting, are run together. A task that judges other
   * projects or tags is run on its own, as a single gate would, and a task
   * that cannot be run at all fails alone.
   */
  public async runBatch(
    args: RunGateBatchArguments,
  ): Promise<Record<string, GateBatchTaskResult>> {
    const results: Record<string, GateBatchTaskResult> = {};
    const groups = new Map<string, GateRunGroup>();
    const concurrency =
      args.concurrency ??
      Math.min(MAX_PARALLEL_RUNS, os.availableParallelism());

    for (const task of args.tasks) {
      const settled = await this.groupOrSettle({
        groups,
        task,
        workspaceRoot: args.workspaceRoot,
      });

      if (settled !== undefined) {
        results[task.id] = settled;
      }
    }

    for (const group of groups.values()) {
      Object.assign(
        results,
        await this.runGroup({
          concurrency,
          group,
          workspaceRoot: args.workspaceRoot,
        }),
      );
    }

    return results;
  }
}
