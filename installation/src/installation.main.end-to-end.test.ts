import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { environmentSchema } from "./installation.constants";

/** The workspace root, which the Nx `start` target runs from. */
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../..");

/** Every command this project registers. */
const COMMAND_NAMES = [
  "dependencies",
  "environment-files",
  "setup",
  "shell-configuration",
  "software",
  "update-reui-skill",
];

// Each test boots a whole Node process through the SWC loader, which takes
// several seconds on a busy machine.
const BOOT_TIMEOUT_MILLISECONDS = 60_000;

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  // A dependency-injection gap fails when the container is built, which unit
  // tests over hand-assembled testing modules never do. Asking each command
  // for its help builds the real container through the real command factory
  // and runs none of the command's steps.
  describe.each(COMMAND_NAMES)("the %s command", (name) => {
    it(
      "boots through the command factory",
      () => {
        expect.hasAssertions();

        const result = spawnSync(
          process.execPath,
          [
            "--import",
            "@swc-node/register/esm-register",
            "installation/src/installation.main.ts",
            name,
            "--help",
          ],
          {
            cwd: WORKSPACE_ROOT,
            encoding: "utf8",
            env: { ...process.env, NODE_OPTIONS: "" },
          },
        );

        expect(result.stderr).not.toContain("Nest can't resolve dependencies");
        expect(result.status).toBe(0);
        expect(result.stdout).toContain(
          `Usage: installation.main ${name} [options]`,
        );
      },
      BOOT_TIMEOUT_MILLISECONDS,
    );
  });
});
