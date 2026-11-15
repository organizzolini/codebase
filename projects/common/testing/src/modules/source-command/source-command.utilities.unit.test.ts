import path from "node:path";

import { describe, expect, it } from "vitest";

import { REPORT_PROCESS_ENTRY } from "../../../testing/fixtures/report-process.main";

import { runSourceCommand } from "./source-command.utilities";

// 🧪 Tests

const PACKAGE_DIRECTORY = path.resolve(import.meta.dirname, "../../..");
const ENTRY = REPORT_PROCESS_ENTRY;

describe(runSourceCommand, () => {
  it("runs the entry with its arguments and captures both streams", async () => {
    const result = await runSourceCommand({
      args: ["0", "alpha", "beta"],
      directory: PACKAGE_DIRECTORY,
      entry: ENTRY,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("diagnostic");
    expect(JSON.parse(result.stdout)).toMatchObject({
      args: ["alpha", "beta"],
      cwd: PACKAGE_DIRECTORY,
    });
  });

  it("reports a failing exit code instead of throwing", async () => {
    const result = await runSourceCommand({
      args: ["3"],
      directory: PACKAGE_DIRECTORY,
      entry: ENTRY,
    });

    expect(result.exitCode).toBe(3);
  });

  it("forces color off, whatever the caller asks", async () => {
    const result = await runSourceCommand({
      directory: PACKAGE_DIRECTORY,
      entry: ENTRY,
      environment: { FORCE_COLOR: "1", GREETING: "salve" },
    });

    expect(JSON.parse(result.stdout)).toMatchObject({
      forceColor: "0",
      greeting: "salve",
    });
  });

  it("names the tsconfig through SWC_NODE_PROJECT", async () => {
    const tsconfig = path.join(PACKAGE_DIRECTORY, "tsconfig.json");
    const result = await runSourceCommand({
      directory: PACKAGE_DIRECTORY,
      entry: ENTRY,
      tsconfig,
    });

    expect(JSON.parse(result.stdout)).toMatchObject({ project: tsconfig });
  });

  it("reports an exit code of 1 when the run is stopped by its timeout", async () => {
    const result = await runSourceCommand({
      directory: PACKAGE_DIRECTORY,
      entry: ENTRY,
      timeout: 1,
    });

    expect(result.exitCode).toBe(1);
  });
});
