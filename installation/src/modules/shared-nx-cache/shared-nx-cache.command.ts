import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { ReporterService } from "../reporter/reporter.service";

import { SharedNxCacheServerService } from "./shared-nx-cache-server.service";
import {
  BIND_ADDRESS,
  DEFAULT_DIRECTORY,
  DEFAULT_PORT,
  DIGITS_PATTERN,
  MAXIMUM_PORT,
} from "./shared-nx-cache.constants";

import type { ServerOptions } from "./shared-nx-cache.types";

/**
 * CLI command that runs Nx's self-hosted remote cache, so every git worktree shares task outputs.
 *
 * Runs in the foreground until SIGINT or SIGTERM, then closes the server. Listens on 127.0.0.1 only.
 * Running it in the background is the calling shell's job.
 */
@Command({
  description:
    "Serve a local Nx remote cache on 127.0.0.1 that every worktree on this machine shares",
  name: "shared-nx-cache",
})
@Injectable()
export class SharedNxCacheCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly sharedNxCacheServerService: SharedNxCacheServerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SharedNxCacheCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Reads `--directory`. */
  @Option({
    description: `Where cached task outputs are stored (default ${DEFAULT_DIRECTORY})`,
    flags: "--directory <directory>",
  })
  public parseDirectory(value: string): string {
    return value;
  }

  /** Reads `--port`, refusing anything that is not a port number. */
  @Option({
    description: `The port to listen on (default ${String(DEFAULT_PORT)})`,
    flags: "--port <port>",
  })
  public parsePort(value: string): number {
    const port = Number(value);

    if (!DIGITS_PATTERN.test(value) || port > MAXIMUM_PORT) {
      throw new Error(`--port must be an integer from 0 to ${MAXIMUM_PORT}`);
    }

    return port;
  }

  /** Serves until SIGINT or SIGTERM, then closes the server. */
  public async run(
    _parameters: string[],
    options: Partial<ServerOptions> = {},
  ): Promise<void> {
    const server = await this.sharedNxCacheServerService.start({
      directory: options.directory ?? DEFAULT_DIRECTORY,
      port: options.port ?? DEFAULT_PORT,
    });

    this.reporter.print(
      `🗄️ Nx shared cache listening on http://${BIND_ADDRESS}:${String(server.port)}`,
    );
    await new Promise<void>((resolve) => {
      process.once("SIGINT", resolve);
      process.once("SIGTERM", resolve);
    });
    await server.close();
    this.reporter.print("🗄️ Nx shared cache stopped");
  }
}
