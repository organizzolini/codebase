import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses } from "../../../testing/mocks";

import type * as ExportConstants from "./export.constants";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

/** The plan with one line appended that breaks the logging convention. */
vi.mock("./export.constants", async (importOriginal) => {
  const original = await importOriginal<typeof ExportConstants>();
  return {
    ...original,
    dryRunMessages: (
      ...args: Parameters<typeof original.dryRunMessages>
    ): string[] => [
      ...original.dryRunMessages(...args),
      "🔍 Dry run: nothing was changed",
    ],
  };
});

describe("export logging convention", () => {
  let directory: string;

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "export-convention-"));
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("fails a run whose log message breaks the convention, as the shipped command line does", async () => {
    mockProcesses();

    const result = await runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        "postgresql://fixture_username@127.0.0.1:1/fixture_development",
        "--table",
        "fixture.widgets",
        "--data",
        "--file",
        path.join(directory, "fixture.dump"),
        "--dry-run",
      ],
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      'Log message must begin with a verb in present progressive or past tense, got "Dry"',
    );
  });
});
