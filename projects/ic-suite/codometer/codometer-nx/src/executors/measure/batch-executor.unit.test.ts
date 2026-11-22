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
  outputJson: true,
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
    workspace = createFakeWorkspace({});
  });

  afterEach(() => {
    workspace.remove();
  });

  it("judges every task from one process, each by its own verdict and report", async () => {
    expect.hasAssertions();

    build(["a", "bad-b", "c"]);

    const results = await measureBatchExecutor(
      ...buildArguments(["a", "bad-b", "c"]),
    );

    expect(results).toStrictEqual({
      "a:codometer-limit": { success: true, terminalOutput: "" },
      "bad-b:codometer-limit": {
        success: false,
        terminalOutput: "limit breached",
      },
      "c:codometer-limit": { success: true, terminalOutput: "" },
    });
  });

  it("prints a failed task's report under its id, and nothing for a passing one", async () => {
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

    expect(results["a:codometer-limit"]?.success).toBe(true);
    expect(results["bad-b:codometer-limit"]?.success).toBe(false);
  });

  it("fails a task the process gave no verdict, without losing its peers", async () => {
    expect.hasAssertions();

    build(["a", "silent-b"]);

    const results = await measureBatchExecutor(
      ...buildArguments(["a", "silent-b"]),
    );

    expect(results["a:codometer-limit"]?.success).toBe(true);
    expect(results["silent-b:codometer-limit"]).toStrictEqual({
      success: false,
      terminalOutput: expect.stringContaining("No verdict") as string,
    });
  });

  it.each([
    [
      "a run that crashed before printing verdicts",
      "crash-b",
      "something broke",
    ],
    ["verdicts that are no list", "object-b", "No verdict"],
    ["a list holding something that is no verdict", "junk-b", "No verdict"],
  ])(
    "fails every task of a group after %s, saying what it printed",
    async (_name, project, text) => {
      expect.hasAssertions();

      build(["a", project]);

      const results = await measureBatchExecutor(
        ...buildArguments(["a", project]),
      );

      expect(
        Object.values(results).map((result) => result.success),
      ).toStrictEqual([false, false]);
      expect(results["a:codometer-limit"]?.terminalOutput).toContain(text);
    },
  );

  it("fails a task whose project the graph does not know without losing its peers", async () => {
    expect.hasAssertions();

    build(["a", "b"]);

    const [taskGraph, options, overrides, context] = buildArguments(["a", "b"]);
    const results = await measureBatchExecutor(taskGraph, options, overrides, {
      ...context,
      projectGraph: { nodes: { b: { data: { root: "packages/b" } } } },
    });

    expect(results["a:codometer-limit"]?.success).toBe(false);
    expect(results["a:codometer-limit"]?.terminalOutput).toContain("a");
    expect(results["b:codometer-limit"]?.success).toBe(true);
  });

  it("measures a lone task from its own root and judges it by the exit code", async () => {
    expect.hasAssertions();

    build(["a", "bad-b"]);

    const passed = await measureBatchExecutor(...buildArguments(["a"]));
    const failed = await measureBatchExecutor(...buildArguments(["bad-b"]));

    expect(passed["a:codometer-limit"]).toStrictEqual({
      success: true,
      terminalOutput: "",
    });
    expect(failed["bad-b:codometer-limit"]).toStrictEqual({
      success: false,
      terminalOutput: expect.stringContaining("limit breached") as string,
    });
  });

  it("starts nothing for a batch of no tasks", async () => {
    expect.hasAssertions();

    await expect(
      measureBatchExecutor(...buildArguments([])),
    ).resolves.toStrictEqual({});
  });
});
