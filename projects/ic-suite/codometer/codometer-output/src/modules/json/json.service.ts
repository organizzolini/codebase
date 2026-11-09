import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import type { RenderReportArguments, SyncJsonArguments } from "./json.types";

/**
 * Writes the report to a JSON file.
 *
 * The file holds the report and nothing else — no timestamp, no tool version.
 * Anything that changes between two runs over the same tree would report a
 * repository nobody touched as stale.
 */
@Injectable()
export class JsonService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(JsonService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Read an existing report, returning an empty string if absent.
   */
  private readExisting(reportPath: string): string {
    try {
      return readFileSync(path.resolve(reportPath), "utf8");
    } catch {
      return "";
    }
  }

  // 🌎 Public Methods

  /**
   * Renders the report as the JSON document to be written, with a trailing newline so formatters and staleness checks agree.
   */
  render<Report>(args: RenderReportArguments<Report>): string {
    return `${JSON.stringify(args.report, null, args.indentation)}\n`;
  }

  /**
   * Syncs the JSON file with the report: writes it, or in check mode reports whether it is current without writing.
   */
  sync<Report>(args: SyncJsonArguments<Report>): boolean {
    const resolvedPath = path.resolve(args.path);
    const rendered = this.render(args);

    if (args.check) {
      return this.readExisting(resolvedPath) === rendered;
    }

    mkdirSync(path.dirname(resolvedPath), { recursive: true });
    writeFileSync(resolvedPath, rendered, "utf8");

    this.logger.info("📝 Wrote the JSON report", undefined, {
      path: resolvedPath,
    });

    return true;
  }
}
