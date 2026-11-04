import { beforeEach, describe, expect, it, vi } from "vitest";

import knipExecutor from "./executor";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type { KnipExecutorContext } from "./knip.types";

const captureAsync =
  vi.fn<
    (executable: string, args: readonly string[]) => Promise<CapturedProcess>
  >();

vi.mock("../../modules/process-runner/process-runner.service", () => ({
  ProcessRunnerService: class {
    public captureAsync = captureAsync;
  },
}));

const CONTEXT: KnipExecutorContext = {
  projectGraph: { nodes: { a: { data: { root: "projects/a" } } } },
  projectName: "a",
  root: "/workspace",
};

describe(knipExecutor, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("runs knip over the target's own workspace and passes when it exits zero", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    await expect(
      knipExecutor({ configuration: "configuration/knip.config.ts" }, CONTEXT),
    ).resolves.toStrictEqual({ success: true });
    expect(captureAsync).toHaveBeenCalledWith(
      "/workspace/node_modules/.bin/knip",
      [
        "--config",
        "configuration/knip.config.ts",
        "--directory",
        "/workspace",
        "--workspace",
        "projects/a",
      ],
    );
  });

  it("fails, and prints what knip printed, when it exits non-zero", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({
      status: 1,
      stderr: "",
      stdout: "Unused files (1)",
    });

    await expect(
      knipExecutor({ configuration: "configuration/knip.config.ts" }, CONTEXT),
    ).resolves.toStrictEqual({ success: false });
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining("Unused files (1)"),
    );
  });

  it("asks knip to fix when the target is a write configuration", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    await knipExecutor(
      { configuration: "configuration/knip.config.ts", fix: true },
      CONTEXT,
    );

    expect(captureAsync.mock.lastCall?.[1]).toContain("--fix");
  });

  it("refuses a project the graph does not know", async () => {
    expect.hasAssertions();

    await expect(
      knipExecutor(
        { configuration: "configuration/knip.config.ts" },
        { ...CONTEXT, projectName: "missing" },
      ),
    ).rejects.toThrow("no project named missing");
  });

  it("refuses a run against no project", async () => {
    expect.hasAssertions();

    await expect(
      knipExecutor(
        { configuration: "configuration/knip.config.ts" },
        { ...CONTEXT, projectName: undefined },
      ),
    ).rejects.toThrow("must be run against a project");
  });
});
