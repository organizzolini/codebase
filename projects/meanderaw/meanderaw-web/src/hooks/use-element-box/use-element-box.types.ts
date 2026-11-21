// 🏷️ Types

/**
 * An element's top and width, and how to hand it over.
 */
export interface UseElementBoxResult {
  setElement: (element: HTMLElement | null) => void;
  /** Its distance from the top of the page, in pixels. */
  top: number;
  /** Its width, in pixels; 0 until it is measured. */
  width: number;
}
