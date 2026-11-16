import path from "node:path";

import { describe, expect, it } from "vitest";

import { runSourceCommand } from "@codebase/testing/end-to-end";

import { mockDates } from "../testing/mocks";

import { environmentSchema } from "./compliance.constants";

const COMMAND_PATH = path.resolve(import.meta.dirname, "compliance.main.ts");
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../..");

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

  it("registers the issue and pull request compliance commands", async () => {
    const result = await runSourceCommand({
      args: ["--help"],
      directory: WORKSPACE_ROOT,
      entry: COMMAND_PATH,
      environment: { NODE_OPTIONS: "" },
      timeout: 120_000,
    });

    expect(result.exitCode).toBe(0);

    for (const command of [
      "audit-files",
      "issue",
      "organization-project",
      "pull-request",
    ]) {
      expect(result.stdout).toContain(command);
    }
  }, 150_000);
});
