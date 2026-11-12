import { Injectable } from "@nestjs/common";

import { BARE_MATRIX_POINT } from "../../../matrix/matrix.constants";

import type { Matrix } from "../../../matrix/matrix.types";

/**
 * Shared straight-run scans, injected by every `submatrix/run` evaluator
 * that needs one rather than reading the grid independently.
 */
@Injectable()
export class RunUtilitiesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The longest straight run of ink in `column`, reading each row's south arm directly and never wrapping across rows. */
  private longestColumnRunLength(matrix: Matrix, column: number): number {
    let run = 0;
    let maximum = 0;

    for (const row of matrix) {
      const point = row[column] ?? BARE_MATRIX_POINT;
      if (point.south) {
        run += 1;
        maximum = Math.max(maximum, run);
      } else {
        run = 0;
      }
    }

    return maximum;
  }

  /** The longest straight run of ink in one row, reading its east arm around the row's own column span twice and capping at `columns`. */
  private longestRowRunLength(row: Matrix[number], columns: number): number {
    let run = 0;
    let maximum = 0;

    for (let index = 0; index < columns * 2; index += 1) {
      const point = row[index % columns] ?? BARE_MATRIX_POINT;
      if (point.east) {
        run += 1;
        maximum = Math.max(maximum, run);
      } else {
        run = 0;
      }
    }

    return Math.min(maximum, columns);
  }

  // 🌎 Public Methods

  /**
   * The longest horizontal run of ink, wrapping across the tile seam. Capped at
   * `columns`, as a longer run would double back.
   */
  public longestHorizontalRunLength(matrix: Matrix): number {
    const columns = matrix[0]?.length ?? 0;
    if (matrix.length === 0 || columns === 0) {
      return 0;
    }

    return Math.max(
      ...matrix.map((row) => this.longestRowRunLength(row, columns)),
    );
  }

  /**
   * The longest vertical run of ink in the Code. Rows do not wrap; the first
   * and last sit against the border rules.
   */
  public longestVerticalRunLength(matrix: Matrix): number {
    const columns = matrix[0]?.length ?? 0;
    if (matrix.length === 0 || columns === 0) {
      return 0;
    }

    return Math.max(
      ...Array.from({ length: columns }, (_unused, column) =>
        this.longestColumnRunLength(matrix, column),
      ),
    );
  }
}
