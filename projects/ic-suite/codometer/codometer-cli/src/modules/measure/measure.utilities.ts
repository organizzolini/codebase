// 🛠️ Utilities

import type { ReportFindingsArguments } from "./measure.types";
import type { ResolvedCodometerConfiguration } from "@codometer/configuration";

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
  const limits = args.measurement.limits
    .filter((limit) => limit.breached && limit.severity === "fail")
    .map(
      (limit) =>
        `Breached ${limit.metric}: measured ${String(limit.measured)}, limit ${String(limit.limit)}`,
    );
  const failures = args.measurement.failures.map(
    (failure) => `Failed to measure ${failure.subject}: ${failure.reason}`,
  );
  const stale = args.stalePaths.map((stalePath) => `Stale report ${stalePath}`);

  return [...limits, ...failures, ...stale].join("\n");
}
