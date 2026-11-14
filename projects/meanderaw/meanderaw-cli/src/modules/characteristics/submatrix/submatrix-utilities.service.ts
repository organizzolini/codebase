import { Injectable } from "@nestjs/common";

import type { SubmatrixWindow } from "../characteristics.types";
import type { GlyphCell } from "./submatrix.types";
import type { Matrix, MatrixPointArm } from "@codebase/meanderaw-core";

/**
 * Shared submatrix readings every submatrix group injects: point digits, arm counts,
 * isolated glyph matches, and the formula and window that describe them.
 */
@Injectable()
export class SubmatrixUtilitiesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  /** Each template's glyph points, parsed once, freed with it. */
  private readonly cellsByTemplate = new WeakMap<
    readonly string[],
    GlyphCell[]
  >();

  /** Each board's digit grid, built once, assuming no mutation. */
  private readonly digitGrids = new WeakMap<
    Matrix,
    readonly (readonly number[])[]
  >();

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The glyph points of a
   * {@link SubmatrixUtilitiesService.countIsolatedGlyphs} template, with each
   * blank `.` left out.
   */
  private glyphCells(template: readonly string[]): GlyphCell[] {
    const parsed = this.cellsByTemplate.get(template);
    if (parsed !== undefined) {
      return parsed;
    }

    const cells = template.flatMap((line, row) =>
      Array.from({ length: line.length }, (_unused, column) => ({
        character: line.charAt(column),
        column,
      }))
        .filter(({ character }) => character !== ".")
        .map(({ character, column }) => ({
          column,
          digit: Number.parseInt(character, 16),
          row,
        })),
    );
    this.cellsByTemplate.set(template, cells);
    return cells;
  }

  /** Whether the glyph `cells` sit on `grid` with their top-left corner at `(row, column)`, columns wrapping. */
  private matchesAt(
    grid: readonly (readonly number[])[],
    cells: readonly GlyphCell[],
    corner: { column: number; row: number },
  ): boolean {
    for (const cell of cells) {
      const digits = grid[corner.row + cell.row] ?? [];
      if (
        digits[(corner.column + cell.column) % digits.length] !== cell.digit
      ) {
        return false;
      }
    }

    return true;
  }

  // 🌎 Public Methods

  /**
   * Counts the isolated glyphs of a matrix drawn exactly as `template`, a
   * hexadecimal-digit grid with `.` outside the glyph. Columns wrap.
   */
  public countIsolatedGlyphs(
    matrix: Matrix,
    template: readonly string[],
  ): number {
    const cells = this.glyphCells(template);
    const width = Math.max(0, ...template.map((line) => line.length));
    const columns = matrix[0]?.length ?? 0;
    if (width > columns) {
      return 0;
    }

    const grid = this.digitGrid(matrix);
    let count = 0;
    for (let row = 0; row + template.length <= grid.length; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (this.matchesAt(grid, cells, { column, row })) {
          count += 1;
        }
      }
    }

    return count;
  }

  /**
   * Counts the points whose ink leaves by `arm`, whatever other arms they
   * carry. This is every directional edge count.
   */
  public countPointsWithArm(matrix: Matrix, arm: MatrixPointArm): number {
    let count = 0;

    for (const row of matrix) {
      for (const point of row) {
        if (point[arm]) {
          count += 1;
        }
      }
    }

    return count;
  }

  /**
   * Counts the points whose ink leaves by exactly `arms`, every other arm
   * clear. A bare point is `[]`; a corner, two perpendicular arms.
   */
  public countPointsWithExactArms(
    matrix: Matrix,
    arms: readonly MatrixPointArm[],
  ): number {
    const east = arms.includes("east");
    const north = arms.includes("north");
    const south = arms.includes("south");
    const west = arms.includes("west");
    let count = 0;

    for (const row of matrix) {
      for (const point of row) {
        if (
          point.east === east &&
          point.north === north &&
          point.south === south &&
          point.west === west
        ) {
          count += 1;
        }
      }
    }

    return count;
  }

  /**
   * Every point's digit, row by row, as {@link SubmatrixUtilitiesService.pointDigitAt}
   * spells it. Shared across templates; callers must not mutate it.
   */
  public digitGrid(matrix: Matrix): readonly (readonly number[])[] {
    const built = this.digitGrids.get(matrix);
    if (built !== undefined) {
      return built;
    }

    const grid = matrix.map((points, row) =>
      points.map((_point, column) => this.pointDigitAt(matrix, row, column)),
    );
    this.digitGrids.set(matrix, grid);
    return grid;
  }

  /**
   * Typesets a {@link SubmatrixUtilitiesService.countIsolatedGlyphs} template
   * as the LaTeX definition of its characteristic.
   */
  public glyphFormula(template: readonly string[]): string {
    const rows = template
      .map((line) =>
        Array.from({ length: line.length }, (_unused, column) =>
          line.charAt(column) === "." ? String.raw`\cdot` : line.charAt(column),
        ).join(" & "),
      )
      .join(String.raw` \\ `);

    return String.raw`\left|\left\{\, W \subseteq M : W \equiv \begin{matrix} ${rows} \end{matrix},\ W \text{ isolated} \,\right\}\right|`;
  }

  /**
   * The window a {@link SubmatrixUtilitiesService.countIsolatedGlyphs}
   * template reads: its widest line by its line count, blanks included.
   */
  public glyphWindow(template: readonly string[]): SubmatrixWindow {
    return {
      columns: Math.max(0, ...template.map((line) => line.length)),
      rows: template.length,
    };
  }

  /**
   * The hexadecimal Code digit at `(row, column)`, columns wrapping; -1 past the top
   * or bottom row.
   */
  public pointDigitAt(matrix: Matrix, row: number, column: number): number {
    const points = matrix[row] ?? [];
    const point =
      points[((column % points.length) + points.length) % points.length];
    if (point === undefined) {
      return -1;
    }

    return (
      (point.north ? 8 : 0) +
      (point.south ? 4 : 0) +
      (point.east ? 2 : 0) +
      (point.west ? 1 : 0)
    );
  }
}
