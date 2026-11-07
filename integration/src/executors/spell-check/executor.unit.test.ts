import { beforeEach, describe, expect, it, vi } from "vitest";

import spellCheckExecutor from "./executor";

import type { CapturedProcess } from "../../modules/process-runner/process-runner.types";
import type { SpellCheckExecutorContext } from "./spell-check.types";

const captureAsync =
  vi.fn<
    (executable: string, args: readonly string[]) => Promise<CapturedProcess>
  >();

vi.mock("../../modules/process-runner/process-runner.service", () => ({
  ProcessRunnerService: class {
    public captureAsync = captureAsync;
  },
}));

const OPTIONS = { configuration: "configuration/cspell.config.yaml" };

const CONTEXT: SpellCheckExecutorContext = {
  projectGraph: { nodes: { a: { data: { root: "projects/a" } } } },
  projectName: "a",
  root: "/workspace",
};

describe(spellCheckExecutor, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  it("runs cspell over the target's own root and passes when it exits zero", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({ status: 0, stderr: "", stdout: "" });

    await expect(spellCheckExecutor(OPTIONS, CONTEXT)).resolves.toStrictEqual({
      success: true,
    });
    expect(captureAsync.mock.lastCall?.[0]).toBe(
      "/workspace/node_modules/.bin/cspell",
    );
    expect(captureAsync.mock.lastCall?.[1]).toContain(
      "projects/a/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs,json,jsonc,json5,css,scss,html,yaml,yml,md,mdx,py,ipynb,sql}",
    );
  });

  it("fails, and prints what cspell printed, when it exits non-zero", async () => {
    expect.hasAssertions();

    captureAsync.mockResolvedValue({
      status: 1,
      stderr: "",
      stdout: "projects/a/x.ts:1:1 - Unknown word (zzz)",
    });

    await expect(spellCheckExecutor(OPTIONS, CONTEXT)).resolves.toStrictEqual({
      success: false,
    });
    expect(process.stdout.write).toHaveBeenCalledWith(
      "projects/a/x.ts:1:1 - Unknown word (zzz)",
    );
  });

  it("refuses a project the graph does not know", async () => {
    expect.hasAssertions();

    await expect(
      spellCheckExecutor(OPTIONS, { ...CONTEXT, projectName: "missing" }),
    ).rejects.toThrow("no project named missing");
  });

  it("refuses a run against no project", async () => {
    expect.hasAssertions();

    await expect(
      spellCheckExecutor(OPTIONS, { ...CONTEXT, projectName: undefined }),
    ).rejects.toThrow("must be run against a project");
  });
});
