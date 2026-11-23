import os from "node:os";
import path from "node:path";

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
        filters: [],
        maximumBreadth: undefined,
        maximumDepth: undefined,
        outputs: { json: undefined, markdown: undefined, overwrite: false },
        paging: undefined,
        sorts: [],
        source: "postgresql://fixture_user:****@localhost:5433/fixture_db",
        table: "closure_tags",
      });
    });

    it("resolves the output flags into the plan's output files", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);
      const json = path.join(os.tmpdir(), "graph-options-plan.json");

      const plan = instance.plan({
        entities: ["a.ts"],
        outputJson: json,
        outputMarkdown: path.join(os.tmpdir(), "graph-options-plan.md"),
        overwrite: true,
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(plan.outputs).toStrictEqual({
        json,
        markdown: path.join(os.tmpdir(), "graph-options-plan.md"),
        overwrite: true,
      });
    });

    it("parses each --filter and --sort in the order given, rejecting bad syntax", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      const plan = instance.plan({
        entities: ["a.ts"],
        filter: ["name~=Inbox", "id>4"],
        schema: "fixture",
        sort: ["name:desc", "id"],
        sourceUri: SOURCE_URI,
      });

      expect(
        plan.filters.map(({ column, operator }) => `${column}${operator}`),
      ).toStrictEqual(["name~=", "id>"]);
      expect(
        plan.sorts.map(({ column, direction }) => `${column}:${direction}`),
      ).toStrictEqual(["name:desc", "id:asc"]);
      expect(() =>
        instance.plan({
          entities: ["a.ts"],
          schema: "fixture",
          sort: ["name:up"],
          sourceUri: SOURCE_URI,
        }),
      ).toThrow('--sort "name:up" must be column, column:asc, or column:desc');
    });

    it("reads --max-depth and --max-breadth as positive integers", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      const plan = instance.plan({
        entities: ["a.ts"],
        maxBreadth: "12",
        maxDepth: "3",
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(plan.maximumBreadth).toBe(12);
      expect(plan.maximumDepth).toBe(3);
    });

    it.each([
      ["--max-depth", "maxDepth"],
      ["--max-breadth", "maxBreadth"],
    ])(
      "rejects a %s that is not a positive integer, naming the value",
      async (flag, key) => {
        const { instance } = await buildTestingModule(GraphOptionsService);

        for (const value of ["0", "-2", "1.5", "2x", "abc", ""]) {
          expect(() =>
            instance.plan({
              entities: ["a.ts"],
              [key]: value,
              schema: "fixture",
              sourceUri: SOURCE_URI,
            }),
          ).toThrow(
            `${flag} must be a positive integer, e.g. ${flag} 3; got "${value}"`,
          );
        }
      },
    );

    it("reads --page and --limit as a paging of root nodes, --page defaulting to 1", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      const paged = instance.plan({
        entities: ["a.ts"],
        limit: "20",
        page: "3",
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });
      const firstPage = instance.plan({
        entities: ["a.ts"],
        limit: "5",
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(paged.paging).toStrictEqual({ limit: 20, page: 3 });
      expect(firstPage.paging).toStrictEqual({ limit: 5, page: 1 });
    });

    it("draws every root when neither --page nor --limit is given", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      const plan = instance.plan({
        entities: ["a.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(plan.paging).toBeUndefined();
    });

    it("rejects --page without --limit, naming both flags", async () => {
      const { instance } = await buildTestingModule(GraphOptionsService);

      expect(() =>
        instance.plan({
          entities: ["a.ts"],
          page: "2",
          schema: "fixture",
          sourceUri: SOURCE_URI,
        }),
      ).toThrow(
        "--page needs --limit: name how many roots a page holds, e.g. --page 2 --limit 20",
      );
    });

    it.each([
      ["--page", "page"],
      ["--limit", "limit"],
    ])(
      "rejects a %s that is not a positive integer, naming the value",
      async (flag, key) => {
        const { instance } = await buildTestingModule(GraphOptionsService);

        for (const value of ["0", "-1", "2.5", "3x", "one", ""]) {
          expect(() =>
            instance.plan({
              entities: ["a.ts"],
              [key]: value,
              schema: "fixture",
              sourceUri: SOURCE_URI,
            }),
          ).toThrow(
            `${flag} must be a positive integer, e.g. ${flag} 3; got "${value}"`,
          );
        }
      },
    );

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
