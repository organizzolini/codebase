import { ConfigurationService } from "@coinagerie/configuration";
import {
  InvalidConfigurationError,
  MalformedGlossaryError,
} from "@coinagerie/core";
import {
  ComparisonService,
  DeliveryService,
  JsonService,
  MarkdownService,
} from "@coinagerie/output";
import { VocabularyService } from "@coinagerie/vocabulary";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { COLLECT_FORMATS } from "./collect.constants";

import type { CollectCommandOptions, CollectMode } from "./collect.types";
import type {
  ConfigurationOverrides,
  ResolvedCoinagerieConfiguration,
} from "@coinagerie/configuration";

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
    private readonly jsonService: JsonService,
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

  /**
   * Collects the vocabulary, or reports the configuration's fault.
   *
   * `exclude.words` and `fold` are the configuration's own code, so a fault in
   * one surfaces here, while the words are collected, naming the file.
   */
  private async collectWords(
    configuration: ResolvedCoinagerieConfiguration,
  ): Promise<string[] | undefined> {
    try {
      return await this.vocabularyService.collect(configuration);
    } catch (error: unknown) {
      if (!(error instanceof InvalidConfigurationError)) {
        throw error;
      }

      this.fail("🪙 Rejected the configuration", { reason: error.message });
      return undefined;
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
        overrides: this.overridesFrom(options),
        workingDirectory: process.cwd(),
      });
    } catch (error: unknown) {
      this.fail("🪙 Rejected the configuration", { reason: String(error) });
      return undefined;
    }
  }

  /** The flags that override the configuration file, as the configuration reads them. */
  private overridesFrom(
    options: CollectCommandOptions,
  ): ConfigurationOverrides {
    return {
      description: options.description,
      excludePaths: options.excludePaths,
      include: options.include,
      outputJson: options.outputJson,
      outputMarkdown: options.outputMarkdown,
    };
  }

  /**
   * Prints the glossary for the vocabulary, every definition empty: the
   * markdown block, or the flat JSON object when `--format json` asks.
   */
  private print(words: string[], format: string | undefined): void {
    const glossary = this.comparisonService.reconcile(words, new Map());

    process.stdout.write(
      format === "json"
        ? this.jsonService.render(glossary)
        : `${this.markdownService.render({ glossary })}\n`,
    );
  }

  /** Why the flags cannot be run, or `undefined` when they can. */
  private rejectionOf(options: CollectCommandOptions): string | undefined {
    if (options.check === true && options.write === true) {
      return "--check and --write cannot be combined";
    }

    if (
      options.format !== undefined &&
      !COLLECT_FORMATS.includes(options.format)
    ) {
      return `--format must be one of ${COLLECT_FORMATS.join(", ")}, not "${options.format}"`;
    }

    return undefined;
  }

  /** The mode the flags ask for, or `undefined` when they are rejected. */
  private selectMode(options: CollectCommandOptions): CollectMode | undefined {
    const rejection = this.rejectionOf(options);

    if (rejection !== undefined) {
      this.fail("🪙 Rejected the command line", { reason: rejection });
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

  /** Reads `--description`, the text rendered under every markdown heading. */
  @Option({
    description:
      "Text rendered under the heading of every markdown destination, replacing the configured description",
    flags: "--description <description>",
  })
  public parseDescription(value: string): string {
    return value;
  }

  /** Reads `--exclude-paths`, repeatable, each adding a glob to leave out. */
  @Option({
    description:
      "Glob of files to leave out of the scan, replacing the configured exclude.paths; repeat for several",
    flags: "--exclude-paths <glob>",
  })
  public parseExcludePaths(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Reads `--format`, the format printed when nothing is checked or written. */
  @Option({
    description: `Format printed to standard output when neither --check nor --write is given: ${COLLECT_FORMATS.join(" or ")}`,
    flags: "--format <format>",
  })
  public parseFormat(value: string): string {
    return value;
  }

  /** Reads `--include`, repeatable, each adding a glob to scan. */
  @Option({
    description:
      "Glob of files to scan, replacing the configured include; repeat for several",
    flags: "--include <glob>",
  })
  public parseInclude(value: string, previous: string[] = []): string[] {
    return [...previous, value];
  }

  /** Reads `--output-json`, a JSON glossary path relative to the working directory. */
  @Option({
    description:
      "JSON glossary to check or write, replacing the configured outputs",
    flags: "--output-json <path>",
  })
  public parseOutputJson(value: string): string {
    return value;
  }

  /** Reads `--output-markdown`, a markdown file relative to the working directory. */
  @Option({
    description:
      "Markdown file holding a glossary block to check or write, replacing the configured outputs",
    flags: "--output-markdown <path>",
  })
  public parseOutputMarkdown(value: string): string {
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

    const words = await this.collectWords(configuration);

    if (words === undefined) {
      return;
    }

    if (mode === "print") {
      this.print(words, options.format);
      return;
    }

    this.deliver({ configuration, mode, words });
  }
}
