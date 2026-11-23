import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { GraphOptionsError } from "./graph-options.constants";
import { GraphOptionsService } from "./graph-options.service";
import { maskedError } from "./graph-options.utilities";

const PASSWORD = "fixture-secret-password";
const SOURCE_URI = `postgresql://fixture_user:${PASSWORD}@localhost:5433/fixture_db`;

describe(GraphOptionsService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(GraphOptionsService);

    expect(instance).toBeInstanceOf(GraphOptionsService);
  });

  describe("plan", () => {
    it("names the connection, schema, entity globs, and table", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      const plan = instance.plan({
        entities: ["src/**/*.entity.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
        table: "closure_tags",
      });

      expect(plan).toStrictEqual({
        connection: {
          database: "fixture_db",
          host: "localhost",
          password: PASSWORD,
          port: 5433,
          schema: "fixture",
          username: "fixture_user",
        },
        entities: ["src/**/*.entity.ts"],
        source: "postgresql://fixture_user:****@localhost:5433/fixture_db",
        table: "closure_tags",
      });
    });

    it("leaves the table undefined when --table is not given", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      const plan = instance.plan({
        entities: ["src/**/*.entity.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(plan.table).toBeUndefined();
    });

    it("reduces a --table qualified with the --schema to its name", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      const plan = instance.plan({
        entities: ["src/**/*.entity.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
        table: "fixture.closure_tags",
      });

      expect(plan.table).toBe("closure_tags");
    });

    it("rejects a --table qualified with another schema", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      expect(() =>
        instance.plan({
          entities: ["src/**/*.entity.ts"],
          schema: "fixture",
          sourceUri: SOURCE_URI,
          table: "sample.closure_tags",
        }),
      ).toThrow(GraphOptionsError);
    });

    it.each([
      ["--source-uri", { entities: ["a.ts"], schema: "fixture" }],
      ["--entities", { schema: "fixture", sourceUri: SOURCE_URI }],
      ["--schema", { entities: ["a.ts"], sourceUri: SOURCE_URI }],
    ])("names %s when it is not given", async (option, options) => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      expect(() => instance.plan(options)).toThrow(`${option} is required`);
    });

    it("never repeats the password of a malformed --source-uri", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      let message = "";
      try {
        instance.plan({
          entities: ["a.ts"],
          schema: "fixture",
          sourceUri: `postgresql://fixture_user:${PASSWORD}@/fixture_db`,
        });
      } catch (error) {
        message = error instanceof Error ? error.message : String(error);
      }

      expect(message).toMatch(/^--source-uri /u);
      expect(message).not.toContain(PASSWORD);
    });
  });

  describe(maskedError, () => {
    it("keeps the error's name and masks the password in its message", () => {
      const failure = new TypeError(
        `could not connect as ${PASSWORD}; retry postgresql://fixture_user:${PASSWORD}@localhost/fixture_db`,
      );

      const masked = maskedError(failure, PASSWORD);

      expect(masked).toBeInstanceOf(Error);
      expect(masked.name).toBe("TypeError");
      expect(masked.message).not.toContain(PASSWORD);
      expect(masked.message).toBe(
        "could not connect as ****; retry postgresql://fixture_user:****@localhost/fixture_db",
      );
    });

    it("masks a thrown value that is not an error", () => {
      expect(maskedError(`refused ${PASSWORD}`, PASSWORD).message).toBe(
        "refused ****",
      );
    });
  });
});
