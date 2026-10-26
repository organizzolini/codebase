import { createMock } from "@golevelup/ts-vitest";
import { afterEach, describe, expect, it } from "vitest";

import { createFakeWorkspace } from "../testing/fake-workspace";

import coinageriePlugin, * as pluginExports from "./index";

import type { FakeWorkspace } from "../testing/fake-workspace";
import type { CreateNodesContext } from "@nx/devkit";

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
      args.options ?? {},
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

  it("matches every file name the coinagerie loader reads", () => {
    expect.hasAssertions();

    const [glob] = coinageriePlugin.createNodes;

    expect(glob).toBe(
      "**/{coinagerie.config.ts,coinagerie.config.mts,coinagerie.config.cts,coinagerie.config.js,coinagerie.config.mjs,coinagerie.config.cjs}",
    );
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
      matched: ["packages/alpha/coinagerie.config.ts"],
      options: { inputs: ["{workspaceRoot}/GLOSSARY.md"] },
    });

    expect(nodes).toStrictEqual([
      [
        "packages/alpha/coinagerie.config.ts",
        {
          projects: {
            "packages/alpha": {
              targets: {
                "coinagerie-check": {
                  cache: true,
                  executor: "nx:run-commands",
                  inputs: [
                    "{projectRoot}/coinagerie.config.ts",
                    "{projectRoot}/coinagerie.config.mts",
                    "{projectRoot}/coinagerie.config.cts",
                    "{projectRoot}/coinagerie.config.js",
                    "{projectRoot}/coinagerie.config.mjs",
                    "{projectRoot}/coinagerie.config.cjs",
                    "{projectRoot}/**/*",
                    "{workspaceRoot}/GLOSSARY.md",
                  ],
                  options: {
                    command: "coinagerie --check",
                    cwd: "{projectRoot}",
                  },
                },
              },
            },
          },
        },
      ],
    ]);
  });

  it("drops a matched file whose folder is no project", async () => {
    expect.hasAssertions();

    await expect(
      createNodes({
        files: { "fixtures/sample/coinagerie.config.ts": "" },
        matched: ["fixtures/sample/coinagerie.config.ts"],
      }),
    ).resolves.toStrictEqual([]);
  });

  it("creates nothing when nothing matched", async () => {
    expect.hasAssertions();

    await expect(
      createNodes({ files: {}, matched: [] }),
    ).resolves.toStrictEqual([]);
  });
});
