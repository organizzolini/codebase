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

/** A formula to install, and the command that shows it is there. */
export interface InfrastructureTool {
  /** The tap path or formula name, when it is not the command. */
  formula?: string;
  /** The command whose presence means the tool is installed. */
  name: string;
}

/** The validated shape of the variables the software command reads. */
export type SoftwareEnvironment = z.infer<typeof environmentSchema>;
