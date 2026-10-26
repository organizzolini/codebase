// 🏷️ Types

import type { PluginInput } from "../options/options.types";
import type { PLUGIN_CONTEXT_GLOBAL_KEY } from "./plugin.constants";
import type { INestApplicationContext } from "@nestjs/common";

/** A target this plugin infers onto a project. */
export interface InferredTarget {
  readonly cache: boolean;
  readonly executor: string;
  /** Files whose change must invalidate the cached result. */
  readonly inputs: PluginInput[];
  readonly options: Record<string, unknown>;
}

/** One project's inferred targets, keyed by target name. */
export type InferredTargets = Record<string, InferredTarget>;

/** Arguments for inferring targets from every configuration Nx matched. */
export interface InferTargetsArguments {
  /** Every coinagerie configuration Nx matched, workspace-root relative. */
  readonly configurationFiles: readonly string[];
  readonly options: unknown;
  readonly workspaceRoot: string;
}

/** `globalThis`, widened with the slot the plugin caches its context in. */
export type PluginContextGlobal = typeof globalThis & {
  [PLUGIN_CONTEXT_GLOBAL_KEY]?: Promise<INestApplicationContext>;
};
