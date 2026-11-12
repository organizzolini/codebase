import { ProjectReportsService } from "@callidescope/output";
import { Injectable } from "@nestjs/common";

import {
  EMPTY_TRACE_REPORT,
  reportUnreadProjects,
} from "../plugin/plugin.constants";

import type { RunVerdict } from "../plugin/plugin.types";
import type { ProjectLimitsLookup } from "@callidescope/configuration";
import type { CallGraphResult } from "@callidescope/core";

/**
 * Decides whether a traced result passes, for every target that reads one.
 *
 * One trace serves a batch: this judges each project from the same result. A verdict takes the result and the projects to judge, not a trace to run.
 */
@Injectable()
export class VerdictService {
  // 🏗 Dependency Injection

  constructor(private readonly projectReportsService: ProjectReportsService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * The block a verdict owes the reader when its findings cannot explain it. Unread projects come
   * first, since they name what went missing.
   */
  public explain(verdict: RunVerdict): string | undefined {
    if (verdict.unreadProjectNames.length > 0) {
      return reportUnreadProjects(verdict.unreadProjectNames);
    }

    return verdict.reason;
  }

  /**
   * Decides whether a traced result passes, judging only in-scope projects. Unread judged projects
   * are named back to the caller.
   */
  public judge(args: {
    judgedProjectNames: readonly string[];
    projectLimits: ProjectLimitsLookup;
    result: CallGraphResult;
  }): RunVerdict {
    const findings = this.projectReportsService.findOwnedFindings({
      limits: args.projectLimits,
      projectNames: args.judgedProjectNames,
      reports: args.result.projects,
    });
    const unreadProjectNames = this.projectReportsService.findUnreadProjects({
      projectNames: args.judgedProjectNames,
      reports: args.result.projects,
    });

    if (args.result.summary.callableCount === 0) {
      return {
        findings,
        ok: false,
        reason: EMPTY_TRACE_REPORT,
        unreadProjectNames,
      };
    }

    return {
      findings,
      ok:
        findings.deepStacks.length === 0 && findings.wideCallables.length === 0,
      reason: undefined,
      unreadProjectNames,
    };
  }
}
