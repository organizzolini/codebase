import path from "node:path";

import { Injectable } from "@nestjs/common";

import { OutputJsonService } from "../output-json/output-json.service";
import { OutputMarkdownService } from "../output-markdown/output-markdown.service";
import { MarkdownReportService } from "../report/markdown-report.service";

import { MARKDOWN_DESTINATION_RENDERINGS } from "./write-destinations.constants";

import type {
  SyncDestinationsArguments,
  SyncProjectSectionsArguments,
} from "./write-destinations.types";

/**
 * Writes a finished run to every destination it was configured with.
 *
 * Kept apart from the command: the command decides whether a run may write, and this decides where
 * the findings land, for both the workspace and each project.
 */
@Injectable()
export class WriteDestinationsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly markdownReportService: MarkdownReportService,
    private readonly outputJsonService: OutputJsonService,
    private readonly outputMarkdownService: OutputMarkdownService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Writes the destinations each project declared for itself, returning the stale ones.
   * Paths are relative to each project's own root.
   */
  private syncProjectDestinations(args: SyncDestinationsArguments): string[] {
    const stale: string[] = [];

    for (const report of args.result.projects) {
      const root = args.startingProjectRoots.get(report.projectName);
      const write = args.writeByProject.get(report.projectName);

      if (root === undefined || write === undefined) {
        continue;
      }

      stale.push(
        ...this.syncProjectSections({
          check: args.check,
          projectLimits: args.projectLimits,
          report,
          result: args.result,
          root,
          write,
        }),
      );
    }

    return stale;
  }

  /** Writes one project's declared destinations, returning the stale ones. */
  private syncProjectSections(args: SyncProjectSectionsArguments): string[] {
    const stale: string[] = [];

    // The two destinations carry the same section, drawn in one and printed in
    // the other — the same split the run's own two make.
    for (const [name, rendering] of MARKDOWN_DESTINATION_RENDERINGS) {
      const destination = args.write[name];

      if (destination === undefined) {
        continue;
      }

      const resolved = {
        ...destination,
        path: path.join(args.root, destination.path),
      };

      if (
        !this.outputMarkdownService.sync({
          check: args.check,
          content: this.markdownReportService.renderProjectSection({
            heading: destination.heading,
            limits: args.projectLimits,
            previewCount: destination.previewCount,
            rendering,
            report: args.report,
          }),
          destination: resolved,
          result: args.result,
        })
      ) {
        stale.push(resolved.path);
      }
    }

    return stale;
  }

  // 🌎 Public Methods

  /** Writes every configured destination, returning the stale ones. */
  public syncDestinations(args: SyncDestinationsArguments): string[] {
    const stale: string[] = [];
    const { json } = args.configuration.write;

    if (
      json !== undefined &&
      !this.outputJsonService.sync({
        check: args.check,
        destination: json,
        result: args.result,
      })
    ) {
      stale.push(json.path);
    }

    // Both anchored destinations write the same report; they differ only in
    // whether its stacks are printed or drawn.
    for (const [name, rendering] of MARKDOWN_DESTINATION_RENDERINGS) {
      const destination = args.configuration.write[name];

      if (
        destination !== undefined &&
        !this.outputMarkdownService.sync({
          check: args.check,
          content: this.markdownReportService.renderRun({
            description: destination.description,
            heading: destination.heading,
            limits: args.projectLimits,
            previewCount: destination.previewCount,
            rendering,
            result: args.result,
          }),
          destination,
          result: args.result,
        })
      ) {
        stale.push(destination.path);
      }
    }

    stale.push(...this.syncProjectDestinations(args));

    return stale;
  }
}
