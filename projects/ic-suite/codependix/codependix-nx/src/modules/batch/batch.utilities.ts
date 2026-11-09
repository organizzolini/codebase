// 🛠️ Utilities

/**
 * The text a task fails with: the error's message, or the value as text when something else was thrown.
 */
export function describeError(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown);
}

/**
 * Reads which projects a `--format json` boundary run charged a finding to. Returns
 * `undefined` when there is no report, so callers fail.
 */
export function readChargedProjects(
  standardOutput: string,
): Set<string> | undefined {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractReportText(standardOutput));
  } catch {
    return undefined;
  }

  const report = isRecord(parsed) ? parsed["boundaries"] : undefined;

  if (
    !isRecord(report) ||
    !isList(report["failures"]) ||
    !isList(report["violations"])
  ) {
    return undefined;
  }

  const charged = new Set<string>();

  for (const finding of [...report["failures"], ...report["violations"]]) {
    const projects = isRecord(finding) ? finding["projects"] : undefined;

    if (!isList(projects)) {
      return undefined;
    }

    for (const project of projects) {
      if (typeof project === "string") {
        charged.add(project);
      }
    }
  }

  return charged;
}

/**
 * Splits project names into runs that start together, within a byte budget.
 * Dealt round-robin; a name over budget still gets a run.
 */
export function splitProjects(
  names: readonly string[],
  budget: number,
  runs: number,
): string[][] {
  for (
    let count = Math.max(1, Math.min(runs, names.length));
    count <= names.length;
    count += 1
  ) {
    const chunks = Array.from({ length: count }, (): string[] => []);

    for (const [index, name] of names.entries()) {
      chunks[index % count]?.push(name);
    }

    if (chunks.every((chunk) => chunk.join(",").length <= budget)) {
      return chunks;
    }
  }

  return names.map((name) => [name]);
}

/**
 * Picks the report out of standard output, from a bare `{` line to the next bare `}`; other
 * lines are left behind.
 */
function extractReportText(standardOutput: string): string {
  const lines = standardOutput.split("\n");
  const first = lines.indexOf("{");
  const last = lines.indexOf("}", first);

  return first === -1 || last === -1
    ? standardOutput
    : lines.slice(first, last + 1).join("\n");
}

/** Whether a parsed JSON value is a list, of items not yet checked. */
function isList(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/** Whether a parsed JSON value is an object rather than a scalar or array. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
