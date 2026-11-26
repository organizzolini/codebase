import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { build } from "rolldown";
import { beforeAll, describe, expect, it } from "vitest";

import rolldownConfiguration from "../configuration/rolldown.config";

/** Where the configuration writes the bundle. */
const BUNDLE_DIRECTORY = path.resolve(
  import.meta.dirname,
  "../../../../dist/caelundas-api",
);

/** Packages that must never reach the image: transpilers, tests, linters. */
const DEVELOPMENT_PACKAGES = [
  "@codebase",
  "@swc",
  "@swc-node",
  "@testcontainers",
  "eslint",
  "rolldown",
  "typescript",
  "vitest",
] as const;

describe("caelundas-api bundle", () => {
  let storeEntries: string[];

  beforeAll(async () => {
    await build(rolldownConfiguration);
    storeEntries = readdirSync(
      path.join(BUNDLE_DIRECTORY, "node_modules/.pnpm"),
    );
  }, 120_000);

  it("compiles workspace code to files with decorator metadata", () => {
    const entry = readFileSync(
      path.join(BUNDLE_DIRECTORY, "caelundas-api.js"),
      "utf8",
    );
    const logger = readFileSync(
      path.join(
        BUNDLE_DIRECTORY,
        "projects/common/observability/src/modules/logger/logger.service.js",
      ),
      "utf8",
    );

    expect(entry).not.toMatch(/from "@codebase\//u);
    expect(logger).toContain('"design:paramtypes"');
  });

  it("builds each migration as a file the database module's glob finds", () => {
    const migrations = readdirSync(
      path.join(BUNDLE_DIRECTORY, "projects/caelundas/caelundas-db/migrations"),
    );

    expect(migrations).toHaveLength(1);
    expect(migrations[0]).toMatch(/^\d+-migration\.js$/u);
  });

  it.each(["@nestjs/core", "pg", "pino-pretty", "typeorm"])(
    "installs %s beside the bundle",
    (name) => {
      expect(
        existsSync(
          path.join(BUNDLE_DIRECTORY, "node_modules", name, "package.json"),
        ),
      ).toBe(true);
    },
  );

  it("ships no development or test package", () => {
    const shipped = storeEntries.filter((entry) =>
      DEVELOPMENT_PACKAGES.some((name) =>
        entry.startsWith(`${name.replace("/", "+")}@`),
      ),
    );

    expect(shipped).toStrictEqual([]);
  });
});
