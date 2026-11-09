import { TileService } from "../src/modules/tile/tile.service";

import type { Tile } from "../src/modules/tile/tile.types";

/**
 * Builds `mosaic` tiles for the tests that need one written out by hand.
 *
 * A tile is four direction bits per point, but only two of them are the
 * point's own — the eastward edge leaving it and the southward one — and the
 * other two belong to its neighbors. So a tile is written here as the edges
 * its points *own*, which is both the shortest complete description of one
 * and the only one that cannot be self-contradictory: there is no way to
 * write a pair of neighbors that disagree.
 */

// 🔧 Configuration

/** The real builder, so hand-written tiles are derived exactly as enumerated ones are. */
const tileService = new TileService();

// 🌎 Utilities

/**
 * The tile whose points own the edges `rowDescriptions` describes, one string per row.
 * `.` none, `e` eastward, `s` southward, `b` both.
 */
export const buildTile = (rowDescriptions: readonly string[]): Tile => {
  const columns = rowDescriptions[0]?.length ?? 0;
  const rows = rowDescriptions.length;
  const owns = (row: number, column: number, mark: string): boolean => {
    const character = rowDescriptions[row]?.[column];

    return character === mark || character === "b";
  };

  return tileService.build(
    { columns, rows },
    {
      horizontal: Array.from({ length: rows }, (_row, row) =>
        Array.from({ length: columns }, (_column, column) =>
          owns(row, column, "e"),
        ),
      ),
      vertical: Array.from({ length: rows - 1 }, (_row, row) =>
        Array.from({ length: columns }, (_column, column) =>
          owns(row, column, "s"),
        ),
      ),
    },
  );
};
