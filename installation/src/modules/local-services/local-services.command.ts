import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { LocalServicesService } from "./local-services.service";

/**
 * CLI command that starts the Docker daemon, when this machine can run one,
 * and the Postgres container on it.
 *
 * Never fails for want of Docker. Safe to run again.
 */
@Command({
  description:
    "Start the Docker daemon where possible, then the local Postgres container",
  name: "local-services",
})
@Injectable()
export class LocalServicesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly localServicesService: LocalServicesService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(LocalServicesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Starts the local services. */
  public async run(): Promise<void> {
    await this.localServicesService.startLocalServices();
  }
}
