import { spawnSync } from "node:child_process";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { environmentSchema } from "./integration.constants";

/** The workspace root, which the spawned command runs from, as the Nx targets do. */
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../..");

/**
 * How long the one real boot may take. A cold transform of the module graph
 * took 20.6s in CI, so this leaves headroom.
 */
const BOOT_TIMEOUT_MILLISECONDS = 60_000;

/** The commands the container must register, each named in the help. */
const COMMAND_NAMES = [
  "adopt-task-database",
  "bound-base-to-push",
  "cleanup-codebase",
  "collect-codometer-baseline",
  "import-pr-task-cache",
  "keep-task-database",
  "merge-task-cache",
  "report-codometer-changes",
  "run-affected",
  "setup-codebase",
  "upgrade-dependencies",
  "verify-task-database",
];

/**
 * Runs the real command line once for its help, with inputs left out and git
 * pointed at no repository.
 */
const runHelp = (): { output: string; status: null | number } => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      "integration/src/integration.main.ts",
      "--help",
    ],
    {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        GIT_DIR: path.join(WORKSPACE_ROOT, "integration/tmp/no-repository"),
        NODE_OPTIONS: "",
        NX_BASE: "",
        NX_HEAD: "",
        TARGET: "",
      },
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
        NX_CACHE_DIRECTORY: ".nx/cache",
        NX_WORKSPACE_DATA_DIRECTORY: ".nx/workspace-data",
      });
    });

    it("takes the defaults for empty values too", () => {
      expect.hasAssertions();
      expect(
        environmentSchema.parse({
          MACHINE_ID_FILES: "",
          NX_CACHE_DIRECTORY: "",
          NX_WORKSPACE_DATA_DIRECTORY: "",
        }),
      ).toStrictEqual({
        MACHINE_ID_FILES: "/var/lib/dbus/machine-id /etc/machine-id",
        NX_CACHE_DIRECTORY: ".nx/cache",
        NX_WORKSPACE_DATA_DIRECTORY: ".nx/workspace-data",
      });
    });
  });

  // A dependency-injection gap fails only when the real container boots,
  // which unit tests and the lint gate never do. `--help` boots every
  // command's providers in one spawn, since each extra spawn repays the
  // cold transform.
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
