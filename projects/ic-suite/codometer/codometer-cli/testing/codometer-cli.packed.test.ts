import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { usePackedSandbox } from "@codebase/testing/end-to-end";

import type { CodometerReport } from "@codometer/core";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

describe("the packed codometer command", () => {
  const packed = usePackedSandbox({
    binary: "codometer",
    packages: [
      "@codometer/cli",
      "@codometer/configuration",
      "@codometer/core",
      "@codometer/languages",
      "@codometer/measurement",
      "@codometer/output",
    ],
    workspaceRoot: WORKSPACE_ROOT,
  });

  it("lists its commands under --help", async () => {
    expect.hasAssertions();

    const result = await packed.command("codometer", ["--help"]).run();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("measure");
    expect(result.stdout).toContain("changes");
    expect(result.stdout).toContain("configuration");
  });

  it("measures a project into a JSON report", async () => {
    expect.hasAssertions();

    const project = createTemporaryDirectory("codometer-packed-project");
    const output = path.join(project, "codometer-report.json");

    fs.mkdirSync(path.join(project, "src"));
    fs.writeFileSync(
      path.join(project, "src/app.ts"),
      "export const app = 1;\n",
    );
    fs.writeFileSync(
      path.join(project, "codometer.config.json"),
      JSON.stringify({ format: "json" }),
    );

    const result = await packed.run(project, [
      "measure",
      "--config",
      path.join(project, "codometer.config.json"),
      "--output-json",
      output,
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain("Finished the measurement run");

    const report = JSON.parse(
      fs.readFileSync(output, "utf8"),
    ) as CodometerReport;

    expect(report.targets.length).toBeGreaterThan(0);
    expect(report.targets[0]?.metrics.length).toBeGreaterThan(0);
  });
});
