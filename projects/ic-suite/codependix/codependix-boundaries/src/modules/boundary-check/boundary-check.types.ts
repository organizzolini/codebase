// 🏷️ Types

import type {
  BoundaryViolation,
  CodependixBoundaryLevel,
} from "../boundaries/boundaries.types";
import type {
  CodependixBoundaryRule,
  CodependixGraphType,
  ResolvedCodependixConfiguration,
} from "@codependix/configuration";
import type { NxProject, NxProjectGraph } from "@codependix/nx-projects";

/**
 * Everything a boundary check reads about the workspace it judges. Narrower than `GraphRunContext`,
 * which a boundary-only caller need not satisfy.
 */
export interface BoundaryCheckContext {
  /**
   * The projects every level's graph is built over: `selectedProjects` and
   * everything they depend on, or `selectedProjects` alone under
   * `--no-dependencies` — see `RunContextService.resolveBuildProjects`.
   */
  readonly buildProjects: NxProject[];
  readonly configuration: ResolvedCodependixConfiguration;
  /**
   * The graph types this run judges, resolved by
   * `RunContextService.resolveEnabledGraphTypes` from the `--no-*` flags.
   * Disabled levels are skipped before any graph is built.
   */
  readonly enabledGraphTypes: ReadonlySet<CodependixGraphType>;
  readonly graph: NxProjectGraph;
  /** Every project the graph knows, apart from the workspace root. */
  readonly projects: NxProject[];
  /**
   * Narrowed projects: a finding fails only when charged to one of these.
   * Equals `projects` unless `--projects` or `--tags` was given.
   */
  readonly selectedProjects: NxProject[];
  readonly workingDirectory: string;
}

/**
 * A graph that could not be built, charged to its projects. `ownerProject` names the dependency
 * whose code failed, when the stack shows it.
 */
export interface BoundaryCheckFailure {
  /** The raised error's message. */
  readonly error: string;
  readonly level: CodependixBoundaryLevel;
  /**
   * The project owning the first stack frame in a non-charged dependency.
   * Absent when no frame resolves: a guess would blame the wrong project.
   */
  readonly ownerProject?: string | undefined;
  /** The projects this failure is charged to, sorted. */
  readonly projects: readonly string[];
}

/**
 * What one boundary pass found, each finding judged. Failures sit beside violations, not thrown,
 * so one broken container hides no other finding.
 */
export interface BoundaryCheckOutcome {
  readonly failures: JudgedBoundaryFinding<BoundaryCheckFailure>[];
  readonly violations: JudgedBoundaryFinding<BoundaryViolation>[];
}

/** What every level found, charged but not yet judged. */
export interface BoundaryLevelOutcome {
  readonly failures: BoundaryCheckFailure[];
  readonly violations: BoundaryViolation[];
}

/**
 * One boundary pass's findings as `--format json` prints them. Each finding carries its verdict,
 * so a note is not mistaken for a failure.
 */
export interface BoundaryReport {
  /** Every container that could not boot, charged and judged. */
  readonly failures: BoundaryReportFailure[];
  /** The projects the run judged, sorted — what a finding must be charged to to fail. */
  readonly judgedProjects: string[];
  /** Every edge or cycle that broke a declared rule, charged and judged. */
  readonly violations: BoundaryReportViolation[];
}

/** Arguments accepted when building a run's `BoundaryReport`. */
export interface BoundaryReportArguments {
  readonly judgedProjects: readonly string[];
  readonly outcome: BoundaryCheckOutcome;
}

/** One container failure in a `BoundaryReport`. */
export interface BoundaryReportFailure {
  readonly error: string;
  readonly level: CodependixBoundaryLevel;
  /** Present only when the failing code belongs to another project. */
  readonly ownerProject?: string;
  readonly projects: readonly string[];
  readonly verdict: BoundaryVerdict;
}

/** One rule violation in a `BoundaryReport`. */
export interface BoundaryReportViolation {
  /** The whole cycle for an `acyclic` rule, and `null` for an access rule. */
  readonly cycle: null | readonly string[];
  readonly level: CodependixBoundaryLevel;
  readonly message: string;
  readonly projects: readonly string[];
  readonly rule: string;
  readonly source: string;
  readonly target: string;
  readonly verdict: BoundaryVerdict;
}

/**
 * Whether a finding fails the run or is a note. `"fail"` when a charged
 * project is judged; `"note"` when all are build-only dependencies.
 */
export type BoundaryVerdict = "fail" | "note";

/** Arguments accepted when collecting one graph's failure. */
export interface CollectFailureArguments {
  readonly error: unknown;
  /**
   * The whole Nx project graph, not just the build set, so an owner is
   * found even in a dependency `--no-dependencies` left out.
   */
  readonly graph: NxProjectGraph;
  readonly level: CodependixBoundaryLevel;
  /** The projects the failing graph was being built for. */
  readonly projects: readonly string[];
  /** Every project the workspace knows, for resolving the failure's owner. */
  readonly workspaceProjects: readonly NxProject[];
}

/** A violation or failure, with the verdict the run reached on it. */
export type JudgedBoundaryFinding<Finding> = Finding & {
  readonly verdict: BoundaryVerdict;
};

/** Arguments accepted when judging one graph level against its rules. */
export interface LevelCheckArguments {
  readonly context: BoundaryCheckContext;
  readonly level: CodependixBoundaryLevel;
  readonly rules: readonly CodependixBoundaryRule[];
}
