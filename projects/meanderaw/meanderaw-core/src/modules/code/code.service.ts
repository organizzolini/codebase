import { Inject, Injectable } from "@nestjs/common";

import { SymmetryService } from "../symmetry/symmetry.service";

import {
  CODE_FORMAT_PATTERN,
  HEXADECIMAL_DIGIT_PATTERN,
  InvalidCodeCharacterError,
  InvalidCodeFormatError,
  InvalidCodeLengthError,
} from "./code.constants";

import type { Directions, Tile } from "../tile/tile.types";
import type { Code, CodeObject } from "./code.types";

/**
 * Owns a meander's Code: reading one, a point's direction bits, spelling a
 * tile into one, and rotating its columns.
 *
 * **A Code is read in place.** Each bit is decoded from its own digit.
 *
 * **The spelling is redundant.** Each edge is written at both ends.
 */
@Injectable()
export class CodeService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(SymmetryService)
    private readonly symmetryService: SymmetryService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** One digit's four direction bits, worth `8` north, `4` south, `2` east, `1` west. */
  private decode(value: number): Directions {
    return {
      east: (value & 0b0010) !== 0,
      north: (value & 0b1000) !== 0,
      south: (value & 0b0100) !== 0,
      west: (value & 0b0001) !== 0,
    };
  }

  /**
   * Checks if a column span repeats exactly to fill the Code.
   */
  private isRepeatingUnit(code: CodeObject, width: number): boolean {
    const { columns, digits, rows } = code;
    for (let row = 0; row < rows; row += 1) {
      const rowSlice = digits.slice(row * columns, (row + 1) * columns);
      const piece = rowSlice.slice(0, width);
      if (piece.repeat(columns / width) !== rowSlice) {
        return false;
      }
    }
    return true;
  }

  /** Parses bare hexadecimal digits with explicit dimensions into a `CodeObject`. */
  private parseBare(code: string, rows: number, columns: number): CodeObject {
    this.validateDigits(code, rows, columns);

    return {
      columns,
      digits: code.toLowerCase(),
      repeats: 1,
      rows,
    };
  }

  /** Parses a self-contained code string match into a `CodeObject`. */
  private parseFormatted(match: RegExpExecArray): CodeObject {
    const {
      columns: rawColumns = "",
      digits: rawDigits = "",
      repeats: rawRepeats = "1",
      rows: rawRows = "",
    } = match.groups ?? {};
    const parsedColumns = Number.parseInt(rawColumns, 10);
    const parsedRows = Number.parseInt(rawRows, 10);
    const repeats = Number.parseInt(rawRepeats, 10);
    const digits = rawDigits.toLowerCase();

    this.validateDigits(digits, parsedRows, parsedColumns);

    return {
      columns: parsedColumns,
      digits,
      repeats,
      rows: parsedRows,
    };
  }

  /** Validates that digits match expected length for the shape and are valid hexadecimal. */
  private validateDigits(digits: string, rows: number, columns: number): void {
    if (digits.length !== rows * columns) {
      throw new InvalidCodeLengthError(digits, rows, columns);
    }

    for (const character of digits) {
      if (!HEXADECIMAL_DIGIT_PATTERN.test(character)) {
        throw new InvalidCodeCharacterError(character, digits);
      }
    }
  }

  // 🌎 Public Methods

  /**
   * The canonical rotation of a Code: the one minimizing its tile-crossing
   * score, ties broken by the lexicographically smallest digits.
   */
  canonicalRotation(
    code: CodeObject,
    scoreTileCrossing: (rotation: CodeObject) => number,
    group: (code: CodeObject) => CodeObject[] = (c) =>
      Array.from({ length: c.columns }, (_, index) => this.rotate(c, index)),
  ): CodeObject {
    let best = code;
    let minimumTileCrossingScore = Infinity;

    for (const rotation of group(code)) {
      const tileCrossingScore = scoreTileCrossing(rotation);

      if (
        tileCrossingScore < minimumTileCrossingScore ||
        (tileCrossingScore === minimumTileCrossingScore &&
          rotation.digits < best.digits)
      ) {
        best = rotation;
        minimumTileCrossingScore = tileCrossingScore;
      }
    }

    return best;
  }

  /**
   * The four direction bits at `(row, column)`, read off the single character
   * there. Positions outside the Code carry no ink.
   */
  directionsAt(code: CodeObject, row: number, column: number): Directions {
    const { columns, digits, rows } = code;

    if (row < 0 || row >= rows || column < 0 || column >= columns) {
      return { east: false, north: false, south: false, west: false };
    }

    return this.decode(
      Number.parseInt(digits[row * columns + column] ?? "0", 16),
    );
  }

  /**
   * Formats a `CodeObject` as `{columns}x{rows}y{digits}`, with an `r{repeats}`
   * suffix past one repeat and 2-digit zero-padding.
   */
  format(code: CodeObject): Code {
    const columns = String(code.columns).padStart(2, "0");
    const rows = String(code.rows).padStart(2, "0");
    const repeatSuffix =
      code.repeats > 1 ? `r${String(code.repeats).padStart(2, "0")}` : "";

    return `${columns}x${rows}y${code.digits.toLowerCase()}${repeatSuffix}`;
  }

  /**
   * Reads `code` as a self-contained string or bare hexadecimal digits at `rows` and
   * `columns`, refusing a length or character that disagrees.
   */
  parse(code: Code, rows?: number, columns?: number): CodeObject {
    const match = CODE_FORMAT_PATTERN.exec(code);
    if (match !== null) {
      return this.parseFormatted(match);
    }

    if (rows !== undefined && columns !== undefined) {
      return this.parseBare(code, rows, columns);
    }

    throw new InvalidCodeFormatError(code);
  }

  /**
   * Reduces a Code to its smallest repeating unit: the smallest column span
   * that divides its columns and repeats to fill them.
   */
  reduceToUnit(code: CodeObject): CodeObject {
    const { columns, digits, repeats, rows } = code;

    for (let width = 1; width <= columns; width += 1) {
      if (columns % width !== 0) {
        continue;
      }

      if (this.isRepeatingUnit(code, width)) {
        let reducedDigits = "";
        for (let row = 0; row < rows; row += 1) {
          reducedDigits += digits.slice(row * columns, row * columns + width);
        }

        return {
          columns: width,
          digits: reducedDigits,
          repeats,
          rows,
        };
      }
    }

    return code;
  }

  /**
   * The Code shifted `shift` columns west, wrapping each row. A shift
   * rotates the repeat without changing the pattern.
   */
  rotate(code: CodeObject, shift: number): CodeObject {
    const { columns, digits, rows } = code;
    const offset = ((shift % columns) + columns) % columns;
    const rotated = Array.from({ length: rows }, (_unused, row) => {
      const rowSlice = digits.slice(row * columns, (row + 1) * columns);

      return rowSlice.slice(offset) + rowSlice.slice(0, offset);
    });

    return { ...code, digits: rotated.join("") };
  }

  /**
   * Names a tile as a self-contained Code string in the format
   * `{columns}x{rows}y{digits}r{repeats}`: its {@link spellDigits}, with
   * 2-digit zero-padding on columns, rows, and repeats.
   */
  spell(tile: Tile, repeats = 1): string {
    return this.format({
      columns: tile.columns,
      digits: this.spellDigits(tile),
      repeats,
      rows: tile.rows,
    });
  }

  /**
   * The Code every tile in a symmetry class shares: {@link spell} of the
   * canonical member. Tiles draw the same pattern exactly when these match.
   */
  spellCanonical(tile: Tile, repeats = 1): string {
    return this.spell(this.symmetryService.canonicalTile(tile), repeats);
  }

  /**
   * The tile's digits: one lowercase hexadecimal character per point in reading order,
   * worth 8 north, 4 south, 2 east and 1 west.
   */
  spellDigits(tile: Tile): string {
    return tile.points
      .flatMap((row) =>
        row.map((point) =>
          (
            (point.north ? 8 : 0) +
            (point.south ? 4 : 0) +
            (point.east ? 2 : 0) +
            (point.west ? 1 : 0)
          ).toString(16),
        ),
      )
      .join("");
  }

  /**
   * The Codes of `code`'s other symmetry-class members, each at its canonical
   * rotation, sorted. The draw run folds these into this row.
   */
  symmetricalCodes(
    code: CodeObject,
    scoreTileCrossing: (rotation: CodeObject) => number,
  ): string[] {
    const own = this.format(code);
    const codes = new Set(
      this.symmetryService
        .reflections(this.tile(code))
        .map((reflection) =>
          this.format(
            this.canonicalRotation(
              { ...code, digits: this.spellDigits(reflection) },
              scoreTileCrossing,
            ),
          ),
        ),
    );

    codes.delete(own);

    return [...codes].toSorted();
  }

  /**
   * The tile a Code names: {@link spell} read backwards. Allocates one object
   * per point, so measuring a Code should use {@link directionsAt} instead.
   */
  tile(code: CodeObject): Tile {
    const { columns, rows } = code;

    return {
      columns,
      points: Array.from({ length: rows }, (_row, row) =>
        Array.from({ length: columns }, (_column, column) =>
          this.directionsAt(code, row, column),
        ),
      ),
      rows,
    };
  }
}
