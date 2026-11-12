import { Inject, Injectable } from "@nestjs/common";

import { DatabaseService } from "../database/database.service";

import { DrawRecordService } from "./draw-record.service";

import type { Meander } from "../database/entities/meander.entity";
import type { CodeDrawingOptions } from "./draw.types";

/**
 * Persists the meander a `--code` drawing names, as one row. It is recorded
 * `isHardcoded: true`, since a Code typed at the command line is named by a
 * person rather than found by a search.
 */
@Injectable()
export class DrawCodeService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(DrawRecordService)
    private readonly drawRecordService: DrawRecordService,
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Decodes, measures, classifies, and persists the one meander `options` names. */
  async draw(options: CodeDrawingOptions): Promise<Meander> {
    const { code, columns, repeats, rows } = options;

    return this.databaseService.save(
      this.drawRecordService.record(code, { columns, repeats, rows }, true),
    );
  }
}
