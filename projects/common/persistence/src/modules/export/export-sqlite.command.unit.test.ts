import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";

/** Nothing listens on port 1, so a connection is refused at once. */
const SOURCE_URI = `postgresql://fixture_username:${PASSWORD}@127.0.0.1:1/fixture_development`;

describe("export --sqlite of a source that cannot be reached", () => {
  let directory: string;
  let file: string;

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "export-sqlite-unit-"));
    file = path.join(directory, "fixture.sqlite");
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("fails without a password in the message, starts no client tool, and leaves no file", async () => {
    const spawned = mockProcesses();

    const result = await runCliCommandLine({
      argv: [
        "export",
        "--sqlite",
        "--source-uri",
        SOURCE_URI,
        "--table",
        "fixture.widgets",
        "--data",
        "--file",
        file,
      ],
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).not.toBe("");
    expect(`${result.stderr}${result.logs.join("\n")}`).not.toContain(PASSWORD);
    expect(spawned).toStrictEqual([]);
    expect(fs.readdirSync(directory)).toStrictEqual([]);
  });
});
