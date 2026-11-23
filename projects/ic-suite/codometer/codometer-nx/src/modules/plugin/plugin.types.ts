// 🏷️ Types

import type { PluginInput } from "../options/options.types";
import type { PLUGIN_CONTEXT_GLOBAL_KEY } from "./plugin.constants";
import type { INestApplicationContext } from "@nestjs/common";

/** A target this plugin infers onto a project. */
export interface InferredTarget {
  readonly cache: boolean;
  /** Option overrides an invocation selects with `--configuration`. */
  readonly configurations?: Record<string, Record<string, unknown>>;
  /** The configuration that applies when none is named. */
  readonly defaultConfiguration?: string;
  /** Targets that must run first, in Nx's own syntax. */
  readonly dependsOn?: string[];
  readonly executor: string;
  /** Files whose change must invalidate the cached result. */
  readonly inputs: PluginInput[];
  readonly options: Record<string, unknown>;
  /** Files the task writes, so Nx restores them on a cache hit. */
  readonly outputs: string[];
}

/** One project's inferred targets, keyed by target name. */
export type InferredTargets = Record<string, InferredTarget>;

/** Arguments for inferring targets from every project manifest Nx matched. */
export interface InferTargetsArguments {
  readonly options: unknown;
  /** Every project manifest Nx matched, workspace-root relative. */
  readonly projectFiles: readonly string[];
  readonly workspaceRoot: string;
}

/** `globalThis`, widened with the slot the plugin caches its context in. */
export type PluginContextGlobal = typeof globalThis & {
  [PLUGIN_CONTEXT_GLOBAL_KEY]?: Promise<INestApplicationContext>;
};
