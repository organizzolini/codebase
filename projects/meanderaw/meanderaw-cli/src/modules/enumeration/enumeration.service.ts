import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { CodeService } from "../code/code.service";

import { DRAW_MINIMUM_ROWS } from "./enumeration.constants";
import { TileEnumerationService } from "./tile-enumeration.service";

import type { MeanderShape } from "../database/database.types";
import type { EnumeratedMeander, Environment } from "./enumeration.types";

/**
 * Enumerates the lattice's whole unit space: every structurally distinct
 * repeat the edge budget admits, spelled as a Code.
 *
 * **There is one unit space, and no filter.** Every repeat within budget is
 * produced; what a meander is gets measured afterwards.
 */
@Injectable()
export class EnumerationService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(CodeService)
    private readonly codeService: CodeService,
    @Inject(TileEnumerationService)
    private readonly tileEnumerationService: TileEnumerationService,
    @Inject(ConfigService)
    configService: ConfigService<Environment>,
  ) {
    this.maximumColumns =
      configService.get<number>("DRAW_MAXIMUM_COLUMNS") ??
      Number.MAX_SAFE_INTEGER;
    this.maximumRows =
      configService.get<number>("DRAW_MAXIMUM_ROWS") ?? Number.MAX_SAFE_INTEGER;
  }

  // 🔐 Private Fields

  /** Widest column count drawn, a review filter from `DRAW_MAXIMUM_COLUMNS`. */
  private readonly maximumColumns: number;

  /** Deepest row count drawn, a review filter from `DRAW_MAXIMUM_ROWS`. */
  private readonly maximumRows: number;

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Every structurally distinct meander of one shape, one per symmetry class,
   * each spelled by its canonical representative's Code.
   */
  enumerate(shape: MeanderShape): EnumeratedMeander[] {
    const { columns, rows } = shape;

    return this.tileEnumerationService.enumerate(rows, columns).map((tile) => ({
      code: this.codeService.spell(tile),
      columns,
      rows,
    }));
  }

  /** Whether the budget admits a shape, which is the only thing that decides whether the draw run walks it. */
  isAdmitted(shape: MeanderShape): boolean {
    return this.tileEnumerationService.isAdmitted(shape);
  }

  /**
   * Every shape the draw run covers, shallowest and narrowest first. The edge
   * budget bounds it; the `DRAW_MAXIMUM_*` settings only narrow it.
   */
  shapes(): MeanderShape[] {
    const shapes: MeanderShape[] = [];

    for (
      let rows = DRAW_MINIMUM_ROWS;
      rows <= this.maximumRows && this.isAdmitted({ columns: 1, rows });
      rows += 1
    ) {
      const widest = Math.min(
        this.tileEnumerationService.maximumColumns(rows),
        this.maximumColumns,
      );

      for (let columns = 1; columns <= widest; columns += 1) {
        shapes.push({ columns, rows });
      }
    }

    return shapes;
  }
}
