/**
 * One timeline row as it was laid out: its id and its height in pixels, in
 * the order the rows are drawn.
 */
export interface TimelineRowBox {
  height: number;
  id: string;
}

/**
 * Where the timeline's body is scrolled to and how tall it shows.
 */
export interface TimelineViewport {
  scrollTop: number;
  viewportHeight: number;
}
