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

/**
 * Lays rows of the given heights end to end, returning each row's top and,
 * last, the height of them all.
 */
export function getRowOffsets(heights: readonly number[]): number[] {
  const offsets = [0];
  let top = 0;

  for (const height of heights) {
    top += height;
    offsets.push(top);
  }

  return offsets;
}

/**
 * Picks the rows a viewport scrolled to `scrollTop` shows, plus the
 * overscan on each side, so a list of any length renders only what fits on screen.
 * Both edges are found by binary search over the offsets.
 */
export function getVirtualWindow(input: VirtualWindowInput): VirtualWindow {
  const { offsets, overscan, scrollTop, viewportHeight } = input;
  const count = offsets.length - 1;

  if (count <= 0) {
    return { end: 0, start: 0 };
  }

  // The first row whose bottom lies below the top edge, and the first row
  // whose top lies at or below the bottom edge.
  const first = Math.min(
    count - 1,
    findFirstRowEndingAfter(offsets, scrollTop),
  );
  const last = Math.max(
    first + 1,
    findFirstRowEndingAfter(offsets, scrollTop + viewportHeight - 1) + 1,
  );

  return {
    end: Math.min(count, last + overscan),
    start: Math.max(0, first - overscan),
  };
}

/**
 * The first row whose bottom edge lies below a pixel, or the row count when
 * none does.
 */
function findFirstRowEndingAfter(
  offsets: readonly number[],
  pixel: number,
): number {
  let low = 0;
  let high = offsets.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    // Past the last offset reads as NaN, which is never past the pixel.
    if (Number(offsets[middle + 1]) > pixel) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  return low;
}
