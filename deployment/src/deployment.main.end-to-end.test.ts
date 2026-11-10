import { spawnSync } from "node:child_process";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { environmentSchema } from "./deployment.constants";

/** The workspace root, which the spawned command runs from, as the Nx targets do. */
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../..");

/**
 * How long the one real boot may take. A cold transform of the module graph
 * took 20.6s in CI, so this leaves headroom.
 */
const BOOT_TIMEOUT_MILLISECONDS = 60_000;

/** The commands the container must register, each named in the help. */
const COMMAND_NAMES = [
  "link-packages",
  "publish-packages",
  "tag-codebase",
  "tag-packages",
  "version-packages",
];

/**
 * Runs the real command line once for its help, with release inputs left out
 * and git pointed at no repository.
 */
const runHelp = (): { output: string; status: null | number } => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      "deployment/src/deployment.main.ts",
      "--help",
    ],
    {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        GIT_DIR: path.join(WORKSPACE_ROOT, "deployment/tmp/no-repository"),
        GITHUB_ENV: "",
        GITHUB_OUTPUT: "",
        GITHUB_PACKAGES_TOKEN: "",
        GITHUB_REPOSITORY: "",
        GITHUB_REPOSITORY_OWNER: "",
        GITHUB_TOKEN: "",
        NODE_OPTIONS: "",
        NPM_TOKEN: "",
        NX_BASE: "",
        NX_HEAD: "",
        RUNNER_TEMP: "",
        TARGET: "",
      },
    },
  );

  return { output: `${result.stdout}${result.stderr}`, status: result.status };
};

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty environment", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });

    it("accepts only a number of seconds as PUSH_RETRY_DELAY", () => {
      expect.hasAssertions();
      expect(
        environmentSchema.parse({ PUSH_RETRY_DELAY: "2.5" }),
      ).toMatchObject({ PUSH_RETRY_DELAY: "2.5" });
      expect(() =>
        environmentSchema.parse({ PUSH_RETRY_DELAY: "soon" }),
      ).toThrow("PUSH_RETRY_DELAY must be a number of seconds");
    });
  });

  // A dependency-injection gap fails only when the real container boots,
  // which neither the unit tests nor the lint gate catch. `--help` boots it
  // all in one spawn; each extra spawn would pay the cold transform again.
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
