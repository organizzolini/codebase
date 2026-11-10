// 🛠️ Utilities

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";

import { MainModule } from "../../conformetry-nx.module";
import { GeneratorService } from "../generator/generator.service";
import { OptionsService } from "../options/options.service";
import { ProjectsService } from "../projects/projects.service";

import { PLUGIN_CONTEXT_GLOBAL_KEY } from "./plugin.constants";
import { PluginService } from "./plugin.service";

import type { PluginContextGlobal } from "./plugin.types";
import type { INestApplicationContext } from "@nestjs/common";

/** Resolves the service that derives the consumer's generator plugin. */
export async function resolveGeneratorService(): Promise<GeneratorService> {
  const context = await resolvePluginContext();

  return context.get(GeneratorService);
}

/** Resolves the service that reads this plugin's registration in `nx.json`. */
export async function resolveOptionsService(): Promise<OptionsService> {
  const context = await resolvePluginContext();

  return context.get(OptionsService);
}

/** Resolves the service backing target inference, generation, and validation. */
export async function resolvePluginService(): Promise<PluginService> {
  const context = await resolvePluginContext();

  return context.get(PluginService);
}

/** Resolves the service that lists the workspace's projects. */
export async function resolveProjectsService(): Promise<ProjectsService> {
  const context = await resolvePluginContext();

  return context.get(ProjectsService);
}

/**
 * Builds, or returns, this process's application context.
 *
 * Cached on `globalThis`, so concurrent callers share one bootstrap.
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
