import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import {
  CODOMETER_SECTION_HEADING,
  MissingMarkdownPathError,
  REGEX_SPECIAL_CHARACTERS,
  TRAILING_NEWLINES,
} from "./markdown.constants";
import {
  buildCssGroup,
  buildCustomGroup,
  buildCustomStatisticInstancesSection,
  buildHclGroup,
  buildJavascriptGroup,
  buildJsonGroup,
  buildJupyterGroup,
  buildMarkdownGroup,
  buildPythonGroup,
  buildRepositoryGroup,
  buildShellGroup,
  buildSqlGroup,
  buildTargetsGroup,
  buildTomlGroup,
  buildTypescriptGroup,
  buildYamlGroup,
} from "./markdown.utilities";

import type {
  BuildAnchorHelpersArguments,
  RenderBadgesArguments,
  RenderDocumentArguments,
  SyncAnchoredBlockArguments,
  SyncMarkdownArguments,
  WrapInAnchorsArguments,
} from "./markdown.types";
import type {
  MarkdownAnchorHelpers,
  ResolvedCodometerMarkdownOutput,
} from "@codometer/configuration";
import type { CodeStatisticsResult } from "@codometer/core";

/**
 * Writes generated code statistics badges into a markdown file.
 */
@Injectable()
export class MarkdownService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MarkdownService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds the helpers handed to a configured `write`, bound to this run's content and path. Names match the wrapped methods.
   */
  private buildAnchorHelpers(
    args: BuildAnchorHelpersArguments,
  ): MarkdownAnchorHelpers {
    return {
      endMarker: args.destination.endMarker,
      startMarker: args.destination.startMarker,
      syncAnchoredBlock: (overrides = {}) =>
        this.syncAnchoredBlock({
          check: args.check,
          content: overrides.content ?? args.content,
          destination: args.destination,
          path: overrides.path ?? args.destination.path,
        }),
      wrapInAnchors: (content = args.content) =>
        this.wrapInAnchors({ content, destination: args.destination }),
    };
  }

  /**
   * Assembles the badge groups in render order. Only the first spans languages, so a moving number traces to one analyzer.
   */
  private buildBadgeGroups(args: RenderDocumentArguments): string {
    const { statistics } = args;

    return [
      buildRepositoryGroup(statistics, args.scope),
      buildTargetsGroup(args.targets),
      buildTypescriptGroup(statistics),
      buildJavascriptGroup(statistics),
      buildPythonGroup(statistics),
      buildJsonGroup(statistics),
      buildYamlGroup(statistics),
      buildTomlGroup(statistics),
      buildShellGroup(statistics),
      buildSqlGroup(statistics),
      buildHclGroup(statistics),
      buildCssGroup(statistics),
      buildCustomGroup(statistics),
      buildJupyterGroup(statistics),
      buildMarkdownGroup(statistics),
    ]
      .filter((group) => group !== "")
      .join("\n\n");
  }

  /**
   * Build the matcher for a block delimited by the configured markers.
   */
  private buildBlockRegex(args: {
    endMarker: string;
    startMarker: string;
  }): RegExp {
    return new RegExp(
      String.raw`${this.escapeRegex(args.startMarker)}[\s\S]*?${this.escapeRegex(args.endMarker)}`,
    );
  }

  /**
   * Escape a configured marker so it can be searched for literally.
   */
  private escapeRegex(input: string): string {
    return input.replaceAll(REGEX_SPECIAL_CHARACTERS, String.raw`\$&`);
  }

  /**
   * Read an existing markdown file, returning an empty string if absent.
   */
  private readExisting(markdownPath: string): string {
    try {
      return readFileSync(path.resolve(markdownPath), "utf8");
    } catch {
      return "";
    }
  }

  /**
   * Narrows the measured statistics to one destination's selected counters, so each destination carries only its own badges.
   */
  private scopeCustomStatistics(
    statistics: CodeStatisticsResult,
    destination: ResolvedCodometerMarkdownOutput,
  ): CodeStatisticsResult {
    const labels = new Set(
      destination.custom.map((statistic) => statistic.label),
    );

    return {
      ...statistics,
      custom: statistics.custom.filter((statistic) =>
        labels.has(statistic.label),
      ),
    };
  }

  /**
   * Splices the anchored block into a file, or in check mode reports whether it is current. Separate from `DocumentsService` on purpose.
   */
  private syncAnchoredBlock(args: SyncAnchoredBlockArguments): boolean {
    if (args.path === undefined) {
      throw new MissingMarkdownPathError();
    }

    const resolvedPath = path.resolve(args.path);
    const existingMarkdown = this.readExisting(resolvedPath);
    const generatedBlock = this.wrapInAnchors(args);
    const blockRegex = this.buildBlockRegex(args.destination);
    const currentBlock = blockRegex.exec(existingMarkdown)?.[0];

    if (args.check) {
      return currentBlock === generatedBlock;
    }

    if (!existingMarkdown.includes(args.destination.startMarker)) {
      // One blank line separates the existing text from the block, whatever it ended with. Two would fail `MD012/no-multiple-blanks`, which `markdownlint --fix` does not repair.
      const preamble =
        existingMarkdown === ""
          ? ""
          : `${existingMarkdown.replace(TRAILING_NEWLINES, "")}\n\n`;

      this.writeMarkdownFile(resolvedPath, `${preamble}${generatedBlock}\n`);
      return true;
    }

    // Replaced through a function so that a `$` in the rendered markdown stays
    // a `$` rather than being read as a replacement pattern.
    this.writeMarkdownFile(
      resolvedPath,
      existingMarkdown.replace(blockRegex, () => generatedBlock),
    );
    return true;
  }

  /**
   * Wrap rendered markdown in the configured anchor markers.
   */
  private wrapInAnchors(args: WrapInAnchorsArguments): string {
    // The blank line after the opening marker is what Prettier expects of a
    // paragraph following an HTML comment. Without it the generated markdown is
    // permanently one reformat away from clean, and `prettier --check` fails
    // on a file no human edited.
    return `${args.destination.startMarker}\n\n${args.content}\n${args.destination.endMarker}`;
  }

  /**
   * Writes markdown to a file and logs it. Creates the directory first, so a missing one is not an error.
   */
  private writeMarkdownFile(resolvedPath: string, content: string): void {
    mkdirSync(path.dirname(resolvedPath), { recursive: true });
    writeFileSync(resolvedPath, content, "utf8");
    this.logger.info("📝 Wrote the markdown badges", undefined, {
      path: resolvedPath,
    });
  }

  // 🌎 Public Methods

  /**
   * Renders the badge block for a destination, description included. Splice and whole-file sinks share it, so they never disagree.
   */
  renderBadges(args: RenderBadgesArguments): string {
    return this.renderDocument({
      description: args.destination.description,
      scope: args.scope,
      statistics: this.scopeCustomStatistics(args.statistics, args.destination),
      targets: args.targets,
    });
  }

  /**
   * Renders the badge block wrapped in its destination's anchors, as a splice would place it without placing it.
   */
  renderBlock(args: RenderBadgesArguments): string {
    return this.wrapInAnchors({
      content: this.renderBadges(args),
      destination: args.destination,
    });
  }

  /**
   * Renders the badges as a document of their own, with no anchors. A per-instance breach adds a section naming each file and line.
   */
  renderDocument(args: RenderDocumentArguments): string {
    const sections: string[] = [CODOMETER_SECTION_HEADING];

    if (args.description !== undefined) {
      sections.push(args.description);
    }

    sections.push(this.buildBadgeGroups(args));

    const instancesSection = buildCustomStatisticInstancesSection(
      args.statistics,
    );

    if (instancesSection !== "") {
      sections.push(instancesSection);
    }

    return sections.join("\n\n");
  }

  /**
   * Syncs a splice destination with the current statistics. A configured `write` decides the output; otherwise badges are spliced between the anchors.
   */
  sync(args: SyncMarkdownArguments): boolean {
    const { destination } = args;
    const statistics = this.scopeCustomStatistics(args.statistics, destination);
    const content = this.renderDocument({
      description: destination.description,
      scope: args.scope,
      statistics,
      targets: args.targets,
    });
    const anchors = this.buildAnchorHelpers({
      check: args.check,
      content,
      destination,
    });

    if (destination.write === undefined) {
      return anchors.syncAnchoredBlock();
    }

    return destination.write({
      anchors,
      check: args.check,
      description: destination.description,
      path: destination.path,
      renderBadges: () => content,
      statistics,
    });
  }
}
