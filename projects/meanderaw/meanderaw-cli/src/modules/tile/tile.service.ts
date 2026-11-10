import { Injectable } from "@nestjs/common";

import { MalformedTileError } from "./tile.constants";

import type {
  Directions,
  Edges,
  EdgesDraft,
  Tile,
  TilePoint,
  TileShape,
} from "./tile.types";

/**
 * The vocabulary every other `mosaic` service reads a tile through: building
 * it from edges and reading them back.
 *
 * A tile has two faces saying the same thing. {@link Edges} holds each degree
 * of freedom once; {@link Directions} is what a point is read in. {@link build}
 * and {@link edges} convert between them.
 */
@Injectable()
export class TileService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Refuses one point whose bits disagree with its neighbors'. Called only from
   * {@link assertWellFormed}.
   */
  private assertPointAgrees(tile: Tile, row: number, column: number): void {
    const { columns, points } = tile;
    const point = points[row]?.[column];
    const rightward = points[row]?.[(column + 1) % columns];

    if (point === undefined || rightward === undefined) {
      throw new MalformedTileError(`row ${row} is ragged`);
    }

    if (point.east !== rightward.west) {
      throw new MalformedTileError(
        `east at row ${row} column ${column} is not west at the point it reaches`,
      );
    }

    this.assertPointJoinsBelow(point, points[row + 1]?.[column], {
      column,
      row,
    });
  }

  /** Refuses one point whose southward bit the point below does not answer, or whose north is claimed where the cap tick sits. */
  private assertPointJoinsBelow(
    point: Directions,
    below: Directions | undefined,
    at: TilePoint,
  ): void {
    const { column, row } = at;

    if (point.south !== (below?.north ?? false)) {
      throw new MalformedTileError(
        `south at row ${row} column ${column} is not north at the point below it`,
      );
    }

    if (row === 0 && point.north) {
      throw new MalformedTileError(
        "the first row carries no north; the border at y = 0 is a cap tick",
      );
    }
  }

  /** Whether the eastward edge leaving `(row, column)` is set, reading a row or column the tile does not have as unset. */
  private horizontal(edges: Edges, row: number, column: number): boolean {
    return edges.horizontal[row]?.[column] ?? false;
  }

  /** Whether the southward edge leaving `(row, column)` is set. The last interior row has none, so it reads as unset there. */
  private vertical(edges: Edges, row: number, column: number): boolean {
    return edges.vertical[row]?.[column] ?? false;
  }

  // 🌎 Public Methods

  /**
   * Refuses a grid of direction bits that is not a tile. Its east-west wrap
   * makes a tile join with its next repeat.
   */
  assertWellFormed(tile: Tile): void {
    const { columns, points, rows } = tile;

    if (points.length !== rows) {
      throw new MalformedTileError(
        `a ${rows}-row tile has ${rows} rows, not ${points.length}`,
      );
    }

    for (const [row, rowEntries] of points.entries()) {
      if (rowEntries.length !== columns) {
        throw new MalformedTileError(
          `row ${row} spans ${rowEntries.length} columns, not ${columns}`,
        );
      }

      for (const [column] of rowEntries.entries()) {
        this.assertPointAgrees(tile, row, column);
      }
    }
  }

  /** A tile's worth of unset edges, ready to be marked one at a time and handed to {@link build}. */
  blankEdges(shape: TileShape): EdgesDraft {
    const { columns, rows } = shape;
    const grid = (rowCount: number): boolean[][] =>
      Array.from({ length: Math.max(rowCount, 0) }, () =>
        Array.from({ length: columns }, () => false),
      );

    return { horizontal: grid(rows), vertical: grid(rows - 1) };
  }

  /**
   * The tile a set of edges draws, each point's four bits derived from its
   * neighbors' edges.
   */
  build(shape: TileShape, edges: Edges): Tile {
    const { columns, rows } = shape;

    return {
      columns,
      points: Array.from({ length: rows }, (_row, row) =>
        Array.from({ length: columns }, (_column, column) => ({
          east: this.horizontal(edges, row, column),
          north: row > 0 && this.vertical(edges, row - 1, column),
          south: this.vertical(edges, row, column),
          west: this.horizontal(edges, row, (column - 1 + columns) % columns),
        })),
      ),
      rows,
    };
  }

  /**
   * A point's degree: how many of its four direction bits are set. A dot is 0,
   * a corner 2, a crossing 4.
   */
  degree(directions: Directions): number {
    return [
      directions.east,
      directions.north,
      directions.south,
      directions.west,
    ].filter(Boolean).length;
  }

  /** A tile's edges, each held once, at the point that owns it. */
  edges(tile: Tile): Edges {
    return {
      horizontal: tile.points.map((row) => row.map(({ east }) => east)),
      vertical: tile.points
        .slice(0, -1)
        .map((row) => row.map(({ south }) => south)),
    };
  }

  /**
   * Distinct edges touching a point. Differs from {@link degree} only at one
   * column, where an eastward edge loops back.
   */
  incidentEdges(tile: Tile, row: number, column: number): number {
    const directions = tile.points[row]?.[column];

    if (directions === undefined) {
      return 0;
    }

    const loops = tile.columns === 1 && directions.east;

    return this.degree(directions) - (loops ? 1 : 0);
  }

  /** Whether a point carries no ink at all, and so draws a dot. */
  isBare(directions: Directions): boolean {
    return this.degree(directions) === 0;
  }

  /** Sets one edge of a draft, ignoring rows the draft lacks, so a caller can walk past the last row. */
  mark(grid: readonly boolean[][], row: number, column: number): void {
    const targetRow = grid[row];

    if (targetRow !== undefined) {
      targetRow[column] = true;
    }
  }
}
