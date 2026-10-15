import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { mockProcesses, processFailure } from "../../../testing/mocks";

import { PostgresClientError } from "./postgres-client.constants";
import { PostgresClientService } from "./postgres-client.service";

import type {
  PostgresDumpOptions,
  PostgresUriConnection,
} from "./postgres-client.types";

vi.mock("node:child_process", async () => {
  const { childProcessMock } = await import("../../../testing/mocks");
  return childProcessMock;
});

const CONNECTION: PostgresUriConnection = {
  database: "lexico_development",
  host: "database.example.com",
  password: "hunter2-secret",
  port: 5432,
  username: "lexico_username",
};

const DUMP: PostgresDumpOptions = {
  connection: CONNECTION,
  content: { data: true, schema: true },
  file: "lexico.dump",
  tables: ["lexico.words"],
};

describe(PostgresClientService, () => {
  let service: PostgresClientService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PostgresClientService],
    }).compile();

    service = await module.resolve(PostgresClientService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("dump", () => {
    it("runs pg_dump to a custom-format file for exactly the given tables", async () => {
      const spawned = mockProcesses();

      await service.dump({
        ...DUMP,
        content: { data: true, schema: false },
        file: "/tmp/lexico.dump",
        tables: ["lexico.words", "archive.lexemes"],
      });

      expect(spawned).toStrictEqual([
        expect.objectContaining({
          args: [
            "--format=custom",
            "--file=/tmp/lexico.dump",
            "--no-password",
            "--strict-names",
            "--data-only",
            "--table=lexico.words",
            "--table=archive.lexemes",
          ],
          file: "pg_dump",
        }),
      ]);
    });

    it("passes the credentials through the environment, never the arguments", async () => {
      const spawned = mockProcesses();

      await service.dump(DUMP);

      expect(spawned[0]?.args.join(" ")).not.toContain(CONNECTION.password);
      expect(spawned[0]?.environment).toMatchObject({
        PGDATABASE: "lexico_development",
        PGHOST: "database.example.com",
        PGPASSWORD: CONNECTION.password,
        PGPORT: "5432",
        PGUSER: "lexico_username",
      });
    });

    it("surfaces pg_dump's own error text, masked, with its exit code", async () => {
      mockProcesses({
        error: processFailure(1),
        stderr: `pg_dump: error: connection failed: password "${CONNECTION.password}" rejected\n`,
      });

      const failure = service.dump({
        ...DUMP,
        content: { data: false, schema: true },
      });

      await expect(failure).rejects.toThrow(PostgresClientError);
      await expect(failure).rejects.toThrow(
        'pg_dump failed with exit code 1: pg_dump: error: connection failed: password "****" rejected',
      );
      await expect(failure).rejects.not.toThrow(CONNECTION.password);
    });

    it("explains a pg_dump that could not be started at all", async () => {
      mockProcesses({
        error: processFailure("ENOENT", "spawn pg_dump ENOENT"),
      });

      await expect(service.dump(DUMP)).rejects.toThrow(
        "pg_dump could not be run: spawn pg_dump ENOENT",
      );
    });
  });
});
