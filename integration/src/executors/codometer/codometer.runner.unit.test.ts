import { beforeEach, describe, expect, it, vi } from "vitest";

import { runCodometerBatch, runCodometerCli } from "./codometer.runner";

import type {
  CapturedProcess,
  CaptureLocation,
} from "../../modules/process-runner/process-runner.types";

const captureAsync =
  vi.fn<
    (
      executable: string,
      args: readonly string[],
      where?: CaptureLocation,
    ) => Promise<CapturedProcess>
  >();

vi.mock("../../modules/process-runner/process-runner.service", () => ({
  ProcessRunnerService: class {
    public captureAsync = captureAsync;
  },
}));

const OPTIONS = { config: "codometer.config.ts" };
const PRINTED = { status: 0, stderr: "", stdout: "done" };

describe("codometer runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captureAsync.mockResolvedValue(PRINTED);
  });

  describe(runCodometerCli, () => {
    it("runs the command line from the project's root, naming no directory", async () => {
      expect.hasAssertions();

      await expect(
        runCodometerCli({
          options: OPTIONS,
          root: "projects/a",
          workspaceRoot: "/workspace",
        }),
      ).resolves.toBe(PRINTED);

      const [executable, args, where] = captureAsync.mock.lastCall ?? [];

      expect(executable).toBe(process.execPath);
      expect(args?.at(-1)).toBe("--output-json");
      expect(where?.cwd).toBe("/workspace/projects/a");
      expect(where?.env?.["SWC_NODE_PROJECT"]).toBe(
        "/workspace/configuration/tsconfig.json",
      );
      expect(where?.env?.["LOG_LEVEL"]).toBe(process.env["LOG_LEVEL"]);
    });
  });

  describe(runCodometerBatch, () => {
    it("runs the command line once from the workspace root, silent, over every root", async () => {
      expect.hasAssertions();

      await expect(
        runCodometerBatch({
          options: OPTIONS,
          roots: ["projects/a", "projects/b"],
          workspaceRoot: "/workspace",
        }),
      ).resolves.toBe(PRINTED);

      const [, args, where] = captureAsync.mock.lastCall ?? [];

      expect(args?.slice(-2)).toStrictEqual([
        "/workspace/projects/a",
        "/workspace/projects/b",
      ]);
      expect(where?.cwd).toBe("/workspace");
      expect(where?.env?.["LOG_LEVEL"]).toBe("silent");
    });
  });
});
