import { Inject, Injectable } from "@nestjs/common";

import { CodeService } from "../code/code.service";
import { TileEnumerationService } from "../enumeration/tile-enumeration.service";
import { SymmetryService } from "../symmetry/symmetry.service";

import { DrawRecordService } from "./draw-record.service";

import type { MeanderRecord, MeanderShape } from "@codebase/meanderaw-db";

/**
 * Draws one batch of a shape's orbit minima into database rows. This is the
 * costly part of a draw run, so `DrawPoolService` spreads it across threads.
 *
 * Nothing here touches the database or the pool, so the same code runs in a
 * worker thread or in-process.
 */
@Injectable()
export class DrawWorkerService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(CodeService)
    private readonly codeService: CodeService,
    @Inject(DrawRecordService)
    private readonly drawRecordService: DrawRecordService,
    @Inject(SymmetryService)
    private readonly symmetryService: SymmetryService,
    @Inject(TileEnumerationService)
    private readonly tileEnumerationService: TileEnumerationService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every mask's meander as an enumerated row, in the order the masks were given. */
  records(shape: MeanderShape, masks: readonly number[]): MeanderRecord[] {
    return masks.map((mask) =>
      this.drawRecordService.record(
        this.codeService.spell(
          this.symmetryService.canonicalTile(
            this.tileEnumerationService.tile(shape, mask),
          ),
        ),
        shape,
        false,
      ),
    );
  }
}
