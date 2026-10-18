import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import {
  COMPLETION_COMMANDS,
  GPG_TTY_BLOCK,
  LEGACY_PROCESSES_MARKER,
  LEGACY_PROCESSES_SCRIPT,
  MARKERS,
  NODE_OPTIONS_BLOCK,
  PNPM_BLOCK,
  ZSH_RC_NAME,
} from "./shell-configuration.constants";

/**
 * Writes the persistent shell configuration to the startup files.
 *
 * Changes made while setup runs only reach that one process. Writing them to
 * `~/.zshrc` or `~/.bashrc` is what makes every later terminal have them.
 * Each block carries a marker, so running setup again adds nothing twice.
 */
@Injectable()
export class ShellConfigurationService {
  // 🏗 Dependency Injection

  constructor(
    private readonly processRunner: ProcessRunnerService,
    private readonly reporter: ReporterService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(ShellConfigurationService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Appends a block to a startup file unless its marker is already there. */
  private appendBlock(file: string, marker: string, block: string): void {
    if (this.readStartupFile(file).includes(marker)) {
      return;
    }

    fs.appendFileSync(file, `\n${marker}\n${block}\n`);
  }

  /** Wires completions for each of the tools that is installed. */
  private appendCompletions(file: string): void {
    if (this.readStartupFile(file).includes(MARKERS.completions)) {
      return;
    }

    const shell = path.basename(file) === ZSH_RC_NAME ? "zsh" : "bash";
    const lines = COMPLETION_COMMANDS.filter(
      ({ command }) => this.processRunner.locate(command) !== undefined,
    ).map(({ line }) => line(shell));

    fs.appendFileSync(
      file,
      `\n${[MARKERS.completions, ...lines].join("\n")}\n`,
    );
  }

  /** Wires Terraform's completion, which it installs for itself. */
  private appendTerraformCompletion(file: string): void {
    const terraform = this.processRunner.locate("terraform");

    if (terraform === undefined) {
      return;
    }

    this.appendBlock(
      file,
      MARKERS.terraform,
      `autoload -U +X bashcompinit && bashcompinit 2>/dev/null\ncomplete -o nospace -C ${terraform} terraform`,
    );
  }

  /** Builds the block that loads nvm and its completions. */
  private buildNvmBlock(nvmPrefix: string): string {
    return [
      'export NVM_DIR="$HOME/.nvm"',
      `[ -s "${nvmPrefix}/nvm.sh" ] && . "${nvmPrefix}/nvm.sh"`,
      `[ -s "${nvmPrefix}/etc/bash_completion.d/nvm" ] && . "${nvmPrefix}/etc/bash_completion.d/nvm"`,
    ].join("\n");
  }

  /** Configures one startup file. */
  private configureStartupFile(file: string): void {
    this.reporter.print(`🐚 Configuring shell in ${file}...`);

    this.appendBlock(
      file,
      MARKERS.nvm,
      this.buildNvmBlock(this.findNvmPrefix()),
    );
    this.appendBlock(file, MARKERS.pnpm, PNPM_BLOCK);
    this.appendBlock(file, MARKERS.gpg, GPG_TTY_BLOCK);
    this.appendBlock(file, MARKERS.nodeOptions, NODE_OPTIONS_BLOCK);
    this.appendCompletions(file);
    this.appendTerraformCompletion(file);
    this.removeProcessesBlock(file);

    this.reporter.print(`✅ Shell configuration updated in ${file}`);
  }

  /** Where Homebrew put nvm, which its startup script is sourced from. */
  private findNvmPrefix(): string {
    return this.processRunner
      .runOrThrow("brew", ["--prefix", "nvm"], { capture: true })
      .stdout.trim();
  }

  /** Tells the user what to add by hand for a shell this project does not configure. */
  private printManualInstructions(): void {
    const nvmPrefix = this.findNvmPrefix();

    this.reporter.print(
      "⚠️  Unsupported shell. Please add the following to your shell config manually:",
    );
    this.reporter.print('   export NVM_DIR="$HOME/.nvm"');
    this.reporter.print(
      `   [ -s "${nvmPrefix}/nvm.sh" ] && . "${nvmPrefix}/nvm.sh"`,
    );
    this.reporter.print('   export PNPM_HOME="$HOME/.local/share/pnpm"');
    this.reporter.print("   export GPG_TTY=$(tty)");
    this.reporter.print('   export NODE_OPTIONS="--max-old-space-size=2048"');
  }

  /** Reads a startup file, or an empty string when there is none yet. */
  private readStartupFile(file: string): string {
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  }

  /**
   * Removes the block an earlier run wrote to source `scripts/shell/processes.sh`,
   * which no longer exists. The block was a marker line and one sourcing line;
   * a marker followed by anything else was not written by this command.
   */
  private removeProcessesBlock(file: string): void {
    const lines = this.readStartupFile(file).split("\n");
    const start = lines.indexOf(LEGACY_PROCESSES_MARKER);

    if (start === -1 || !lines[start + 1]?.includes(LEGACY_PROCESSES_SCRIPT)) {
      return;
    }

    lines.splice(start, 2);
    fs.writeFileSync(file, lines.join("\n"));
  }

  // 🌎 Public Methods

  /** Configures the startup files of the shell this process was started from. */
  public configureShell(): void {
    const home = os.homedir();
    const shell = path.basename(process.env["SHELL"] ?? "");

    this.reporter.print("🐚 Configuring shell...");

    if (shell === "zsh") {
      this.configureStartupFile(path.join(home, ".zshrc"));
    } else if (shell === "bash") {
      this.configureStartupFile(path.join(home, ".bashrc"));

      // macOS terminals start login shells, which read this file instead.
      if (fs.existsSync(path.join(home, ".bash_profile"))) {
        this.configureStartupFile(path.join(home, ".bash_profile"));
      }
    } else {
      this.printManualInstructions();
    }
  }
}
