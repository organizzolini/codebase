import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { SymmetryService } from "../symmetry/symmetry.service";
import { TileService } from "../tile/tile.service";

import { EDGE_BUDGET, OversizedTileError } from "./enumeration.constants";

import type { EdgesDraft, Tile, TileShape } from "../tile/tile.types";
import type { EdgeAddress, Environment } from "./enumeration.types";

/**
 * Enumerates every distinct tile of a shape: every subset of its edges.
 *
 * `DRAW_EDGE_BUDGET` caps the edges one tile may hold, keeping the walk finite.
 * The result is folded by symmetry class, and `SymmetryService.canonicalTile`
 * picks the member the corpus draws.
 */
@Injectable()
export class TileEnumerationService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(SymmetryService)
    private readonly symmetryService: SymmetryService,
    @Inject(TileService)
    private readonly tileService: TileService,
    @Inject(ConfigService)
    configService: ConfigService<Environment>,
  ) {
    this.edgeBudget =
      configService.get<number>("DRAW_EDGE_BUDGET") ?? EDGE_BUDGET;
  }

  // 🔐 Private Fields

  /**
   * How many edges one tile may hold, read once from `DRAW_EDGE_BUDGET`.
   */
  private readonly edgeBudget: number;

  /** Enumerations by `rows x columns`, kept since they are pure. */
  private readonly tilesByShape = new Map<string, Tile[]>();

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Where the `ordinal`-th edge sits in a draft: the grid that holds it, and its row and column within that grid. */
  private address(
    edges: EdgesDraft,
    shape: TileShape,
    ordinal: number,
  ): EdgeAddress {
    const { columns, rows } = shape;
    const horizontalCount = columns * rows;
    const isHorizontal = ordinal < horizontalCount;
    const local = isHorizontal ? ordinal : ordinal - horizontalCount;

    return {
      column: local % columns,
      grid: isHorizontal ? edges.horizontal : edges.vertical,
      row: Math.floor(local / columns),
    };
  }

  /**
   * One permutation of a shape's edges as byte lookup tables, so a mask maps
   * with one lookup per byte.
   */
  private byteTables(permutation: readonly number[]): Uint32Array[] {
    return Array.from(
      { length: Math.ceil(permutation.length / 8) },
      (_table, byte) =>
        Uint32Array.from({ length: 256 }, (_entry, value) => {
          let image = 0;

          for (let bit = 0; bit < 8; bit += 1) {
            const target = permutation[byte * 8 + bit];

            if (target !== undefined && (value >>> bit) & 1) {
              image |= 1 << target;
            }
          }

          return image >>> 0;
        }),
    );
  }

  /** Where `mask` lands under the permutation `tables` were built from. */
  private image(tables: readonly Uint32Array[], mask: number): number {
    let image = 0;

    for (const [byte, table] of tables.entries()) {
      image |= table[(mask >>> (byte * 8)) & 255] ?? 0;
    }

    return image >>> 0;
  }

  /** Sets the `ordinal`-th edge of a draft. */
  private set(edges: EdgesDraft, shape: TileShape, ordinal: number): void {
    const { column, grid, row } = this.address(edges, shape, ordinal);

    this.tileService.mark(grid, row, column);
  }

  // 🌎 Public Methods

  /**
   * How many edges a tile of this shape holds: the binary decisions one tile
   * is, and what the edge budget bounds.
   */
  edges(shape: TileShape): number {
    return shape.columns * (2 * shape.rows - 1);
  }

  /**
   * Every distinct tile of the given size, one per symmetry class, in canonical
   * edge-key order. Refuses an over-budget shape.
   */
  enumerate(rows: number, columns: number): Tile[] {
    const shape: TileShape = { columns, rows };

    if (!this.isAdmitted(shape)) {
      throw new OversizedTileError(shape, this.edges(shape), this.edgeBudget);
    }

    const cached = this.tilesByShape.get(`${rows}x${columns}`);

    if (cached !== undefined) {
      return [...cached];
    }

    const tiles = this.orbitMinima(rows, columns)
      .map((mask) => {
        const tile = this.symmetryService.canonicalTile(this.tile(shape, mask));

        return { key: this.symmetryService.edgeKey(tile), tile };
      })
      .toSorted((first, second) => first.key.localeCompare(second.key))
      .map(({ tile }) => tile);

    this.tilesByShape.set(`${rows}x${columns}`, tiles);

    return [...tiles];
  }

  /** Whether a shape is small enough to enumerate, which is the only thing that decides it. */
  isAdmitted(shape: TileShape): boolean {
    return this.edges(shape) <= this.edgeBudget;
  }

  /**
   * Whether every point of a tile touches at most one edge (the retired
   * `mosaic` exact-cover rule). Kept to assert old counts.
   */
  isMatching(tile: Tile): boolean {
    for (const [row, pointsRow] of tile.points.entries()) {
      for (const [column] of pointsRow.entries()) {
        if (this.tileService.incidentEdges(tile, row, column) > 1) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * The widest column span the budget admits at a row count, at least one.
   */
  maximumColumns(rows: number): number {
    return Math.max(Math.floor(this.edgeBudget / (2 * rows - 1)), 1);
  }

  /**
   * Every assignment no symmetry-group element sends to a smaller one: one
   * bitmask per class, ascending.
   */
  orbitMinima(rows: number, columns: number): number[] {
    const shape: TileShape = { columns, rows };
    const edges = this.edges(shape);

    if (!this.isAdmitted(shape) || edges > 32) {
      throw new OversizedTileError(shape, edges, this.edgeBudget);
    }

    const group = this.symmetryService
      .edgePermutations(shape)
      .slice(1)
      .map((permutation) => this.byteTables(permutation));
    const minima: number[] = [];

    for (let mask = 0; mask < 2 ** edges; mask += 1) {
      if (group.every((tables) => this.image(tables, mask) >= mask)) {
        minima.push(mask);
      }
    }

    return minima;
  }

  /**
   * The tile a bitmask describes, edge `ordinal` set wherever bit `ordinal`
   * is — not folded to its class's representative, which
   * `SymmetryService.canonicalTile` does.
   */
  tile(shape: TileShape, mask: number): Tile {
    const edges = this.tileService.blankEdges(shape);

    for (let ordinal = 0; ordinal < this.edges(shape); ordinal += 1) {
      if ((mask >>> ordinal) & 1) {
        this.set(edges, shape, ordinal);
      }
    }

    return this.tileService.build(shape, edges);
  }
}
