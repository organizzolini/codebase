import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

/**
 * Installs a Homebrew formula when its command is missing, and says when an
 * installed one has an upgrade waiting.
 */
@Injectable()
export class SoftwareBrewService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareBrewService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Installs `formula` through Homebrew unless `name` is already a command.
   *
   * @param name - The command whose presence decides whether to install.
   * @param formula - The formula or tap path, when it is not `name` itself.
   */
  public installOrCheck(name: string, formula: string = name): void {
    this.reporter.print(`🔍 Checking for ${name} installation...`);

    if (this.processRunner.locate(name) === undefined) {
      this.reporter.print(`📦 ${name} not found. Installing via Homebrew...`);
      this.processRunner.runOrThrow("brew", ["install", formula]);
      this.reporter.print(`✅ ${name} installed via Homebrew`);

      return;
    }

    this.reporter.print(`👍 ${name} is already installed`);

    if (this.listOutdated().includes(name)) {
      this.reporter.print(
        `🔄 ${name} is outdated. To update, run: brew upgrade ${formula}`,
      );
    }
  }

  /** Lists the Homebrew formulae with an upgrade available. */
  public listOutdated(): string {
    return this.processRunner.run("brew", ["outdated"], { capture: true })
      .stdout;
  }
}
