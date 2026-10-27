/**
 * The rows to render: `start` is included and `end` is not.
 */
export interface VirtualWindow {
  end: number;
  start: number;
}

/**
 * Where a virtualized list is scrolled to and how much of it shows.
 */
export interface VirtualWindowInput {
  /**
   * Each row's top in pixels, then the list's full height, as
   * {@link getRowOffsets} writes them.
   */
  offsets: readonly number[];
  /**
   * How many rows to render beyond each edge, so a fast scroll does not
   * show blank space before the next render.
   */
  overscan: number;
  scrollTop: number;
  viewportHeight: number;
}
