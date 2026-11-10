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
 * Judges many gate tasks from as few command line runs as possible.
 *
 * A run over forty projects took 22 seconds where one took 4, so the command line is asked
 * about a group's projects at once. Each task then gets the verdict of its own project alone.
 */
@Injectable()
export class BatchService {
  // 🏗 Dependency Injection

  constructor(private readonly gateService: GateService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Runs the command line and keeps its output. A process that cannot start settles with
   * the reason, rather than rejecting.
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
   * Gets a failed task's own report by running its project alone, since a batch prints JSON.
   * A passing rerun never clears the failure.
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
   * Puts a task in the group it can be judged with, or settles it outright. Tasks judging
   * other projects run alone.
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
   * Judges one run's tasks from one boundary check. A task fails only when a finding names
   * its own project; unreadable output fails them all.
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
   * Deals a group's projects into the runs that judge them, and builds each run's command line.
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
   * Judges a group's tasks from runs that go at once, each over its own share of projects.
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
   * Judges every task of a batch by its own project, from as few runs as possible.
   * Own-project tasks share runs.
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
