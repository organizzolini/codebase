import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { createTarballSandboxRunner } from "@codebase/testing/end-to-end";

import type {
  CommandResult,
  TarballSandboxRunner,
} from "@codebase/testing/end-to-end";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

const CONFIGURATION = `export default [
  {
    description: "One template file",
    inputs: { name: { description: "Greeting name", type: "string" } },
    instances: [{ patterns: ["instances/*"] }],
    name: "hello",
    templatePath: "templates/hello",
  },
];
`;

describe("the packed conformetry command", () => {
  let sandbox: TarballSandboxRunner;

  /** Writes a `hello` template and one instance of it; returns the project directory. */
  function writeProject(): string {
    const directory = createTemporaryDirectory("conformetry-packed-project");
    const template = path.join(
      directory,
      "templates/hello/{{nameKebabCase}}/{{nameKebabCase}}.md",
    );
    const instance = path.join(directory, "instances/world/world.md");

    fs.mkdirSync(path.dirname(template), { recursive: true });
    fs.mkdirSync(path.dirname(instance), { recursive: true });
    fs.writeFileSync(
      template,
      "# {{namePascalCase}}\n\n## Usage\n\nSay hello to {{nameKebabCase}}.\n",
    );
    fs.writeFileSync(instance, "# World\n\n## Usage\n\nSay hello to world.\n");
    fs.writeFileSync(
      path.join(directory, "conformetry.config.ts"),
      CONFIGURATION,
    );

    return directory;
  }

  /** Runs the installed binary from `directory`, which is outside the sandbox. */
  async function conformetry(
    directory: string,
    args: readonly string[],
  ): Promise<CommandResult> {
    return sandbox
      .command(path.join(sandbox.directory, "node_modules/.bin/conformetry"), [
        ...args,
        "--config",
        path.join(directory, "conformetry.config.ts"),
      ])
      .inDirectory(directory)
      .run();
  }

  beforeAll(async () => {
    sandbox = await createTarballSandboxRunner({
      packages: [
        "@conformetry/cli",
        "@conformetry/configuration",
        "@conformetry/core",
        "@conformetry/generation",
        "@conformetry/languages",
        "@conformetry/output",
        "@conformetry/validation",
      ],
      workspaceRoot: WORKSPACE_ROOT,
    });
  });

  afterAll(() => {
    sandbox.dispose();
  });

  it("lists its commands under --help", async () => {
    expect.hasAssertions();

    const result = await sandbox.command("conformetry", ["--help"]).run();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("validate");
    expect(result.stdout).toContain("instances");
  });

  it("validates an instance that conforms to its template", async () => {
    expect.hasAssertions();

    const result = await conformetry(writeProject(), ["validate"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("All checked files conform.");
  });

  it("fails an instance that has drifted from its template", async () => {
    expect.hasAssertions();

    const directory = writeProject();

    fs.rmSync(path.join(directory, "instances/world/world.md"));
    fs.writeFileSync(
      path.join(directory, "instances/world/world.md"),
      "# World\n",
    );

    const result = await conformetry(directory, ["validate"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout + result.stderr).not.toContain(
      "All checked files conform.",
    );
  });

  it("lists the instances the configuration finds", async () => {
    expect.hasAssertions();

    const result = await conformetry(writeProject(), ["instances", "--json"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("instances/world");
  });
});
