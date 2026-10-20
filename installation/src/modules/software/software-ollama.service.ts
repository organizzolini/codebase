import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import {
  OLLAMA_DEFAULT_MODEL,
  OLLAMA_READINESS_ATTEMPTS,
  OLLAMA_VERSION_ENDPOINT,
} from "./software.constants";

/**
 * Installs Ollama, makes sure its daemon is running, and pulls the default
 * model.
 *
 * Ollama serves local language models over HTTP. The affirmancy application
 * uses it as its LangChain backend.
 */
@Injectable()
export class SoftwareOllamaService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly softwareBrewService: SoftwareBrewService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareOllamaService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Whether the daemon answers on its port. */
  private isRunning(): boolean {
    return (
      this.processRunner.run("curl", ["-sf", OLLAMA_VERSION_ENDPOINT], {
        capture: true,
      }).status === 0
    );
  }

  /** Starts the daemon, as a Homebrew service when it is one. */
  private start(): void {
    this.reporter.print("🚀 Starting Ollama...");

    const services = this.processRunner.run("brew", ["services", "list"], {
      capture: true,
    });

    if (services.stdout.includes("ollama")) {
      this.processRunner.runOrThrow("brew", ["services", "start", "ollama"]);
    } else {
      this.processRunner.startDetached("ollama", ["serve"]);
    }
  }

  /** Waits for the daemon to answer, for up to the readiness attempts. */
  private async waitUntilReady(): Promise<void> {
    this.reporter.print("⏳ Waiting for Ollama to be ready...");

    for (let attempt = 0; attempt < OLLAMA_READINESS_ATTEMPTS; attempt += 1) {
      if (this.isRunning()) {
        return;
      }

      await this.processRunner.sleep(1);
    }
  }

  // 🌎 Public Methods

  /** Installs Ollama, ensures it is running, and pulls the default model. */
  public async installOllama(): Promise<void> {
    this.softwareBrewService.installOrCheck("ollama");

    this.reporter.print("🦙 Ensuring Ollama is running...");

    if (!this.isRunning()) {
      this.start();
      await this.waitUntilReady();
    }

    this.reporter.print("✅ Ollama is running");
    this.reporter.print(
      `🦙 Pulling default model (${OLLAMA_DEFAULT_MODEL})...`,
    );
    this.processRunner.runOrThrow("ollama", ["pull", OLLAMA_DEFAULT_MODEL]);
  }
}
