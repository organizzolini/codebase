import { spawnSync } from "node:child_process";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import {
  ESCAPE_SEQUENCE_PATTERN,
  INHERITED_VARIABLE_PATTERN,
  MAXIMUM_OUTPUT_BYTES,
} from "./publishable-packages-consumer.constants";

import type {
  ConsumerCommand,
  ConsumerCommandResult,
  ConsumerContext,
} from "./publishable-packages.types";

/**
 * Runs a command inside a consumer, isolated from the workspace that packed
 * its tarballs and from any registry token.
 */
@Injectable()
export class PublishablePackagesProcessService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(PublishablePackagesProcessService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Inherits this process's environment minus anything that would reach this
   * workspace or a registry token, and points npm's user config inside the
   * consumer.
   */
  private createEnvironment(context: ConsumerContext): NodeJS.ProcessEnv {
    const environment: NodeJS.ProcessEnv = {};
    for (const [name, value] of Object.entries(process.env)) {
      if (!INHERITED_VARIABLE_PATTERN.test(name)) {
        environment[name] = value;
      }
    }

    const workspacePrefix = `${context.workspaceRoot}${path.sep}`;
    const searchPath: string[] = [];
    for (const entry of (environment["PATH"] ?? "").split(path.delimiter)) {
      const insideWorkspace =
        entry === context.workspaceRoot || entry.startsWith(workspacePrefix);
      if (entry !== "" && !insideWorkspace) {
        searchPath.push(entry);
      }
    }

    return {
      ...environment,
      FORCE_COLOR: "0",
      npm_config_userconfig: path.join(context.directory, ".npmrc-user"),
      NX_DAEMON: "false",
      NX_NO_CLOUD: "true",
      NX_TUI: "false",
      PATH: searchPath.join(path.delimiter),
    };
  }

  // 🌎 Public Methods

  /**
   * Runs one command in the consumer's directory, returning its combined output
   * without color codes and its exit code.
   */
  public run(
    context: ConsumerContext,
    command: ConsumerCommand,
  ): ConsumerCommandResult {
    const result = spawnSync(command.executable, [...command.args], {
      cwd: context.directory,
      encoding: "utf8",
      env: this.createEnvironment(context),
      maxBuffer: MAXIMUM_OUTPUT_BYTES,
      timeout: command.timeout,
    });
    const printed = [result.stdout, result.stderr]
      .filter((stream): stream is string => typeof stream === "string")
      .join("");
    const output = result.error ? `${printed}${String(result.error)}` : printed;

    return {
      output: output.replaceAll(ESCAPE_SEQUENCE_PATTERN, ""),
      status: result.status,
    };
  }
}
