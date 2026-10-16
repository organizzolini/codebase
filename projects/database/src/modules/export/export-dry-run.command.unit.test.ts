import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DataSource } from "typeorm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";

/** Nothing listens on port 1, so a connection would be refused at once. */
const SOURCE_URI = `postgresql://fixture_username:${PASSWORD}@127.0.0.1:1/fixture_development`;

describe("export --dry-run", () => {
  let directory: string;
  let file: string;

  /** A dry run exporting `fixture.widgets` to `file`, plus `extra`. */
  const run = async (
    ...extra: readonly string[]
  ): ReturnType<typeof runCliCommandLine> =>
    runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        SOURCE_URI,
        "--table",
        "fixture.widgets",
        "--file",
        file,
        "--dry-run",
        ...extra,
      ],
    });

  beforeAll(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "export-dry-run-unit-"));
    file = path.join(directory, "fixture.dump");
  });

  beforeEach(() => {
    fs.rmSync(file, { force: true });
  });

  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("prints the plan and runs nothing but the version check", async () => {
    const initialize = vi.spyOn(DataSource.prototype, "initialize");
    const spawned = mockProcesses();

    const result = await run("--data");

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output).toContain('database "fixture_development" on 127.0.0.1');
    expect(output).toContain(file);
    expect(output).toContain("Planning to export data of fixture.widgets");
    expect(output).toContain(`Planning to create ${file}`);
    expect(`${output}${result.stderr}`).not.toContain(PASSWORD);
    expect(spawned.map(({ args }) => args)).toStrictEqual([["--version"]]);
    expect(initialize).not.toHaveBeenCalled();
    expect(fs.readdirSync(directory)).toStrictEqual([]);
  });

  it.each([
    [["--data"], "data"],
    [["--ddl"], "DDL"],
    [["--data", "--ddl"], "data and DDL"],
  ])("with %j says it would export %s", async (options, content) => {
    mockProcesses();

    const result = await run(...options);

    expect(result.exitCode).toBe(0);
    expect(result.logs.join("\n")).toContain(
      `Planning to export ${content} of fixture.widgets`,
    );
  });

  it("names a table given twice once, qualified or resolved in --schema", async () => {
    mockProcesses();

    const result = await run(
      "--schema",
      "fixture",
      "--table",
      "widgets",
      "--table",
      "sample.parts",
      "--data",
    );

    const output = result.logs.join("\n");

    expect(result.exitCode).toBe(0);
    expect(output.match(/export data of fixture\.widgets/gu)).toHaveLength(1);
    expect(output).toContain("Planning to export data of sample.parts");
  });

  it("with --overwrite says an existing file would be overwritten, leaving it as it was", async () => {
    fs.writeFileSync(file, "an earlier dump");
    const before = fs.statSync(file).mtimeMs;
    const spawned = mockProcesses();

    const result = await run("--data", "--overwrite");

    expect(result.exitCode).toBe(0);
    expect(result.logs.join("\n")).toContain(`Planning to overwrite ${file}`);
    expect(fs.readFileSync(file, "utf8")).toBe("an earlier dump");
    expect(fs.statSync(file).mtimeMs).toBe(before);
    expect(fs.readdirSync(directory)).toStrictEqual(["fixture.dump"]);
    expect(spawned.map(({ args }) => args)).toStrictEqual([["--version"]]);
  });

  it("still refuses an existing file without --overwrite, as a real export does", async () => {
    fs.writeFileSync(file, "an earlier dump");
    const spawned = mockProcesses();

    const result = await run("--data");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(`${file} already exists`);
    expect(result.logs.join("\n")).not.toContain("Planning");
    expect(spawned).toStrictEqual([]);
    expect(fs.readFileSync(file, "utf8")).toBe("an earlier dump");
  });

  it("fails an incomplete command line, as a real export does", async () => {
    const spawned = mockProcesses();

    const result = await run();

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("--data and/or --ddl is required");
    expect(spawned).toStrictEqual([]);
  });

  it("fails an unqualified --table without --schema, starting no process", async () => {
    const spawned = mockProcesses();

    const result = await run("--data", "--table", "widgets");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("--table widgets names no schema");
    expect(spawned).toStrictEqual([]);
  });
});
