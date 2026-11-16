import fs from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  installedVersion,
  usePackedRegistry,
} from "@codebase/testing/end-to-end";

import type {
  CommandResult,
  ConsumerWorkspace,
} from "@codebase/testing/end-to-end";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../../..");

const CONFIGURATION = `export default [
  {
    description: "One template file",
    inputs: { name: { description: "Greeting name", type: "string" } },
    instances: [{ patterns: ["instances/*"], tags: ["kind:docs"] }],
    name: "hello",
    templatePath: "templates/hello",
  },
];
`;

describe("the conformetry plugin installed from a registry", () => {
  const registry = usePackedRegistry({
    localScopes: ["@conformetry"],
    packages: [
      "@conformetry/configuration",
      "@conformetry/core",
      "@conformetry/generation",
      "@conformetry/languages",
      "@conformetry/nx",
      "@conformetry/output",
      "@conformetry/validation",
    ],
    workspaceRoot: WORKSPACE_ROOT,
  });
  let workspace: ConsumerWorkspace;

  /** Resolves a path inside the consumer workspace. */
  const inWorkspace = (...segments: string[]): string =>
    path.join(workspace.directory, ...segments);

  /** Runs an `nx` command with the daemon off and room for a cold start. */
  async function nx(args: readonly string[]): Promise<CommandResult> {
    return workspace
      .command("nx", [...args])
      .withEnvironment({ NX_DAEMON: "false" })
      .withTimeout(240_000)
      .run();
  }

  /** Writes the `hello` template, the `docs` project, and the plugin's registration. */
  function writeWorkspace(): void {
    const template = inWorkspace(
      "templates/hello/{{nameKebabCase}}/{{nameKebabCase}}.md",
    );

    fs.mkdirSync(path.dirname(template), { recursive: true });
    fs.mkdirSync(inWorkspace("packages/docs"), { recursive: true });
    fs.writeFileSync(
      template,
      "# {{namePascalCase}}\n\n## Usage\n\nSay hello to {{nameKebabCase}}.\n",
    );
    fs.writeFileSync(
      inWorkspace("packages/docs/project.json"),
      JSON.stringify({
        name: "docs",
        projectType: "library",
        tags: ["kind:docs"],
      }),
    );
    fs.writeFileSync(inWorkspace("conformetry.config.ts"), CONFIGURATION);
    fs.writeFileSync(
      inWorkspace("nx.json"),
      JSON.stringify({
        plugins: [
          {
            options: { configurationPath: "conformetry.config.ts" },
            plugin: "@conformetry/nx",
          },
        ],
        sync: { globalGenerators: ["@conformetry/nx:sync"] },
      }),
    );
  }

  beforeAll(async () => {
    workspace = await registry.runner.createWorkspace({
      dependencies: {
        nx: installedVersion(WORKSPACE_ROOT, "nx"),
        typescript: installedVersion(WORKSPACE_ROOT, "typescript"),
      },
      packages: ["@conformetry/nx"],
    });
    writeWorkspace();
  });

  it("emits the generator plugin, then generates and validates an instance", async () => {
    expect.hasAssertions();

    const bootstrap = await workspace
      .command("conformetry-nx-bootstrap-generators")
      .run();

    expect(bootstrap.exitCode).toBe(0);
    expect(
      fs.existsSync(inWorkspace(".conformetry/nx-generators/generators.json")),
    ).toBe(true);

    const clean = await nx(["sync:check"]);

    expect(clean.exitCode).toBe(0);

    const generated = await nx([
      "generate",
      "conformetry:hello",
      "--name=world",
      "--project=docs",
    ]);

    expect(generated.exitCode).toBe(0);
    expect(
      fs.readFileSync(
        inWorkspace("packages/docs/instances/world/world.md"),
        "utf8",
      ),
    ).toContain("Say hello to world.");

    const validated = await nx(["run", "docs:conformetry-validate"]);

    expect(validated.exitCode).toBe(0);
  }, 900_000);

  it("fails the validation of an instance that drifted from its template", async () => {
    expect.hasAssertions();

    fs.writeFileSync(
      inWorkspace("packages/docs/instances/world/world.md"),
      "# World\n",
    );

    const result = await nx(["run", "docs:conformetry-validate"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toContain('Missing markdown heading: "Usage"');
  });

  it("reports the emitted plugin as stale once the configuration changes", async () => {
    expect.hasAssertions();

    fs.writeFileSync(
      inWorkspace("conformetry.config.ts"),
      CONFIGURATION.replace("hello", "salute"),
    );

    const stale = await nx(["sync:check"]);

    expect(stale.exitCode).not.toBe(0);
    expect(stale.stdout + stale.stderr).toContain("out of sync");
  });
});
