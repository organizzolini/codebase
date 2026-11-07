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
 * Its own service so one trace can be judged once per project: a batch of
 * gates traces the workspace a single time and asks this the same question of
 * each project, which is why a verdict takes the result and the projects to
 * judge rather than a trace to run.
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
   * The block a verdict owes the reader when its findings cannot explain it.
   *
   * Both targets print this and only one fails on it — see `judge` — because
   * an unread project is a fact about the run either way. The unread projects
   * come first when both apply: they name what went missing, where the
   * whole-run reason can only say that something did.
   */
  public explain(verdict: RunVerdict): string | undefined {
    if (verdict.unreadProjectNames.length > 0) {
      return reportUnreadProjects(verdict.unreadProjectNames);
    }

    return verdict.reason;
  }

  /**
   * Decides whether a traced result passes, for every target that reads one.
   *
   * One predicate rather than the same expression beside each caller, so a
   * rule added here cannot reach one verdict and miss the other.
   *
   * **Only the projects the run was scoped to are judged.** A trace reaches
   * into the dependencies of what it was pointed at, so judging the whole
   * run's findings would fail `alpha`'s task for a breach in `beta`. The same
   * line the publishing side already draws, one step further along:
   * measurement reaches into dependencies, publishing does not, and judging
   * does not either. A dependency's breach is its own gate's business, and
   * `nx affected` selects it too when it changes, so nothing escapes a verdict.
   *
   * **A judged project none of whose own files were read is named back**, the
   * case `callidescope`'s own `reportEmptyTrace` fails for the same reason: a
   * gate that passes because it never looked reports the project as clean.
   * Asked of each judged project rather than of the whole run, because
   * narrowing made those two different questions — a project with dependencies
   * has a non-empty run whatever became of its own sources, so its own
   * `exclude` over-matching would otherwise leave it owning no finding and
   * passing green. The whole run is asked too, for a run judging no project at
   * all.
   *
   * It is the one rule whose **consequence** is the caller's rather than this
   * predicate's, and so the one thing `unreadProjectNames` is returned beside
   * `ok` for: a `gate` fails on it and a `trace` prints it and passes. Every
   * project the workspace configuration excludes reads nothing of its own and
   * is denied a gate while keeping its trace, so failing the trace too would
   * make that project's target permanently red for being configured exactly as
   * it was asked to be. Finding the projects stays here either way, so the
   * rule cannot be applied to one verdict and forgotten by the other.
   *
   * **Depth is judged always, breadth wherever a limit exists** — not two
   * modes to be selected between. `maximumDepth` has a default and
   * `maximumBreadth` has none at any level, so a project declaring no breadth
   * limit can produce no breadth finding to fail on. Reading the findings
   * rather than naming a check is what keeps that true without a decision.
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
