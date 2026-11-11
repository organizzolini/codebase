/**
 * A timeline row's id and height, in draw order.
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
