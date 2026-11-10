import { beforeEach, describe, expect, it, vi } from "vitest";

import codometerExecutor from "./executor";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type { CodometerExecutorContext } from "./codometer.types";

const runCodometerCli = vi.fn<() => Promise<CapturedProcess>>();

vi.mock("./codometer.runner", () => ({
  runCodometerCli: async () => runCodometerCli(),
}));

const OPTIONS = { config: "codometer.config.ts" };

const CONTEXT: CodometerExecutorContext = {
  projectGraph: { nodes: { a: { data: { root: "projects/a" } } } },
  projectName: "a",
  root: "/workspace",
};

describe(codometerExecutor, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("passes when the command line exits zero", async () => {
    expect.hasAssertions();

    runCodometerCli.mockResolvedValue({ status: 0, stderr: "", stdout: "ok" });

    await expect(codometerExecutor(OPTIONS, CONTEXT)).resolves.toStrictEqual({
      success: true,
    });
  });

  it("fails, and prints what codometer printed, when it exits non-zero", async () => {
    expect.hasAssertions();

    runCodometerCli.mockResolvedValue({
      status: 1,
      stderr: "breached",
      stdout: "",
    });

    await expect(codometerExecutor(OPTIONS, CONTEXT)).resolves.toStrictEqual({
      success: false,
    });
    expect(process.stdout.write).toHaveBeenCalledWith("breached");
  });

  it("refuses a project the graph does not know", async () => {
    expect.hasAssertions();

    await expect(
      codometerExecutor(OPTIONS, { ...CONTEXT, projectName: "missing" }),
    ).rejects.toThrow("no project named missing");
  });

  it("refuses a run against no project", async () => {
    expect.hasAssertions();

    await expect(
      codometerExecutor(OPTIONS, { ...CONTEXT, projectName: undefined }),
    ).rejects.toThrow("must be run against a project");
  });
});
