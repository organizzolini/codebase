import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { environmentSchema } from "./constants";

/** The workspace root, which the spawned command runs from, as the Nx targets do. */
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../..");

/** Runs the real command line, with the Nx revision variables left out. */
const runCommand = (
  name: string,
): { output: string; status: null | number } => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "@swc-node/register/esm-register",
      "projects/publication/src/main.ts",
      name,
    ],
    {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
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
    it("allows an empty environment", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  // A dependency-injection gap fails only when the real container boots,
  // which neither the unit tests nor the lint gate do. Each command is run
  // far enough to reach its own first check.
  describe("command boot e2e", () => {
    it("boots run-affected and reaches its input check", () => {
      expect.hasAssertions();

      const { output, status } = runCommand("run-affected");

      expect(output).toContain("TARGET is unset");
      expect(status).toBe(1);
    });

    it("boots publishable-packages-gate and reaches its input check", () => {
      expect.hasAssertions();

      const { output, status } = runCommand("publishable-packages-gate");

      expect(output).toContain("NX_BASE and NX_HEAD are unset");
      expect(status).toBe(1);
    });
  });
});
