import { ConfigurationService } from "@coinagerie/configuration";
import { MalformedGlossaryError } from "@coinagerie/core";
import {
  ComparisonService,
  DeliveryService,
  MarkdownService,
} from "@coinagerie/output";
import { VocabularyService } from "@coinagerie/vocabulary";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import type { CollectCommandOptions, CollectMode } from "./collect.types";
import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

/**
 * The `coinagerie` command: collect the code's vocabulary, then print it,
 * check every glossary against it, or write it into every glossary.
 *
 * With no flag it prints the glossary block to standard output and writes
 * nothing. `--check` exits 1 naming each destination's missing and stale
 * words; `--write` rewrites each destination, keeping every definition still
 * in use. A glossary that cannot be fully parsed stops the run before any file
 * is written. Diagnostics go to standard error, so standard output carries
 * only the glossary.
 */
@Command({
  description:
    "List the words the code uses, and check or write a glossary of them",
  name: "collect",
  options: { isDefault: true },
})
@Injectable()
export class CollectCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly vocabularyService: VocabularyService,
    private readonly comparisonService: ComparisonService,
    private readonly deliveryService: DeliveryService,
    private readonly markdownService: MarkdownService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(CollectCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Checks every destination, failing the run when any disagrees. */
  private check(
    configuration: ResolvedCoinagerieConfiguration,
    words: string[],
  ): void {
    const differences = this.deliveryService
      .check({ destinations: configuration.outputs, words })
      .filter(
        (difference) =>
          difference.missing.length > 0 || difference.stale.length > 0,
      );

    for (const { missing, path, stale } of differences) {
      this.fail("🪙 Found a glossary out of step with the code", {
        missing,
        path,
        stale,
      });
    }

    if (differences.length === 0) {
      this.logger.info("✅ Found every glossary in step with the code");
    }
  }

  /** Checks or writes, refusing a glossary that cannot be parsed. */
  private deliver(args: {
    configuration: ResolvedCoinagerieConfiguration;
    mode: "check" | "write";
    words: string[];
  }): void {
    if (args.configuration.outputs.length === 0) {
      this.fail(`🪙 Found no glossary destination to ${args.mode}`, {
        configurationPath: args.configuration.configurationPath,
      });
      return;
    }

    try {
      if (args.mode === "check") {
        this.check(args.configuration, args.words);
      } else {
        this.write(args.configuration, args.words);
      }
    } catch (error: unknown) {
      if (!(error instanceof MalformedGlossaryError)) {
        throw error;
      }

      this.fail("🪙 Refused a glossary it cannot parse", {
        reason: error.message,
      });
    }
  }

  /** Reports why the run failed, and fails it. */
  private fail(message: string, context: Record<string, unknown>): void {
    this.logger.error(message, undefined, context);
    process.exitCode = 1;
  }

  /** Reads the configuration, or reports why it could not be read. */
  private async loadConfiguration(
    options: CollectCommandOptions,
  ): Promise<ResolvedCoinagerieConfiguration | undefined> {
    try {
      return await this.configurationService.loadConfiguration({
        configurationPath: options.config,
        workingDirectory: process.cwd(),
      });
    } catch (error: unknown) {
      this.fail("🪙 Rejected the configuration", { reason: String(error) });
      return undefined;
    }
  }

  /** Prints the glossary block for the vocabulary, every definition empty. */
  private print(words: string[]): void {
    const glossary = this.comparisonService.reconcile(words, new Map());

    process.stdout.write(`${this.markdownService.render({ glossary })}\n`);
  }

  /** The mode the flags ask for, or `undefined` when they contradict. */
  private selectMode(options: CollectCommandOptions): CollectMode | undefined {
    if (options.check === true && options.write === true) {
      this.fail("🪙 Rejected the command line", {
        reason: "--check and --write cannot be combined",
      });
      return undefined;
    }

    if (options.check === true) {
      return "check";
    }

    return options.write === true ? "write" : "print";
  }

  /** Writes every destination, saying which files changed. */
  private write(
    configuration: ResolvedCoinagerieConfiguration,
    words: string[],
  ): void {
    const results = this.deliveryService.write({
      destinations: configuration.outputs,
      words,
    });

    for (const { missing, path, stale } of results.filter(
      (result) => result.written,
    )) {
      this.logger.info("🪙 Wrote the glossary", undefined, {
        added: missing,
        deleted: stale,
        path,
      });
    }
  }

  // 🌎 Public Methods

  /** Reads `--check`, which fails the run on any disagreement. */
  @Option({
    description: "Fail when a glossary's words disagree with the code's",
    flags: "--check",
  })
  public parseCheck(): boolean {
    return true;
  }

  /** Reads `--config`, a configuration file relative to the working directory. */
  @Option({
    description:
      "Path to a coinagerie configuration file; coinagerie.config.ts in the working directory is used when omitted",
    flags: "--config <config>",
  })
  public parseConfig(value: string): string {
    return value;
  }

  /** Reads `--write`, which rewrites every glossary. */
  @Option({
    description:
      "Rewrite every glossary to hold exactly the code's words, keeping definitions",
    flags: "--write",
  })
  public parseWrite(): boolean {
    return true;
  }

  /** Collects the vocabulary and prints, checks, or writes it. */
  async run(
    _passedParameters: string[],
    options: CollectCommandOptions = {},
  ): Promise<void> {
    const mode = this.selectMode(options);

    if (mode === undefined) {
      return;
    }

    const configuration = await this.loadConfiguration(options);

    if (configuration === undefined) {
      return;
    }

    const words = await this.vocabularyService.collect(configuration);

    if (mode === "print") {
      this.print(words);
      return;
    }

    this.deliver({ configuration, mode, words });
  }
}
