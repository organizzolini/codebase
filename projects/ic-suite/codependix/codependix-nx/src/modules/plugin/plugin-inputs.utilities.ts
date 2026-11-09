// 🛠️ Utilities

import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import {
  CLI_PACKAGE_NAME,
  TOOL_PACKAGE_GLOBS,
  WORKSPACE_PROTOCOL,
} from "./plugin.constants";

import type {
  InferredInput,
  ResolveToolInputsArguments,
  ToolInputsLogger,
  WorkspacePackages,
} from "./plugin.types";

/**
 * Whether a real path sits in the workspace rather than an install: under its
 * root, and under no `node_modules` on the way.
 */
export function isInsideWorkspace(args: {
  directory: string;
  workspaceRoot: string;
}): boolean {
  const relative = path.relative(
    realpathSync(args.workspaceRoot),
    args.directory,
  );

  return !(
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.split(path.sep).includes("node_modules")
  );
}

/** Every dependency a package's manifest declares, in either map. */
export function readDependencies(directory: string): [string, unknown][] {
  const manifest = readManifest(directory);

  return Object.entries({
    ...toRecord(manifest["dependencies"]),
    ...toRecord(manifest["devDependencies"]),
  });
}

/**
 * Cache inputs tying a gate to the command line it runs. Nothing here throws, since
 * a throw would stop every command in the workspace.
 */
export function resolveToolInputs(
  args: ResolveToolInputsArguments,
): InferredInput[] {
  try {
    const cliDirectory = locatePackage({
      fromFile: args.resolveFrom ?? import.meta.url,
      name: CLI_PACKAGE_NAME,
    });

    if (cliDirectory === undefined) {
      warnUnresolved({ logger: args.logger, names: [CLI_PACKAGE_NAME] });

      return [];
    }

    return isInsideWorkspace({
      directory: cliDirectory,
      workspaceRoot: args.workspaceRoot,
    })
      ? resolveWorkspaceInputs({ ...args, cliDirectory })
      : resolveExternalInputs(cliDirectory);
  } catch (error) {
    args.logger.warn(
      `🕸️ Skipped the cache inputs of ${CLI_PACKAGE_NAME}, so a change to it will not invalidate a cached codependix gate: ${String(error)}`,
    );

    return [];
  }
}

/**
 * Collects a workspace package and every workspace package it reaches. One that cannot be
 * resolved is skipped alone.
 */
function collectWorkspacePackages(cliDirectory: string): WorkspacePackages {
  const directories = new Set([cliDirectory]);
  const unresolved = new Set<string>();
  const pending = [cliDirectory];

  for (
    let current = pending.pop();
    current !== undefined;
    current = pending.pop()
  ) {
    const names = readDependencies(current)
      .filter(([, specifier]) =>
        String(specifier).startsWith(WORKSPACE_PROTOCOL),
      )
      .map(([name]) => name);

    for (const name of names) {
      const dependency = locatePackage({
        fromFile: path.join(current, "package.json"),
        name,
      });

      if (dependency === undefined) {
        unresolved.add(name);
      } else if (!directories.has(dependency)) {
        directories.add(dependency);
        pending.push(dependency);
      }
    }
  }

  return { directories, unresolved: [...unresolved].toSorted() };
}

/**
 * Finds the real directory of a package by name, or nothing. Climbs from the entry, since
 * a package need not export its manifest.
 */
function locatePackage(args: {
  fromFile: string;
  name: string;
}): string | undefined {
  let directory: string;

  try {
    directory = path.dirname(
      realpathSync(createRequire(args.fromFile).resolve(args.name)),
    );
  } catch {
    return undefined;
  }

  for (; ; directory = path.dirname(directory)) {
    if (readManifest(directory)["name"] === args.name) {
      return directory;
    }
    if (path.dirname(directory) === directory) {
      return undefined;
    }
  }
}

/**
 * Reads a package directory's manifest, or an empty one when it is missing or unparsable.
 */
function readManifest(directory: string): Record<string, unknown> {
  const manifestPath = path.join(directory, "package.json");

  try {
    const manifest = existsSync(manifestPath)
      ? (JSON.parse(readFileSync(manifestPath, "utf8")) as unknown)
      : undefined;

    // Narrowed in place rather than through `toRecord`, which would put this
    // one frame past the depth this package is held to.
    return typeof manifest === "object" && manifest !== null
      ? { ...manifest }
      : {};
  } catch {
    return {};
  }
}

/**
 * Pins an installed command line by version, with its codependix packages. Nx hashes
 * their dependencies too.
 */
function resolveExternalInputs(cliDirectory: string): InferredInput[] {
  const packages = readDependencies(cliDirectory)
    .map(([name]) => name)
    .filter((name) => name.startsWith("@codependix/"));

  return [{ externalDependencies: [CLI_PACKAGE_NAME, ...packages].toSorted() }];
}

/**
 * Globs over the sources and manifest of the command line and of every
 * workspace package it reaches, sorted so the cache key is stable.
 */
function resolveWorkspaceInputs(args: {
  cliDirectory: string;
  logger: ToolInputsLogger;
  workspaceRoot: string;
}): InferredInput[] {
  const realWorkspaceRoot = realpathSync(args.workspaceRoot);
  const { directories, unresolved } = collectWorkspacePackages(
    args.cliDirectory,
  );

  if (unresolved.length > 0) {
    warnUnresolved({ logger: args.logger, names: unresolved });
  }

  return [...directories]
    .flatMap((directory) =>
      TOOL_PACKAGE_GLOBS.map(
        (glob) =>
          `{workspaceRoot}/${path.relative(realWorkspaceRoot, directory)}/${glob}`,
      ),
    )
    .toSorted();
}

/** Copies an untrusted value into a record, or an empty one. */
function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? { ...value } : {};
}

/** Names the packages whose changes a cached gate will not notice. */
function warnUnresolved(args: {
  logger: ToolInputsLogger;
  names: readonly string[];
}): void {
  args.logger.warn(
    `🕸️ Skipped the cache inputs of ${args.names.join(", ")}, which could not be resolved, so a change to ${args.names.length === 1 ? "it" : "them"} will not invalidate a cached codependix gate.`,
  );
}
