// 🛠️ Utilities

import { SOURCE_INPUT } from "./measure.constants";

import type { ReportFindingsArguments } from "./measure.types";
import type {
  ResolvedCodometerConfiguration,
  RunMode,
} from "@codometer/configuration";

/**
 * Replaces every configured input with the `--inputs` globs, measured as the `language` analysis with no other input active.
 */
export function applyInputsOverride(
  configuration: ResolvedCodometerConfiguration,
  globs: string[] | undefined,
): ResolvedCodometerConfiguration {
  if (globs === undefined) {
    return configuration;
  }

  return {
    ...configuration,
    inputs: [
      {
        analyses: ["language"],
        compression: "none",
        directory: ".",
        exclude: [],
        include: globs,
        name: "Command Line",
      },
    ],
  };
}

/**
 * Says what failed a run as plain lines: each failing limit, each part that could not be measured, each stale report.
 */
export function describeFindings(args: ReportFindingsArguments): string {
  const limits = enforcedFailures(args).map(
    (limit) =>
      `Breached ${limit.metric}: measured ${String(limit.measured)}, limit ${String(limit.limit)}`,
  );
  const failures = args.measurement.failures.map(
    (failure) => `Failed to measure ${failure.subject}: ${failure.reason}`,
  );
  const stale = args.stalePaths.map((stalePath) => `Stale report ${stalePath}`);

  return [...limits, ...failures, ...stale].join("\n");
}

/**
 * The breached failing limits the run was asked to fail on: `--check limits` takes those on the source tree, `--check weigh` those on every other input.
 */
export function enforcedFailures(
  args: ReportFindingsArguments,
): ReportFindingsArguments["measurement"]["limits"] {
  return args.measurement.limits.filter(
    (limit) =>
      limit.breached &&
      limit.severity === "fail" &&
      (limit.target === SOURCE_INPUT
        ? args.mode.checksLimits
        : args.mode.checksWeigh),
  );
}

/**
 * Narrows a source-only run, `--check limits` without `--check weigh`, to the `codebase` input, dropping the others and the limits written against them so no build is needed.
 */
export function scopeToMode(
  configuration: ResolvedCodometerConfiguration,
  mode: RunMode,
): ResolvedCodometerConfiguration {
  if (!mode.checksLimits || mode.checksWeigh) {
    return configuration;
  }

  const dropped = configuration.inputs
    .map((input) => input.name)
    .filter((name) => name !== SOURCE_INPUT);

  return {
    ...configuration,
    inputs: configuration.inputs.filter((input) => input.name === SOURCE_INPUT),
    limits: configuration.limits.filter(
      (limit) =>
        !dropped.some((input) =>
          limitTargetsInput(configuration, limit.metric, input),
        ),
    ),
  };
}

/**
 * Whether a limit is written against an input: by its name in front of the metric, or unqualified where that input is the default.
 */
function limitTargetsInput(
  configuration: ResolvedCodometerConfiguration,
  metric: string,
  input: string,
): boolean {
  if (metric.startsWith(`${input}.`)) {
    return true;
  }

  const isQualified = configuration.inputs.some((configured) =>
    metric.startsWith(`${configured.name}.`),
  );

  return !isQualified && configuration.defaultInput === input;
}
