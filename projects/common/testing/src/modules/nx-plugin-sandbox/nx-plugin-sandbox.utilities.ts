import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import runServer from "verdaccio";
import { parse } from "yaml";

import { createCommand } from "../command/command.utilities";
import { TARBALL_DIRECTORY } from "../tarball-sandbox/tarball-sandbox.constants";
import { findTarballs } from "../tarball-sandbox/tarball-sandbox.utilities";
import { makeDirectory } from "../temporary-directory/temporary-directory.utilities";

import {
  DEFAULT_REGISTRY_TAG,
  REGISTRY_OPERATION_TIMEOUT_MS,
  REGISTRY_PASSWORD,
  REGISTRY_USER_PREFIX,
  VERDACCIO_CONFIG_PATH,
  VERDACCIO_MAXIMUM_BODY_SIZE,
} from "./nx-plugin-sandbox.constants";
import { bootstrapConsumerWorkspace } from "./nx-plugin-sandbox.functions";

import type {
  VerdaccioPluginRunner,
  VerdaccioPluginRunnerOptions,
} from "./nx-plugin-sandbox.types";
import type { Server } from "node:http";

/** Starts an ephemeral Verdaccio registry on a free local port. */
export async function startVerdaccioPluginRunner(
  options: VerdaccioPluginRunnerOptions = {},
): Promise<VerdaccioPluginRunner> {
  const tag = options.tag ?? DEFAULT_REGISTRY_TAG;
  const directory = makeDirectory("verdaccio");
  const npmrc = path.join(directory, ".npmrc");
  const workspaces: string[] = [];
  const server = await createServer(directory, options.localScopes ?? []);
  const stop = async (): Promise<void> => {
    await closeServer(server);

    for (const created of [directory, ...workspaces]) {
      fs.rmSync(created, { force: true, recursive: true });
    }
  };

  try {
    const { port, registryUrl } = await connect(server, npmrc);

    return {
      createWorkspace: async (workspaceOptions) => {
        const workspace = makeDirectory("consumer-workspace");
        workspaces.push(workspace);

        return bootstrapConsumerWorkspace(
          workspace,
          { tag, url: registryUrl },
          workspaceOptions,
        );
      },
      port,
      publish: async ({ packages, tarballDirectory, workspaceRoot }) => {
        const sourceDirectory =
          tarballDirectory ?? path.join(workspaceRoot, TARBALL_DIRECTORY);

        for (const name of packages) {
          for (const tarball of findTarballs(sourceDirectory, [name])) {
            await publishTarball(tarball, { name, npmrc, registryUrl, tag });
          }
        }
      },
      registryUrl,
      stop,
      tag,
    };
  } catch (error) {
    await stop();
    throw error;
  }
}

/** Closes a server, dropping any connection still open. */
async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
    server.closeAllConnections();
  });
}

/** Listens, signs up a user, and writes that user's `.npmrc`. */
async function connect(
  server: Server,
  npmrc: string,
): Promise<{ readonly port: number; readonly registryUrl: string }> {
  await listen(server);
  const address = server.address();
  assert.ok(typeof address === "object" && address !== null);
  const { port } = address;
  const registryUrl = `http://127.0.0.1:${port}/`;
  const token = await createRegistryToken(registryUrl);
  fs.writeFileSync(
    npmrc,
    `registry=${registryUrl}\n//127.0.0.1:${port}/:_authToken=${token}\n`,
  );

  return { port, registryUrl };
}

/** Signs up the sandbox user, since publishing refuses a made-up token. */
async function createRegistryToken(registryUrl: string): Promise<string> {
  const user = `${REGISTRY_USER_PREFIX}-${crypto.randomUUID()}`;
  const response = await fetch(
    `${registryUrl}-/user/org.couchdb.user:${user}`,
    {
      body: JSON.stringify({
        name: user,
        password: REGISTRY_PASSWORD,
        type: "user",
      }),
      headers: { "content-type": "application/json" },
      method: "PUT",
    },
  );

  if (!response.ok) {
    throw new Error(
      `The registry refused to sign up a user: ${response.status}`,
    );
  }
  const { token } = (await response.json()) as { token: string };

  return token;
}

/** Builds a Verdaccio server, not yet listening; `localScopes` match before the proxying `**`. */
async function createServer(
  directory: string,
  localScopes: readonly string[],
): Promise<Server> {
  const config = parse(fs.readFileSync(VERDACCIO_CONFIG_PATH, "utf8")) as {
    packages?: Record<string, unknown>;
  };
  const local = Object.fromEntries(
    localScopes.map((scope) => [
      `${scope}/*`,
      { access: "$all", publish: "$all", unpublish: "$all" },
    ]),
  );

  return (await runServer({
    ...config,
    max_body_size: VERDACCIO_MAXIMUM_BODY_SIZE,
    packages: { ...local, ...config.packages },
    self_path: directory,
    storage: path.join(directory, "storage"),
  })) as Server;
}

/** Listens on a free local port chosen by the operating system. */
async function listen(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });
}

/** Publishes one tarball as packed; its scope pins the registry, since `publishConfig` beats `--registry`. */
async function publishTarball(
  tarball: string,
  registry: {
    readonly name: string;
    readonly npmrc: string;
    readonly registryUrl: string;
    readonly tag: string;
  },
): Promise<void> {
  const [scope] = registry.name.startsWith("@") ? registry.name.split("/") : [];
  const result = await createCommand("npm", [
    "publish",
    tarball,
    "--tag",
    registry.tag,
    "--userconfig",
    registry.npmrc,
    ...(scope === undefined
      ? []
      : [`--${scope}:registry=${registry.registryUrl}`]),
  ])
    .withTimeout(REGISTRY_OPERATION_TIMEOUT_MS)
    .run();

  if (result.exitCode !== 0) {
    throw new Error(`npm publish failed for ${tarball}:\n${result.stderr}`);
  }
}
