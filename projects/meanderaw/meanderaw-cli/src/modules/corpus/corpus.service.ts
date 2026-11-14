import { MeanderawDatabaseService } from "@codebase/meanderaw-db";
import type { Meander } from "@codebase/meanderaw-db";
import { Inject, Injectable } from "@nestjs/common";

import { CharacteristicsService } from "../characteristics/characteristics.service";
import { CodeService } from "../code/code.service";
import { DRAW_MINIMUM_ROWS } from "../enumeration/enumeration.constants";
import { TileEnumerationService } from "../enumeration/tile-enumeration.service";

import {
  DuplicateCorpusCodeError,
  HISTORICAL_CORPUS_EDGE_BUDGET,
} from "./corpus.constants";

import type { CorpusEntry } from "./corpus.types";

/**
 * Ingests the historical corpus through `DrawCodeService`, so every row comes from one place.
 *
 * Only entries beyond the sixteen-edge budget, or shallower than the draw run's
 * row floor, are ingested. A raised draw run budget moves nothing here.
 */
@Injectable()
export class CorpusService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(CharacteristicsService)
    private readonly characteristicsService: CharacteristicsService,
    @Inject(MeanderawDatabaseService)
    private readonly databaseService: MeanderawDatabaseService,
    @Inject(CodeService)
    private readonly codeService: CodeService,
    @Inject(TileEnumerationService)
    private readonly tileEnumerationService: TileEnumerationService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reads, measures, and persists one entry. */
  private async ingestOne(entry: CorpusEntry): Promise<Meander> {
    const { code, columns, rows } = entry;
    const parsed = this.codeService.parse(code, rows, columns);
    const canonical = this.codeService.canonicalPhase(parsed, (phase) =>
      this.characteristicsService.tileCrossingComponentDeltaCount(phase),
    );

    const characteristics = this.characteristicsService.compute(canonical);
    const isReducible = this.characteristicsService.isReducible(canonical);
    const formatted = this.codeService.format(canonical);

    try {
      const existing = await this.databaseService.findOneByCode(formatted);
      if (existing) {
        return existing;
      }

      return await this.databaseService.save({
        characteristics: this.characteristicsService.stored(
          characteristics,
          isReducible,
        ),
        code: formatted,
        columns,
        isHardcoded: true,
        lattice: canonical.digits,
        repeats: canonical.repeats,
        rows,
        symmetricalCodes: this.codeService.symmetricalCodes(
          canonical,
          (phase) =>
            this.characteristicsService.tileCrossingComponentDeltaCount(phase),
        ),
      });
    } catch (error) {
      throw new DuplicateCorpusCodeError(formatted, error);
    }
  }

  // 🌎 Public Methods

  /**
   * Ingests each entry `isPreserved` keeps, in order. Sequential, so a
   * failure names the entry that caused it.
   */
  async ingest(corpus: readonly CorpusEntry[]): Promise<Meander[]> {
    const beyond = corpus.filter((entry) => this.isPreserved(entry));
    const saved: Meander[] = [];

    for (const entry of beyond) {
      saved.push(await this.ingestOne(entry));
    }

    return saved;
  }

  /**
   * Whether an entry is kept as a hardcoded row: past sixteen edges, or
   * shallower than the draw run's row floor.
   */
  isPreserved(entry: CorpusEntry): boolean {
    const { columns, rows } = entry;

    return (
      rows < DRAW_MINIMUM_ROWS ||
      this.tileEnumerationService.edges({ columns, rows }) >
        HISTORICAL_CORPUS_EDGE_BUDGET
    );
  }
}
