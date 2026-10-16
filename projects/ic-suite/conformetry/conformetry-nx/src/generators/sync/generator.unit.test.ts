import { createTree } from "nx/src/generators/testing-utils/create-tree";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EXECUTION_OPTION_SURFACE } from "../../modules/options/options.constants";
import {
  resolveGeneratorService,
  resolveOptionsService,
  resolveProjectsService,
} from "../../modules/plugin/plugin-context.utilities";

import syncGenerator from "./generator";

import type { Tree } from "@nx/devkit";

// The emitted plugin is the generator service's business and is tested there;
// what this entry point owns is writing the result through the tree.
vi.mock("../../modules/plugin/plugin-context.utilities", () => ({
  resolveGeneratorService: vi.fn(),
  resolveOptionsService: vi.fn(),
  resolveProjectsService: vi.fn(),
}));

const emitPlugin = vi.fn();
const resolveConfigurationPath =
  vi.fn<
    (args: {
      configuration?: string | undefined;
      nxConfiguration: unknown;
      surface?: string;
    }) => string
  >();

describe(syncGenerator, () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    emitPlugin.mockResolvedValue([
      { content: '{ "generators": {} }\n', filePath: "generators.json" },
    ]);
    // type-coverage:ignore-next-line -- a deliberate stand-in for the service
    vi.mocked(resolveGeneratorService).mockResolvedValue({
      emitPlugin,
    } as unknown as Awaited<ReturnType<typeof resolveGeneratorService>>);
    resolveConfigurationPath.mockReturnValue("conformetry.config.ts");
    // type-coverage:ignore-next-line -- a deliberate stand-in for the service
    vi.mocked(resolveOptionsService).mockResolvedValue({
      resolveConfigurationPath,
    } as unknown as Awaited<ReturnType<typeof resolveOptionsService>>);
    // type-coverage:ignore-next-line -- a deliberate stand-in for the service
    vi.mocked(resolveProjectsService).mockResolvedValue({
      listWorkspaceProjects: () => [],
    } as unknown as Awaited<ReturnType<typeof resolveProjectsService>>);
  });

  it("writes every emitted file into the tree rather than to disk", async () => {
    await syncGenerator(tree);

    expect(tree.read("generators.json", "utf8")).toBe('{ "generators": {} }\n');
  });

  it("returns the message `nx sync:check` reports when out of date", async () => {
    const { outOfSyncMessage } = await syncGenerator(tree);

    expect(outOfSyncMessage.length).toBeGreaterThan(0);
  });

  it("refuses to emit when no configuration path is registered", async () => {
    resolveConfigurationPath.mockImplementation(() => {
      throw new Error("A configuration path is required");
    });

    await expect(syncGenerator(tree)).rejects.toThrow(
      "A configuration path is required",
    );
    expect(emitPlugin).not.toHaveBeenCalled();
  });

  it("reads the plugin registration out of the workspace's nx.json", async () => {
    const nxConfiguration = {
      plugins: [
        {
          options: { configurationPath: "elsewhere/conformetry.config.ts" },
          plugin: "@conformetry/nx",
        },
      ],
    };

    tree.write("nx.json", JSON.stringify(nxConfiguration));

    await syncGenerator(tree);

    // A global sync generator receives no plugin options, so the registration
    // is what it has to go on.
    const [call] = resolveConfigurationPath.mock.calls;

    expect(call?.[0].nxConfiguration).toStrictEqual(nxConfiguration);
  });

  it("uses the registered path when given no options", async () => {
    resolveConfigurationPath.mockReturnValue("elsewhere/conformetry.config.ts");

    await syncGenerator(tree);

    expect(emitPlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        configurationPath: "elsewhere/conformetry.config.ts",
      }),
    );
  });

  it("hands the configuration option and its surface to the resolver", async () => {
    await syncGenerator(tree, {
      configuration: "custom/conformetry.config.ts",
    });

    expect(resolveConfigurationPath).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: "custom/conformetry.config.ts",
        surface: EXECUTION_OPTION_SURFACE,
      }),
    );
  });

  it("honors the paths a caller names", async () => {
    resolveConfigurationPath.mockReturnValue("custom/conformetry.config.ts");

    await syncGenerator(tree, {
      configuration: "custom/conformetry.config.ts",
      outputPath: "custom/out",
      packageName: "@acme/conformetry-nx",
    });

    expect(emitPlugin).toHaveBeenCalledWith({
      configurationPath: "custom/conformetry.config.ts",
      outputPath: "custom/out",
      packageName: "@acme/conformetry-nx",
      projects: [],
    });
  });
});
