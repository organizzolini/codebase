import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { isBuiltin } from "node:module";
import path from "node:path";

import type { BuildOptions, Plugin } from "rolldown";

/** Options for the shared bundle of a NestJS application. */
export interface RolldownApplicationOptions {
  /** Entry points: output name to source path, from the package directory. */
  readonly entry: Readonly<Record<string, string>>;
  /** Workspace-relative directories whose `.ts` files load by glob, built as entries. */
  readonly globbedDirectories?: readonly string[];
  /** The directory of the application being bundled. */
  readonly packageDirectory: string;
  /** Packages this application loads by name at run time, beyond {@link BY_NAME_DEPENDENCIES}. */
  readonly runtimeDependencies?: readonly string[];
}

// TypeORM's driver and pino's pretty transport, which a shared package loads by name.
/** Packages loaded by name at run time, which no import shows. */
export const BY_NAME_DEPENDENCIES = ["pg", "pino-pretty"] as const;

/** Specifier prefixes bundled into the output instead of installed beside it. */
const BUNDLED_PREFIXES = [
  "@codebase/",
  "@oxc-project/runtime",
  "@swc/helpers",
  "tslib",
] as const;

// Besides licenses, a shipped package keeps what Node loads (code, JSON, native
// addons, WebAssembly) and what it reads by name (protobuf, GraphQL, SQL).
// Source maps, declarations, documentation, TypeScript sources and native build
// leftovers stay behind.
/** Extensions a shipped package keeps: what Node loads or reads. */
const RUNTIME_EXTENSIONS = new Set([
  ".cjs",
  ".gql",
  ".graphql",
  ".js",
  ".json",
  ".mjs",
  ".node",
  ".proto",
  ".sql",
  ".wasm",
]);

/** A license file of any spelling, which a redistributed package keeps. */
const LICENSE_FILE = /^(?:copying|licen[cs]e|notice)(?:[-.].*)?$/iu;

/** Directories no run reads: native build intermediates, caches, and binary links. */
const SKIPPED_DIRECTORIES = new Set([".bin", ".tmp", ".deps"]);

/** A native build's per-target intermediates folder, named with a `.target` suffix. */
const NATIVE_TARGET_DIRECTORY = /\.target$/u;

// `nest-commander` loads `@fig/complete-commander`, and with it `prettier`, only
// to write a shell completion spec, which no application here enables.
/** Packages left out though depended on, because no run reaches them. */
const OMITTED_PACKAGES = new Set(["@fig/complete-commander"]);

/** Directory holding the pnpm virtual store, ahead of each `<id>` entry. */
const STORE_SEGMENT = `${path.sep}node_modules${path.sep}.pnpm${path.sep}`;

/**
 * Compiles an application's TypeScript and workspace packages to one ESM file
 * per module, beside a `node_modules` of production packages they import.
 */
export function createRolldownApplicationConfig({
  entry,
  globbedDirectories = [],
  packageDirectory,
  runtimeDependencies = [],
}: RolldownApplicationOptions): BuildOptions {
  const origins = new Map<string, Set<string>>();
  const roots = [
    ...declaredDependencies(packageDirectory),
    ...BY_NAME_DEPENDENCIES,
    ...runtimeDependencies,
  ];
  const workspaceRoot = path.resolve(import.meta.dirname, "../..");
  // Outside `projects/`, whose folders conformetry reads as instances.
  const outputDirectory = path.join(
    workspaceRoot,
    "dist",
    path.basename(packageDirectory),
  );

  const productionModules: Plugin = {
    name: "production-modules",
    resolveId(source, parent) {
      if (parent === undefined || !isInstalledSpecifier(source)) {
        return null;
      }
      const name = packageName(source);
      const directories = origins.get(name) ?? new Set<string>();
      directories.add(path.dirname(parent));
      origins.set(name, directories);

      return { external: true, id: source };
    },
    writeBundle() {
      const names = new Set([...origins.keys(), ...roots]);
      const packages = [...names].map((name) => ({
        directory: locatePackage(name, [
          packageDirectory,
          ...(origins.get(name) ?? []),
          ...[...origins.values()].flatMap((directories) => [...directories]),
        ]),
        name,
      }));
      copyProductionModules(packages, outputDirectory);
    },
  };

  return {
    input: {
      ...Object.fromEntries(
        Object.entries(entry).map(([name, source]) => [
          name,
          path.join(packageDirectory, source),
        ]),
      ),
      ...globbedEntries(workspaceRoot, globbedDirectories),
    },
    output: {
      cleanDir: true,
      dir: outputDirectory,
      entryFileNames: "[name].js",
      format: "esm",
      // NestJS and TypeORM read class `.name`, which a bundle may rename.
      keepNames: true,
      // One file per module, at its source path, so a path built from
      // `import.meta.dirname` still finds its neighbors.
      preserveModules: true,
      preserveModulesRoot: workspaceRoot,
    },
    platform: "node",
    plugins: [productionModules],
    tsconfig: path.join(packageDirectory, "configuration/tsconfig.json"),
  };
}

/**
 * Copies `packages` and the dependencies they need out of the pnpm store into
 * `<outputDirectory>/node_modules`, keeping its layout and links.
 */
export function copyProductionModules(
  packages: readonly { directory: string; name: string }[],
  outputDirectory: string,
): void {
  const storeDirectory = path.join(outputDirectory, "node_modules/.pnpm");
  const entries = new Set(
    [...collectPackages(packages.map(({ directory }) => directory))].map(
      (directory) => storeEntry(directory),
    ),
  );

  for (const entry of entries) {
    cpSync(entry, path.join(storeDirectory, path.basename(entry)), {
      filter: isRuntimeFile,
      recursive: true,
      verbatimSymlinks: true,
    });
  }

  // Links to dependencies left behind, such as optional peers, would dangle.
  for (const entry of entries) {
    const modules = path.join(
      storeDirectory,
      path.basename(entry),
      "node_modules",
    );
    for (const link of dependencyLinks(modules)) {
      if (!existsSync(link.path)) {
        rmSync(link.path);
      }
    }
  }

  for (const { directory, name } of packages) {
    const link = path.join(outputDirectory, "node_modules", name);
    const target = path.join(
      storeDirectory,
      path.basename(storeEntry(directory)),
      "node_modules",
      name,
    );
    mkdirSync(path.dirname(link), { recursive: true });
    symlinkSync(path.relative(path.dirname(link), target), link);
  }
}

/**
 * `roots` and every package they need at run time: dependencies, optional
 * dependencies, and peers that are not optional.
 */
export function collectPackages(roots: readonly string[]): Set<string> {
  const packages = new Set<string>();
  const pending = [...roots];

  for (
    let directory = pending.pop();
    directory !== undefined;
    directory = pending.pop()
  ) {
    if (packages.has(directory)) {
      continue;
    }
    packages.add(directory);
    const needed = neededDependencies(directory);
    const links = dependencyLinks(
      path.join(storeEntry(directory), "node_modules"),
    );
    for (const link of links) {
      if (needed.has(link.name) && isRuntimePackage(link.name)) {
        pending.push(realpathSync(link.path));
      }
    }
  }

  return packages;
}

/** Whether a package belongs in the image: not a type package, and not an omitted one. */
export function isRuntimePackage(name: string): boolean {
  return !name.startsWith("@types/") && !OMITTED_PACKAGES.has(name);
}

/** Whether a file or directory of a package is kept: links and directories, code, data and licenses. */
export function isRuntimeFile(source: string): boolean {
  const name = path.basename(source);
  const stats = lstatSync(source);
  if (stats.isDirectory()) {
    return (
      !SKIPPED_DIRECTORIES.has(name) && !NATIVE_TARGET_DIRECTORY.test(name)
    );
  }

  return (
    stats.isSymbolicLink() ||
    RUNTIME_EXTENSIONS.has(path.extname(name)) ||
    LICENSE_FILE.test(name)
  );
}

/** The first directory in `directories`, or above one, installing `name`. */
export function locatePackage(
  name: string,
  directories: readonly string[],
): string {
  for (const start of directories) {
    for (
      let directory = start;
      path.dirname(directory) !== directory;
      directory = path.dirname(directory)
    ) {
      const candidate = path.join(directory, "node_modules", name);
      if (existsSync(path.join(candidate, "package.json"))) {
        return realpathSync(candidate);
      }
    }
  }
  throw new Error(`Cannot find the installed package ${name}.`);
}

/** The package a specifier names: `@scope/name/sub` is `@scope/name`. */
export function packageName(specifier: string): string {
  const segments = specifier.split("/");

  return segments.slice(0, specifier.startsWith("@") ? 2 : 1).join("/");
}

/** The `.ts` files of `directories` as entry points named by their path from `root`. */
function globbedEntries(
  root: string,
  directories: readonly string[],
): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const directory of directories) {
    for (const file of readdirSync(path.join(root, directory))) {
      if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
        entries[`${directory}/${path.basename(file, ".ts")}`] = path.join(
          root,
          directory,
          file,
        );
      }
    }
  }

  return entries;
}

/** The links in a store entry's `node_modules`, by package name. */
function dependencyLinks(
  modulesDirectory: string,
  scope = "",
): { name: string; path: string }[] {
  const links: { name: string; path: string }[] = [];

  for (const item of readdirSync(modulesDirectory, { withFileTypes: true })) {
    const itemPath = path.join(modulesDirectory, item.name);
    if (item.isSymbolicLink()) {
      links.push({ name: `${scope}${item.name}`, path: itemPath });
    } else if (item.isDirectory() && item.name.startsWith("@")) {
      links.push(...dependencyLinks(itemPath, `${item.name}/`));
    }
  }

  return links;
}

/** The dependencies, optional ones, and required peers a package declares. */
function neededDependencies(packageDirectory: string): Set<string> {
  const manifest = JSON.parse(
    readFileSync(path.join(packageDirectory, "package.json"), "utf8"),
  ) as {
    dependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  };
  const requiredPeers = Object.keys(manifest.peerDependencies ?? {}).filter(
    (name) => manifest.peerDependenciesMeta?.[name]?.optional !== true,
  );

  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...requiredPeers,
  ]);
}

/** The names under `dependencies` that are not workspace packages. */
function declaredDependencies(packageDirectory: string): string[] {
  const manifest = JSON.parse(
    readFileSync(path.join(packageDirectory, "package.json"), "utf8"),
  ) as { dependencies?: Record<string, string> };

  return Object.entries(manifest.dependencies ?? {})
    .filter(([, version]) => !version.startsWith("workspace:"))
    .map(([name]) => name)
    .filter((name) => isInstalledSpecifier(name));
}

/** Whether a specifier names a package that stays installed at run time. */
function isInstalledSpecifier(specifier: string): boolean {
  return !(
    specifier.startsWith(".") ||
    path.isAbsolute(specifier) ||
    isBuiltin(specifier) ||
    BUNDLED_PREFIXES.some((prefix) => specifier.startsWith(prefix))
  );
}

/** The `.pnpm/<id>` directory that holds a package's real files. */
function storeEntry(packageDirectory: string): string {
  const index = packageDirectory.indexOf(STORE_SEGMENT);
  if (index === -1) {
    throw new Error(
      `${packageDirectory} is outside pnpm's virtual store, so its dependencies cannot be found.`,
    );
  }
  const start = index + STORE_SEGMENT.length;
  const identifier = packageDirectory.slice(start).split(path.sep)[0] ?? "";

  return packageDirectory.slice(0, start) + identifier;
}
