import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { ConfigurationService } from "@codependix/configuration";
import { Injectable } from "@nestjs/common";

import { PluginService } from "../plugin/plugin.service";

import {
  CLI_ENTRY_SPECIFIER,
  EXECUTOR_OPTION_SURFACE,
  LOADER_SPECIFIER,
  NX_CONFIGURATION_FILENAME,
  UNCACHEABLE_SELECTION_MESSAGE,
} from "./gate.constants";

import type {
  BuildBatchArguments,
  BuildCommandArguments,
  GateOptions,
  GateSelection,
  RunGateArguments,
} from "./gate.types";

/**
 * Runs `codependix map --check boundaries` for the projects one gate judges, as a child process.
 *
 * The check boots NestJS containers from TypeScript sources, which needs the decorator metadata
 * only the `@swc-node/register` loader emits. Only a fresh `node --import` can provide it.
 */
@Injectable()
export class GateService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly pluginService: PluginService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Reads a list of names from an executor option. Entries are split on commas and blanks
   * dropped, so `--projects="a, b,"` names two projects.
   */
  private readNameList(value: readonly string[] | undefined): string[] {
    return (value ?? [])
      .flatMap((entry) => entry.split(","))
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "");
  }

  /**
   * Reads the workspace's `nx.json`, or nothing when it cannot be read. The caller falls back
   * to the conventional paths.
   */
  private readNxConfiguration(workspaceRoot: string): unknown {
    try {
      return JSON.parse(
        readFileSync(
          path.join(workspaceRoot, NX_CONFIGURATION_FILENAME),
          "utf8",
        ),
      ) as unknown;
    } catch {
      return undefined;
    }
  }

  /**
   * Runs the command line, forwarding its output. A signal kill is a failure: no verdict was reached.
   */
  private async spawnCommandLine(args: {
    argv: string[];
    workspaceRoot: string;
  }): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args.argv, {
        cwd: args.workspaceRoot,
        stdio: ["ignore", "pipe", "pipe"],
      });

      child.stdout.on("data", (chunk: Buffer) => process.stdout.write(chunk));
      child.stderr.on("data", (chunk: Buffer) => process.stderr.write(chunk));
      child.on("error", reject);
      child.on("close", (exitCode: null | number) => {
        resolve(exitCode === 0);
      });
    });
  }

  // 🌎 Public Methods

  /**
   * Builds the `node` arguments for a run whose configuration is already resolved, as a batch's is.
   */
  public buildBatchArguments(args: BuildBatchArguments): string[] {
    return this.buildCommandArguments({
      cliEntryPath: createRequire(import.meta.url).resolve(CLI_ENTRY_SPECIFIER),
      configurationPath: args.configurationPath,
      dependencies: args.dependencies,
      loaderUrl: pathToFileURL(
        createRequire(import.meta.url).resolve(LOADER_SPECIFIER),
      ).href,
      projects: args.projects,
      tags: args.tags,
      workspaceRoot: args.workspaceRoot,
    });
  }

  /**
   * Builds the `node` arguments one gate runs. A finding fails the gate only when charged to a
   * judged project.
   */
  public buildCommandArguments(args: BuildCommandArguments): string[] {
    return [
      "--import",
      args.loaderUrl,
      args.cliEntryPath,
      "map",
      "--directory",
      args.workspaceRoot,
      "--config",
      args.configurationPath,
      "--check",
      "boundaries",
      ...(args.projects.length > 0
        ? ["--projects", args.projects.join(",")]
        : []),
      ...(args.tags.length > 0 ? ["--tags", args.tags.join(",")] : []),
      ...(args.dependencies ? [] : ["--no-dependencies"]),
    ];
  }

  /** Whether a selection names exactly the project the target belongs to. */
  public judgesOwnProject(args: {
    projectName: string | undefined;
    selection: GateSelection;
  }): boolean {
    return (
      args.selection.tags.length === 0 &&
      args.selection.projects.length === 1 &&
      args.selection.projects[0] === args.projectName
    );
  }

  /**
   * Resolves the configuration path one gate runs with: the `configuration` option, else the path
   * read back from `nx.json`.
   */
  public resolveConfigurationPath(args: {
    configuration?: string | undefined;
    workspaceRoot: string;
  }): string {
    if (args.configuration !== undefined) {
      return this.configurationService.requireConfigurationPath(
        args.configuration,
        EXECUTOR_OPTION_SURFACE,
      );
    }

    return this.pluginService.resolvePluginOptions({
      options: this.pluginService.readRegisteredOptions(
        this.readNxConfiguration(args.workspaceRoot),
      ),
    }).configurationPath;
  }

  /**
   * Resolves which projects one gate judges: the named `projects` or `tags`, else its own project.
   * Throws rather than judge nothing.
   */
  public resolveSelection(args: {
    options: GateOptions;
    projectName: string | undefined;
  }): GateSelection {
    const projects = this.readNameList(args.options.projects);
    const tags = this.readNameList(args.options.tags);

    if (projects.length > 0 || tags.length > 0) {
      return { projects, tags };
    }

    if (args.projectName === undefined) {
      throw new Error(
        "The codependix gate executor must be run against a project, or given `projects` or `tags`.",
      );
    }

    return { projects: [args.projectName], tags };
  }

  /**
   * Runs one gate. A cached target may judge only its own project, since its inputs cover nothing else.
   */
  public async run(args: RunGateArguments): Promise<boolean> {
    const selection = this.resolveSelection(args);

    if (args.cached && !this.judgesOwnProject({ ...args, selection })) {
      throw new Error(UNCACHEABLE_SELECTION_MESSAGE);
    }

    const argv = this.buildCommandArguments({
      ...selection,
      cliEntryPath: createRequire(import.meta.url).resolve(CLI_ENTRY_SPECIFIER),
      configurationPath: this.resolveConfigurationPath({
        configuration: args.options.configuration,
        workspaceRoot: args.workspaceRoot,
      }),
      dependencies: args.options.dependencies !== false,
      loaderUrl: pathToFileURL(
        createRequire(import.meta.url).resolve(LOADER_SPECIFIER),
      ).href,
      workspaceRoot: args.workspaceRoot,
    });

    return await this.spawnCommandLine({
      argv,
      workspaceRoot: args.workspaceRoot,
    });
  }
}
