import { DEFAULT_JSON_INDENTATION } from "@codometer/configuration";
import { Injectable } from "@nestjs/common";

import { JsonService } from "../json/json.service";
import { MarkdownService } from "../markdown/markdown.service";

import { DEFAULT_MARKDOWN_DESTINATION } from "./delivery.constants";

import type { TargetSize } from "../markdown/markdown.types";
import type { DeliverArguments } from "./delivery.types";
import type { RunMode } from "@codometer/configuration";
import type { MeasurementResult } from "@codometer/measurement";

/**
 * Produces every resolved output, and says which written ones are stale.
 *
 * Standard output has one writer, `deliverConsole`. A file sink never prints, so a pipeline parsing stdout sees one document.
 */
@Injectable()
export class DeliveryService {
  // 🏗 Dependency Injection

  constructor(
    private readonly jsonService: JsonService,
    private readonly markdownService: MarkdownService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Print whatever the run asked for, and nothing when it asked for nothing. */
  private deliverConsole(args: DeliverArguments): void {
    if (args.format === undefined) {
      return;
    }

    if (args.format === "json") {
      process.stdout.write(
        this.jsonService.render({
          indentation:
            args.destinations.json?.indentation ?? DEFAULT_JSON_INDENTATION,
          report: args.report,
        }),
      );
      return;
    }

    const badges = this.markdownService.renderBlock({
      destination: args.consoleMarkdown ?? DEFAULT_MARKDOWN_DESTINATION,
      scope: args.scope,
      statistics: args.measurement.statistics,
      targets: this.readTargetSizes(args.measurement),
    });

    process.stdout.write(`${badges}\n`);
  }

  /** Write the report to its file, if this run writes or compares one. */
  private deliverJson(args: DeliverArguments, stalePaths: string[]): void {
    const destination = args.destinations.json;

    if (destination === undefined || !this.touchesFiles(args.mode)) {
      return;
    }

    const isCurrent = this.jsonService.sync({
      check: args.mode.checksReports,
      indentation: destination.indentation,
      path: destination.path,
      report: args.report,
    });

    if (!isCurrent && args.mode.checksReports) {
      stalePaths.push(destination.path);
    }
  }

  /**
   * Writes the badge block into its markdown file, if this run writes or compares one. `MarkdownService.sync` handles the file's existence.
   */
  private deliverMarkdown(args: DeliverArguments, stalePaths: string[]): void {
    const destination = args.destinations.markdown;

    if (destination === undefined || !this.touchesFiles(args.mode)) {
      return;
    }

    const isCurrent = this.markdownService.sync({
      check: args.mode.checksReports,
      destination,
      scope: args.scope,
      statistics: args.measurement.statistics,
      targets: this.readTargetSizes(args.measurement),
    });

    if (!isCurrent && args.mode.checksReports) {
      // A configured writer may have picked the file itself, so name the
      // destination rather than claiming a path nobody configured.
      stalePaths.push(destination.path ?? "markdown output");
    }
  }

  /**
   * The size of every input this run measured, in declaration order. Inputs with no size or files are omitted, not shown as zero.
   */
  private readTargetSizes(measurement: MeasurementResult): TargetSize[] {
    return measurement.inputs.flatMap((input) =>
      input.size === undefined || input.size.files === 0
        ? []
        : [
            {
              bytes: input.size.bytes,
              compression: input.size.compression,
              name: input.name,
            },
          ],
    );
  }

  /**
   * Whether the run writes or checks any file. A run that neither writes nor compares leaves every file alone.
   */
  private touchesFiles(mode: RunMode): boolean {
    return mode.writesJson || mode.writesMarkdown || mode.checksReports;
  }

  // 🌎 Public Methods

  /** Produce every output, and name the ones found stale. */
  deliver(args: DeliverArguments): string[] {
    const stalePaths: string[] = [];

    this.deliverConsole(args);
    this.deliverJson(args, stalePaths);
    this.deliverMarkdown(args, stalePaths);

    return stalePaths;
  }
}
