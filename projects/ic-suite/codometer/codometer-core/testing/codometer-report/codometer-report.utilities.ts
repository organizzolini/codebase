import type { CodometerReport } from "../../src";

/**
 * Builds a report with one target and one unlimited metric, enough for tests that only pass a report through.
 */
export function buildCodometerReport(
  overrides: Partial<CodometerReport> = {},
): CodometerReport {
  return {
    failures: [],
    targets: [
      {
        empty: false,
        files: 3,
        metrics: [
          {
            instances: null,
            limits: [],
            name: "codebase.files",
            path: "files",
            unit: null,
            value: 3,
          },
        ],
        name: "codebase",
      },
    ],
    ...overrides,
  };
}
