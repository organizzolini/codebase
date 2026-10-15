import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { describe, expect, it, vi } from "vitest";

import { LoggerModule } from "@codebase/logging";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { mockProcesses, processFailure } from "../../../testing/mocks";
import { environmentSchema } from "../../constants";

import { ExportModule } from "./export.module";

import type { DynamicModule } from "@nestjs/common";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const PASSWORD = "hunter2-secret";
const SOURCE_URI = `postgresql://lexico_username:${PASSWORD}@database.example.com:6543/lexico_development`;

/** Holds whichever configuration `exportTestModule` was last built with. */
@Module({})
class ExportTestModule {}

/** The export command on its own, with no database connection at start-up. */
function exportTestModule(): DynamicModule {
  return {
    imports: [
      ConfigModule.forRoot({
        ignoreEnvFile: true,
        isGlobal: true,
        validate: (config: Record<string, unknown>) =>
          environmentSchema.parse(config),
      }),
      LoggerModule,
      ExportModule,
    ],
    module: ExportTestModule,
  };
}

/** Runs `export` of `tables` from the source through the real runner. */
async function runExport(
  ...tables: string[]
): ReturnType<typeof runCliCommandLine> {
  vi.stubEnv("LEXICO_POSTGRES_SCHEMA", undefined);
  try {
    return await runCliCommandLine({
      argv: [
        "export",
        "--source-uri",
        SOURCE_URI,
        ...tables.flatMap((table) => ["--table", table]),
        "--data",
        "--file",
        "lexico.dump",
      ],
      module: exportTestModule(),
    });
  } finally {
    vi.unstubAllEnvs();
  }
}

describe("export of a table that does not exist", () => {
  it("names the table and the masked source instead of pg_dump's text", async () => {
    mockProcesses({
      error: processFailure(1),
      stderr: `pg_dump: error: no matching tables were found for pattern "lexico.nope" on ${SOURCE_URI}\n`,
    });

    const result = await runExport("nope");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "No table lexico.nope exists in postgresql://lexico_username:****@database.example.com:6543/lexico_development; check the --table name.",
    );
    expect(result.stderr).not.toContain("pg_dump failed");
    expect(result.stderr).not.toContain(PASSWORD);
  });

  it("names every table pg_dump reported, schema-qualified", async () => {
    mockProcesses({
      error: processFailure(1),
      stderr: [
        'pg_dump: error: no matching tables were found for pattern "lexico.nope"',
        'pg_dump: error: no matching tables were found for pattern "other.gone"',
      ].join("\n"),
    });

    const result = await runExport("nope", "other.gone");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No tables lexico.nope, other.gone exist");
  });

  it("leaves every other pg_dump failure as pg_dump's own masked error", async () => {
    mockProcesses({
      error: processFailure(1),
      stderr: `pg_dump: error: connection to server at "database.example.com" failed: password authentication failed for ${SOURCE_URI}\n`,
    });

    const result = await runExport("words");

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "pg_dump failed with exit code 1: pg_dump: error: connection to server",
    );
    expect(result.stderr).not.toContain("check the --table name");
    expect(result.stderr).not.toContain(PASSWORD);
  });
});
