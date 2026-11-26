import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { build } from "rolldown";
import { beforeAll, describe, expect, it } from "vitest";

import rolldownConfiguration from "../configuration/rolldown.config";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../..");

/** Where the configuration writes the build. */
const BUNDLE_DIRECTORY = path.join(WORKSPACE_ROOT, "dist/caelundas-api");

/** Shared packages compiled in, whose dependencies the image carries. */
const SHARED_PACKAGES = [
  "projects/common/observability",
  "projects/common/persistence",
  "projects/caelundas/caelundas-db",
] as const;

/** Store ids that must never reach the image: transpilers, tests, linters, bundlers. */
const DEVELOPMENT_STORE_PREFIXES = [
  "@codebase+",
  "@fig+complete-commander@",
  "@golevelup+ts-vitest@",
  "@nestjs+testing@",
  "@oxc-project+",
  "@swc+",
  "@swc-node+",
  "@testcontainers+",
  "@vitest+",
  "eslint@",
  "prettier@",
  "rolldown@",
  "typescript@",
  "vite@",
  "vitest@",
] as const;

/** Files only a package's authors read; licenses stay. */
const NON_RUNTIME_FILE =
  /^(?!licen[cs]e|notice|copying).*\.(?:d\.[cm]?ts|map|md|tsbuildinfo)$|\.(?:a|o)$/iu;

/** Every file and directory name under `directory`, links not followed. */
function listNames(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => [
    entry.name,
    ...(entry.isDirectory() ? listNames(path.join(directory, entry.name)) : []),
  ]);
}

/** Test-only dependencies of shared packages the image omits; others must ship. */
const NOT_SHIPPED = new Set([
  "@codebase/testing",
  "@golevelup/ts-vitest",
  "@nestjs/testing",
  "@testcontainers/postgresql",
  "typescript",
  "vitest",
]);

describe("caelundas-api build", () => {
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

  it("builds the migrations as files the database module's glob finds", () => {
    const migrations = readdirSync(
      path.join(BUNDLE_DIRECTORY, "projects/caelundas/caelundas-db/migrations"),
    );

    expect(migrations.length).toBeGreaterThan(0);
    expect(migrations.every((file) => /^\d+-migration\.js$/u.test(file))).toBe(
      true,
    );
  });

  it.each(["@nestjs/core", "pg", "pino-pretty", "typeorm"])(
    "installs %s beside the build",
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
      DEVELOPMENT_STORE_PREFIXES.some((prefix) => entry.startsWith(prefix)),
    );

    expect(shipped).toStrictEqual([]);
  });

  it("ships no source map, declaration, documentation or compiled leftover", () => {
    const shipped = listNames(
      path.join(BUNDLE_DIRECTORY, "node_modules"),
    ).filter((name) => NON_RUNTIME_FILE.test(name));

    expect(shipped).toStrictEqual([]);
  });

  it.each(SHARED_PACKAGES)(
    "ships every dependency of %s that its tests do not own",
    (directory) => {
      const manifest = JSON.parse(
        readFileSync(
          path.join(WORKSPACE_ROOT, directory, "package.json"),
          "utf8",
        ),
      ) as { dependencies?: Record<string, string> };
      const missing = Object.entries(manifest.dependencies ?? {})
        .filter(
          ([name, version]) =>
            !version.startsWith("workspace:") && !NOT_SHIPPED.has(name),
        )
        .map(([name]) => name)
        .filter(
          (name) =>
            !existsSync(
              path.join(BUNDLE_DIRECTORY, "node_modules", name, "package.json"),
            ) &&
            !storeEntries.some((entry) =>
              entry.startsWith(`${name.replace("/", "+")}@`),
            ),
        );

      expect(missing).toStrictEqual([]);
    },
  );
});
