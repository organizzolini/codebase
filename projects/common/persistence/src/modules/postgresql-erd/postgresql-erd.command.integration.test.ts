import fs from "node:fs";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { runCliCommandLine } from "../../../testing/command-line-runner";
import { readPostgresqlErdModel } from "../../index";

const directory = path.resolve("testing/fixtures/postgresql-erd");
const jsonOutput = path.join(directory, "command-output.json");
const markdownOutput = path.join(directory, "command-output.md");
const entityGlobs = [
  "testing/fixtures/postgresql-erd/department.entity.ts",
  "testing/fixtures/postgresql-erd/employee.entity.ts",
];
const entityOptions = entityGlobs.flatMap((glob) => ["--entities", glob]);

async function runErd(
  options: readonly string[],
): ReturnType<typeof runCliCommandLine> {
  return runCliCommandLine({
    argv: ["postgresql-erd", ...entityOptions, ...options],
  });
}

describe("postgresql-erd", () => {
  afterAll(() => {
    fs.rmSync(jsonOutput, { force: true });
    fs.rmSync(markdownOutput, { force: true });
  });

  it("writes only the JSON output when --output-markdown is omitted", async () => {
    fs.rmSync(jsonOutput, { force: true });
    fs.rmSync(markdownOutput, { force: true });

    const result = await runErd(["--output-json", jsonOutput]);

    expect(result.exitCode).toBe(0);
    expect(fs.existsSync(jsonOutput)).toBe(true);
    expect(fs.existsSync(markdownOutput)).toBe(false);
  });

  it("writes only the Markdown output when --output-json is omitted", async () => {
    fs.rmSync(jsonOutput, { force: true });
    fs.rmSync(markdownOutput, { force: true });

    const result = await runErd(["--output-markdown", markdownOutput]);

    expect(result.exitCode).toBe(0);
    expect(fs.existsSync(markdownOutput)).toBe(true);
    expect(fs.existsSync(jsonOutput)).toBe(false);
  });

  it("writes JSON and Mermaid markdown and checks both outputs for drift", async () => {
    fs.rmSync(jsonOutput, { force: true });
    fs.rmSync(markdownOutput, { force: true });

    const generated = await runErd([
      "--output-json",
      jsonOutput,
      "--output-markdown",
      markdownOutput,
    ]);

    expect(generated.exitCode).toBe(0);

    const model = await readPostgresqlErdModel(entityGlobs);
    const freshJson = `${JSON.stringify(model, null, 2)}\n`;
    const freshMarkdown = fs.readFileSync(markdownOutput, "utf8");

    expect(fs.readFileSync(jsonOutput, "utf8")).toBe(freshJson);
    expect(freshMarkdown).toContain("```mermaid\nerDiagram");
    expect(freshMarkdown).toContain("ErdEmployee }o--|| departments");

    const current = await runErd([
      "--output-json",
      jsonOutput,
      "--output-markdown",
      markdownOutput,
      "--check",
    ]);

    expect(current.exitCode).toBe(0);
    expect(fs.readFileSync(jsonOutput, "utf8")).toBe(freshJson);
    expect(fs.readFileSync(markdownOutput, "utf8")).toBe(freshMarkdown);

    fs.writeFileSync(jsonOutput, "stale JSON\n");
    fs.writeFileSync(
      markdownOutput,
      freshMarkdown.replace("departments", "stale_departments"),
    );

    const stale = await runErd([
      "--output-json",
      jsonOutput,
      "--output-markdown",
      markdownOutput,
      "--check",
    ]);

    expect(stale.exitCode).toBe(1);
    expect(stale.stderr).toContain(jsonOutput);
    expect(stale.stderr).toContain(markdownOutput);
    expect(fs.readFileSync(jsonOutput, "utf8")).toBe("stale JSON\n");
    expect(fs.readFileSync(markdownOutput, "utf8")).toBe(
      freshMarkdown.replace("departments", "stale_departments"),
    );
  });
});
