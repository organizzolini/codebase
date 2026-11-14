import { MeanderawDatabaseService } from "@codebase/meanderaw-db";
import type { MeanderShape } from "@codebase/meanderaw-db";
import { Inject, Injectable } from "@nestjs/common";

import { EnumerationService } from "../enumeration/enumeration.service";

import { DrawPoolService } from "./draw-pool.service";


/**
 * The draw run's lattice-first half: enumerates the whole unit space and
 * writes one row per meander found.
 *
 * Every row is `isHardcoded: false`, found by a search rather than named by
 * a person. Nothing here filters; what a meander is gets measured afterwards.
 */
@Injectable()
export class DrawEnumerationService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(DrawPoolService)
    private readonly drawPoolService: DrawPoolService,
    @Inject(MeanderawDatabaseService)
    private readonly databaseService: MeanderawDatabaseService,
    @Inject(EnumerationService)
    private readonly enumerationService: EnumerationService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Every shape the budget admits, drawn and written — which is what `draw` with no drawing named now does. */
  async drawAll(): Promise<number> {
    return this.persist(this.enumerationService.shapes());
  }

  /**
   * Draws the shapes and writes every meander they hold, a batch at a time.
   * Skips any Code a hardcoded row already holds.
   */
  async persist(shapes: readonly MeanderShape[]): Promise<number> {
    let written = 0;

    try {
      for (const shape of shapes) {
        const held = await this.databaseService.codes(shape);

        for await (const records of this.drawPoolService.batches(shape)) {
          written += await this.databaseService.saveAll(
            records.filter(({ code }) => !held.has(code)),
          );
        }
      }
    } finally {
      await this.drawPoolService.close();
    }

    return written;
  }
}
