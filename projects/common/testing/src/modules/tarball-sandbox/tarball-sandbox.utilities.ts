import fs from "node:fs";
import path from "node:path";

import { createCommand } from "../command/command.utilities";
import { makeDirectory } from "../temporary-directory/temporary-directory.utilities";

import {
  SANDBOX_INSTALL_TIMEOUT_MS,
  TARBALL_DIRECTORY,
} from "./tarball-sandbox.constants";

import type {
  TarballSandboxOptions,
  TarballSandboxRunner,
} from "./tarball-sandbox.types";

/**
 * Installs packed tarballs from files into a fresh temporary project, so a
 * test runs them exactly as a consumer would. Call `dispose` when done.
 */
export async function createTarballSandboxRunner(
  options: TarballSandboxOptions,
): Promise<TarballSandboxRunner> {
  const { packages, workspaceRoot } = options;
  const tarballs = findTarballs(
    options.tarballDirectory ?? path.join(workspaceRoot, TARBALL_DIRECTORY),
    packages,
  );
  const directory = makeDirectory("tarball-sandbox");
  const dispose = (): void => {
    fs.rmSync(directory, { force: true, recursive: true });
  };

  try {
    const names = await Promise.all(
      tarballs.map(async (tarball) => readPackageName(tarball)),
    );
    const files = Object.fromEntries(
      names.map((name, index) => [name, `file:${tarballs[index]}`]),
    );
    fs.writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify({
        dependencies: files,
        name: "tarball-sandbox",
        private: true,
      }),
    );
    fs.writeFileSync(
      path.join(directory, "pnpm-workspace.yaml"),
      JSON.stringify({ overrides: files, strictDepBuilds: false }),
    );
    fs.writeFileSync(path.join(directory, ".npmrc"), "");
    const install = await createCommand("pnpm", ["install"])
      .inDirectory(directory)
      .withEnvironment({
        npm_config_userconfig: path.join(directory, ".npmrc"),
      })
      .withTimeout(SANDBOX_INSTALL_TIMEOUT_MS)
      .run();

    if (install.exitCode !== 0) {
      throw new Error(`pnpm install failed in the sandbox:\n${install.stderr}`);
    }
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    command: (command, args = []) =>
      createCommand(command, args).inDirectory(directory),
    directory,
    dispose,
    tarballs,
  };
}

/**
 * Finds each package's newest `<flat-name>-<version>.tgz` in a directory
 * (`@scope/name` flattens to `scope-name`), in the order given.
 */
export function findTarballs(
  directory: string,
  packages: readonly string[],
): string[] {
  const files = fs.existsSync(directory) ? fs.readdirSync(directory) : [];

  return packages.map((name) => {
    const flat = name.replace(/^@/u, "").replace("/", "-");
    const matches = files
      .filter((file) =>
        new RegExp(String.raw`^${flat}-\d.*\.tgz$`, "u").test(file),
      )
      .map((file) => path.join(directory, file))
      .toSorted((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    const [newest] = matches;

    if (newest === undefined) {
      throw new Error(
        `No tarball for "${name}" in ${directory}; run the pack target first`,
      );
    }

    return newest;
  });
}

/** Reads the `name` a tarball's package declares. */
async function readPackageName(tarball: string): Promise<string> {
  const result = await createCommand("tar", [
    "-xOzf",
    tarball,
    "package/package.json",
  ]).run();

  if (result.exitCode !== 0) {
    throw new Error(`Cannot read ${tarball}:\n${result.stderr}`);
  }

  return (JSON.parse(result.stdout) as { name: string }).name;
}
