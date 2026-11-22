import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { captureOutput } from "@codebase/testing";

import { FAKE_COMMAND } from "../../../testing/fake-command-line";
import { createFakeWorkspace } from "../../../testing/fake-workspace";

import measureExecutor from "./executor";

import type { FakeWorkspace } from "../../../testing/fake-workspace";
import type { MeasureExecutorContext } from "./executor.types";
import type { CapturedOutput } from "@codebase/testing";

const OPTIONS = {
  check: true,
  command: FAKE_COMMAND,
  config: "codometer.config.ts",
  outputJson: true,
};

describe(measureExecutor, () => {
  let output: CapturedOutput;
  let workspace: FakeWorkspace;

  /** A context for the named project, which the workspace knows as `a` and `bad-b`. */
  function contextFor(projectName: string | undefined): MeasureExecutorContext {
    return {
      projectName,
      projectsConfigurations: {
        projects: {
          a: { root: "packages/a" },
          "bad-b": { root: "packages/bad-b" },
        },
      },
      root: workspace.root,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    output = captureOutput();
    workspace = createFakeWorkspace({
      "packages/a/.keep": "",
      "packages/bad-b/.keep": "",
    });
  });

  afterEach(() => {
    workspace.remove();
  });

  it("passes a project the command line passes", async () => {
    expect.hasAssertions();

    await expect(
      measureExecutor(OPTIONS, contextFor("a")),
    ).resolves.toStrictEqual({ success: true });
  });

  it("fails a project the command line fails, and prints why", async () => {
    expect.hasAssertions();

    await expect(
      measureExecutor(OPTIONS, contextFor("bad-b")),
    ).resolves.toStrictEqual({ success: false });
    expect(output.stdout()).toContain("limit breached");
  });

  it("refuses to run with no project", async () => {
    expect.hasAssertions();

    await expect(
      measureExecutor(OPTIONS, contextFor(undefined)),
    ).rejects.toThrow("must be run against a project");
  });

  it("refuses a project the workspace does not know", async () => {
    expect.hasAssertions();

    await expect(measureExecutor(OPTIONS, contextFor("zzz"))).rejects.toThrow(
      "Unknown project: zzz",
    );
  });
});
