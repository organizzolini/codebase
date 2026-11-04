// 🛠️ Utilities

/**
 * Describes whatever was thrown, as the text a task should fail with.
 *
 * An error's message when it is one, and the value as text when something else
 * was thrown, so a task's failure always says something.
 */
export function describeError(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown);
}

/**
 * Reads which projects a `--format json` boundary run charged a finding to.
 *
 * A finding is charged to every project its `projects` names, whatever its
 * verdict: the verdict is the run's, judged against everything it was asked
 * about, where a batch asks the same question of each project in turn.
 * Returns `undefined` when the output holds no report the command line prints,
 * so a caller can fail on output it could not check rather than pass.
 *
 * One function rather than a helper per layer of the report: it is called
 * from deep inside a batch, and each helper would be one more frame on a stack
 * the project holds to a fixed depth.
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
 * Splits project names into runs that can start together, each handed a
 * `--projects` value within a byte budget.
 *
 * Round-robin rather than in blocks: adjacent names are often one family of
 * project, and a family tends to cost alike, so dealing them out like cards
 * keeps the runs about as long as each other. Starts at the number of runs
 * asked for, never more than there are projects, and adds runs until every
 * argument fits. A name longer than the budget on its own still gets a run
 * rather than being dropped: the budget exists to keep an argument short, not
 * to refuse a project.
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
 * Picks the report out of what a run printed to standard output.
 *
 * The command line prints the report indented, so it is the lines from the
 * first one that is a bare `{` to the next one that is a bare `}`; anything
 * a logger wrote to the same stream before or after is left behind. Output
 * with no such lines, such as a report printed on one line, is returned as it
 * came, for the caller to read or refuse.
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
