import type { Command, CommandResult } from "../command/command.types";
import type { TarballSandboxOptions } from "../tarball-sandbox/tarball-sandbox.types";

/** A clean Nx consumer workspace whose installs resolve from the registry. */
export interface ConsumerWorkspace {
  /** Starts a command in the workspace; its installed binaries are on `PATH`. */
  readonly command: (command: string, args?: readonly string[]) => Command;
  readonly directory: string;
  /** Runs `nx generate <generator> ...args`. */
  readonly generate: (
    generator: string,
    args?: readonly string[],
  ) => Promise<CommandResult>;
  /** Adds a plugin to `nx.json`, once; options make it an object entry. */
  readonly registerPlugin: (
    plugin: string,
    options?: Readonly<Record<string, unknown>>,
  ) => void;
  /** Runs `nx run <project:target> ...args`, for example a gate. */
  readonly runTarget: (
    target: string,
    args?: readonly string[],
  ) => Promise<CommandResult>;
}

/** What a consumer workspace installs. */
export interface ConsumerWorkspaceOptions {
  /** Published packages, installed at the runner's tag. */
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly packages: readonly string[];
}

/** An ephemeral Verdaccio registry on its own port, and what it hosts. */
export interface VerdaccioPluginRunner {
  /** Bootstraps a consumer workspace and installs from the registry. */
  readonly createWorkspace: (
    options: ConsumerWorkspaceOptions,
  ) => Promise<ConsumerWorkspace>;
  readonly port: number;
  /** Publishes packed tarballs under the tag, manifests untouched. */
  readonly publish: (options: TarballSandboxOptions) => Promise<void>;
  /** Ends with a slash, so a package name can follow it. */
  readonly registryUrl: string;
  /** Stops the registry and removes its storage and workspaces. */
  readonly stop: () => Promise<void>;
  readonly tag: string;
}

/** How to start a registry. */
export interface VerdaccioPluginRunnerOptions {
  /**
   * Scopes, such as `@callidescope`, whose packages the registry never
   * proxies. Without this, the registry refuses to publish a version the
   * real registry already has, which every released package does.
   */
  readonly localScopes?: readonly string[];
  /** The dist-tag published packages carry; defaults to `e2e`. */
  readonly tag?: string;
}
