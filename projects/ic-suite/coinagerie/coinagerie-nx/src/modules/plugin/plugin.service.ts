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
   * Inputs are the project's configuration, its included files, and registered extras. A `{workspaceRoot}` path also marks the project affected on edit.
   */
  private buildCheckTarget(
    pluginOptions: CoinageriePluginOptions,
  ): InferredTargets {
    return {
      [pluginOptions.checkTargetName]: {
        cache: true,
        executor: "@coinagerie/nx:check",
        inputs: [
          ...CONFIGURATION_FILE_NAMES.map((name) => `{projectRoot}/${name}`),
          PROJECT_FILES_INPUT,
          ...pluginOptions.inputs,
        ],
        options: { command: pluginOptions.command },
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
   * Whether a folder is an Nx project. A `package.json` counts only if it names a package; an unnamed one would break the graph.
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
   * Infers a check target onto every project holding a configuration. Options are
   * read once per workspace, since Nx passes every matched file at once.
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
