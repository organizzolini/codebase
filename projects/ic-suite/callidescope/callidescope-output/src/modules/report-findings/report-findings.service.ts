import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import type { ReportFindingsArguments } from "./report-findings.types";

/**
 * Weighs every finding a run produces, failing on the ones it gates.
 *
 * Kept apart from `CallidescopeCommand`, as `RunPlanService` is: this service
 * decides on its own what a run does with its findings, through `this.logger`,
 * leaving the command to orchestrate the trace.
 */
@Injectable()
export class ReportFindingsService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Names the stacks that ran deeper than allowed. Reported whether or not the run gates on them;
   * only a depth gate fails.
   */
  private reportDeepStacks(args: ReportFindingsArguments): boolean {
    const { deepStacks } = args.result;

    if (deepStacks.length === 0) {
      return false;
    }

    this.logger.error(`🔭 Found call stacks too deep`, undefined, {
      count: deepStacks.length,
      deepest: Math.max(...deepStacks.map((stack) => stack.depth)),
      entryPoints: deepStacks.map((stack) => stack.frames[0]?.displayName),
    });

    return args.mode.checksDepth;
  }

  /**
   * Fails a run that traced nothing at all, unconditionally, since a gate that never looked must
   * not pass.
   */
  private reportEmptyTrace(args: ReportFindingsArguments): boolean {
    if (args.result.summary.callableCount > 0) {
      return false;
    }

    this.logger.error("🔭 Traced nothing", undefined, {
      projectCount: args.result.summary.projectCount,
    });

    return true;
  }

  /** Names the destinations that no longer hold what a fresh run would write. */
  private reportStaleness(args: ReportFindingsArguments): boolean {
    if (args.stalePaths.length === 0) {
      return false;
    }

    this.logger.error(`🔭 Found stale reports`, undefined, {
      paths: args.stalePaths,
    });

    return true;
  }

  /**
   * Names the callables that call more things directly than allowed. Reported always; only a breadth
   * gate fails on them.
   */
  private reportWideCallables(args: ReportFindingsArguments): boolean {
    const { wideCallables } = args.result;

    if (wideCallables.length === 0) {
      return false;
    }

    this.logger.error(
      `🔭 Found callables calling too much directly`,
      undefined,
      {
        callables: wideCallables.map((finding) => finding.displayName),
        count: wideCallables.length,
        widest: Math.max(...wideCallables.map((finding) => finding.breadth)),
      },
    );

    return args.mode.checksBreadth;
  }

  // 🌎 Public Methods

  /**
   * Weighs every finding a run can produce and fails on any of them, announcing each kind
   * separately so its fix is clear.
   */
  public reportFindings(args: ReportFindingsArguments): void {
    const stale = this.reportStaleness(args);
    const deep = this.reportDeepStacks(args);
    const wide = this.reportWideCallables(args);
    const empty = this.reportEmptyTrace(args);

    if (deep || empty || stale || wide) {
      process.exitCode = 1;
    }
  }
}
