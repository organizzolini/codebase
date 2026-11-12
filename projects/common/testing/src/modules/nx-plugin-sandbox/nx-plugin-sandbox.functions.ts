import fs from "node:fs";
import path from "node:path";

import { createCommand } from "../command/command.utilities";

import { REGISTRY_OPERATION_TIMEOUT_MS } from "./nx-plugin-sandbox.constants";

import type { Command } from "../command/command.types";
import type {
  ConsumerWorkspace,
  ConsumerWorkspaceOptions,
} from "./nx-plugin-sandbox.types";

/**
 * Creates a clean Nx consumer workspace in `directory`: a manifest naming the
 * packages at `tag`, an `.npmrc` pointing at the registry, an `nx.json` with no
 * plugins, then `pnpm install`.
 */
export async function bootstrapConsumerWorkspace(
  directory: string,
  registry: { readonly tag: string; readonly url: string },
  options: ConsumerWorkspaceOptions,
): Promise<ConsumerWorkspace> {
  const npmrc = path.join(directory, ".npmrc");
  const devDependencies = {
    ...Object.fromEntries(options.packages.map((name) => [name, registry.tag])),
    ...options.dependencies,
  };
  fs.writeFileSync(npmrc, `registry=${registry.url}\n`);
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ devDependencies, name: "consumer", private: true }),
  );
  fs.writeFileSync(
    path.join(directory, "nx.json"),
    JSON.stringify({ plugins: [] }),
  );

  const install = await createCommand("pnpm", ["install"])
    .inDirectory(directory)
    .withEnvironment({ npm_config_userconfig: npmrc })
    .withTimeout(REGISTRY_OPERATION_TIMEOUT_MS)
    .run();

  if (install.exitCode !== 0) {
    throw new Error(`pnpm install failed in the workspace:\n${install.stderr}`);
  }

  return describeWorkspace(directory);
}

/** Wraps a bootstrapped directory in the helpers a test calls. */
function describeWorkspace(directory: string): ConsumerWorkspace {
  const nxJson = path.join(directory, "nx.json");
  const command = (name: string, args: readonly string[] = []): Command =>
    createCommand(name, args).inDirectory(directory);

  return {
    command,
    directory,
    generate: async (generator, args = []) =>
      command("nx", ["generate", generator, ...args]).run(),
    registerPlugin: (plugin, options) => {
      const config = JSON.parse(fs.readFileSync(nxJson, "utf8")) as {
        plugins: (string | { options?: unknown; plugin: string })[];
      };
      const registered = config.plugins.some(
        (entry) =>
          (typeof entry === "string" ? entry : entry.plugin) === plugin,
      );

      if (!registered) {
        config.plugins.push(
          options === undefined ? plugin : { options, plugin },
        );
        fs.writeFileSync(nxJson, JSON.stringify(config));
      }
    },
    runTarget: async (target, args = []) =>
      command("nx", ["run", target, ...args]).run(),
  };
}
