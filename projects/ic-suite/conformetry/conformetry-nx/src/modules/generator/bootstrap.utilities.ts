// 🛠️ Utilities

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { NX_CONFIGURATION_FILENAME } from "../options/options.constants";
import {
  resolveGeneratorService,
  resolveOptionsService,
  resolveProjectsService,
} from "../plugin/plugin-context.utilities";

import {
  DEFAULT_OUTPUT_PATH,
  DEFAULT_PACKAGE_NAME,
} from "./generator.constants";

import type { EmittedFile } from "./generator.types";

/**
 * Emits the generator plugin and links it for Nx.
 *
 * Calls `emitPlugin` directly; `nx sync` would build the whole graph first.
 */
export async function bootstrapPlugin(
  workspaceRoot: string,
): Promise<EmittedFile[]> {
  const generatorService = await resolveGeneratorService();
  const optionsService = await resolveOptionsService();
  const projectsService = await resolveProjectsService();
  const files = await generatorService.emitPlugin({
    // Taken from the workspace's own plugin registration rather than assumed:
    // this runs from a `postinstall`, where Nx passes nothing.
    configurationPath: optionsService.resolveConfigurationPath({
      nxConfiguration: readNxConfiguration(workspaceRoot),
    }),
    outputPath: DEFAULT_OUTPUT_PATH,
    packageName: DEFAULT_PACKAGE_NAME,
    projects: projectsService.listWorkspaceProjects(workspaceRoot),
  });

  writePlugin({ files, workspaceRoot });
  linkPlugin(workspaceRoot);

  return files;
}

/**
 * Bootstraps the plugin, warning rather than failing the install.
 *
 * A non-zero `postinstall` would fail `pnpm install` itself while the configuration is mid-edit.
 */
export async function runBootstrapCli(workspaceRoot: string): Promise<void> {
  try {
    const files = await bootstrapPlugin(workspaceRoot);

    // No Nest container exists during `postinstall`, so this cannot go
    // through `LoggerService`. The message still follows its convention —
    // emoji, then a verb — so bootstrap output reads like everything else.
    console.info(
      `👔 Emitted the conformetry generator plugin to ${DEFAULT_OUTPUT_PATH}`,
      { count: files.length },
    );
  } catch (error) {
    console.warn("👔 Skipped emitting the conformetry generator plugin");
    console.warn(error instanceof Error ? error.message : error);
  }
}

/**
 * Whether a path resolves to the emitted plugin, and so is ours to replace.
 *
 * A dangling link left by this bootstrap counts too.
 */
function leadsTo(args: { linkPath: string; outputPath: string }): boolean {
  try {
    return realpathSync(args.linkPath) === realpathSync(args.outputPath);
  } catch {
    return !existsSync(args.linkPath);
  }
}

/**
 * Links the emitted plugin into the root `node_modules`.
 *
 * pnpm will not create it; a `workspace:*` dependency fails a fresh install.
 */
function linkPlugin(workspaceRoot: string): void {
  const linkPath = path.resolve(
    workspaceRoot,
    "node_modules",
    DEFAULT_PACKAGE_NAME,
  );
  const outputPath = path.resolve(workspaceRoot, DEFAULT_OUTPUT_PATH);

  mkdirSync(path.dirname(linkPath), { recursive: true });

  // The plugin's name is unscoped, so an installed dependency could occupy this path.
  // Refuse rather than delete it. Checks where the path leads, since pnpm symlinks its store.
  if (
    lstatSync(linkPath, { throwIfNoEntry: false }) !== undefined &&
    !leadsTo({ linkPath, outputPath })
  ) {
    throw new Error(
      `node_modules/${DEFAULT_PACKAGE_NAME} is an installed package, not a link to ${DEFAULT_OUTPUT_PATH}. Rename the emitted plugin via the sync generator's packageName option.`,
    );
  }

  // `rmSync` on a symlink removes the link, never what it points at, so a
  // re-run replaces the link rather than writing through into the emitted
  // directory.
  rmSync(linkPath, { force: true, recursive: true });
  symlinkSync(
    path.relative(path.dirname(linkPath), outputPath),
    linkPath,
    "dir",
  );
}

/**
 * Reads `nx.json`, or nothing when there is none.
 *
 * `resolveConfigurationPath` then refuses for want of a registered path.
 */
function readNxConfiguration(workspaceRoot: string): unknown {
  const nxConfigurationPath = path.resolve(
    workspaceRoot,
    NX_CONFIGURATION_FILENAME,
  );

  if (!existsSync(nxConfigurationPath)) {
    return undefined;
  }

  const parsed: unknown = JSON.parse(readFileSync(nxConfigurationPath, "utf8"));

  return parsed;
}

/**
 * Writes the emitted files, replacing whatever the last emit left behind.
 *
 * Clears `src` first, so dropped generators lose their schemas.
 */
function writePlugin(args: {
  files: EmittedFile[];
  workspaceRoot: string;
}): void {
  rmSync(path.resolve(args.workspaceRoot, DEFAULT_OUTPUT_PATH, "src"), {
    force: true,
    recursive: true,
  });

  for (const file of args.files) {
    const absolutePath = path.resolve(args.workspaceRoot, file.filePath);

    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, file.content, "utf8");
  }
}
