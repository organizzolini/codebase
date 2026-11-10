// 🛠️ Utilities

import { existsSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { readJsonFile } from "@nx/devkit";

import { isInsideWorkspace, readDependencies } from "./plugin-inputs.utilities";
import {
  LOCAL_DEPENDENCY_PROTOCOLS,
  PACKAGE_TSCONFIG_FILENAME,
  SKIPPED_BASE_REASONS,
  WORKSPACE_TSCONFIG_INPUT,
} from "./plugin.constants";

import type {
  ExtendedBase,
  ExtendsChain,
  InferredInput,
  ResolveTsconfigInputsArguments,
  ToolInputsLogger,
} from "./plugin.types";

/**
 * Cache inputs for the compiler options the loader reads: the root `tsconfig.json` and every
 * base it extends. Never throws.
 */
export function resolveTsconfigInputs(
  args: ResolveTsconfigInputsArguments,
): InferredInput[] {
  try {
    const workspaceRoot = realpathSync(args.workspaceRoot);
    const { files, packages } = followExtendsChain({
      logger: args.logger,
      workspaceRoot,
    });
    const fileInputs = [...files]
      .map(
        (file) =>
          `{workspaceRoot}/${path.relative(workspaceRoot, file).split(path.sep).join("/")}`,
      )
      .toSorted();

    return packages.size === 0
      ? fileInputs
      : [...fileInputs, { externalDependencies: [...packages].toSorted() }];
  } catch (error) {
    args.logger.warn(
      `🕸️ Skipped following the bases the root tsconfig.json extends, so a change to one will not invalidate a cached codependix gate: ${String(error)}`,
    );

    return [WORKSPACE_TSCONFIG_INPUT];
  }
}

/** Why a base no input can cover was skipped, as a warning phrases it. */
function describeSkippedBase(
  base: Exclude<ExtendedBase, { kind: "file" | "package" }>,
): string {
  return base.kind === "undeclared"
    ? `the root package.json does not declare ${base.name} from a registry`
    : SKIPPED_BASE_REASONS[base.kind];
}

/**
 * Walks the root tsconfig's `extends` chain, each workspace file once. The root is named
 * even when absent.
 */
function followExtendsChain(args: {
  logger: ToolInputsLogger;
  workspaceRoot: string;
}): ExtendsChain {
  const rootFile = path.join(args.workspaceRoot, "tsconfig.json");
  const declared = readRegistryDependencies(args.workspaceRoot);
  const files = new Set([rootFile]);
  const packages = new Set<string>();
  const pending = existsSync(rootFile) ? [rootFile] : [];

  for (
    let current = pending.pop();
    current !== undefined;
    current = pending.pop()
  ) {
    for (const specifier of readExtends({ ...args, file: current })) {
      const base = resolveExtendedBase({
        ...args,
        declared,
        file: current,
        specifier,
      });

      if (base.kind === "file") {
        if (!files.has(base.file)) {
          files.add(base.file);
          pending.push(base.file);
        }
      } else if (base.kind === "package") {
        packages.add(base.name);
      } else {
        warnSkipped({ ...args, base, file: current, specifier });
      }
    }
  }

  return { files, packages };
}

/**
 * Every string a tsconfig's `extends` names, as TypeScript reads it. Nothing, with a
 * warning, when the file cannot be parsed.
 */
function readExtends(args: {
  file: string;
  logger: ToolInputsLogger;
  workspaceRoot: string;
}): string[] {
  try {
    const config = readJsonFile<Record<string, unknown>>(args.file, {
      expectComments: true,
    });

    return [config["extends"]]
      .flat()
      .filter((specifier) => typeof specifier === "string");
  } catch (error) {
    args.logger.warn(
      `🕸️ Skipped the bases ${path.relative(args.workspaceRoot, args.file)} extends, which could not be read, so a change to one will not invalidate a cached codependix gate: ${String(error)}`,
    );

    return [];
  }
}

/**
 * The installed package a real path outside the workspace belongs to: the one under its
 * last `node_modules`, or nothing for a path under none.
 */
function readInstalledPackageName(file: string): string | undefined {
  const segments = file.split(path.sep);
  const start = segments.lastIndexOf("node_modules") + 1;
  const scope = segments[start];

  if (start === 0 || scope === undefined) {
    return undefined;
  }

  return segments
    .slice(start, scope.startsWith("@") ? start + 2 : start + 1)
    .join("/");
}

/**
 * The packages the root manifest declares from a registry. Local protocols are left out,
 * since naming one would fail every gate.
 */
function readRegistryDependencies(workspaceRoot: string): Set<string> {
  return new Set(
    readDependencies(workspaceRoot)
      .filter(
        ([, specifier]) =>
          !LOCAL_DEPENDENCY_PROTOCOLS.some((protocol) =>
            String(specifier).startsWith(protocol),
          ),
      )
      .map(([name]) => name),
  );
}

/**
 * Resolves an `extends` entry to the base it names, sorted by where that base lives. One that
 * resolves nowhere is skipped.
 */
function resolveExtendedBase(args: {
  declared: ReadonlySet<string>;
  file: string;
  specifier: string;
  workspaceRoot: string;
}): ExtendedBase {
  // TypeScript reads either separator, on every platform.
  const specifier = args.specifier.replaceAll("\\", "/");
  const file =
    path.isAbsolute(specifier) ||
    specifier.startsWith("./") ||
    specifier.startsWith("../")
      ? resolvePathBase({ file: args.file, specifier })
      : resolvePackageBase({ file: args.file, specifier });

  if (file === undefined) {
    return { kind: "unresolved" };
  }
  if (
    isInsideWorkspace({ directory: file, workspaceRoot: args.workspaceRoot })
  ) {
    return { file, kind: "file" };
  }

  const name = readInstalledPackageName(file);

  if (name === undefined) {
    return { kind: "outside" };
  }

  return args.declared.has(name)
    ? { kind: "package", name }
    : { kind: "undeclared", name };
}

/**
 * Resolves a package entry as Node does. Only a JSON file counts, since only one can be a base.
 */
function resolvePackageBase(args: {
  file: string;
  specifier: string;
}): string | undefined {
  const { specifier } = args;
  const candidates =
    specifier.split("/").length > (specifier.startsWith("@") ? 2 : 1)
      ? [specifier, `${specifier}.json`]
      : [`${specifier}/${PACKAGE_TSCONFIG_FILENAME}`, specifier];
  const resolver = createRequire(args.file);

  // Every candidate is tried, at most two, so none needs a sentinel.
  const [file] = candidates.flatMap((candidate) => {
    try {
      const resolved = realpathSync(resolver.resolve(candidate));

      return resolved.endsWith(".json") ? [resolved] : [];
    } catch {
      return [];
    }
  });

  return file;
}

/**
 * Resolves a path entry from the extending file's directory, appending `.json` when it names no
 * file. A missing file is still named.
 */
function resolvePathBase(args: { file: string; specifier: string }): string {
  const named = path.resolve(path.dirname(args.file), args.specifier);
  const target =
    statSync(named, { throwIfNoEntry: false })?.isFile() === true ||
    named.endsWith(".json")
      ? named
      : `${named}.json`;

  return existsSync(target) ? realpathSync(target) : target;
}

/** Names a base no input can cover, so a cached gate will not notice it. */
function warnSkipped(args: {
  base: Exclude<ExtendedBase, { kind: "file" | "package" }>;
  file: string;
  logger: ToolInputsLogger;
  specifier: string;
  workspaceRoot: string;
}): void {
  args.logger.warn(
    `🕸️ Skipped the cache input of ${args.specifier}, which ${path.relative(args.workspaceRoot, args.file)} extends, because ${describeSkippedBase(args.base)}, so a change to it will not invalidate a cached codependix gate.`,
  );
}
