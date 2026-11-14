import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { Inject, Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { CODE_FORMAT_PATTERN } from "@codebase/meanderaw-core";
import { LoggerService } from "@codebase/observability";

import { CorpusService } from "../corpus/corpus.service";
import { HISTORICAL_CORPUS } from "../corpus/historical-corpus.constants";
import { DatabaseService } from "../database/database.service";

import { DrawCodeService } from "./draw-code.service";
import { DrawEnumerationService } from "./draw-enumeration.service";
import { DrawIndexService } from "./draw-index.service";
import { IncompleteCodeDrawingError } from "./draw.constants";

import type { DrawCommandOptions } from "./draw.types";

/**
 * Draws meanders into the Postgres database `MEANDERAW_POSTGRES_DATABASE` names.
 *
 * - **`draw`** draws every meander, then the corpus's hardcoded Codes beyond the budget.
 * - **`draw --rows <n> --columns <n> --code <code>`** persists one meander.
 *
 * The hardcoded half runs first, so a hardcoded row keeps its Code.
 */
@Command({
  description:
    "Draw meanders into the Postgres database MEANDERAW_POSTGRES_DATABASE names: with no flag, draw every meander the application can draw into it (the whole lattice's unit space, enumerated and measured by each meander's own structure, plus the historical corpus's hardcoded constants beyond the enumeration's budget); with --rows, --columns, and --code, draw that one",
  name: "draw",
  options: { isDefault: true },
})
@Injectable()
export class DrawCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    @Inject(DrawCodeService)
    private readonly drawCodeService: DrawCodeService,
    @Inject(DrawEnumerationService)
    private readonly drawEnumerationService: DrawEnumerationService,
    @Inject(DrawIndexService)
    private readonly drawIndexService: DrawIndexService,
    @Inject(CorpusService)
    private readonly corpusService: CorpusService,
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {
    super();
    this.logger.setContext(DrawCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Draws every meander, after clearing the existing rows. The hardcoded
   * corpus goes first, so its rows keep their Codes.
   */
  private async drawAll(): Promise<void> {
    await this.databaseService.clear();

    // `ingest` hands back one row per corpus entry, and entries that share a
    // Code share a row, so the rows are counted by id rather than by entry.
    const ingested = await this.corpusService.ingest(HISTORICAL_CORPUS);
    const hardcoded = new Set(ingested.map(({ id }) => id)).size;

    this.logger.log("✨ Ingested the historical corpus", undefined, {
      hardcoded,
    });

    const enumerated = await this.drawEnumerationService.drawAll();

    this.logger.log("✨ Generated every meander", undefined, {
      enumerated,
      hardcoded,
      total: enumerated + hardcoded,
    });

    await this.writePages();
  }

  /**
   * Decodes, measures, and persists the one meander `--rows`, `--columns`, and
   * `--code` name, refusing the request when `--rows` or `--columns` is missing.
   */
  private async runCodeDrawing(
    code: string,
    rows: number | undefined,
    columns: number | undefined,
  ): Promise<void> {
    if (
      !CODE_FORMAT_PATTERN.test(code) &&
      (rows === undefined || columns === undefined)
    ) {
      throw new IncompleteCodeDrawingError();
    }

    const meander = await this.drawCodeService.draw({ code, columns, rows });

    this.logger.log("✨ Generated a meander by code", undefined, {
      id: meander.id,
    });
  }

  /**
   * Writes `output/index.html` and every pattern's page. Runs last, once both
   * halves have committed.
   */
  private async writePages(): Promise<void> {
    const pages = await this.drawIndexService.build();

    for (const [relativePath, content] of Object.entries(pages)) {
      const fullPath = path.join("output", relativePath);

      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
    }

    this.logger.log("✨ Rebuilt the index pages");
  }

  // 🌎 Public Methods

  /**
   * Parses `--code`, passed through unchanged. `CodeService.parse` refuses a
   * non-hexadecimal character or a length that disagrees with the shape.
   */
  @Option({
    description:
      "Hexadecimal Code a meander's per-point direction bits are decoded from, one character per interior lattice point — draws that one meander and writes it to the database",
    flags: "--code <code>",
  })
  parseCode(value: string): string {
    return value;
  }

  /** Parses `--columns` as an integer, used only with `--code`. */
  @Option({
    description: "Column count of one --code drawing",
    flags: "--columns <columns>",
  })
  parseColumns(value: string): number {
    return Number.parseInt(value, 10);
  }

  /** Parses `--rows` as an integer, used only with `--code`. Optional, since a draw run names no row count. */
  @Option({
    description: "Row count of one --code drawing, controlling grid density",
    flags: "-r, --rows <rows>",
  })
  parseRows(value: string): number {
    return Number.parseInt(value, 10);
  }

  /** Draws every meander into the database when no Code is named, or draws the one `--code` names. */
  async run(
    _passedParameters: string[],
    options: DrawCommandOptions,
  ): Promise<void> {
    if (options.code === undefined) {
      await this.drawAll();

      return;
    }

    await this.runCodeDrawing(options.code, options.rows, options.columns);
  }
}
