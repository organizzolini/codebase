import { MeanderawDatabaseService } from "@codebase/meanderaw-db";
import type { Meander } from "@codebase/meanderaw-db";
import { Inject, Injectable } from "@nestjs/common";


import { DrawRecordService } from "./draw-record.service";

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
    @Inject(MeanderawDatabaseService)
    private readonly databaseService: MeanderawDatabaseService,
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
