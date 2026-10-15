import { afterAll, beforeAll, describe, expect, it } from "vitest";

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

    const result = await runCliCommandLine({
      argv: ["--help"],
      env: database.environment,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("clear");
  });

  it("reports a non-zero exit code and message for an unknown command", async () => {
    expect.hasAssertions();

    const result = await runCliCommandLine({
      argv: ["no-such-command"],
      env: database.environment,
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("no-such-command");
  });
});
