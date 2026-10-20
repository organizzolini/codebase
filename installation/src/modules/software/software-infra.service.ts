import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SoftwareBrewService } from "./software-brew.service";
import { INFRASTRUCTURE_TOOLS } from "./software.constants";

/**
 * Installs the infrastructure and DevOps command-line tools, then prints the
 * versions of everything setup installed.
 */
@Injectable()
export class SoftwareInfraService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly softwareBrewService: SoftwareBrewService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SoftwareInfraService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Builds the version summary, one `label: version` line per tool. */
  private buildVersionLines(): string[] {
    return [
      `   Node.js:     ${this.read("node", ["--version"])}`,
      `   pnpm:        ${this.read("pnpm", ["--version"])}`,
      `   Python:      ${this.readMerged("python3", ["--version"])}`,
      `   uv:          ${this.read("uv", ["--version"])}`,
      `   Ollama:      ${this.readMerged("ollama", ["--version"])}`,
      `   Gitleaks:    ${this.readMerged("gitleaks", ["version"], "not installed")}`,
      `   Terraform:   ${this.readTerraformVersion()}`,
      `   Trivy:       ${this.readTrivyVersion()}`,
      `   Supabase:    ${this.read("supabase", ["--version"])}`,
      `   Helm:        ${this.read("helm", ["version", "--short"])}`,
      `   kubectl:     ${this.readKubectlVersion()}`,
      `   Docker:      ${this.readMerged("docker", ["--version"], "not installed")}`,
    ];
  }

  /** Runs a command and returns its trimmed standard output, or `fallback` when it fails. */
  private read(command: string, args: string[], fallback = ""): string {
    const result = this.processRunner.run(command, args, { capture: true });

    return result.status === 0 ? result.stdout.trim() : fallback;
  }

  /** kubectl's client version, the short form where it still exists. */
  private readKubectlVersion(): string {
    return (
      this.read("kubectl", ["version", "--client", "--short"]) ||
      this.read("kubectl", ["version", "--client"]).split("\n", 1).join("")
    );
  }

  /** Like `read`, with standard error merged in as `2>&1` would. */
  private readMerged(command: string, args: string[], fallback = ""): string {
    const result = this.processRunner.run(command, args, { capture: true });

    return result.status === 0 ? result.output.trim() : fallback;
  }

  /** Terraform's version from its JSON form, or the first line of its text form. */
  private readTerraformVersion(): string {
    try {
      const parsed: unknown = JSON.parse(
        this.read("terraform", ["version", "-json"]),
      );

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "terraform_version" in parsed &&
        typeof parsed.terraform_version === "string"
      ) {
        return parsed.terraform_version;
      }
    } catch {
      // Older Terraform has no JSON form; fall through to the text one.
    }

    return this.read("terraform", ["version"]).split("\n", 1).join("");
  }

  /** Trivy's version: the last word of the first line it prints. */
  private readTrivyVersion(): string {
    const firstLine = this.readMerged("trivy", ["--version"])
      .split("\n", 1)
      .join("");

    return firstLine.split(/\s+/u).slice(-1).join("");
  }

  // 🌎 Public Methods

  /** Installs every infrastructure tool, then prints the version summary. */
  public installInfrastructureTools(): void {
    for (const { formula, name } of INFRASTRUCTURE_TOOLS) {
      this.softwareBrewService.installOrCheck(name, formula);
    }

    this.reporter.print("");
    this.reporter.print("📋 Installed tool versions:");

    for (const line of this.buildVersionLines()) {
      this.reporter.print(line);
    }
  }
}
