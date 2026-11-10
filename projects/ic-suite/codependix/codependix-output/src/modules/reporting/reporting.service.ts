import {
  BoundaryOutcomeReportService,
  BoundaryReportService,
} from "@codependix/boundaries";
import { InputError } from "@codependix/configuration";
import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import type { MapRunResult } from "../graph-run/graph-run.types";
import type {
  BoundaryCheckOutcome,
  BoundaryVerdict,
  UnmatchedSelection,
} from "@codependix/boundaries";
import type { GraphRunOutcome } from "@codependix/core";

/**
 * Logs what `MapCommand`'s passes found, and decides whether each pass
 * should fail the run.
 *
 * Split out of `MapCommand` purely to keep that file under this
 * repository's per-file line limit: reporting a pass's own findings is a
 * concern of its own, separate from resolving the command line into a mode
 * and orchestrating the passes themselves.
 */
@Injectable()
export class ReportingService {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundaryOutcomeReportService: BoundaryOutcomeReportService,
    private readonly boundaryReportService: BoundaryReportService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ReportingService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Narrows an outcome to the findings that reached one verdict. */
  private filterVerdict(
    outcome: BoundaryCheckOutcome,
    verdict: BoundaryVerdict,
  ): BoundaryCheckOutcome {
    return {
      failures: outcome.failures.filter(
        (failure) => failure.verdict === verdict,
      ),
      violations: outcome.violations.filter(
        (violation) => violation.verdict === verdict,
      ),
    };
  }

  /**
   * Warns about findings charged only to a dependency of the judged projects. They are reported,
   * never failing the run.
   */
  private reportBoundaryNotes(notes: BoundaryCheckOutcome): void {
    if (notes.failures.length === 0 && notes.violations.length === 0) return;

    this.logger.warn(
      "🕸️ Found codependix boundary findings in dependencies, not failing",
      undefined,
      {
        failures: this.boundaryOutcomeReportService.renderFailures(
          notes.failures,
          [],
        ),
        violations: this.boundaryReportService.renderNotes(notes.violations),
      },
    );
  }

  // 🌎 Public Methods

  /**
   * Logs a boundary pass's findings and reports whether the run should fail. Only a finding
   * charged to a judged project fails it.
   */
  reportBoundaries(
    outcome: BoundaryCheckOutcome,
    judgedProjects: readonly string[],
  ): boolean {
    const failing = this.filterVerdict(outcome, "fail");

    if (failing.failures.length > 0) {
      this.logger.error("💥 Failed running codependix", undefined, {
        failures: this.boundaryOutcomeReportService.renderFailures(
          failing.failures,
          judgedProjects,
        ),
      });
    }

    if (failing.violations.length > 0) {
      this.logger.error("🕸️ Found codependix boundary violations", undefined, {
        summary: this.boundaryReportService.renderSummary(failing.violations),
        violations: this.boundaryReportService.renderViolations(
          failing.violations,
        ),
      });
    }

    this.reportBoundaryNotes(this.filterVerdict(outcome, "note"));

    return failing.failures.length === 0 && failing.violations.length === 0;
  }

  /**
   * Warns when no project is selected. `include` defaults to nothing, so the run would write
   * nothing and still exit zero.
   */
  reportEmptySelection(projectCount: number): void {
    if (projectCount > 0) return;

    this.logger.warn("🕸️ Selected no project to export", undefined, {
      hint: "name the projects that participate in the configuration's include list",
    });
  }

  /**
   * Logs why a run ended before it started, and fails it. A rejected command line is reported as
   * such, not as a crash.
   */
  reportFailure(error: unknown): void {
    this.logger.error(
      error instanceof InputError
        ? "🕸️ Rejected the command line"
        : "💥 Failed running codependix",
      undefined,
      { reason: error instanceof Error ? error.message : String(error) },
    );

    process.exitCode = 1;
  }

  /**
   * Logs an outcome's failures and stale exports, and reports whether the run should fail. Both
   * are reported, not short-circuited.
   */
  reportOutcome(outcome: GraphRunOutcome): boolean {
    const staleResults = outcome.results.filter((result) => !result.isCurrent);
    const staleProjects = [
      ...new Set(staleResults.map((result) => result.projectName)),
    ];

    if (outcome.failures.length > 0) {
      this.logger.error("💥 Failed running codependix", undefined, {
        failures: outcome.failures,
      });
    }

    if (staleProjects.length > 0) {
      const staleExports = [
        ...new Map(
          staleResults.flatMap((result) =>
            result.staleExports.map((stale) => [
              `${result.projectName}:${stale.path}:${stale.anchor ?? ""}`,
              {
                ...(stale.anchor !== undefined && { anchor: stale.anchor }),
                difference: stale.difference,
                path: stale.path,
                project: result.projectName,
              },
            ]),
          ),
        ).values(),
      ];

      this.logger.error("🕸️ Found stale codependix exports", undefined, {
        exports: staleExports,
        projects: staleProjects,
      });
    }

    return outcome.failures.length === 0 && staleProjects.length === 0;
  }

  /**
   * Weighs what each pass found, reporting neither over the other. `selectedProjects` are the
   * projects the boundary pass judged.
   */
  reportPassOutcomes(args: {
    boundaryOutcome: BoundaryCheckOutcome | undefined;
    exportRun: MapRunResult | undefined;
    selectedProjects: readonly { readonly name: string }[];
  }): boolean {
    const exportsPassed =
      args.exportRun === undefined ||
      this.reportOutcome(args.exportRun.outcome);
    const boundariesPassed =
      args.boundaryOutcome === undefined ||
      this.reportBoundaries(
        args.boundaryOutcome,
        args.selectedProjects.map((project) => project.name),
      );

    return exportsPassed && boundariesPassed;
  }

  /** Logs what each pass that ran verified, and nothing for one that did not. */
  reportSuccess(args: {
    boundaryOutcome: BoundaryCheckOutcome | undefined;
    exportOutcome: GraphRunOutcome | undefined;
  }): void {
    if (args.exportOutcome !== undefined) {
      this.logger.info(
        "🕸️ Verified every configured codependix export is current",
        undefined,
        { projects: args.exportOutcome.results.length },
      );
    }

    if (args.boundaryOutcome !== undefined) {
      this.logger.info("🕸️ Verified every declared codependix boundary holds");
    }
  }

  /**
   * Warns about `--projects` patterns and `--tags` tags that matched no project. The run still
   * judges what did match, so this never fails.
   */
  reportUnmatchedSelection(unmatched: UnmatchedSelection): void {
    if (unmatched.projects.length + unmatched.tags.length === 0) return;

    this.logger.warn(
      "🕸️ Ignored selection entries that matched no project",
      undefined,
      {
        hint: "check the spelling — the run judged only the entries that matched",
        ...(unmatched.projects.length > 0 && { projects: unmatched.projects }),
        ...(unmatched.tags.length > 0 && { tags: unmatched.tags }),
      },
    );
  }
}
