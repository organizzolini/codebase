import { DataSource } from "typeorm";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";

import { StandaloneModule } from "../src/standalone.module";

import { runCliCommandLine } from "./command-line-runner";
import {
  INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  LEXICO_DATABASE_TIMEOUT_MILLISECONDS,
  startLexicoDatabase,
} from "./lexico-database";

import type { LexicoDatabase } from "./lexico-database";

describe("lexico database testing helpers", () => {
  let database: LexicoDatabase;

  beforeAll(async () => {
    database = await startLexicoDatabase();
  }, LEXICO_DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await database.close();
  }, INTEGRATION_TEST_TIMEOUT_MILLISECONDS);

  it(
    "seeds a row into the migrated schema and reads it back",
    async () => {
      expect.hasAssertions();

      await database.query("INSERT INTO authors (name, slug) VALUES ($1, $2)", [
        "Vergil",
        "vergil",
      ]);

      const rows = await database.query<{ name: string; slug: string }>(
        "SELECT name, slug FROM lexico.authors WHERE slug = $1",
        ["vergil"],
      );

      expect(rows).toStrictEqual([{ name: "Vergil", slug: "vergil" }]);
    },
    INTEGRATION_TEST_TIMEOUT_MILLISECONDS,
  );

  it("exposes a connection URI that carries the role's password", () => {
    expect.hasAssertions();

    const uri = new URL(database.uri);

    expect(uri.protocol).toBe("postgresql:");
    expect(decodeURIComponent(uri.password)).toBe(database.connection.password);
    expect(database.connection.password).not.toBe("");
  });

  it("runs --help through the real runner and captures its output", async () => {
    expect.hasAssertions();

    const initialize = vi.spyOn(DataSource.prototype, "initialize");
    onTestFinished(() => {
      initialize.mockRestore();
    });

    // 🎯 Root help, because a subcommand's help exits the process itself.
    // rootModule would boot MainModule, and with it the Lexico database
    // connection, for a command line that names no command.
    const result = await runCliCommandLine({
      argv: ["--help"],
      module: StandaloneModule,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("export");
    expect(initialize).not.toHaveBeenCalled();
  });

  it("reports a non-zero exit code and message for an unknown command", async () => {
    expect.hasAssertions();

    const initialize = vi.spyOn(DataSource.prototype, "initialize");
    onTestFinished(() => {
      initialize.mockRestore();
    });

    // 🎯 rootModule would boot MainModule, and with it the Lexico database
    // connection, for a command it does not recognize.
    const result = await runCliCommandLine({
      argv: ["no-such-command"],
      module: StandaloneModule,
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("no-such-command");
    expect(initialize).not.toHaveBeenCalled();
  });
});
