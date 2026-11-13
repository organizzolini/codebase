import { globSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { runSourceCommand } from "@codebase/testing/end-to-end";

const MODULES_DIRECTORY = path.resolve(import.meta.dirname, "..");

const WORKSPACE_ROOT = path.resolve(MODULES_DIRECTORY, "../../../../..");

const ENTITY_FILES = globSync("**/*.entity.ts", {
  cwd: MODULES_DIRECTORY,
}).toSorted();

const IMPORT_TIMEOUT_MILLISECONDS = 120_000;

/**
 * Runs a module as an entry point in a fresh process under the SWC loader, which emits decorator metadata unlike Vitest, so an entity cycle throws here.
 */
async function importInFreshProcess(modulePath: string): Promise<string> {
  const { exitCode, stderr } = await runSourceCommand({
    directory: WORKSPACE_ROOT,
    entry: modulePath,
    timeout: IMPORT_TIMEOUT_MILLISECONDS,
  });

  if (exitCode !== 0) {
    throw new Error(stderr);
  }

  return stderr;
}

describe("entities module graph", () => {
  it("finds the entity files", () => {
    expect.hasAssertions();
    expect(ENTITY_FILES.length).toBeGreaterThan(0);
  });

  it.concurrent.each(ENTITY_FILES)(
    "evaluates %s as an entry point with decorator metadata",
    async (entityFile) => {
      expect.hasAssertions();
      await expect(
        importInFreshProcess(path.join(MODULES_DIRECTORY, entityFile)),
      ).resolves.not.toContain("Error");
    },
    IMPORT_TIMEOUT_MILLISECONDS,
  );

  it(
    "evaluates the package entry point with decorator metadata",
    async () => {
      expect.hasAssertions();
      await expect(
        importInFreshProcess(path.resolve(MODULES_DIRECTORY, "../index.ts")),
      ).resolves.not.toContain("Error");
    },
    IMPORT_TIMEOUT_MILLISECONDS,
  );
});
