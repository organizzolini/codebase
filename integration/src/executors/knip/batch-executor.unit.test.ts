import { beforeEach, describe, expect, it, vi } from "vitest";

import knipBatchExecutor from "./batch-executor";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type {
  KnipBatchExecutorArguments,
  KnipExecutorContext,
  KnipExecutorOptions,
} from "./knip.types";
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
const CONFIGURATION = "configuration/knip.config.ts";

/** The arguments of a batch of one `knip` task per project. */
function buildArguments(
  names: string[],
  options: Partial<KnipExecutorOptions> = {},
  context: KnipExecutorContext = buildContext(names),
): KnipBatchExecutorArguments {
  return [
    {
      tasks: Object.fromEntries(
        names.map((name) => [`${name}:knip`, { target: { project: name } }]),
      ),
    },
    Object.fromEntries(
      names.map((name) => [
        `${name}:knip`,
        { configuration: CONFIGURATION, ...options },
      ]),
    ),
    { configuration: CONFIGURATION },
    context,
  ];
}

/** A context over the named projects, each rooted at `projects/<name>`. */
function buildContext(names: string[]): KnipExecutorContext {
  return {
    projectGraph: {
      nodes: Object.fromEntries(
        names.map((name) => [name, { data: { root: `projects/${name}` } }]),
      ),
    },
    root: "/workspace",
  };
}

/** A knip JSON report with one issue in each of the given files. */
function reportOf(files: string[]): CapturedProcess {
  return {
    status: files.length > 0 ? 1 : 0,
    stderr: "",
    stdout: JSON.stringify({ issues: files.map((file) => ({ file })) }),
  };
}

describe(knipBatchExecutor, () => {
  let write: MockInstance<typeof process.stdout.write>;

  beforeEach(() => {
    vi.clearAllMocks();
    captureAsync.mockReset();
    write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("judges every task from one knip run over all of their workspaces", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue(reportOf([]));

    const results = await knipBatchExecutor(...buildArguments(["a", "b"]));

    expect(captureAsync).toHaveBeenCalledTimes(1);
    expect(captureAsync).toHaveBeenCalledWith(
      "/workspace/node_modules/.bin/knip",
      [
        "--config",
        CONFIGURATION,
        "--directory",
        "/workspace",
        "--reporter",
        "json",
        "--workspace",
        "projects/a",
        "--workspace",
        "projects/b",
      ],
    );
    expect(results).toStrictEqual({
      "a:knip": { success: true, terminalOutput: "" },
      "b:knip": { success: true, terminalOutput: "" },
    });
  });

  it("fails only the task whose workspace holds an issue, with knip's own report", async () => {
    expect.hasAssertions();

    captureAsync
      .mockResolvedValueOnce(reportOf(["projects/a/src/unused.ts"]))
      .mockResolvedValueOnce({
        status: 1,
        stderr: "",
        stdout: "Unused files (1)\nprojects/a/src/unused.ts",
      });

    const results = await knipBatchExecutor(...buildArguments(["a", "b", "c"]));

    // The failing workspace is run again by itself, so what it prints is
    // exactly what a single knip would have printed.
    expect(captureAsync).toHaveBeenCalledTimes(2);
    expect(captureAsync.mock.lastCall?.[1]).toStrictEqual([
      "--config",
      CONFIGURATION,
      "--directory",
      "/workspace",
      "--workspace",
      "projects/a",
    ]);
    expect(results["a:knip"]).toStrictEqual({
      success: false,
      terminalOutput: "Unused files (1)\nprojects/a/src/unused.ts",
    });
    expect(results["b:knip"]?.success).toBe(true);
    expect(results["c:knip"]?.success).toBe(true);
  });

  it("fails every task when what knip printed is not a report", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({
      status: 0,
      stderr: "",
      stdout: "not json",
    });

    const results = await knipBatchExecutor(...buildArguments(["a", "b"]));

    expect(
      Object.values(results).map((result) => result.success),
    ).toStrictEqual([false, false]);
    expect(results["a:knip"]?.terminalOutput).toContain("not json");
  });

  it("says so when a failed task's own run does not reproduce the failure", async () => {
    expect.hasAssertions();

    captureAsync
      .mockResolvedValueOnce(reportOf(["projects/a/src/unused.ts"]))
      .mockResolvedValueOnce({ status: 0, stderr: "", stdout: "" });

    const results = await knipBatchExecutor(...buildArguments(["a"]));

    expect(results["a:knip"]?.success).toBe(false);
    expect(results["a:knip"]?.terminalOutput).toContain("did not reproduce");
  });

  it("falls back to the shared overrides for a task with no options of its own", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue(reportOf([]));

    const [taskGraph, , overrides, context] = buildArguments(["a"]);
    const results = await knipBatchExecutor(taskGraph, {}, overrides, context);

    expect(results["a:knip"]?.success).toBe(true);
    expect(captureAsync.mock.lastCall?.[1]).toContain(CONFIGURATION);
  });

  it("fails every task when knip failed but charged none of them", async () => {
    expect.hasAssertions();

    // Never a pass on a run nobody can account for: the one issue sits in a
    // workspace outside the batch, so nothing says what failed the run.
    captureAsync.mockResolvedValue({
      ...reportOf(["infrastructure/project.json"]),
      stderr: "something broke",
    });

    const results = await knipBatchExecutor(...buildArguments(["a", "b"]));

    expect(
      Object.values(results).map((result) => result.success),
    ).toStrictEqual([false, false]);
  });

  it("runs a task that is asked to fix by itself, never in the batch", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    const results = await knipBatchExecutor(
      ...buildArguments(["a", "b"], { fix: true }),
    );

    // A fix rewrites files, so each workspace is fixed on its own.
    expect(captureAsync).toHaveBeenCalledTimes(2);
    expect(
      captureAsync.mock.calls.map(([, args]) => args.includes("--fix")),
    ).toStrictEqual([true, true]);
    expect(
      captureAsync.mock.calls.map(([, args]) => args.includes("json")),
    ).toStrictEqual([false, false]);
    expect(results["a:knip"]?.success).toBe(true);
  });

  it("makes one run for each configuration file", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue(reportOf([]));

    const [taskGraph, options, overrides, context] = buildArguments(["a", "b"]);

    await knipBatchExecutor(
      taskGraph,
      { ...options, "b:knip": { configuration: "other.config.ts" } },
      overrides,
      context,
    );

    expect(captureAsync).toHaveBeenCalledTimes(2);
  });

  it("fails a task whose project the graph does not know without losing its peers", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue(reportOf([]));

    const results = await knipBatchExecutor(
      ...buildArguments(["a", "b"], {}, buildContext(["b"])),
    );

    expect(results["a:knip"]?.success).toBe(false);
    expect(results["a:knip"]?.terminalOutput).toContain("a");
    expect(results["b:knip"]?.success).toBe(true);
  });

  it("prints a failed task's report under its id, and nothing for a passing one", async () => {
    expect.hasAssertions();

    captureAsync
      .mockResolvedValueOnce(reportOf(["projects/a/src/unused.ts"]))
      .mockResolvedValueOnce({
        status: 1,
        stderr: "",
        stdout: "Unused files (1)",
      });

    await knipBatchExecutor(...buildArguments(["a", "b"]));

    // Nx stores a batch task's output but never prints it, so without this a
    // failed task would be red and silent.
    const printed = write.mock.calls.map(([chunk]) => String(chunk)).join("");

    expect(printed).toContain("a:knip");
    expect(printed).toContain("Unused files (1)");
    expect(printed).not.toContain("b:knip");
  });

  it("makes no knip run for a batch of no tasks", async () => {
    expect.hasAssertions();

    await expect(
      knipBatchExecutor(...buildArguments([])),
    ).resolves.toStrictEqual({});
    expect(captureAsync).not.toHaveBeenCalled();
  });
});
