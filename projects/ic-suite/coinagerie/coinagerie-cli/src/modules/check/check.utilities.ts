// 🛠️ Utilities

import path from "node:path";

import { REPORT_MARK } from "./check.constants";

import type { CheckVerdict, Difference, Written } from "./check.types";

/**
 * Judges a check: it passes when no destination has a missing or stale word,
 * and otherwise names each destination that has, with its words.
 */
export function judgeDifferences(args: {
  differences: readonly Difference[];
  workspaceRoot: string;
}): CheckVerdict {
  const disagreeing = args.differences.filter(
    ({ missing, stale }) => missing.length > 0 || stale.length > 0,
  );

  return {
    ok: disagreeing.length === 0,
    report: disagreeing
      .map(
        ({ missing, path: file, stale }) =>
          `${REPORT_MARK} Found a glossary out of step with the code: ${path.relative(args.workspaceRoot, file)}\n  missing: ${missing.join(", ")}\n  stale: ${stale.join(", ")}`,
      )
      .join("\n"),
  };
}

/** Reports a write, naming only the files it changed. A write cannot fail. */
export function reportWritten(args: {
  results: readonly Written[];
  workspaceRoot: string;
}): CheckVerdict {
  return {
    ok: true,
    report: args.results
      .filter(({ written }) => written)
      .map(
        ({ path: file }) =>
          `${REPORT_MARK} Wrote the glossary: ${path.relative(args.workspaceRoot, file)}`,
      )
      .join("\n"),
  };
}
