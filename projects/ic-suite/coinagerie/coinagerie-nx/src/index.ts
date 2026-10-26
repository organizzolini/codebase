// 📤 Exports
import path from "node:path";

import { COINAGERIE_NX_PLUGIN_NAME } from "./modules/options/options.constants";
import { resolvePluginService } from "./modules/plugin/plugin-context.utilities";
import { CONFIGURATION_GLOB } from "./modules/plugin/plugin.constants";

import type {
  CreateNodes,
  CreateNodesContext,
  CreateNodesResultArray,
} from "@nx/devkit";

export { MainModule } from "./coinagerie-nx.module";
export {
  COINAGERIE_NX_PLUGIN_NAME,
  DEFAULT_CHECK_TARGET_NAME,
  DEFAULT_COMMAND,
} from "./modules/options/options.constants";
export { OptionsModule } from "./modules/options/options.module";
export { OptionsService } from "./modules/options/options.service";
export type { CoinageriePluginOptions } from "./modules/options/options.types";
export { resolvePluginService } from "./modules/plugin/plugin-context.utilities";
export { PluginModule } from "./modules/plugin/plugin.module";
export { PluginService } from "./modules/plugin/plugin.service";
export type {
  InferredTarget,
  InferredTargets,
} from "./modules/plugin/plugin.types";

/**
 * Infers a coinagerie check target onto every project holding a configuration.
 *
 * Nx hands this every matched file at once, which is why inference reads the
 * plugin options a single time inside `inferTargets` rather than once per
 * project.
 */
const createNodes: CreateNodes = [
  CONFIGURATION_GLOB,
  async (
    configurationFiles: readonly string[],
    options: unknown,
    context: CreateNodesContext,
  ): Promise<CreateNodesResultArray> => {
    const pluginService = await resolvePluginService();
    const targetsByProjectRoot = pluginService.inferTargets({
      configurationFiles,
      options,
      workspaceRoot: context.workspaceRoot,
    });

    const seenRoots = new Set<string>();

    return configurationFiles.flatMap(
      (configurationFile): CreateNodesResultArray => {
        const projectRoot = path.posix.dirname(configurationFile);
        const targets = targetsByProjectRoot.get(projectRoot);

        if (targets === undefined || seenRoots.has(projectRoot)) {
          return [];
        }

        seenRoots.add(projectRoot);

        return [
          [configurationFile, { projects: { [projectRoot]: { targets } } }],
        ];
      },
    );
  },
];

const coinageriePlugin = {
  createNodes,
  name: COINAGERIE_NX_PLUGIN_NAME,
};

export default coinageriePlugin;
