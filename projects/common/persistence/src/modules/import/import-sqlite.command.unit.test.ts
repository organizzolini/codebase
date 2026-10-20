import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const TARGET_URI =
  "postgresql://fixture_username:hunter2-secret@127.0.0.1:1/fixture_development";

describe("import --sqlite", () => {
  let directory: string;
  let file: string;

  /** Runs `import` of `fixture.widgets` from `file`, plus `extra`. */
  const run = async (
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({
      argv: [
        "import",
        "--target-uri",
        TARGET_URI,
        "--table",
        "fixture.widgets",
        "--data",
        "--file",
        file,
        ...extra,
      ],
    });

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-sqlite-unit-"));
    file = path.join(directory, "fixture.sqlite");
    fs.writeFileSync(file, "a SQLite file");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it.each([
    ["an import", ["--sqlite"]],
    ["a dry run", ["--sqlite", "--dry-run"]],
    ["a --clean import", ["--sqlite", "--clean"]],
  ])(
    "rejects --sqlite on %s, naming the option and starting nothing",
    async (_case, extra) => {
      const spawned = mockProcesses();
      const initialize = vi.spyOn(DataSource.prototype, "initialize");

      const result = await run(...extra);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("--sqlite is not supported by import");
      expect(result.stderr).toContain("export");
      expect(spawned).toStrictEqual([]);
      expect(initialize).not.toHaveBeenCalled();
      expect(fs.readFileSync(file, "utf8")).toBe("a SQLite file");
    },
  );

  it("rejects --sqlite before it checks any other option", async () => {
    const spawned = mockProcesses();

    const result = await runCliCommandLine({ argv: ["import", "--sqlite"] });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("--sqlite is not supported by import");
    expect(spawned).toStrictEqual([]);
  });
});
