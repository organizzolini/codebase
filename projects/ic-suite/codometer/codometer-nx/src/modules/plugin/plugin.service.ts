import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { OptionsService } from "../options/options.service";

import {
  BUILD_TARGET_NAME,
  LIMIT_INPUT,
  PACKAGE_JSON_FILENAME,
  PROJECT_JSON_FILENAME,
  WEIGH_MARKDOWN_PATH,
  WEIGH_REPORT_PATH,
} from "./plugin.constants";

import type { CodometerPluginOptions } from "../options/options.types";
import type {
  InferredTarget,
  InferredTargets,
  InferTargetsArguments,
} from "./plugin.types";

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
   * The source gate: `--check limits` measures the source tree alone, so it needs no build, and writes nothing.
   */
  private buildLimitTarget(
    pluginOptions: CodometerPluginOptions,
  ): InferredTarget {
    return {
      cache: true,
      executor: "@codometer/nx:measure",
      inputs: [LIMIT_INPUT, ...pluginOptions.inputs],
      options: {
        check: "limits",
        command: pluginOptions.command,
        config: pluginOptions.projectConfigurationPath,
      },
      outputs: [],
    };
  }

  /**
   * The build gate: `--check weigh` waits for the build, since sizes are read from its output.
   */
  private buildWeighTarget(
    pluginOptions: CodometerPluginOptions,
  ): InferredTarget {
    return {
      cache: true,
      configurations: {
        check: { check: "weigh" },
        write: { outputMarkdown: true },
      },
      defaultConfiguration: "check",
      dependsOn: [BUILD_TARGET_NAME],
      executor: "@codometer/nx:measure",
      inputs: [
        "production",
        "^production",
        `!{projectRoot}/${WEIGH_REPORT_PATH}`,
        ...pluginOptions.inputs,
      ],
      options: {
        command: pluginOptions.command,
        config: pluginOptions.projectConfigurationPath,
        outputJson: true,
      },
      outputs: [
        `{projectRoot}/${WEIGH_REPORT_PATH}`,
        `{projectRoot}/${WEIGH_MARKDOWN_PATH}`,
      ],
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
   * Infers a limit and a weigh target onto each project holding a configuration at the
   * configured path, reading options once per workspace.
   */
  public inferTargets(
    args: InferTargetsArguments,
  ): Map<string, InferredTargets> {
    const pluginOptions = this.optionsService.resolvePluginOptions(
      args.options,
    );
    const targetsByProjectRoot = new Map<string, InferredTargets>();

    for (const projectFile of args.projectFiles) {
      const projectRoot = path.posix.dirname(projectFile);

      if (
        !targetsByProjectRoot.has(projectRoot) &&
        this.isProject({ projectRoot, workspaceRoot: args.workspaceRoot }) &&
        existsSync(
          path.join(
            args.workspaceRoot,
            projectRoot,
            pluginOptions.projectConfigurationPath,
          ),
        )
      ) {
        targetsByProjectRoot.set(projectRoot, {
          [pluginOptions.limitTargetName]: this.buildLimitTarget(pluginOptions),
          [pluginOptions.weighTargetName]: this.buildWeighTarget(pluginOptions),
        });
      }
    }

    return targetsByProjectRoot;
  }
}
