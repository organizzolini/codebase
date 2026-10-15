import { describe, expect, it } from "vitest";

import { PostgresUriError } from "./postgres-client.constants";
import {
  maskPostgresCredentials,
  parsePostgresMajorVersion,
  parsePostgresUri,
  postgresContentFlags,
  postgresProcessEnvironment,
  qualifyTableName,
} from "./postgres-client.utilities";

import type { PostgresUriConnection } from "./postgres-client.types";

const CONNECTION: PostgresUriConnection = {
  database: "lexico_development",
  host: "database.example.com",
  password: "s3cr3t:p@ss",
  port: 6543,
  username: "lexico_username",
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
          "postgresql://lexico_username:s3cr3t%3Ap%40ss@database.example.com:6543/lexico_development",
          "--source-uri",
        ),
      ).toStrictEqual(CONNECTION);
    });

    it("accepts the postgres scheme and defaults the port", () => {
      expect(
        parsePostgresUri("postgres://lexico@localhost/lexico", "--source-uri"),
      ).toStrictEqual({
        database: "lexico",
        host: "localhost",
        password: "",
        port: 5432,
        username: "lexico",
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
        "postgresql://user@localhost/database?application_name=lexico",
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
        HOME: "/home/lexico",
        PGPASSFILE: "/home/lexico/credentials",
        PGSERVICE: "production",
      });

      expect(environment).toStrictEqual({
        HOME: "/home/lexico",
        PGDATABASE: "lexico_development",
        PGHOST: "database.example.com",
        PGPASSWORD: "s3cr3t:p@ss",
        PGPORT: "6543",
        PGUSER: "lexico_username",
      });
    });

    it("leaves PGPASSWORD unset when the URI carries no password", () => {
      const environment = postgresProcessEnvironment(
        { ...CONNECTION, password: "" },
        { PGPASSWORD: "inherited" },
      );

      expect(environment).not.toHaveProperty("PGPASSWORD");
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

  describe(qualifyTableName, () => {
    it("resolves an unqualified name in the schema", () => {
      expect(qualifyTableName("words", "lexico")).toBe("lexico.words");
    });

    it("uses a schema-qualified name as written", () => {
      expect(qualifyTableName("archive.words", "lexico")).toBe("archive.words");
    });
  });

  describe(postgresContentFlags, () => {
    it.each([
      [{ data: true, schema: false }, ["--data-only"]],
      [{ data: false, schema: true }, ["--schema-only"]],
      [{ data: true, schema: true }, []],
    ])("maps %o to %o", (content, flags) => {
      expect(postgresContentFlags(content)).toStrictEqual(flags);
    });

    it("refuses to choose for a caller that selected neither", () => {
      expect(() =>
        postgresContentFlags({ data: false, schema: false }),
      ).toThrow("neither data nor schema");
    });
  });
});
