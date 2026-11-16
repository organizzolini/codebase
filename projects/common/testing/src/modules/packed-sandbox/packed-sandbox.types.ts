import type { Command, CommandResult } from "../command/command.types";
import type { VerdaccioPluginRunner } from "../nx-plugin-sandbox/nx-plugin-sandbox.types";
import type {
  TarballSandboxOptions,
  TarballSandboxRunner,
} from "../tarball-sandbox/tarball-sandbox.types";

/** A registry whose setup and teardown the harness owns. */
export interface PackedRegistry {
  readonly runner: VerdaccioPluginRunner;
}

/** The registry's scopes, and the packages it publishes. */
export interface PackedRegistryOptions extends TarballSandboxOptions {
  readonly localScopes: readonly string[];
}

/** A packed sandbox whose setup and teardown the harness owns. */
export interface PackedSandbox {
  /** Starts a command in the sandbox; its installed binaries are on `PATH`. */
  readonly command: (command: string, args?: readonly string[]) => Command;
  /** The sandbox's directory. */
  readonly directory: string;
  /** Runs the installed binary from `directory`, outside the sandbox. */
  readonly run: (
    directory: string,
    args: readonly string[],
  ) => Promise<CommandResult>;
  /** The underlying runner. */
  readonly sandbox: TarballSandboxRunner;
}

/** Which packed packages to install, and the binary `run` starts. */
export interface PackedSandboxOptions extends TarballSandboxOptions {
  /** The installed binary `run` starts, such as `codometer`. */
  readonly binary: string;
}
