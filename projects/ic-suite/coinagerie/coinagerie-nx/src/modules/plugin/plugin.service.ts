import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { CONFIGURATION_FILE_NAMES } from "@coinagerie/configuration";
import { Injectable } from "@nestjs/common";

import { OptionsService } from "../options/options.service";

import {
  PACKAGE_JSON_FILENAME,
  PROJECT_FILES_INPUT,
  PROJECT_JSON_FILENAME,
} from "./plugin.constants";

import type { CoinageriePluginOptions } from "../options/options.types";
import type { InferredTargets, InferTargetsArguments } from "./plugin.types";

/**
 * Everything this plugin does, behind one injectable.
 *
 * Nx calls plugins from module-level functions with no injection of their own,
 * so the bare entry point in `index.ts` builds nothing itself — it resolves
 * this service and hands it the arguments.
 */
@Injectable()
export class PluginService {
  // 🏗 Dependency Injection

  constructor(private readonly optionsService: OptionsService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds the check target of one project.
   *
   * The check passes or fails on the project's configuration and the files
   * that configuration includes, so both are inputs: a cached verdict taken
   * across an edit to either would report the old answer. Whatever the
   * registration declared joins them — the shared configuration a project
   * spreads, or the glossary its `exclude.words` reads, live outside the
   * project and are invisible to it otherwise. Declaring a path under
   * `{workspaceRoot}` is also what makes Nx count an edit to it as touching
   * this project, so `nx affected` selects the check without a dependency edge.
   */
  private buildCheckTarget(
    pluginOptions: CoinageriePluginOptions,
  ): InferredTargets {
    return {
      [pluginOptions.checkTargetName]: {
        cache: true,
        executor: "nx:run-commands",
        inputs: [
          ...CONFIGURATION_FILE_NAMES.map((name) => `{projectRoot}/${name}`),
          PROJECT_FILES_INPUT,
          ...pluginOptions.inputs,
        ],
        options: {
          command: `${pluginOptions.command} --check`,
          cwd: "{projectRoot}",
        },
      },
    };
  }

  /** Whether a `package.json` names a package, which is what makes it a project. */
  private isNamedPackage(manifestPath: string): boolean {
    try {
      const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));

      return (
        typeof manifest === "object" &&
        manifest !== null &&
        "name" in manifest &&
        typeof manifest.name === "string" &&
        manifest.name !== ""
      );
    } catch {
      return false;
    }
  }

  /**
   * Whether a folder is an Nx project, which is what a target can run on.
   *
   * A `package.json` counts only when it names a package, because that is
   * the only kind Nx makes a project of; a node returned for a folder it does
   * not would carry no name and stop the whole project graph.
   */
  private isProject(args: {
    projectRoot: string;
    workspaceRoot: string;
  }): boolean {
    const folder = path.join(args.workspaceRoot, args.projectRoot);

    return (
      existsSync(path.join(folder, PROJECT_JSON_FILENAME)) ||
      this.isNamedPackage(path.join(folder, PACKAGE_JSON_FILENAME))
    );
  }

  // 🌎 Public Methods

  /**
   * Infers a check target onto every project that holds a configuration.
   *
   * A project with no configuration is never matched, so it has no target — a
   * check there would find nothing to read its settings from. The options are
   * read once for the whole workspace rather than once per project, because Nx
   * hands this every matched file at once.
   */
  public inferTargets(
    args: InferTargetsArguments,
  ): Map<string, InferredTargets> {
    const pluginOptions = this.optionsService.resolvePluginOptions(
      args.options,
    );
    const targetsByProjectRoot = new Map<string, InferredTargets>();

    for (const configurationFile of args.configurationFiles) {
      const projectRoot = path.posix.dirname(configurationFile);

      if (
        !targetsByProjectRoot.has(projectRoot) &&
        this.isProject({ projectRoot, workspaceRoot: args.workspaceRoot })
      ) {
        targetsByProjectRoot.set(
          projectRoot,
          this.buildCheckTarget(pluginOptions),
        );
      }
    }

    return targetsByProjectRoot;
  }
}
