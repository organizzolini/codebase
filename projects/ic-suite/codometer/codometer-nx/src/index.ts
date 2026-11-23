// 📤 Exports
import path from "node:path";

import { CODOMETER_NX_PLUGIN_NAME } from "./modules/options/options.constants";
import { resolvePluginService } from "./modules/plugin/plugin-context.utilities";
import { PROJECT_MANIFEST_GLOB } from "./modules/plugin/plugin.constants";

import type {
  CreateNodes,
  CreateNodesContext,
  CreateNodesResultArray,
} from "@nx/devkit";

export { MainModule } from "./codometer-nx.module";
export {
  CODOMETER_NX_PLUGIN_NAME,
  DEFAULT_COMMAND,
  DEFAULT_LIMIT_TARGET_NAME,
  DEFAULT_WEIGH_TARGET_NAME,
} from "./modules/options/options.constants";
export { OptionsModule } from "./modules/options/options.module";
export { OptionsService } from "./modules/options/options.service";
export type { CodometerPluginOptions } from "./modules/options/options.types";
export { resolvePluginService } from "./modules/plugin/plugin-context.utilities";
export { PluginModule } from "./modules/plugin/plugin.module";
export { PluginService } from "./modules/plugin/plugin.service";
export type {
  InferredTarget,
  InferredTargets,
} from "./modules/plugin/plugin.types";

/** Infers a limit and a weigh target where the configured configuration exists. */
const createNodes: CreateNodes = [
  PROJECT_MANIFEST_GLOB,
  async (
    projectFiles: readonly string[],
    options: unknown,
    context: CreateNodesContext,
  ): Promise<CreateNodesResultArray> => {
    const pluginService = await resolvePluginService();
    const targetsByProjectRoot = pluginService.inferTargets({
      options,
      projectFiles,
      workspaceRoot: context.workspaceRoot,
    });

    const seenRoots = new Set<string>();

    return projectFiles.flatMap((projectFile): CreateNodesResultArray => {
      const projectRoot = path.posix.dirname(projectFile);
      const targets = targetsByProjectRoot.get(projectRoot);

      if (targets === undefined || seenRoots.has(projectRoot)) {
        return [];
      }

      seenRoots.add(projectRoot);

      return [[projectFile, { projects: { [projectRoot]: { targets } } }]];
    });
  },
];

const codometerPlugin = {
  createNodes,
  name: CODOMETER_NX_PLUGIN_NAME,
};

export default codometerPlugin;
