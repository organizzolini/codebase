import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { FAKE_COMMAND } from "../../../testing/fake-command-line";

import checkBatchExecutor from "./batch-executor";

import type {
  CheckBatchExecutorArguments,
  CheckExecutorOptions,
} from "./executor.types";
import type { MockInstance } from "vitest";

/** The workspace root: this project, so the fake command line resolves from it. */
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const OPTIONS: CheckExecutorOptions = { command: FAKE_COMMAND };

/** A batch of one `coinagerie-check` task per project, each rooted at `packages/<name>`. */
function buildArguments(
  names: string[],
  options: Record<string, CheckExecutorOptions> = {},
): CheckBatchExecutorArguments {
  return [
    {
      tasks: Object.fromEntries(
        names.map((name) => [
          `${name}:coinagerie-check`,
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
      root: ROOT,
    },
  ];
}

describe(checkBatchExecutor, () => {
  let write: MockInstance<typeof process.stdout.write>;

  beforeEach(() => {
    vi.clearAllMocks();
    write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("judges every task from one process, each by its own verdict", async () => {
    expect.hasAssertions();

    const results = await checkBatchExecutor(
      ...buildArguments(["a", "bad-b", "c"]),
    );

    expect(results).toStrictEqual({
      "a:coinagerie-check": { success: true, terminalOutput: "" },
      "bad-b:coinagerie-check": {
        success: false,
        terminalOutput: "missing: argv",
      },
      "c:coinagerie-check": { success: true, terminalOutput: "" },
    });
  });

  it("prints a failed task's report under its id, and nothing for a passing one", async () => {
    expect.hasAssertions();

    await checkBatchExecutor(...buildArguments(["a", "bad-b"]));

    // Nx stores a batch task's output but never prints it.
    const printed = write.mock.calls.map(([chunk]) => String(chunk)).join("");

    expect(printed).toContain("bad-b:coinagerie-check");
    expect(printed).toContain("missing: argv");
    expect(printed).not.toContain("a:coinagerie-check");
  });

  it("writes the tasks that ask to write, in a process of their own", async () => {
    expect.hasAssertions();

    const results = await checkBatchExecutor(
      ...buildArguments(["a", "b"], {
        "a:coinagerie-check": { ...OPTIONS, write: true },
      }),
    );

    expect(results["a:coinagerie-check"]?.terminalOutput).toBe("wrote");
    expect(results["b:coinagerie-check"]?.terminalOutput).toBe("");
  });

  it("fails a task the process printed no verdict for, without losing its peers", async () => {
    expect.hasAssertions();

    const results = await checkBatchExecutor(
      ...buildArguments(["a", "silent-b"]),
    );

    expect(results["a:coinagerie-check"]?.success).toBe(true);
    expect(results["silent-b:coinagerie-check"]?.success).toBe(false);
    expect(results["silent-b:coinagerie-check"]?.terminalOutput).toContain(
      "No verdict",
    );
  });

  it("fails every task of a group whose process printed no verdicts, with what it printed", async () => {
    expect.hasAssertions();

    const results = await checkBatchExecutor(
      ...buildArguments(["a", "crash-b"]),
    );

    expect(
      Object.values(results).map((result) => result.success),
    ).toStrictEqual([false, false]);
    expect(results["a:coinagerie-check"]?.terminalOutput).toContain(
      "something broke",
    );
  });

  it.each([
    ["JSON that is no list", "object-b"],
    ["a list holding something that is no verdict", "junk-b"],
  ])("fails every task when the process printed %s", async (_name, project) => {
    expect.hasAssertions();

    const results = await checkBatchExecutor(...buildArguments(["a", project]));

    expect(
      Object.values(results).map((result) => result.success),
    ).toStrictEqual([false, false]);
    expect(results["a:coinagerie-check"]?.terminalOutput).toContain(
      "without a verdict",
    );
  });

  it("fails a task whose project the graph does not know without losing its peers", async () => {
    expect.hasAssertions();

    const [taskGraph, options, overrides, context] = buildArguments(["a", "b"]);
    const results = await checkBatchExecutor(taskGraph, options, overrides, {
      ...context,
      projectGraph: { nodes: { b: { data: { root: "packages/b" } } } },
    });

    expect(results["a:coinagerie-check"]?.success).toBe(false);
    expect(results["a:coinagerie-check"]?.terminalOutput).toContain("a");
    expect(results["b:coinagerie-check"]?.success).toBe(true);
  });

  it("starts nothing for a batch of no tasks", async () => {
    expect.hasAssertions();

    await expect(
      checkBatchExecutor(...buildArguments([])),
    ).resolves.toStrictEqual({});
  });
});
