import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { ComparisonService } from "../comparison/comparison.service";
import { MarkdownService } from "../markdown/markdown.service";

import type {
  DeliverArguments,
  DeliveryResult,
  GlossaryFormatHandler,
  ReadDestination,
} from "./delivery.types";
import type { ResolvedCoinagerieOutput } from "@coinagerie/configuration";
import type { GlossaryDifference } from "@coinagerie/core";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Checks and writes every configured glossary destination.
 *
 * Every destination is read and parsed before any is written, so one that
 * cannot be parsed stops the run with every file untouched. Destinations are
 * independent: each is compared with the vocabulary alone, and no definition
 * is ever copied from one to another.
 */
@Injectable()
/* v8 ignore stop */
export class DeliveryService {
  // 🏗 Dependency Injection

  constructor(
    private readonly comparisonService: ComparisonService,
    markdownService: MarkdownService,
  ) {
    this.handlers = { markdown: markdownService };
  }

  // 🔐 Private Fields

  /**
   * Each destination type to the format that reads and writes it. A record
   * rather than a map, so adding a destination type fails to compile until
   * its format is registered here.
   */
  private readonly handlers: Readonly<
    Record<ResolvedCoinagerieOutput["type"], GlossaryFormatHandler>
  >;

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** How one read destination differs from the vocabulary. */
  private differenceOf(
    read: ReadDestination,
    words: string[],
  ): GlossaryDifference {
    return {
      ...this.comparisonService.compare(words, read.glossary),
      path: read.destination.path,
      type: read.destination.type,
    };
  }

  /** The format a destination is written in. */
  private handlerFor(
    destination: ResolvedCoinagerieOutput,
  ): GlossaryFormatHandler {
    return this.handlers[destination.type];
  }

  /** Reads and parses every destination, throwing before anything is written. */
  private readAll(destinations: ResolvedCoinagerieOutput[]): ReadDestination[] {
    return destinations.map((destination) => {
      const content = existsSync(destination.path)
        ? readFileSync(destination.path, "utf8")
        : undefined;
      const glossary =
        this.handlerFor(destination).read(content, destination.path) ??
        new Map<string, string>();

      return { content, destination, glossary };
    });
  }

  // 🌎 Public Methods

  /**
   * How each destination differs from the vocabulary, writing nothing. A
   * destination that does not exist yet is missing every word.
   */
  check(args: DeliverArguments): GlossaryDifference[] {
    return this.readAll(args.destinations).map((read) =>
      this.differenceOf(read, args.words),
    );
  }

  /**
   * Rewrites every destination to hold exactly the vocabulary, keeping every
   * definition still in use. A file already holding exactly that is not
   * touched, so a second write changes nothing.
   */
  write(args: DeliverArguments): DeliveryResult[] {
    return this.readAll(args.destinations).map((read) => {
      const content = this.handlerFor(read.destination).write({
        content: read.content,
        destination: read.destination,
        glossary: this.comparisonService.reconcile(args.words, read.glossary),
      });
      const written = content !== read.content;

      if (written) {
        mkdirSync(path.dirname(read.destination.path), { recursive: true });
        writeFileSync(read.destination.path, content);
      }

      return { ...this.differenceOf(read, args.words), written };
    });
  }
}
