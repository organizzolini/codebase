import { beforeEach, describe, expect, it, vi } from "vitest";

import codometerBatchExecutor from "./batch-executor";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type {
  CodometerBatchExecutorArguments,
  CodometerExecutorContext,
  CodometerExecutorOptions,
} from "./codometer.types";

const runCodometerBatch =
  vi.fn<(args: { roots: readonly string[] }) => Promise<CapturedProcess>>();
const runCodometerCli =
  vi.fn<(args: { root: string }) => Promise<CapturedProcess>>();

vi.mock("./codometer.runner", () => ({
  runCodometerBatch: async (args: { roots: readonly string[] }) =>
    runCodometerBatch(args),
  runCodometerCli: async (args: { root: string }) => runCodometerCli(args),
}));

const OPTIONS = { check: true, config: "codometer.config.ts" };

/** The arguments of a batch of one `codometer` task per project. */
function buildArguments(
  names: string[],
  context: CodometerExecutorContext = buildContext(names),
  optionsByName: Record<string, CodometerExecutorOptions> = {},
): CodometerBatchExecutorArguments {
  return [
    {
      tasks: Object.fromEntries(
        names.map((name) => [
          `${name}:codometer`,
          { target: { project: name } },
        ]),
      ),
    },
    Object.fromEntries(
      names.map((name) => [
        `${name}:codometer`,
        optionsByName[name] ?? OPTIONS,
      ]),
    ),
    OPTIONS,
    context,
  ];
}

/** A context over the named projects, each rooted at `projects/<name>`. */
function buildContext(names: string[]): CodometerExecutorContext {
  return {
    projectGraph: {
      nodes: Object.fromEntries(
        names.map((name) => [name, { data: { root: `projects/${name}` } }]),
      ),
    },
    root: "/workspace",
  };
}

describe(codometerBatchExecutor, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runCodometerBatch.mockReset();
    runCodometerCli.mockReset();
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("judges every task from one run over all of their roots and runs none alone", async () => {
    expect.hasAssertions();

    runCodometerBatch.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    const results = await codometerBatchExecutor(...buildArguments(["a", "b"]));

    expect(runCodometerBatch).toHaveBeenCalledTimes(1);
    expect(runCodometerBatch).toHaveBeenCalledWith(
      expect.objectContaining({ roots: ["projects/a", "projects/b"] }),
    );
    expect(runCodometerCli).not.toHaveBeenCalled();
    expect(results).toStrictEqual({
      "a:codometer": { success: true, terminalOutput: "" },
      "b:codometer": { success: true, terminalOutput: "" },
    });
  });

  it("judges tasks that ask for different measurements in separate runs", async () => {
    expect.hasAssertions();

    runCodometerBatch.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    await codometerBatchExecutor(
      ...buildArguments(["a", "b"], undefined, {
        b: { config: "codometer.config.ts" },
      }),
    );

    expect(runCodometerBatch).toHaveBeenCalledTimes(2);
  });

  it("judges each task alone when the run failed, failing only the project that fails", async () => {
    expect.hasAssertions();

    runCodometerBatch.mockResolvedValue({ status: 1, stderr: "", stdout: "" });
    runCodometerCli
      .mockResolvedValueOnce({
        status: 1,
        stderr: "breached a failing limit\n",
        stdout: "",
      })
      .mockResolvedValueOnce({ status: 0, stderr: "", stdout: "fine" });

    const results = await codometerBatchExecutor(...buildArguments(["a", "b"]));

    expect(runCodometerCli).toHaveBeenCalledTimes(2);
    expect(runCodometerCli).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ root: "projects/a" }),
    );
    expect(results).toStrictEqual({
      "a:codometer": {
        success: false,
        terminalOutput: "breached a failing limit",
      },
      "b:codometer": { success: true, terminalOutput: "" },
    });
    expect(process.stdout.write).toHaveBeenCalledWith(
      "\n> a:codometer\nbreached a failing limit\n",
    );
  });

  it("fails a project the graph does not know and runs nothing when no task is left", async () => {
    expect.hasAssertions();

    const results = await codometerBatchExecutor(
      ...buildArguments(["a"], buildContext([])),
    );

    expect(runCodometerBatch).not.toHaveBeenCalled();
    expect(results["a:codometer"]).toStrictEqual({
      success: false,
      terminalOutput: "The project graph has no project named a.",
    });
  });

  it("falls back to the batch's own options for a task it has none for", async () => {
    expect.hasAssertions();

    runCodometerBatch.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    const [taskGraph, , overrides, context] = buildArguments(["a"]);

    await codometerBatchExecutor(taskGraph, {}, overrides, context);

    expect(runCodometerBatch).toHaveBeenCalledWith(
      expect.objectContaining({ options: OPTIONS }),
    );
  });
});
