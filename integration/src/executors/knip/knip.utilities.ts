// 🛠️ Utilities

import type { AttributedIssues, BuildKnipArguments } from "./knip.types";

/**
 * Counts a knip JSON report's issues per workspace, by each file's deepest
 * enclosing one. Returns `undefined` for non-report output.
 */
export function attributeIssues(
  output: string,
  roots: readonly string[],
): AttributedIssues | undefined {
  const files = readIssueFiles(output);

  if (files === undefined) {
    return undefined;
  }

  const byRoot = new Map<string, number>();
  let unattributed = 0;

  for (const file of files) {
    const owner = ownerOf(file, roots);

    if (owner === undefined) {
      unattributed += 1;
    } else {
      byRoot.set(owner, (byRoot.get(owner) ?? 0) + 1);
    }
  }

  return { byRoot, unattributed };
}

/** Builds the arguments of one knip run over the given workspaces. */
export function buildKnipArguments(args: BuildKnipArguments): string[] {
  return [
    "--config",
    args.configuration,
    "--directory",
    args.directory,
    ...(args.fix ? ["--fix"] : []),
    ...(args.format === "json" ? ["--reporter", "json"] : []),
    ...args.roots.flatMap((root) => ["--workspace", root]),
  ];
}

/** Whether a parsed JSON value is an object rather than a scalar or array. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The deepest workspace holding a file, matched on whole path segments so
 * a nested workspace's files are not its parent's.
 */
function ownerOf(file: string, roots: readonly string[]): string | undefined {
  return roots
    .filter((root) => file.startsWith(`${root}/`))
    .toSorted((left, right) => right.length - left.length)[0];
}

/**
 * Reads an issue's file from a knip JSON report. Returns `undefined` if
 * output is not a report or an issue has no file.
 */
function readIssueFiles(output: string): string[] | undefined {
  let parsed: unknown;

  try {
    parsed = JSON.parse(output);
  } catch {
    return undefined;
  }

  const issues = isRecord(parsed) ? parsed["issues"] : undefined;

  if (!Array.isArray(issues)) {
    return undefined;
  }

  const files: string[] = [];

  for (const issue of issues as unknown[]) {
    const file = isRecord(issue) ? issue["file"] : undefined;

    if (typeof file !== "string") {
      return undefined;
    }

    files.push(file);
  }

  return files;
}
