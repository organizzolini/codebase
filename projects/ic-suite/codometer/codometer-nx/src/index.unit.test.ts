import { createMock } from "@golevelup/ts-vitest";
import { afterEach, describe, expect, it } from "vitest";

import { createFakeWorkspace } from "../testing/fake-workspace";

import codometerPlugin, * as pluginExports from "./index";

import type { FakeWorkspace } from "../testing/fake-workspace";
import type { CreateNodesContext } from "@nx/devkit";

/** The registration every case runs with, unless it brings its own. */
const OPTIONS = { projectConfigurationPath: "codometer.config.ts" };

describe("codometerPlugin", () => {
  let workspace: FakeWorkspace | undefined;

  /** Runs node creation over a fake workspace, as Nx would for a match. */
  async function createNodes(args: {
    files: Record<string, string>;
    matched: string[];
    options?: unknown;
  }): Promise<unknown> {
    workspace = createFakeWorkspace(args.files);

    const [, callback] = codometerPlugin.createNodes;

    return await callback(
      args.matched,
      args.options ?? OPTIONS,
      createMock<CreateNodesContext>({ workspaceRoot: workspace.root }),
    );
  }

  afterEach(() => {
    workspace?.remove();
    workspace = undefined;
  });

  it("declares the name Nx registers it under", () => {
    expect.hasAssertions();
    expect(codometerPlugin.name).toBe("@codometer/nx");
  });

  it("matches project manifests, since the configuration path is an option a static glob cannot read", () => {
    expect.hasAssertions();

    const [glob] = codometerPlugin.createNodes;

    expect(glob).toBe("**/{project.json,package.json}");
  });

  it("exports its public surface", () => {
    expect.hasAssertions();
    expect(Object.keys(pluginExports).toSorted()).toStrictEqual(
      [
        "CODOMETER_NX_PLUGIN_NAME",
        "DEFAULT_COMMAND",
        "DEFAULT_LIMIT_TARGET_NAME",
        "DEFAULT_WEIGH_TARGET_NAME",
        "MainModule",
        "OptionsModule",
        "OptionsService",
        "PluginModule",
        "PluginService",
        "default",
        "resolvePluginService",
      ].toSorted(),
    );
  });

  it("attaches the limit and weigh targets to the project that holds the configuration", async () => {
    expect.hasAssertions();

    const nodes = await createNodes({
      files: {
        "packages/alpha/codometer.config.ts": "",
        "packages/alpha/project.json": "{}",
        "packages/beta/project.json": "{}",
      },
      matched: ["packages/alpha/project.json", "packages/beta/project.json"],
      options: {
        inputs: ["{workspaceRoot}/a.json"],
        projectConfigurationPath: "codometer.config.ts",
      },
    });

    expect(nodes).toStrictEqual([
      [
        "packages/alpha/project.json",
        {
          projects: {
            "packages/alpha": {
              targets: {
                "codometer-limit": {
                  cache: true,
                  executor: "@codometer/nx:measure",
                  inputs: ["default", "{workspaceRoot}/a.json"],
                  options: {
                    check: true,
                    command: "codometer",
                    config: "codometer.config.ts",
                  },
                  outputs: [],
                },
                "codometer-weigh": {
                  cache: true,
                  configurations: {
                    check: { check: true },
                    write: { outputMarkdown: true },
                  },
                  defaultConfiguration: "check",
                  dependsOn: ["build"],
                  executor: "@codometer/nx:measure",
                  inputs: [
                    "production",
                    "^production",
                    "!{projectRoot}/codometer-report.json",
                    "{workspaceRoot}/a.json",
                  ],
                  options: {
                    command: "codometer",
                    config: "codometer.config.ts",
                    outputJson: true,
                  },
                  outputs: [
                    "{projectRoot}/codometer-report.json",
                    "{projectRoot}/documentation/codometer.md",
                  ],
                },
              },
            },
          },
        },
      ],
    ]);
  });

  it("answers a project holding two manifests once", async () => {
    expect.hasAssertions();

    const nodes = await createNodes({
      files: {
        "packages/alpha/codometer.config.ts": "",
        "packages/alpha/package.json": '{"name":"alpha"}',
        "packages/alpha/project.json": "{}",
      },
      matched: ["packages/alpha/package.json", "packages/alpha/project.json"],
    });

    expect(nodes).toHaveLength(1);
  });

  it("drops a matched manifest whose folder holds no configuration", async () => {
    expect.hasAssertions();

    await expect(
      createNodes({
        files: { "packages/alpha/project.json": "{}" },
        matched: ["packages/alpha/project.json"],
      }),
    ).resolves.toStrictEqual([]);
  });

  it("creates nothing when nothing matched", async () => {
    expect.hasAssertions();

    await expect(
      createNodes({ files: {}, matched: [] }),
    ).resolves.toStrictEqual([]);
  });

  it("refuses a registration with no configuration path", async () => {
    expect.hasAssertions();

    await expect(
      createNodes({ files: {}, matched: [], options: {} }),
    ).rejects.toThrow("projectConfigurationPath is required");
  });
});
