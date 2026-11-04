// 🛠️ Utilities

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";

import { MainModule } from "../../coinagerie-nx.module";

import { PLUGIN_CONTEXT_GLOBAL_KEY } from "./plugin.constants";
import { PluginService } from "./plugin.service";

import type { PluginContextGlobal } from "./plugin.types";
import type { INestApplicationContext } from "@nestjs/common";

/** Resolves the service backing target inference. */
export async function resolvePluginService(): Promise<PluginService> {
  const context = await resolvePluginContext();

  return context.get(PluginService);
}

/**
 * Builds, or returns, this process's application context.
 *
 * Nx calls plugins from module-level functions with no injection of their own,
 * so a bare function is the only possible entry point. It builds nothing
 * itself: it bootstraps the NestJS context and hands back a service, which is
 * where all the logic lives.
 *
 * The context is cached on `globalThis` rather than in a module variable
 * because the Nx daemon is long-lived and may load this module more than once
 * — under plugin isolation, per worker — and one NestJS context per process is
 * the point. The pending promise is stored, not the resolved context, so
 * concurrent callers share a single bootstrap instead of racing to build two.
 */
async function resolvePluginContext(): Promise<INestApplicationContext> {
  const globalScope: PluginContextGlobal = globalThis;

  globalScope[PLUGIN_CONTEXT_GLOBAL_KEY] ??=
    NestFactory.createApplicationContext(MainModule, {
      abortOnError: false,
      logger: false,
    });

  return await globalScope[PLUGIN_CONTEXT_GLOBAL_KEY];
}
