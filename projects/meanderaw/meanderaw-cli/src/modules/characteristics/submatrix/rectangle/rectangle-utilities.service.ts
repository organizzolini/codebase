import { Inject, Injectable } from "@nestjs/common";

import { SubmatrixUtilitiesService } from "../submatrix-utilities.service";

import type { SubmatrixOffset } from "../submatrix.types";
import type { Matrix } from "@codebase/meanderaw-core";

/**
 * Finds the isolated rectangular rings of a matrix for the rectangle group,
 * reading each point's Code digit through `SubmatrixUtilitiesService`.
 */
@Injectable()
export class RectangleUtilitiesService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(SubmatrixUtilitiesService)
    private readonly submatrixUtilitiesService: SubmatrixUtilitiesService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Whether a rectangle with its north-west corner at `origin`, of a size `isCounted` accepts, closes its ring exactly.
   */
  private isIsolatedRectangleAt(
    matrix: Matrix,
    origin: SubmatrixOffset,
    isCounted: (width: number, height: number) => boolean,
  ): boolean {
    if (
      this.submatrixUtilitiesService.pointDigitAt(
        matrix,
        origin.row,
        origin.column,
      ) !== 6
    ) {
      return false;
    }

    const width = this.sideLength(matrix, origin, {
      corner: 5,
      limit: (matrix[0]?.length ?? 0) - 1,
      step: { column: 1, row: 0 },
      straight: 3,
    });
    const height = this.sideLength(matrix, origin, {
      corner: 10,
      limit: matrix.length - 1,
      step: { column: 0, row: 1 },
      straight: 12,
    });

    return (
      width > 0 &&
      height > 0 &&
      isCounted(width, height) &&
      this.ringCloses(matrix, origin, { height, width })
    );
  }

  /**
   * Whether the bottom and right sides of a ring, with top and left at their corners, are straights meeting at a south-east corner (┘).
   */
  private ringCloses(
    matrix: Matrix,
    origin: SubmatrixOffset,
    size: { readonly height: number; readonly width: number },
  ): boolean {
    const { column, row } = origin;
    const { height, width } = size;
    const bottom = Array.from({ length: width - 1 }, (_unused, offset) =>
      this.submatrixUtilitiesService.pointDigitAt(
        matrix,
        row + height,
        column + 1 + offset,
      ),
    );
    const right = Array.from({ length: height - 1 }, (_unused, offset) =>
      this.submatrixUtilitiesService.pointDigitAt(
        matrix,
        row + 1 + offset,
        column + width,
      ),
    );

    return (
      this.submatrixUtilitiesService.pointDigitAt(
        matrix,
        row + height,
        column + width,
      ) === 9 &&
      bottom.every((digit) => digit === 3) &&
      right.every((digit) => digit === 12)
    );
  }

  /**
   * Edges a ring's side runs from `origin` along `side.step`, crossing only `side.straight` points until `side.corner`; 0 if it breaks first or exceeds `side.limit`.
   */
  private sideLength(
    matrix: Matrix,
    origin: SubmatrixOffset,
    side: {
      readonly corner: number;
      readonly limit: number;
      readonly step: SubmatrixOffset;
      readonly straight: number;
    },
  ): number {
    for (let length = 1; length <= side.limit; length += 1) {
      const digit = this.submatrixUtilitiesService.pointDigitAt(
        matrix,
        origin.row + side.step.row * length,
        origin.column + side.step.column * length,
      );
      if (digit === side.corner) {
        return length;
      }
      if (digit !== side.straight) {
        return 0;
      }
    }

    return 0;
  }

  // 🌎 Public Methods

  /**
   * Counts the isolated rectangles of a matrix whose size `isCounted` accepts. Assumes every arm is reciprocated, as `TileService.assertWellFormed` checks.
   */
  public countIsolatedRectangles(
    matrix: Matrix,
    isCounted: (width: number, height: number) => boolean,
  ): number {
    const columns = matrix[0]?.length ?? 0;
    let count = 0;

    for (let row = 0; row < matrix.length; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (this.isIsolatedRectangleAt(matrix, { column, row }, isCounted)) {
          count += 1;
        }
      }
    }

    return count;
  }
}
