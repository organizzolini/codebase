import { describe, expect, it, vi } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses, processFailure } from "../../../testing/mocks";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";
const SOURCE_URI = `postgresql://fixture_username:${PASSWORD}@database.example.com:6543/fixture_development`;

/**
 * Runs `export` of `tables` from the source through the real runner, with
 * unqualified names resolving in the `fixture` schema.
 */
async function runExport(
  ...tables: string[]
): ReturnType<typeof runCliCommandLine> {
  return runCliCommandLine({
    argv: [
      "export",
      "--source-uri",
      SOURCE_URI,
      "--schema",
      "fixture",
      ...tables.flatMap((table) => ["--table", table]),
      "--data",
      "--file",
      "fixture.dump",
    ],
  });
}

describe("export of a table that does not exist", () => {
  it("names the table and the masked source instead of pg_dump's text", async () => {
    mockProcesses({
      error: processFailure(1),
      stderr: `pg_dump: error: no matching tables were found for pattern "fixture.nope" on ${SOURCE_URI}\n`,
    });

    const result = await runExport("nope");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "No table fixture.nope exists in postgresql://fixture_username:****@database.example.com:6543/fixture_development; check the --table name.",
    );
    expect(result.stderr).not.toContain("pg_dump failed");
    expect(result.stderr).not.toContain(PASSWORD);
  });

  it("names every table pg_dump reported, schema-qualified", async () => {
    mockProcesses({
      error: processFailure(1),
      stderr: [
        'pg_dump: error: no matching tables were found for pattern "fixture.nope"',
        'pg_dump: error: no matching tables were found for pattern "other.gone"',
      ].join("\n"),
    });

    const result = await runExport("nope", "other.gone");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No tables fixture.nope, other.gone exist");
  });

  it("leaves every other pg_dump failure as pg_dump's own masked error", async () => {
    mockProcesses({
      error: processFailure(1),
      stderr: `pg_dump: error: connection to server at "database.example.com" failed: password authentication failed for ${SOURCE_URI}\n`,
    });

    const result = await runExport("widgets");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "pg_dump failed with exit code 1: pg_dump: error: connection to server",
    );
    expect(result.stderr).not.toContain("check the --table name");
    expect(result.stderr).not.toContain(PASSWORD);
  });
});
