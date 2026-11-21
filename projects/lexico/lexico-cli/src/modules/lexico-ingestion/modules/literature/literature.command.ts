import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  getOptionText,
  requireChoice,
  selectChoice,
} from "../../lexico-ingestion.utilities";

import { LiteratureAuthorEraService } from "./literature-author-era.service";
import { LiteratureWordLinkingService } from "./literature-word-linking.service";
import { LiteratureService } from "./literature.service";

import type { CommandOptionChoice } from "../../lexico-ingestion.types";
import type {
  LibraryEntry,
  LiteratureCommandOptions,
  LiteratureFilterArguments,
} from "./literature.types";

/**
 * Ingests markdown texts from `data/library` into literature entities with
 * provider-aware deduplication.
 */
@Command({
  description: "Run the literature command",
  name: "literature",
})
@Injectable()
export class LiteratureCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly helper: LiteratureService,
    private readonly authorEraService: LiteratureAuthorEraService,
    private readonly wordLinkingService: LiteratureWordLinkingService,
  ) {
    super();
    this.logger.setContext(LiteratureCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Deduplicate by provider for literature ingestion.
   */
  private deduplicateByProvider(texts: LibraryEntry[]): LibraryEntry[] {
    const priorityProviders = [
      "perseus",
      "corpus-scriptorum-ecclesiasticorum-latinorum",
      "thelatinlibrary",
      "epigraphik-datenbank-clauss-slaby",
    ];
    const textMap = new Map<string, LibraryEntry>();
    for (const text of texts) {
      const slug = [text.authorSlug, ...text.pathParts, text.textSlug].join(
        "/",
      );
      const existing = textMap.get(slug);
      if (existing) {
        const existingPriority = priorityProviders.indexOf(existing.provider);
        const newPriority = priorityProviders.indexOf(text.provider);
        if (
          newPriority !== -1 &&
          (existingPriority === -1 || newPriority < existingPriority)
        ) {
          textMap.set(slug, text);
        }
      } else {
        textMap.set(slug, text);
      }
    }
    return [...textMap.values()];
  }

  /**
   * Gets author choices used by literature ingestion.
   */
  private async getAuthorChoices(
    provider?: string,
  ): Promise<CommandOptionChoice[]> {
    const library = await this.helper.scanLibrary();
    const filtered = provider
      ? library.filter((entry) => entry.provider === provider)
      : library;
    const authors = [
      ...new Set(filtered.map((entry) => entry.authorSlug)),
    ].toSorted();
    return authors.map((author) => ({ title: author, value: author }));
  }

  /**
   * Gets provider choices used by literature ingestion.
   */
  private async getProviderChoices(): Promise<CommandOptionChoice[]> {
    const library = await this.helper.scanLibrary();
    const providers = [
      ...new Set(library.map((entry) => entry.provider)),
    ].toSorted();
    return providers.map((provider) => ({ title: provider, value: provider }));
  }

  /**
   * Gets text choices used by literature ingestion.
   */
  private async getTextChoices(
    provider?: string,
    authorSlug?: string,
  ): Promise<CommandOptionChoice[]> {
    const library = await this.helper.scanLibrary();
    let filtered = library;
    if (provider)
      filtered = filtered.filter((entry) => entry.provider === provider);
    if (authorSlug)
      filtered = filtered.filter((entry) => entry.authorSlug === authorSlug);

    const textSlugs = [
      ...new Set(
        filtered.map((entry) =>
          [entry.authorSlug, ...entry.pathParts, entry.textSlug].join("/"),
        ),
      ),
    ].toSorted();
    return textSlugs.map((textSlug) => ({ title: textSlug, value: textSlug }));
  }

  /**
   * Ingests the texts selected by the provider, author and text options.
   */
  private async ingest(options: LiteratureCommandOptions): Promise<void> {
    const startTime = performance.now();
    const library = await this.helper.scanLibrary();
    if (library.length === 0) {
      this.logger.warn("📚 Missing texts in the data/library directory");
      return;
    }
    const provider = await this.resolveFilter({
      choices: await this.getProviderChoices(),
      label: "Provider",
      message: "Select the provider",
      value: options.provider,
    });
    const author = await this.resolveFilter({
      choices: await this.getAuthorChoices(provider),
      label: "Author",
      message: "Select the author",
      value: options.author,
    });
    const text = await this.resolveFilter({
      choices: await this.getTextChoices(provider, author),
      label: "Text",
      message: "Select the text",
      value: options.text,
    });
    const textsToIngest = this.selectTextsToIngest({
      author,
      library,
      provider,
      text,
    });
    this.logger.info("📚 Selected texts for ingestion", undefined, {
      count: textsToIngest.length,
    });
    await this.ingestAndDateAuthors(textsToIngest);
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    this.logger.info("📚 Ingested literature", undefined, {
      durationSeconds: duration,
    });
  }

  /**
   * Ingests the selected texts, then dates their authors.
   */
  private async ingestAndDateAuthors(texts: LibraryEntry[]): Promise<void> {
    await this.helper.ingestAllAuthors(texts);
    await this.authorEraService.dateAuthors();
  }

  /**
   * Links the words of ingested texts to the dictionary and logs what it linked.
   */
  private async relink(): Promise<void> {
    const summary = await this.wordLinkingService.relinkTokens();
    this.logger.info("🔗 Relinked literature words", undefined, { ...summary });
  }

  /**
   * Resolves an optional filter: a given value must be one of `choices`; a missing one is asked for, else means "All".
   */
  private async resolveFilter({
    choices,
    label,
    message,
    value,
  }: LiteratureFilterArguments): Promise<string | undefined> {
    const text = getOptionText(value);
    if (text) {
      return requireChoice(
        text,
        choices,
        `${label} "${text}" not found in the dataset.`,
      );
    }

    return selectChoice({ choices, message, noSelectionTitle: "All" });
  }

  /**
   * Select texts to ingest for literature ingestion.
   */
  private selectTextsToIngest(args: {
    author: string | undefined;
    library: LibraryEntry[];
    provider: string | undefined;
    text: string | undefined;
  }): LibraryEntry[] {
    const { author, library, provider, text } = args;
    let filtered = library;
    if (provider)
      filtered = filtered.filter((entry) => entry.provider === provider);
    if (author)
      filtered = filtered.filter((entry) => entry.authorSlug === author);
    if (text) {
      filtered = filtered.filter(
        (entry) =>
          [entry.authorSlug, ...entry.pathParts, entry.textSlug].join("/") ===
          text,
      );
    }
    return this.deduplicateByProvider(filtered);
  }

  // 🌎 Public Methods

  /**
   * Passes the `--author` text through to `run`, which validates it against
   * the provider's authors.
   */
  @Option({
    description: "The author to ingest (omit to pick one, or all)",
    flags: "-a, --author [author]",
  })
  parseAuthor(author: string): string {
    return author;
  }

  /**
   * Passes the `--provider` text through to `run`, which validates it against
   * the providers in `data/library`.
   */
  @Option({
    description: "The provider to ingest from (omit to pick one, or all)",
    flags: "-p, --provider [provider]",
  })
  parseProvider(provider: string): string {
    return provider;
  }

  /**
   * Links the words of texts already ingested to the dictionary, reading no
   * text again.
   */
  @Option({
    description: "Only relink the words of ingested texts to the dictionary",
    flags: "--relink",
  })
  parseRelink(): boolean {
    return true;
  }

  /**
   * Passes the `--text` text through to `run`, which validates it against the
   * texts left by the provider and author filters.
   */
  @Option({
    description: "The specific text to ingest (omit to pick one, or all)",
    flags: "-t, --text [text]",
  })
  parseText(text: string): string {
    return text;
  }

  /**
   * Runs literature ingestion for the selected provider/author/text scope, or
   * only relinks ingested words under `--relink`.
   */
  async run(
    _arguments: string[],
    options: LiteratureCommandOptions,
  ): Promise<void> {
    this.logger.info("📚 Starting literature ingestion");
    this.logger.info("⚙️ Parsed command options", undefined, { options });
    await (options.relink ? this.relink() : this.ingest(options));
  }
}
