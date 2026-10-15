import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { INTEGRATION_TEST_TIMEOUT_MILLISECONDS } from "../../../testing/fixture-database";

// 🎯 The real execFile, wrapped so each test can see whether any client tool
// was started at all.
vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<{ execFile: typeof execFile }>();
  return { ...actual, execFile: vi.fn<typeof execFile>(actual.execFile) };
});

/** Nothing listens on port 1, so any connection attempt would fail loudly. */
const UNREACHABLE_SOURCE_URI =
  "postgresql://fixture_username:hunter2-secret@127.0.0.1:1/fixture_development";

describe("export with missing arguments", () => {
  let directory: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "fixture-arguments-"));
    vi.mocked(execFile).mockClear();
    return () => {
      fs.rmSync(directory, { force: true, recursive: true });
    };
  });

  async function runExport(
    argv: readonly string[],
  ): ReturnType<typeof runCliCommandLine> {
    return runCliCommandLine({
      argv: ["export", "--schema", "fixture", ...argv],
    });
  }

  it.each([
    [
      "no --source-uri",
      ["--table", "widgets", "--data"],
      "--source-uri is required",
    ],
    ["no --table", ["--source-uri", "<uri>", "--data"], "--table is required"],
    [
      "neither --data nor --ddl",
      ["--source-uri", "<uri>", "--table", "widgets"],
      "--data and/or --ddl is required",
    ],
  ])(
    "fails fast with %s, starting no process and writing no file",
    async (_case, argv, message) => {
      expect.hasAssertions();

      const file = path.join(directory, "never.dump");

      const result = await runExport([
        ...argv.map((value) =>
          value === "<uri>" ? UNREACHABLE_SOURCE_URI : value,
        ),
        "--file",
        file,
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(message);
      expect(vi.mocked(execFile)).not.toHaveBeenCalled();
      expect(fs.existsSync(file)).toBe(false);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it(
    "fails fast with no --file, starting no process",
    async () => {
      expect.hasAssertions();

      const result = await runExport([
        "--source-uri",
        UNREACHABLE_SOURCE_URI,
        "--table",
        "widgets",
        "--data",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("--file is required");
      expect(vi.mocked(execFile)).not.toHaveBeenCalled();
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );
});
