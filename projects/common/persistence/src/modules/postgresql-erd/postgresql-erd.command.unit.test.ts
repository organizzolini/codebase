import { describe, expect, it } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { runCliCommandLine } from "../../../testing/command-line-runner";

import { PostgresqlErdCommand } from "./postgresql-erd.command";

describe(PostgresqlErdCommand, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PostgresqlErdCommand);

    expect(instance).toBeInstanceOf(PostgresqlErdCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(PostgresqlErdCommand);
  });

  describe("validates options before reading entities", () => {
    it("rejects a missing --entities", async () => {
      const result = await runCliCommandLine({
        argv: ["postgresql-erd", "--output-json", "erd.json"],
      });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("--entities is required");
    });

    it("rejects a missing output option before reading entity globs", async () => {
      const result = await runCliCommandLine({
        argv: [
          "postgresql-erd",
          "--entities",
          "testing/fixtures/postgresql-erd/missing.entity.ts",
        ],
      });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "--output-json and/or --output-markdown is required",
      );
      expect(result.stderr).not.toContain("No files matched entity glob");
    });
  });
});
