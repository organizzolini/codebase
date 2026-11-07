import { beforeEach, describe, expect, it, vi } from "vitest";

import spellCheckBatchExecutor from "./batch-executor";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type {
  SpellCheckBatchExecutorArguments,
  SpellCheckExecutorContext,
} from "./spell-check.types";
import type { MockInstance } from "vitest";

const captureAsync =
  vi.fn<
    (executable: string, args: readonly string[]) => Promise<CapturedProcess>
  >();

vi.mock("../../modules/process-runner/process-runner.service", () => ({
  ProcessRunnerService: class {
    public captureAsync = captureAsync;
  },
}));

/** The configuration every task of a test names. */
const CONFIGURATION = "configuration/cspell.config.yaml";

/** The arguments of a batch of one `spell-check` task per project. */
function buildArguments(
  names: string[],
  context: SpellCheckExecutorContext = buildContext(names),
): SpellCheckBatchExecutorArguments {
  return [
    {
      tasks: Object.fromEntries(
        names.map((name) => [
          `${name}:spell-check`,
          { target: { project: name } },
        ]),
      ),
    },
    Object.fromEntries(
      names.map((name) => [
        `${name}:spell-check`,
        { configuration: CONFIGURATION },
      ]),
    ),
    { configuration: CONFIGURATION },
    context,
  ];
}

/** A context over the named projects, each rooted at `projects/<name>`. */
function buildContext(names: string[]): SpellCheckExecutorContext {
  return {
    projectGraph: {
      nodes: Object.fromEntries(
        names.map((name) => [name, { data: { root: `projects/${name}` } }]),
      ),
    },
    root: "/workspace",
  };
}

/** What cspell prints for a misspelling in the given file. */
function findingIn(file: string): CapturedProcess {
  return {
    status: 1,
    stderr: "",
    stdout: `${file}:1:1 - Unknown word (zzz)`,
  };
}

describe(spellCheckBatchExecutor, () => {
  let write: MockInstance<typeof process.stdout.write>;

  beforeEach(() => {
    vi.clearAllMocks();
    captureAsync.mockReset();
    write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("judges every task from one cspell run over all of their roots", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    const results = await spellCheckBatchExecutor(
      ...buildArguments(["a", "b"]),
    );

    expect(captureAsync).toHaveBeenCalledTimes(1);
    expect(captureAsync.mock.lastCall?.[1]).toStrictEqual(
      expect.arrayContaining([
        expect.stringMatching(/^projects\/a\/\*\*/u),
        expect.stringMatching(/^projects\/b\/\*\*/u),
      ]),
    );
    expect(results).toStrictEqual({
      "a:spell-check": { success: true, terminalOutput: "" },
      "b:spell-check": { success: true, terminalOutput: "" },
    });
  });

  it("fails only the task whose root holds a finding, with cspell's own report", async () => {
    expect.hasAssertions();

    captureAsync
      .mockResolvedValueOnce(findingIn("projects/a/x.ts"))
      .mockResolvedValueOnce(findingIn("projects/a/x.ts"));

    const results = await spellCheckBatchExecutor(
      ...buildArguments(["a", "b", "c"]),
    );

    expect(captureAsync).toHaveBeenCalledTimes(2);
    expect(results["a:spell-check"]).toStrictEqual({
      success: false,
      terminalOutput: "projects/a/x.ts:1:1 - Unknown word (zzz)",
    });
    expect(results["b:spell-check"]?.success).toBe(true);
    expect(results["c:spell-check"]?.success).toBe(true);
  });

  it("says so when a failed task's own run does not reproduce the failure", async () => {
    expect.hasAssertions();

    captureAsync
      .mockResolvedValueOnce(findingIn("projects/a/x.ts"))
      .mockResolvedValueOnce({ status: 0, stderr: "", stdout: "" });

    const results = await spellCheckBatchExecutor(...buildArguments(["a"]));

    expect(results["a:spell-check"]?.success).toBe(false);
    expect(results["a:spell-check"]?.terminalOutput).toContain(
      "did not reproduce",
    );
  });

  it("fails every task when cspell failed but charged none of them", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({
      status: 2,
      stderr: "configuration error",
      stdout: "",
    });

    const results = await spellCheckBatchExecutor(
      ...buildArguments(["a", "b"]),
    );

    expect(
      Object.values(results).map((result) => result.success),
    ).toStrictEqual([false, false]);
    expect(results["a:spell-check"]?.terminalOutput).toContain(
      "configuration error",
    );
  });

  it("makes one run for each configuration file", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    const [taskGraph, , overrides, context] = buildArguments(["a", "b"]);

    await spellCheckBatchExecutor(
      taskGraph,
      {
        "a:spell-check": { configuration: "one.yaml" },
        "b:spell-check": { configuration: "two.yaml" },
      },
      overrides,
      context,
    );

    expect(captureAsync).toHaveBeenCalledTimes(2);
  });

  it("falls back to the shared overrides for a task with no options of its own", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    const [taskGraph, , overrides, context] = buildArguments(["a"]);
    const results = await spellCheckBatchExecutor(
      taskGraph,
      {},
      overrides,
      context,
    );

    expect(results["a:spell-check"]?.success).toBe(true);
    expect(captureAsync.mock.lastCall?.[1]).toContain(CONFIGURATION);
  });

  it("fails a task whose project the graph does not know without losing its peers", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    const results = await spellCheckBatchExecutor(
      ...buildArguments(["a", "ghost"], buildContext(["a"])),
    );

    expect(results["a:spell-check"]?.success).toBe(true);
    expect(results["ghost:spell-check"]?.terminalOutput).toContain(
      "no project named ghost",
    );
  });

  it("prints a failed task's report under its id, and nothing for a passing one", async () => {
    expect.hasAssertions();

    captureAsync
      .mockResolvedValueOnce(findingIn("projects/a/x.ts"))
      .mockResolvedValueOnce(findingIn("projects/a/x.ts"));

    await spellCheckBatchExecutor(...buildArguments(["a", "b"]));

    const printed = write.mock.calls.map(([chunk]) => String(chunk)).join("");

    expect(printed).toContain("> a:spell-check");
    expect(printed).not.toContain("> b:spell-check");
  });
});
