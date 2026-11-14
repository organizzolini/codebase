// ♟️ Constants

/**
 * The smallest `rows` value a `mosaic` tile is worth enumerating at.
 *
 * Two, the shallowest band that holds a southward edge. The budget admits five
 * column spans there, so it is where the space is widest.
 */

// 🚨 Errors

/**
 * Thrown when a grid of direction bits is not a tile: adjoining points disagree
 * about the edge between them, or the grid is the wrong size.
 *
 * Refusing these keeps the bits a bijection with the drawing.
 */
export class MalformedTileError extends Error {
  constructor(reason: string) {
    super(`direction bits do not describe a mosaic tile: ${reason}`);
    this.name = "MalformedTileError";
  }
}
