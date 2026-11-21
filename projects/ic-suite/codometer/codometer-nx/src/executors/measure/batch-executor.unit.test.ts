import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { captureOutput } from "@codebase/testing";

import { FAKE_COMMAND } from "../../../testing/fake-command-line";
import { createFakeWorkspace } from "../../../testing/fake-workspace";

import measureBatchExecutor from "./batch-executor";

import type { FakeWorkspace } from "../../../testing/fake-workspace";
import type {
  MeasureBatchExecutorArguments,
  MeasureExecutorOptions,
} from "./executor.types";
import type { CapturedOutput } from "@codebase/testing";

const OPTIONS: MeasureExecutorOptions = {
  command: FAKE_COMMAND,
  config: "codometer.config.ts",
  outputJson: "report.json",
};

describe(measureBatchExecutor, () => {
  let output: CapturedOutput;
  let workspace: FakeWorkspace;

  /** A batch of one `codometer-limit` task per project, each rooted at `packages/<name>`. */
  function buildArguments(
    names: string[],
    options: Record<string, MeasureExecutorOptions> = {},
  ): MeasureBatchExecutorArguments {
    return [
      {
        tasks: Object.fromEntries(
          names.map((name) => [
            `${name}:codometer-limit`,
            { target: { project: name } },
          ]),
        ),
      },
      options,
      OPTIONS,
      {
        projectGraph: {
          nodes: Object.fromEntries(
            names.map((name) => [name, { data: { root: `packages/${name}` } }]),
          ),
        },
        root: workspace.root,
      },
    ];
  }

  /** Makes the workspace hold a folder for each project. */
  function build(names: string[]): void {
    workspace = createFakeWorkspace(
      Object.fromEntries(names.map((name) => [`packages/${name}/.keep`, ""])),
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    output = captureOutput();
  });

  afterEach(() => {
    workspace.remove();
  });

  it("passes every task from one process when the run passes", async () => {
    expect.hasAssertions();

    build(["a", "b"]);

    const results = await measureBatchExecutor(...buildArguments(["a", "b"]));

    expect(results).toStrictEqual({
      "a:codometer-limit": { success: true, terminalOutput: "" },
      "b:codometer-limit": { success: true, terminalOutput: "" },
    });
    // One run for both: the directories follow the flags, and the log is silenced.
    expect(output.stdout()).toBe("");
  });

  it("charges a breach to the task that has it, measuring the others alone", async () => {
    expect.hasAssertions();

    build(["a", "bad-b", "c"]);

    const results = await measureBatchExecutor(
      ...buildArguments(["a", "bad-b", "c"]),
    );

    expect(results["a:codometer-limit"]?.success).toBe(true);
    expect(results["bad-b:codometer-limit"]).toStrictEqual({
      success: false,
      terminalOutput: expect.stringContaining("limit breached") as string,
    });
    expect(results["c:codometer-limit"]?.success).toBe(true);
  });

  it("prints a failed task's output under its id, and nothing for a passing one", async () => {
    expect.hasAssertions();

    build(["a", "bad-b"]);

    await measureBatchExecutor(...buildArguments(["a", "bad-b"]));

    // Nx stores a batch task's output but never prints it.
    const printed = output.stdout();

    expect(printed).toContain("bad-b:codometer-limit");
    expect(printed).toContain("limit breached");
    expect(printed).not.toContain("a:codometer-limit");
  });

  it("measures tasks that ask for different things in processes of their own", async () => {
    expect.hasAssertions();

    build(["a", "bad-b"]);

    const results = await measureBatchExecutor(
      ...buildArguments(["a", "bad-b"], {
        "a:codometer-limit": { ...OPTIONS, check: true },
      }),
    );

    // `a` asked for a gate and `bad-b` did not, so a breach reaches only `bad-b`.
    expect(results["a:codometer-limit"]?.success).toBe(true);
    expect(results["bad-b:codometer-limit"]?.success).toBe(false);
  });

  it("fails a task whose project the graph does not know without losing its peers", async () => {
    expect.hasAssertions();

    build(["b"]);

    const [taskGraph, options, overrides, context] = buildArguments(["a", "b"]);
    const results = await measureBatchExecutor(taskGraph, options, overrides, {
      ...context,
      projectGraph: { nodes: { b: { data: { root: "packages/b" } } } },
    });

    expect(results["a:codometer-limit"]?.success).toBe(false);
    expect(results["a:codometer-limit"]?.terminalOutput).toContain("a");
    expect(results["b:codometer-limit"]?.success).toBe(true);
  });

  it("starts nothing for a batch of no tasks", async () => {
    expect.hasAssertions();

    build([]);

    await expect(
      measureBatchExecutor(...buildArguments([])),
    ).resolves.toStrictEqual({});
  });
});
