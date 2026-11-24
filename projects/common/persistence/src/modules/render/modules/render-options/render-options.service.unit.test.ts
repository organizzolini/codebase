import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { RenderOptionsError } from "./render-options.constants";
import { RenderOptionsService } from "./render-options.service";
import { maskedError } from "./render-options.utilities";

const PASSWORD = "fixture-secret-password";
const SOURCE_URI = `postgresql://fixture_user:${PASSWORD}@localhost:5433/fixture_db`;

describe(RenderOptionsService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(RenderOptionsService);

    expect(instance).toBeInstanceOf(RenderOptionsService);
  });

  describe("plan", () => {
    it("names the connection, schema, entity globs, and table", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

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
        diagram: "flowchart",
        entities: ["src/**/*.entity.ts"],
        fields: { icon: "icon", note: "note", order: "order" },
        filters: [],
        outputs: { json: undefined, markdown: undefined, overwrite: false },
        paging: undefined,
        sorts: [],
        source: "postgresql://fixture_user:****@localhost:5433/fixture_db",
        table: "closure_tags",
        truncateBreadth: undefined,
        truncateDepth: undefined,
      });
    });

    it("plans the diagram --diagram names, a flowchart when it is left out", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);
      const base = {
        entities: ["a.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
      };

      expect(instance.plan(base).diagram).toBe("flowchart");
      expect(instance.plan({ ...base, diagram: "filetree" }).diagram).toBe(
        "filetree",
      );
    });

    it("resolves the output flags into the plan's output files", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);
      const json = path.join(os.tmpdir(), "render-options-plan.json");

      const plan = instance.plan({
        entities: ["a.ts"],
        outputJson: json,
        outputMarkdown: path.join(os.tmpdir(), "render-options-plan.md"),
        overwrite: true,
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(plan.outputs).toStrictEqual({
        json,
        markdown: path.join(os.tmpdir(), "render-options-plan.md"),
        overwrite: true,
      });
    });

    it("parses each --filter and --sort in the order given, rejecting bad syntax", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

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

    it("reads --truncate-depth and --truncate-breadth as positive integers", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

      const plan = instance.plan({
        entities: ["a.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
        truncateBreadth: "12",
        truncateDepth: "3",
      });

      expect(plan.truncateBreadth).toBe(12);
      expect(plan.truncateDepth).toBe(3);
    });

    it.each([
      ["--truncate-depth", "truncateDepth"],
      ["--truncate-breadth", "truncateBreadth"],
    ])(
      "rejects a %s that is not a positive integer, naming the value",
      async (flag, key) => {
        const { instance } = await buildTestingModule(RenderOptionsService);

        for (const value of ["0", "-2", "1.5", "2x", "abc", ""]) {
          expect(() =>
            instance.plan({
              entities: ["a.ts"],
              [key]: key === "page" ? [value] : value,
              schema: "fixture",
              sourceUri: SOURCE_URI,
            }),
          ).toThrow(
            `${flag} must be a positive integer, e.g. ${flag} 3; got "${value}"`,
          );
        }
      },
    );

    it("reads --page and --limit as a paging of root nodes, every page when --page is left out", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

      const paged = instance.plan({
        entities: ["a.ts"],
        limit: "20",
        page: ["3", "1", "3"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });
      const firstPage = instance.plan({
        entities: ["a.ts"],
        limit: "5",
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(paged.paging).toStrictEqual({
        all: false,
        limit: 20,
        page: 3,
        pages: [3, 1],
      });
      expect(firstPage.paging).toStrictEqual({
        all: true,
        limit: 5,
        page: 1,
        pages: [],
      });
    });

    it("draws every root when neither --page nor --limit is given", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

      const plan = instance.plan({
        entities: ["a.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(plan.paging).toBeUndefined();
    });

    it("rejects --page without --limit, naming both flags", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

      expect(() =>
        instance.plan({
          entities: ["a.ts"],
          page: ["2"],
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
        const { instance } = await buildTestingModule(RenderOptionsService);

        for (const value of ["0", "-1", "2.5", "3x", "one", ""]) {
          expect(() =>
            instance.plan({
              entities: ["a.ts"],
              [key]: key === "page" ? [value] : value,
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
      const { instance } = await buildTestingModule(RenderOptionsService);

      const plan = instance.plan({
        entities: ["src/**/*.entity.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
      });

      expect(plan.table).toBeUndefined();
    });

    it("reduces a --table qualified with the --schema to its name", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

      const plan = instance.plan({
        entities: ["src/**/*.entity.ts"],
        schema: "fixture",
        sourceUri: SOURCE_URI,
        table: "fixture.closure_tags",
      });

      expect(plan.table).toBe("closure_tags");
    });

    it("rejects a --table qualified with another schema", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

      expect(() =>
        instance.plan({
          entities: ["src/**/*.entity.ts"],
          schema: "fixture",
          sourceUri: SOURCE_URI,
          table: "sample.closure_tags",
        }),
      ).toThrow(RenderOptionsError);
    });

    it.each([
      ["--source-uri", { entities: ["a.ts"], schema: "fixture" }],
      ["--entities", { schema: "fixture", sourceUri: SOURCE_URI }],
      ["--schema", { entities: ["a.ts"], sourceUri: SOURCE_URI }],
    ])("names %s when it is not given", async (option, options) => {
      const { instance } = await buildTestingModule(RenderOptionsService);

      expect(() => instance.plan(options)).toThrow(`${option} is required`);
    });

    it("never repeats the password of a malformed --source-uri", async () => {
      const { instance } = await buildTestingModule(RenderOptionsService);

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
