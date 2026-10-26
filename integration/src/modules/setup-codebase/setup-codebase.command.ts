import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { BoundBaseToPushService } from "../bound-base-to-push/bound-base-to-push.service";
import { ImportPrTaskCacheService } from "../import-pr-task-cache/import-pr-task-cache.service";
import { TaskDatabaseService } from "../task-database/task-database.service";

import {
  ENABLED_VALUE,
  MERGE_GROUP_EVENT,
  PUSH_BEFORE_SOURCE,
  PUSH_EVENT,
} from "./setup-codebase.constants";

import type { Environment } from "../../integration.types";

/**
 * CLI command that readies a CI job's Nx state after `pnpm install`, in the
 * order the steps depend on each other: bound a push's base to the push's own
 * previous tip, import the pull request's cache into a merge group, discard
 * any restored task database a cancelled save left damaged, and adopt the
 * restored one as this machine's.
 *
 * Each step is a command of its own too, and this runs the same services, so
 * what a step decides is explained where its command is. Reads `NX_CACHE`,
 * `NX_SHAS`, `NX_BASE_SOURCE`, and `GITHUB_EVENT_NAME` to skip the steps the
 * job did not ask for, plus whatever the steps it runs read. Exits 1 only when
 * a push's base cannot be bounded; a cache that cannot be imported or adopted
 * leaves a cold run.
 *
 * It runs the services itself rather than through a service of its own: one
 * more layer would put the import's call stack over the depth limit.
 */
@Command({
  description:
    "Ready a CI job's Nx base and task cache once its dependencies are installed",
  name: "setup-codebase",
})
@Injectable()
export class SetupCodebaseCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly boundBaseToPushService: BoundBaseToPushService,
    private readonly importPrTaskCacheService: ImportPrTaskCacheService,
    private readonly taskDatabaseService: TaskDatabaseService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SetupCodebaseCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Moves a push's base to the push's previous tip, when this job asked for
   * that, and prints what it decided.
   *
   * @returns Whether the run may go on: false when the base could not be bounded.
   */
  private boundBase(): boolean {
    if (
      this.configService.get("NX_SHAS", { infer: true }) !== ENABLED_VALUE ||
      this.configService.get("NX_BASE_SOURCE", { infer: true }) !==
        PUSH_BEFORE_SOURCE ||
      this.configService.get("GITHUB_EVENT_NAME", { infer: true }) !==
        PUSH_EVENT
    ) {
      return true;
    }

    const bounded = this.boundBaseToPushService.bound();

    for (const line of bounded.lines) {
      if (line.startsWith("❌")) {
        console.error(line);
      } else {
        console.info(line);
      }
    }
    process.exitCode =
      bounded.exitCode === 0 ? process.exitCode : bounded.exitCode;

    return bounded.exitCode === 0;
  }

  // 🌎 Public Methods

  /** Runs the steps this job asked for, prints what they decided, and sets the exit code. */
  public async run(): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    if (
      !this.boundBase() ||
      this.configService.get("NX_CACHE", { infer: true }) !== ENABLED_VALUE
    ) {
      return;
    }

    const reports = [
      ...(this.configService.get("GITHUB_EVENT_NAME", { infer: true }) ===
      MERGE_GROUP_EVENT
        ? [this.importPrTaskCacheService.import()]
        : []),
      this.taskDatabaseService.verify(),
      this.taskDatabaseService.adopt(),
    ];

    for (const report of reports) {
      for (const line of report.lines) {
        console.info(line);
      }
    }
  }
}
