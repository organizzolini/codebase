import { createMock } from "@golevelup/ts-vitest";
import { afterEach, describe, expect, it } from "vitest";

import { createFakeWorkspace } from "../testing/fake-workspace";

import coinageriePlugin, * as pluginExports from "./index";

import type { FakeWorkspace } from "../testing/fake-workspace";
import type { CreateNodesContext } from "@nx/devkit";

/** The registration every case runs with, unless it brings its own. */
const OPTIONS = { projectConfigurationPath: "coinagerie.config.ts" };

describe("coinageriePlugin", () => {
  let workspace: FakeWorkspace | undefined;

  /** Runs node creation over a fake workspace, as Nx would for a match. */
  async function createNodes(args: {
    files: Record<string, string>;
    matched: string[];
    options?: unknown;
  }): Promise<unknown> {
    workspace = createFakeWorkspace(args.files);

    const [, callback] = coinageriePlugin.createNodes;

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
    expect(coinageriePlugin.name).toBe("@coinagerie/nx");
  });

  it("matches project manifests, since the configuration path is an option a static glob cannot read", () => {
    expect.hasAssertions();

    const [glob] = coinageriePlugin.createNodes;

    expect(glob).toBe("**/{project.json,package.json}");
  });

  it("exports its public surface", () => {
    expect.hasAssertions();
    expect(Object.keys(pluginExports).toSorted()).toStrictEqual(
      [
        "COINAGERIE_NX_PLUGIN_NAME",
        "DEFAULT_CHECK_TARGET_NAME",
        "DEFAULT_COMMAND",
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

  it("attaches the check target to the project that holds the configuration", async () => {
    expect.hasAssertions();

    const nodes = await createNodes({
      files: {
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
        "packages/beta/project.json": "{}",
      },
      matched: ["packages/alpha/project.json", "packages/beta/project.json"],
      options: {
        inputs: ["{workspaceRoot}/GLOSSARY.md"],
        projectConfigurationPath: "coinagerie.config.ts",
      },
    });

    expect(nodes).toStrictEqual([
      [
        "packages/alpha/project.json",
        {
          projects: {
            "packages/alpha": {
              targets: {
                "coinagerie-check": {
                  cache: true,
                  executor: "@coinagerie/nx:check",
                  inputs: [
                    "{projectRoot}/coinagerie.config.ts",
                    "{projectRoot}/**/*",
                    "{workspaceRoot}/GLOSSARY.md",
                  ],
                  options: {
                    command: "coinagerie",
                    projectConfigurationPath: "coinagerie.config.ts",
                  },
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
        "packages/alpha/coinagerie.config.ts": "",
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
