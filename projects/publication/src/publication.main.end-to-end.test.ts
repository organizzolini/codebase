import { spawnSync } from "node:child_process";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { environmentSchema } from "./publication.constants";

/** The workspace root, which the spawned command runs from, as the Nx targets do. */
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../..");

/**
 * How long the one real boot may take. CI run 38950100262 took 20.6s for the
 * first boot of this command line and 12.5s for a second, swc-node
 * transforming the whole module graph cold each time; three times the slower
 * one leaves headroom on a busy runner.
 */
const BOOT_TIMEOUT_MILLISECONDS = 60_000;

/** The commands the container must register, each named in the help. */
const COMMAND_NAMES = [
  "adopt-task-database",
  "keep-task-database",
  "publishable-packages-gate",
  "run-affected",
  "verify-task-database",
];

/** Runs the real command line once, asking only for its help. */
const runHelp = (): { output: string; status: null | number } => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      "projects/publication/src/publication.main.ts",
      "--help",
    ],
    {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0", NODE_OPTIONS: "" },
    },
  );

  return { output: `${result.stdout}${result.stderr}`, status: result.status };
};

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty environment, filling in what Nx itself defaults", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({
        MACHINE_ID_FILES: "/var/lib/dbus/machine-id /etc/machine-id",
        NX_WORKSPACE_DATA_DIRECTORY: ".nx/workspace-data",
      });
    });

    it("takes the defaults for empty values too", () => {
      expect.hasAssertions();
      expect(
        environmentSchema.parse({
          MACHINE_ID_FILES: "",
          NX_WORKSPACE_DATA_DIRECTORY: "",
        }),
      ).toStrictEqual({
        MACHINE_ID_FILES: "/var/lib/dbus/machine-id /etc/machine-id",
        NX_WORKSPACE_DATA_DIRECTORY: ".nx/workspace-data",
      });
    });
  });

  // A dependency-injection gap fails only when the real container boots,
  // which neither the unit tests nor the lint gate do. `--help` boots the
  // whole container, every command's providers included, before commander
  // prints anything, so one spawn checks them all: each extra spawn would
  // pay the whole cold transform again.
  describe("command boot e2e", () => {
    let boot: { output: string; status: null | number };

    beforeAll(() => {
      boot = runHelp();
    }, BOOT_TIMEOUT_MILLISECONDS);

    it("boots the container without an error", () => {
      expect.hasAssertions();
      expect(boot.status).toBe(0);
      expect(boot.output).not.toContain("Nest can't resolve");
    });

    it.each(COMMAND_NAMES)("registers %s", (name) => {
      expect.hasAssertions();
      expect(boot.output).toContain(name);
    });
  });
});
