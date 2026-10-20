import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

/**
 * Prints what setup is doing to the terminal, one line at a time.
 *
 * Plain text rather than structured logs: the person running setup is
 * watching it, and the lines are what they read.
 */
@Injectable()
export class ReporterService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(ReporterService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Prints one line. */
  public print(line: string): void {
    console.info(line);
  }
}
