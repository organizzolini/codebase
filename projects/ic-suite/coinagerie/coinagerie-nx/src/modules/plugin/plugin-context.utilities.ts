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
 * Returns this process's Nest context, cached on `globalThis`. Stores the
 * pending promise so concurrent callers share one bootstrap.
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
