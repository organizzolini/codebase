// 🛠️ Utilities

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";

import { MainModule } from "../../codependix-nx.module";
import { BatchService } from "../batch/batch.service";
import { GateService } from "../gate/gate.service";

import { PLUGIN_CONTEXT_GLOBAL_KEY } from "./plugin.constants";
import { PluginService } from "./plugin.service";

import type { PluginContextGlobal } from "./plugin.types";
import type { INestApplicationContext } from "@nestjs/common";

/** Resolves the service behind the gate executor's batch implementation. */
export async function resolveBatchService(): Promise<BatchService> {
  const context = await resolvePluginContext();

  return context.get(BatchService);
}

/** Resolves the service behind the gate executor. */
export async function resolveGateService(): Promise<GateService> {
  const context = await resolvePluginContext();

  return context.get(GateService);
}

/** Resolves the service behind target inference. */
export async function resolvePluginService(): Promise<PluginService> {
  const context = await resolvePluginContext();

  return context.get(PluginService);
}

/**
 * Builds, or returns, the process's application context. Cached on `globalThis`, so the
 * daemon shares one bootstrap.
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
