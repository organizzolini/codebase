import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { TreeService } from "./tree.service";

const files = [
  "README.md",
  "package.json",
  "src/index.ts",
  "src/modules/alpha/alpha.service.ts",
  "src/modules/alpha/alpha.types.ts",
  "src/modules/alpha/modules/beta/beta.service.ts",
  "src/modules/database/migrations/1-migration.ts",
  "src/modules/database/migrations/2-migration.ts",
  "src/modules/database/migrations/3-migration.ts",
];

describe(TreeService, () => {
  let service: TreeService;

  beforeAll(async () => {
    const { instance } = await buildTestingModule(TreeService);

    service = instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(TreeService);

    expect(instance).toBeInstanceOf(TreeService);
  });

  describe("measureBreadth", () => {
    it("counts files and folders alike, naming the root as a dot", () => {
      expect(
        service.measureBreadth({ exclude: [], files, maximum: 2 }),
      ).toStrictEqual([
        { directory: ".", measured: 3 },
        { directory: "src/modules/alpha", measured: 3 },
        { directory: "src/modules/database/migrations", measured: 3 },
      ]);
    });

    it("exempts an excluded directory and its descendants", () => {
      expect(
        service.measureBreadth({
          exclude: ["**/migrations", "src/modules/alpha"],
          files,
          maximum: 2,
        }),
      ).toStrictEqual([{ directory: ".", measured: 3 }]);
    });

    it("reports nothing for a tree within its ceiling", () => {
      expect(
        service.measureBreadth({ exclude: [], files, maximum: 3 }),
      ).toStrictEqual([]);
    });
  });

  describe("measureDepth", () => {
    it("reports each shallowest breach once, measured by its deepest folder", () => {
      expect(
        service.measureDepth({ exclude: [], files, maximum: 2 }),
      ).toStrictEqual([
        { directory: "src/modules/alpha", measured: 5 },
        { directory: "src/modules/database", measured: 4 },
      ]);
    });

    it("measures without the folders an exclusion exempts", () => {
      expect(
        service.measureDepth({
          exclude: ["**/migrations", "**/alpha/modules"],
          files,
          maximum: 2,
        }),
      ).toStrictEqual([
        { directory: "src/modules/alpha", measured: 3 },
        { directory: "src/modules/database", measured: 3 },
      ]);
    });

    it("judges the root's own files at depth zero", () => {
      expect(
        service.measureDepth({ exclude: [], files: ["README.md"], maximum: 0 }),
      ).toStrictEqual([]);
    });
  });
});
