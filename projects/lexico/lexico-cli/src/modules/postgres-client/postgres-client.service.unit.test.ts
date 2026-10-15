import fs from "node:fs";

import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { mockProcesses, processFailure } from "../../../testing/mocks";

import {
  PostgresClientError,
  PostgresClientToolError,
} from "./postgres-client.constants";
import { PostgresClientService } from "./postgres-client.service";

import type {
  PostgresDumpEntry,
  PostgresDumpOptions,
  PostgresRestoreOptions,
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

/** A dump of two tables' definitions and rows, as `list` reads it. */
const CONTENTS: readonly PostgresDumpEntry[] = [
  { dependencies: [], id: 3496, kind: "header" },
  { dependencies: [], id: 221, kind: "table", table: "lexico.words" },
  { dependencies: [], id: 222, kind: "table", table: "archive.lexemes" },
  { dependencies: [221], id: 3490, kind: "data", table: "lexico.words" },
  { dependencies: [222], id: 3491, kind: "data", table: "archive.lexemes" },
  { dependencies: [221], id: 3334, kind: "other" },
];

const RESTORE: PostgresRestoreOptions = {
  connection: CONNECTION,
  content: { data: true, schema: false },
  contents: CONTENTS,
  file: "/tmp/lexico.dump",
  tables: ["lexico.words"],
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

  describe("ensureTool", () => {
    it("runs --version and accepts major version 18, without credentials", async () => {
      const spawned = mockProcesses({
        version: { stdout: "pg_restore (PostgreSQL) 18.6\n" },
      });

      await expect(service.ensureTool("pg_restore")).resolves.toBeUndefined();

      expect(spawned).toStrictEqual([
        expect.objectContaining({ args: ["--version"], file: "pg_restore" }),
      ]);
      expect(spawned[0]?.environment?.["PGPASSWORD"]).toBeUndefined();
    });

    it("fails a missing binary, naming the setup script", async () => {
      mockProcesses({
        version: { error: processFailure("ENOENT", "spawn pg_dump ENOENT") },
      });

      const failure = service.ensureTool("pg_dump");

      await expect(failure).rejects.toThrow(PostgresClientToolError);
      await expect(failure).rejects.toThrow(
        "pg_dump was not found on your PATH. Install the PostgreSQL 18 client tools by running scripts/local/software/database.sh.",
      );
    });

    it("fails a wrong major version, naming the version found and the setup script", async () => {
      mockProcesses({ version: { stdout: "pg_dump (PostgreSQL) 16.4\n" } });

      await expect(service.ensureTool("pg_dump")).rejects.toThrow(
        "pg_dump is major version 16, but 18 is required. Install the PostgreSQL 18 client tools by running scripts/local/software/database.sh.",
      );
    });

    it("fails a binary that exits non-zero, naming the setup script", async () => {
      mockProcesses({
        version: { error: processFailure(1), stderr: "boom\n" },
      });

      await expect(service.ensureTool("pg_dump")).rejects.toThrow(
        /pg_dump could not report its version: boom\. Install .*database\.sh/u,
      );
    });

    it("fails unexpected --version output, naming the setup script", async () => {
      mockProcesses({ version: { stdout: "something else entirely\n" } });

      await expect(service.ensureTool("pg_dump")).rejects.toThrow(
        /pg_dump reported an unrecognized version: "something else entirely"\. Install .*database\.sh/u,
      );
    });
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

  describe("list", () => {
    it("lists the dump's contents with pg_restore, connecting to nothing", async () => {
      const spawned = mockProcesses({
        list: {
          stdout: [
            "; Selected TOC Entries:",
            "221; 1259 16386 TABLE lexico words lexico_username",
            "3490; 0 16386 TABLE DATA lexico words lexico_username",
            ";\tdepends on: 221",
          ].join("\n"),
        },
      });

      await expect(service.list("/tmp/lexico.dump")).resolves.toStrictEqual([
        { dependencies: [], id: 221, kind: "table", table: "lexico.words" },
        { dependencies: [221], id: 3490, kind: "data", table: "lexico.words" },
      ]);
      expect(spawned).toStrictEqual([
        expect.objectContaining({
          args: ["--list", "--verbose", "/tmp/lexico.dump"],
          file: "pg_restore",
        }),
      ]);
      expect(
        Object.keys(spawned[0]?.environment ?? {}).filter((key) =>
          key.startsWith("PG"),
        ),
      ).toStrictEqual([]);
    });

    it("surfaces pg_restore's own error for a file that is not a dump", async () => {
      mockProcesses({
        list: {
          error: processFailure(1),
          stderr:
            "pg_restore: error: input file does not appear to be a valid archive\n",
        },
      });

      await expect(service.list("notes.txt")).rejects.toThrow(
        "pg_restore failed with exit code 1: pg_restore: error: input file does not appear to be a valid archive",
      );
    });
  });

  describe("restore", () => {
    it("restores only the selected tables' entries in one transaction, credentials in the environment", async () => {
      const spawned = mockProcesses();

      await service.restore(RESTORE);

      expect(spawned).toStrictEqual([
        expect.objectContaining({
          args: [
            "--dbname=lexico_development",
            "--no-password",
            "--single-transaction",
            "--exit-on-error",
            "--no-owner",
            "--no-privileges",
            "--data-only",
            expect.stringMatching(/^--use-list=/u) as unknown,
            "/tmp/lexico.dump",
          ],
          environment: expect.objectContaining({
            PGHOST: "database.example.com",
            PGPASSWORD: CONNECTION.password,
          }) as unknown,
          file: "pg_restore",
          useList: "3496;\n221;\n3490;\n3334;\n",
        }),
      ]);
      expect(spawned[0]?.args.join(" ")).not.toContain(CONNECTION.password);
    });

    it.each([
      [{ data: false, schema: true }, ["--schema-only"]],
      [{ data: true, schema: true }, []],
    ])("maps %o to the pg_restore flags %o", async (content, flags) => {
      const spawned = mockProcesses();

      await service.restore({ ...RESTORE, content });

      expect(spawned[0]?.args.slice(6, -2)).toStrictEqual(flags);
    });

    it("removes the list it wrote, whether the restore succeeds or fails", async () => {
      const spawned = mockProcesses({
        error: processFailure(1),
        stderr: `pg_restore: error: could not connect: password "${CONNECTION.password}" rejected\n`,
      });

      const failure = service.restore(RESTORE);

      await expect(failure).rejects.toThrow(PostgresClientError);
      await expect(failure).rejects.toThrow(
        'pg_restore failed with exit code 1: pg_restore: error: could not connect: password "****" rejected',
      );

      const list = spawned[0]?.args
        .find((argument) => argument.startsWith("--use-list="))
        ?.slice("--use-list=".length);

      expect(list).toBeDefined();
      expect(fs.existsSync(list ?? "")).toBe(false);
    });
  });
});
