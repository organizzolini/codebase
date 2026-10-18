import { describe, expect, it } from "vitest";

import {
  PostgresTableNameError,
  PostgresUriError,
} from "./postgresql-utilities.constants";
import {
  describePostgresContent,
  maskPostgresCredentials,
  parsePostgresMajorVersion,
  parsePostgresUri,
  postgresContentFlags,
  postgresProcessEnvironment,
  qualifyTableNames,
} from "./postgresql-utilities.utilities";

import type { PostgresUriConnection } from "./postgresql-utilities.types";

const CONNECTION: PostgresUriConnection = {
  database: "fixture_development",
  host: "database.example.com",
  password: "s3cr3t:p@ss",
  port: 6543,
  username: "fixture_username",
};

describe("postgres-client utilities", () => {
  describe(parsePostgresMajorVersion, () => {
    it.each([
      ["pg_dump (PostgreSQL) 18.6", 18],
      ["pg_restore (PostgreSQL) 18.0\n", 18],
      ["pg_dump (PostgreSQL) 18beta1", 18],
      ["pg_dump (PostgreSQL) 17.6", 17],
      ["pg_dump (PostgreSQL) 16.4 (Ubuntu 16.4-1.pgdg22.04+1)", 16],
    ])("reads the major version from %j", (output, major) => {
      expect(parsePostgresMajorVersion(output)).toBe(major);
    });

    it.each(["", "   \n", "command not found", "pg_dump (PostgreSQL) dev"])(
      "reads nothing from unexpected output %j",
      (output) => {
        expect(parsePostgresMajorVersion(output)).toBeUndefined();
      },
    );
  });

  describe(parsePostgresUri, () => {
    it("parses every part of a postgresql URI, decoding its credentials", () => {
      expect(
        parsePostgresUri(
          "postgresql://fixture_username:s3cr3t%3Ap%40ss@database.example.com:6543/fixture_development",
          "--source-uri",
        ),
      ).toStrictEqual(CONNECTION);
    });

    it("accepts the postgres scheme and defaults the port", () => {
      expect(
        parsePostgresUri(
          "postgres://fixture@localhost/fixture",
          "--source-uri",
        ),
      ).toStrictEqual({
        database: "fixture",
        host: "localhost",
        password: "",
        port: 5432,
        username: "fixture",
      });
    });

    it.each([
      ["an invalid string", "not a uri", "is not a valid URI"],
      [
        "another scheme",
        "mysql://user:password@localhost:3306/database",
        "must start with postgresql:// or postgres://",
      ],
      ["no host", "postgresql:///database", "must name a host"],
      [
        "no username",
        "postgresql://localhost:5432/database",
        "must name a user",
      ],
      [
        "no database",
        "postgresql://user:password@localhost:5432",
        "must name a database",
      ],
      [
        "no database after the slash",
        "postgresql://user:password@localhost/",
        "must name a database",
      ],
      [
        "query parameters",
        "postgresql://user@localhost/database?application_name=fixture",
        "must not carry query parameters",
      ],
      [
        "a malformed percent-encoding",
        "postgresql://user:password%zz@localhost/database",
        "has a malformed percent-encoding",
      ],
    ])(
      "rejects %s, naming the option but never echoing the URI",
      (_case, uri, reason) => {
        expect(() => parsePostgresUri(uri, "--target-uri")).toThrow(
          new PostgresUriError("--target-uri", reason),
        );
        expect(() => parsePostgresUri(uri, "--target-uri")).toThrow(
          `--target-uri ${reason}`,
        );
        expect(() => parsePostgresUri(uri, "--target-uri")).not.toThrow(
          /password/u,
        );
      },
    );
  });

  describe(postgresProcessEnvironment, () => {
    it("hands the connection over as PG* variables, dropping inherited ones", () => {
      const environment = postgresProcessEnvironment(CONNECTION, {
        HOME: "/home/fixture",
        PGPASSFILE: "/home/fixture/credentials",
        PGSERVICE: "production",
      });

      expect(environment).toStrictEqual({
        HOME: "/home/fixture",
        PGDATABASE: "fixture_development",
        PGHOST: "database.example.com",
        PGPASSWORD: "s3cr3t:p@ss",
        PGPORT: "6543",
        PGUSER: "fixture_username",
      });
    });

    it("leaves PGPASSWORD unset when the URI carries no password", () => {
      const environment = postgresProcessEnvironment(
        { ...CONNECTION, password: "" },
        { PGPASSWORD: "inherited" },
      );

      expect(environment).not.toHaveProperty("PGPASSWORD");
    });

    it("hands over no connection at all when there is none", () => {
      expect(
        postgresProcessEnvironment(undefined, {
          HOME: "/home/fixture",
          PGPASSWORD: "inherited",
        }),
      ).toStrictEqual({ HOME: "/home/fixture" });
    });

    it("reads the current process environment by default", () => {
      expect(postgresProcessEnvironment(CONNECTION)).toMatchObject({
        PGHOST: "database.example.com",
      });
    });
  });

  describe(maskPostgresCredentials, () => {
    it("masks the password of every URI in the text", () => {
      expect(
        maskPostgresCredentials(
          "from postgresql://user:one@host/a to postgres://other:two%40x@host/b",
        ),
      ).toBe(
        "from postgresql://user:****@host/a to postgres://other:****@host/b",
      );
    });

    it("masks a known password wherever it appears", () => {
      expect(
        maskPostgresCredentials(
          'FATAL: password "s3cr3t:p@ss" rejected; s3cr3t:p@ss again',
          CONNECTION.password,
        ),
      ).toBe('FATAL: password "****" rejected; **** again');
    });

    it("leaves text without credentials unchanged", () => {
      expect(
        maskPostgresCredentials("postgresql://user@host/database", ""),
      ).toBe("postgresql://user@host/database");
    });
  });

  describe(qualifyTableNames, () => {
    it("resolves each unqualified name in the schema", () => {
      expect(qualifyTableNames(["widgets", "parts"], "fixture")).toStrictEqual([
        "fixture.widgets",
        "fixture.parts",
      ]);
    });

    it("uses a schema-qualified name as written, even with a schema", () => {
      expect(
        qualifyTableNames(["sample.widgets", "widgets"], "fixture"),
      ).toStrictEqual(["sample.widgets", "fixture.widgets"]);
    });

    it("needs no schema when every name is schema-qualified", () => {
      expect(
        qualifyTableNames(["fixture.widgets", "sample.parts"], undefined),
      ).toStrictEqual(["fixture.widgets", "sample.parts"]);
    });

    it.each([undefined, ""])(
      "names the one unqualified table to fix when the schema is %j",
      (schema) => {
        expect(() =>
          qualifyTableNames(["fixture.widgets", "parts"], schema),
        ).toThrow(new PostgresTableNameError(["parts"]));
        expect(() =>
          qualifyTableNames(["fixture.widgets", "parts"], schema),
        ).toThrow(
          "--table parts names no schema: qualify it as schema.table, or pass --schema <name> to resolve unqualified names in that schema",
        );
      },
    );

    it("names every unqualified table at once", () => {
      expect(() => qualifyTableNames(["widgets", "parts"], undefined)).toThrow(
        "--table widgets, parts name no schema: qualify them as schema.table, or pass --schema <name> to resolve unqualified names in that schema",
      );
    });
  });

  describe(describePostgresContent, () => {
    it.each([
      [{ data: true, ddl: false }, "data"],
      [{ data: false, ddl: true }, "DDL"],
      [{ data: true, ddl: true }, "data and DDL"],
    ])("names %o as %j", (content, name) => {
      expect(describePostgresContent(content)).toBe(name);
    });
  });

  describe(postgresContentFlags, () => {
    it.each([
      [{ data: true, ddl: false }, ["--data-only"]],
      [{ data: false, ddl: true }, ["--schema-only"]],
      [{ data: true, ddl: true }, []],
    ])("maps %o to %o", (content, flags) => {
      expect(postgresContentFlags(content)).toStrictEqual(flags);
    });

    it("refuses to choose for a caller that selected neither", () => {
      expect(() => postgresContentFlags({ data: false, ddl: false })).toThrow(
        "neither data nor DDL",
      );
    });
  });
});
