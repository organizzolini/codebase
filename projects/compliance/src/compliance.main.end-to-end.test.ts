import { spawnSync } from "node:child_process";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { mockDates } from "../testing/mocks";

import { environmentSchema } from "./compliance.constants";

const COMMAND_PATH = path.resolve(import.meta.dirname, "compliance.main.ts");
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../..");

describe("main end-to-end suite", () => {
  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  describe("test date fixture", () => {
    mockDates();

    it("freezes the clock at a stable date", () => {
      expect(new Date().toISOString()).toBe("2025-03-20T14:46:00.000Z");
    });
  });

  it("registers the issue and pull request compliance commands", () => {
    const result = spawnSync(
      process.execPath,
      ["--import", "@swc-node/register/esm-register", COMMAND_PATH, "--help"],
      {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8",
        env: { ...process.env, FORCE_COLOR: "0", NODE_OPTIONS: "" },
        timeout: 120_000,
      },
    );

    expect(result.status).toBe(0);

    for (const command of [
      "audit-governance",
      "issue-assignees",
      "issue-labels",
      "issue-metadata",
      "pull-request-body",
      "pull-request-context",
      "pull-request-labels",
      "pull-request-metadata",
      "pull-request-release-significance",
    ]) {
      expect(result.stdout).toContain(command);
    }
  }, 150_000);
});
