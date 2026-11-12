import { Injectable } from "@nestjs/common";

import {
  AnchorNotFoundError,
  buildEndMarker,
  buildStartMarker,
  CODEPENDIX_SECTION_HEADING,
} from "./anchors.constants";

import type {
  AnchorLocationArguments,
  AnchorSectionInsertArguments,
} from "./anchors.types";
import type { AnchorCheckResult } from "@codependix/core";

/**
 * Reads and rewrites codependix's named anchor blocks in a Markdown file. Markers are HTML
 * comments, so no `conformetry-*` package is needed.
 *
 * `insertAnchorSection` is the only method that creates a section, and only at a safe spot.
 */
@Injectable()
export class AnchorsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Appends a brand-new `## 🕸️ Codependix` section to the end of a file. */
  private appendCodependixSection(args: {
    fileContent: string;
    introLine: string;
    subsectionBlock: string;
  }): string {
    const trimmedFile = args.fileContent.trimEnd();
    const prefix = trimmedFile.length === 0 ? "" : `${trimmedFile}\n\n`;

    return `${prefix}${CODEPENDIX_SECTION_HEADING}\n\n${args.introLine}\n\n${args.subsectionBlock}\n`;
  }

  /** Builds the pattern matching a named anchor block and its inner content. */
  private buildAnchorPattern(anchorName: string): RegExp {
    const start = this.escapeForPattern(buildStartMarker(anchorName));
    const end = this.escapeForPattern(buildEndMarker(anchorName));

    return new RegExp(String.raw`${start}\n([\s\S]*?)\n${end}`, "u");
  }

  /** Escapes a string so it can be embedded literally in a regular expression. */
  private escapeForPattern(value: string): string {
    return value.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);
  }

  /**
   * Inserts a subsection at the end of an existing Codependix section, before the next heading.
   */
  private insertIntoCodependixSection(args: {
    fileContent: string;
    headingMatch: RegExpExecArray;
    subsectionBlock: string;
  }): string {
    const { fileContent, headingMatch, subsectionBlock } = args;
    const sectionStart = headingMatch.index + headingMatch[0].length;
    const remainder = fileContent.slice(sectionStart);
    const nextHeadingMatch = /\n#{1,2} /u.exec(remainder);
    const sectionBodyEnd = nextHeadingMatch?.index ?? remainder.length;
    const sectionBody = remainder.slice(0, sectionBodyEnd).trimEnd();
    const tail = remainder.slice(sectionBodyEnd);
    const finalTail = tail.length === 0 ? "\n" : tail.replace(/^\n/u, "\n\n");

    return `${fileContent.slice(0, sectionStart)}${sectionBody}\n\n${subsectionBlock}${finalTail}`;
  }

  // 🌎 Public Methods

  /**
   * Compares a Markdown file's anchor against a freshly computed export. Throws
   * `AnchorNotFoundError` when the anchor is missing, which fails a `--check` run.
   */
  checkAnchor(
    args: AnchorLocationArguments & { freshContent: string },
  ): AnchorCheckResult {
    const currentContent = this.extractAnchorContent(args);

    if (currentContent === undefined) {
      throw new AnchorNotFoundError(args.anchorName, args.filePath);
    }

    return {
      currentContent,
      freshContent: args.freshContent,
      isCurrent: currentContent.trim() === args.freshContent.trim(),
    };
  }

  /** Reads a named anchor's current content, or `undefined` when it is absent. */
  extractAnchorContent(args: AnchorLocationArguments): string | undefined {
    return this.buildAnchorPattern(args.anchorName).exec(args.fileContent)?.[1];
  }

  /** Whether a named anchor block is present in a file's content. */
  hasAnchor(args: AnchorLocationArguments): boolean {
    return this.buildAnchorPattern(args.anchorName).test(args.fileContent);
  }

  /**
   * Auto-creates a missing anchor's section, appending the heading only when none exists.
   * Call only once the anchor is known absent.
   */
  insertAnchorSection(args: AnchorSectionInsertArguments): string {
    const subsectionBlock = this.wrapInAnchors(args.anchorName, args.content);
    const fullSubsectionBlock =
      args.subheading === undefined
        ? subsectionBlock
        : `### ${args.subheading}\n\n${subsectionBlock}`;
    const headingMatch = new RegExp(
      `^${this.escapeForPattern(CODEPENDIX_SECTION_HEADING)}$`,
      "mu",
    ).exec(args.fileContent);

    if (headingMatch === null) {
      return this.appendCodependixSection({
        fileContent: args.fileContent,
        introLine: args.introLine,
        subsectionBlock: fullSubsectionBlock,
      });
    }

    return this.insertIntoCodependixSection({
      fileContent: args.fileContent,
      headingMatch,
      subsectionBlock: fullSubsectionBlock,
    });
  }

  /**
   * Replaces a named anchor's content in place. Output is canonical, so writing twice is idempotent.
   */
  replaceAnchorContent(
    args: AnchorLocationArguments & { newContent: string },
  ): string {
    if (!this.hasAnchor(args)) {
      throw new AnchorNotFoundError(args.anchorName, args.filePath);
    }

    const start = buildStartMarker(args.anchorName);
    const end = buildEndMarker(args.anchorName);
    const trimmedContent = args.newContent.trim();

    return args.fileContent.replace(
      this.buildAnchorPattern(args.anchorName),
      () => `${start}\n${trimmedContent}\n${end}`,
    );
  }

  /** Wraps content in a fresh pair of markers, for placing a new anchor by hand. */
  wrapInAnchors(anchorName: string, content: string): string {
    return [
      buildStartMarker(anchorName),
      content.trim(),
      buildEndMarker(anchorName),
    ].join("\n");
  }
}
