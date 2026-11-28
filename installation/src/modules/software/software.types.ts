// 🏷️ Types

import type { environmentSchema } from "../../installation.constants";
import type { z } from "zod";

/** A Go program built from a pinned tag. */
export interface GoTool {
  /** The module path of the `main` package, ending in its `cmd` folder. */
  module: string;
  /** The command the build installs, which is also what tells it is already there. */
  name: string;
  /** The tag to build, without a leading `v`. */
  version: string;
}

/** A Helm plugin installed from a pinned release tarball. */
export interface HelmPlugin {
  /** What this release calls each processor architecture Node reports. */
  architectures: Readonly<Record<string, string>>;
  /** The sha256 of the tarball, by the architecture Node reports. */
  checksums: Readonly<Record<string, string>>;
  /** Where the tarball is downloaded from, with `{version}` and `{architecture}` filled in. */
  downloadUrl: string;
  /** The name `helm plugin list` shows, which also tells it is installed. */
  name: string;
  /** The name `software` is given to install it. */
  software: string;
  /** The release to install, without a leading `v`. */
  version: string;
}

/** A formula to install, and the command that shows it is there. */
export interface InfrastructureTool {
  /** The tap path or formula name, when it is not the command. */
  formula?: string;
  /** The command whose presence means the tool is installed. */
  name: string;
}

/** The validated shape of the variables the software command reads. */
export type SoftwareEnvironment = z.infer<typeof environmentSchema>;
