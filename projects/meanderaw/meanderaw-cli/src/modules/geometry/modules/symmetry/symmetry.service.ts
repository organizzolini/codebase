import { Inject, Injectable } from "@nestjs/common";

import { TileService } from "../tile/tile.service";

import type { Directions, Tile, TileShape } from "../tile/tile.types";
import type { PointRank, Transform, TransformChoice } from "./symmetry.types";

/**
 * The symmetries under which two `mosaic` tiles draw the same pattern.
 *
 * The group has order `4 × columns`: translations, a horizontal mirror, and a
 * vertical flip. It acts on edges, since edges carry the tile's degrees of freedom.
 */
@Injectable()
export class SymmetryService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Where one group element sends each of a shape's edges, in {@link edgeKey} order. */
  private edgePermutation(
    shape: TileShape,
    element: TransformChoice,
  ): number[] {
    const { columns, rows } = shape;
    const horizontalCount = columns * rows;
    const transform = { ...element, columns, rows };
    const image = (ordinal: number, isHorizontal: boolean): number => {
      const row = Math.floor(ordinal / columns);
      const lastRow = isHorizontal ? rows - 1 : rows - 2;
      const target = element.flip ? lastRow - row : row;
      const column = this.mapColumn(ordinal % columns, {
        ...transform,
        isHorizontal,
      });

      return (isHorizontal ? 0 : horizontalCount) + target * columns + column;
    };

    return [
      ...Array.from({ length: horizontalCount }, (_edge, ordinal) =>
        image(ordinal, true),
      ),
      ...Array.from({ length: (rows - 1) * columns }, (_edge, ordinal) =>
        image(ordinal, false),
      ),
    ];
  }

  /**
   * Every element of the group at a column count, identity first: each
   * shift, plain then mirrored, each upright then flipped.
   */
  private elements(columns: number): TransformChoice[] {
    return Array.from({ length: columns }, (_element, shift) =>
      [false, true].flatMap((mirror) =>
        [false, true].map((flip) => ({ flip, mirror, shift })),
      ),
    ).flat();
  }

  /**
   * Where an edge's column lands under one group element. A mirror moves an
   * eastward edge one column back.
   */
  private mapColumn(column: number, options: Transform): number {
    const { columns, isHorizontal, mirror, shift } = options;
    const reflected = mirror
      ? (isHorizontal ? -column - 1 : -column) + 2 * columns
      : column;

    return (reflected + shift) % columns;
  }

  /** Every tile the symmetry group maps `tile` to, itself included, with duplicates left in. */
  private orbit(tile: Tile): Tile[] {
    return this.elements(tile.columns).map((element) =>
      this.transform(tile, element),
    );
  }

  /**
   * Copies one direction's edges from `source` onto `target` under one group
   * element.
   */
  private place(
    source: readonly (readonly boolean[])[],
    target: readonly boolean[][],
    options: Transform,
  ): void {
    const lastRow = options.isHorizontal ? options.rows - 1 : options.rows - 2;

    for (const [row, sourceRow] of source.entries()) {
      for (const [column, isSet] of sourceRow.entries()) {
        if (isSet) {
          this.tileService.mark(
            target,
            options.flip ? lastRow - row : row,
            this.mapColumn(column, options),
          );
        }
      }
    }
  }

  /**
   * Ranks how a point is reached, the order the retired `mosaic` search found
   * covers: bare, south-anchored, east-anchored, then neighbor-reached.
   */
  private rank(directions: Directions): PointRank {
    if (directions.south) {
      return 1;
    }

    if (directions.east) {
      return 2;
    }

    return directions.north || directions.west ? 3 : 0;
  }

  /**
   * The key {@link canonicalTile} minimizes: each point's {@link rank} in
   * reading order, then the tile's edges as a tie-break.
   */
  private signature(tile: Tile): string {
    const ranks = tile.points
      .flatMap((row) => row.map((directions) => this.rank(directions)))
      .join("");

    return `${ranks}|${this.edgeKey(tile)}`;
  }

  /** The tile one group element maps `tile` to. */
  private transform(tile: Tile, options: TransformChoice): Tile {
    const { columns, rows } = tile;
    const source = this.tileService.edges(tile);
    const { horizontal, vertical } = this.tileService.blankEdges(tile);

    this.place(source.horizontal, horizontal, {
      ...options,
      columns,
      isHorizontal: true,
      rows,
    });
    this.place(source.vertical, vertical, {
      ...options,
      columns,
      isHorizontal: false,
      rows,
    });

    return this.tileService.build({ columns, rows }, { horizontal, vertical });
  }

  // 🌎 Public Methods

  /**
   * The one tile of a symmetry class the corpus draws. The choice is made by
   * {@link rank}.
   */
  canonicalTile(tile: Tile): Tile {
    let best = tile;
    let smallest = this.signature(tile);

    for (const variant of this.orbit(tile)) {
      const signature = this.signature(variant);

      if (signature < smallest) {
        best = variant;
        smallest = signature;
      }
    }

    return best;
  }

  /**
   * A tile's edges as a bit string, eastward then southward, in reading order.
   * Not how a drawing is named.
   */
  edgeKey(tile: Tile): string {
    const { horizontal, vertical } = this.tileService.edges(tile);

    return [...horizontal, ...vertical]
      .flatMap((row) => row.map((isSet) => (isSet ? "1" : "0")))
      .join("");
  }

  /**
   * Every group element as a permutation of a shape's edges in {@link edgeKey}
   * order, so a bitmask needs no tile per element.
   */
  edgePermutations(shape: TileShape): number[][] {
    return this.elements(shape.columns).map((element) =>
      this.edgePermutation(shape, element),
    );
  }

  /**
   * The tiles a mirror, a flip, and both map `tile` to, with no shift. Codes
   * already fold shifts.
   */
  reflections(tile: Tile): Tile[] {
    return [
      this.transform(tile, { flip: false, mirror: true, shift: 0 }),
      this.transform(tile, { flip: true, mirror: false, shift: 0 }),
      this.transform(tile, { flip: true, mirror: true, shift: 0 }),
    ];
  }

  /**
   * Every distinct tile drawing the same pattern as `tile`, itself included.
   * Summing sizes over the enumeration recovers the unfolded count.
   */
  variants(tile: Tile): Tile[] {
    const distinct = new Map<string, Tile>();

    for (const variant of this.orbit(tile)) {
      distinct.set(this.edgeKey(variant), variant);
    }

    return [...distinct.values()];
  }
}
