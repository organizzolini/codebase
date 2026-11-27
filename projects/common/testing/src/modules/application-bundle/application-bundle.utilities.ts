import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { writeFileTree } from "../file-tree/file-tree.utilities";
import { createTemporaryDirectory } from "../temporary-directory/temporary-directory.utilities";

import {
  DEVELOPMENT_STORE_PREFIXES,
  NON_RUNTIME_FILE,
  NOT_SHIPPED,
  SHARED_PACKAGES,
} from "./application-bundle.constants";

import type {
  ApplicationBundleExpectations,
  BuiltBundle,
} from "./application-bundle.types";

/** Builds an application and checks what its image would ship. */
export function describeApplicationBundle(
  expectations: ApplicationBundleExpectations,
): void {
  const { bundle, directory, entry, invalid, maximumFileBytes, packages } =
    expectations;

  describe(`${path.basename(directory)} build`, () => {
    let storeEntries: string[] = [];
    const built: BuiltBundle = { directory, storeEntries: () => storeEntries };

    beforeAll(async () => {
      await bundle();
      storeEntries = readdirSync(path.join(directory, "node_modules/.pnpm"));
    }, 120_000);

    describeContents(built, entry[0], packages);
    describeOmissions(built, expectations.workspaceRoot, maximumFileBytes);
    describeInvalidRun(built, entry, invalid);
  });
}

/** Checks what the build holds and installs beside it. */
function describeContents(
  built: BuiltBundle,
  entry: string,
  packages: readonly string[],
): void {
  it("compiles workspace code to files with decorator metadata", () => {
    const entryFile = readFileSync(path.join(built.directory, entry), "utf8");
    const logger = readFileSync(
      path.join(
        built.directory,
        "projects/common/observability/src/modules/logger/logger.service.js",
      ),
      "utf8",
    );

    expect(entryFile).not.toMatch(/from "@codebase\//u);
    expect(logger).toContain('"design:paramtypes"');
  });

  it("builds the migrations as files the database module's glob finds", () => {
    const migrations = readdirSync(
      path.join(built.directory, "projects/caelundas/caelundas-db/migrations"),
    );

    expect(migrations.length).toBeGreaterThan(0);
    expect(migrations.every((file) => /^\d+-migration\.js$/u.test(file))).toBe(
      true,
    );
  });

  it.each(packages)("installs %s beside the build", (name) => {
    expect(
      existsSync(
        path.join(built.directory, "node_modules", name, "package.json"),
      ),
    ).toBe(true);
  });
}

/** Checks that the entry stops on an invalid run with the expected message. */
function describeInvalidRun(
  built: BuiltBundle,
  entry: readonly [string, ...string[]],
  invalid: ApplicationBundleExpectations["invalid"],
): void {
  it("loads its entry and stops on an invalid environment with the schema's error", () => {
    const runDirectory = createTemporaryDirectory("bundle-entry");
    writeFileTree(runDirectory, { ...invalid.files });

    const [entryFile, ...entryArguments] = entry;
    const result = spawnSync(
      process.execPath,
      [path.join(built.directory, entryFile), ...entryArguments],
      {
        cwd: runDirectory,
        encoding: "utf8",
        env: { ...invalid.environment, PATH: process.env["PATH"] ?? "" },
      },
    );

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(invalid.message);
  });
}

/** Checks what the build leaves out. */
function describeOmissions(
  built: BuiltBundle,
  workspaceRoot: string,
  maximumFileBytes: number,
): void {
  it("ships no development or test package", () => {
    const shipped = built
      .storeEntries()
      .filter((entry) =>
        DEVELOPMENT_STORE_PREFIXES.some((prefix) => entry.startsWith(prefix)),
      );

    expect(shipped).toStrictEqual([]);
  });

  it("ships no source map, declaration, documentation or compiled leftover", () => {
    const shipped = listNames(
      path.join(built.directory, "node_modules"),
    ).filter((name) => NON_RUNTIME_FILE.test(name));

    expect(shipped).toStrictEqual([]);
  });

  it.each(SHARED_PACKAGES)(
    "ships every dependency of %s that its tests do not own",
    (shared) => {
      const manifestPath = path.join(workspaceRoot, shared, "package.json");

      expect(missingDependencies(manifestPath, built)).toStrictEqual([]);
    },
  );

  it("ships no file heavier than the weight limit", () => {
    const oversized = listFiles(built.directory).filter(
      (file) => statSync(file).size > maximumFileBytes,
    );

    expect(oversized).toStrictEqual([]);
  });
}

/** Every file path under `directory`, links not followed. */
function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
}

/** Every file and directory name under `directory`, links not followed. */
function listNames(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => [
    entry.name,
    ...(entry.isDirectory() ? listNames(path.join(directory, entry.name)) : []),
  ]);
}

/** The dependencies of a shared package that the build should carry but does not. */
function missingDependencies(
  manifestPath: string,
  built: BuiltBundle,
): string[] {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  const wanted = Object.entries(manifest.dependencies ?? {})
    .filter(
      ([name, version]) =>
        !version.startsWith("workspace:") && !NOT_SHIPPED.has(name),
    )
    .map(([name]) => name);

  return wanted.filter(
    (name) =>
      !existsSync(
        path.join(built.directory, "node_modules", name, "package.json"),
      ) &&
      !built
        .storeEntries()
        .some((entry) => entry.startsWith(`${name.replace("/", "+")}@`)),
  );
}
