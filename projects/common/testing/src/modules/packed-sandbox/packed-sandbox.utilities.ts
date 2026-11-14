import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll } from "vitest";

import { startVerdaccioPluginRunner } from "../nx-plugin-sandbox/nx-plugin-sandbox.utilities";
import { createTarballSandboxRunner } from "../tarball-sandbox/tarball-sandbox.utilities";

import type { VerdaccioPluginRunner } from "../nx-plugin-sandbox/nx-plugin-sandbox.types";
import type { TarballSandboxRunner } from "../tarball-sandbox/tarball-sandbox.types";
import type {
  PackedRegistry,
  PackedRegistryOptions,
  PackedSandbox,
  PackedSandboxOptions,
} from "./packed-sandbox.types";

/** The version of `name` the workspace has installed, so a registry release cannot move a leg. */
export function installedVersion(workspaceRoot: string, name: string): string {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(workspaceRoot, "node_modules", name, "package.json"),
      "utf8",
    ),
  ) as { version: string };

  return manifest.version;
}

/**
 * Starts a registry and publishes packed tarballs to it before the
 * suite, then stops it after. Call inside `describe`.
 */
export function usePackedRegistry(
  options: PackedRegistryOptions,
): PackedRegistry {
  let runner: undefined | VerdaccioPluginRunner;

  beforeAll(async () => {
    runner = await startVerdaccioPluginRunner({
      localScopes: options.localScopes,
    });
    await runner.publish({
      packages: options.packages,
      workspaceRoot: options.workspaceRoot,
    });
  });

  afterAll(async () => {
    await runner?.stop();
  });

  return {
    get runner() {
      if (runner === undefined) {
        throw new Error(
          "The packed registry is read before its suite started.",
        );
      }

      return runner;
    },
  };
}

/**
 * Installs packed tarballs before the suite and removes them after it.
 * Call inside `describe`; read the accessor only in hooks and tests.
 */
export function usePackedSandbox(options: PackedSandboxOptions): PackedSandbox {
  let sandbox: TarballSandboxRunner | undefined;
  const current = (): TarballSandboxRunner => {
    if (sandbox === undefined) {
      throw new Error("The packed sandbox is read before its suite started.");
    }

    return sandbox;
  };

  beforeAll(async () => {
    sandbox = await createTarballSandboxRunner(options);
  });

  afterAll(() => {
    sandbox?.dispose();
  });

  return {
    command: (command, args) => current().command(command, args),
    get directory() {
      return current().directory;
    },
    run: async (directory, args) =>
      current()
        .command(
          path.join(current().directory, "node_modules/.bin", options.binary),
          args,
        )
        .inDirectory(directory)
        .run(),
    get sandbox() {
      return current();
    },
  };
}
