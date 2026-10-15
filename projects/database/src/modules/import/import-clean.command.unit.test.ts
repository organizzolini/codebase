import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import {
  mockProcesses,
  mockStandardInputTerminal,
  processFailure,
} from "../../../testing/mocks";

import type { SpawnedProcess } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";
const TARGET_URI = `postgresql://fixture_username:${PASSWORD}@database.example.com:6543/fixture_development`;

/** `pg_restore --list --verbose` of a dump of `fixture.widgets`. */
const LISTING = [
  "; Selected TOC Entries:",
  "3496; 0 0 ENCODING - ENCODING ",
  "221; 1259 16386 TABLE fixture widgets fixture_username",
  "3490; 0 16386 TABLE DATA fixture widgets fixture_username",
  ";\tdepends on: 221",
  "",
].join("\n");

/** The processes that restored, leaving out the version check and listing. */
function restoresOf(spawned: readonly SpawnedProcess[]): SpawnedProcess[] {
  return spawned.filter(
    ({ args }) => args[0] !== "--version" && args[0] !== "--list",
  );
}

describe("import --clean", () => {
  const setStandardInputTerminal = mockStandardInputTerminal();
  let directory: string;
  let file: string;

  /** A command line that imports `fixture.widgets`' schema, plus `extra`. */
  const argv = (...extra: readonly string[]): string[] => [
    "import",
    "--target-uri",
    TARGET_URI,
    "--table",
    "fixture.widgets",
    "--schema",
    "--file",
    file,
    ...extra,
  ];

  const run = async (
    commandLine: readonly string[],
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({ argv: commandLine });

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "import-clean-unit-"));
    file = path.join(directory, "fixture.dump");
    fs.writeFileSync(file, "a dump");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it.each([
    ["on a terminal", true],
    ["with no terminal", false],
  ])("runs --clean without asking %s", async (_case, isTerminal) => {
    setStandardInputTerminal(isTerminal);
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(argv("--clean"));

    expect(result.exitCode).toBe(0);
    expect(restoresOf(spawned)[0]?.args).toStrictEqual(
      expect.arrayContaining(["--clean", "--if-exists", "--schema-only"]),
    );
  });

  it("adds no clean flags without --clean", async () => {
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(argv());

    expect(result.exitCode).toBe(0);
    expect(restoresOf(spawned)[0]?.args).not.toContain("--clean");
  });

  it("rejects --yes as an unknown option, restoring nothing", async () => {
    const spawned = mockProcesses({ list: { stdout: LISTING } });

    const result = await run(argv("--clean", "--yes"));

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("--yes");
    expect(restoresOf(spawned)).toStrictEqual([]);
  });

  it("says a failed clean restore rolled back", async () => {
    mockProcesses({
      error: processFailure(1),
      list: { stdout: LISTING },
      stderr: "pg_restore: error: cannot drop table widgets\n",
    });

    const result = await run(argv("--clean"));

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("was left unchanged");
  });
});
