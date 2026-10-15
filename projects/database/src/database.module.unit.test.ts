import { describe, expect, it } from "vitest";

import { runCliCommandLine } from "../testing/command-line-runner";

import { MainModule } from "./database.module";

/**
 * Every Postgres variable the process inherited, removed for a run, so the
 * command line is shown to start without any of them.
 */
function withoutPostgresEnvironment(): Record<string, undefined> {
  return Object.fromEntries(
    Object.keys(process.env)
      .filter((key) => key.includes("POSTGRES") || key.startsWith("PG"))
      .map((key) => [key, undefined]),
  );
}

describe(MainModule, () => {
  it("boots the command line with no Postgres environment and no connection, listing export and import", async () => {
    const result = await runCliCommandLine({
      argv: ["--help"],
      env: withoutPostgresEnvironment(),
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/^\s+export\b/mu);
    expect(result.stdout).toMatch(/^\s+import\b/mu);
    expect(result.stderr).toBe("");
  });

  it("validates a command's options without opening any connection", async () => {
    const result = await runCliCommandLine({
      argv: ["export", "--data", "--file", "sample.dump"],
      env: withoutPostgresEnvironment(),
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("--source-uri is required");
  });
});
