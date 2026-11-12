import type { Command } from "../command/command.types";

/** The fields of a tarball's `package.json` the sandbox reads. */
export interface Manifest {
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly name: string;
}

/** Which packed packages to install, and where their tarballs are. */
export interface TarballSandboxOptions {
  /**
   * Every package the sandbox needs, closure included: a tarball's
   * workspace dependencies resolve only to tarballs named here.
   */
  readonly packages: readonly string[];
  /** Overrides `<workspaceRoot>/dist/tarballs`. */
  readonly tarballDirectory?: string;
  readonly workspaceRoot: string;
}

/** An isolated consumer project with packed tarballs installed from files. */
export interface TarballSandboxRunner {
  /** Starts a command in the sandbox; its installed binaries are on `PATH`. */
  readonly command: (command: string, args?: readonly string[]) => Command;
  /** The sandbox's directory, in the system's temporary directory. */
  readonly directory: string;
  /** Removes the sandbox. */
  readonly dispose: () => void;
  /** The tarballs that were installed. */
  readonly tarballs: readonly string[];
}
