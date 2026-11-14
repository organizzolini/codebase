// 🏷️ Types

/**
 * Where an element sits and how wide it is, and how to hand the hook the element.
 */
export interface UseElementBoxResult {
  setElement: (element: HTMLElement | null) => void;
  /** Its distance from the top of the page, in pixels. */
  top: number;
  /** Its width, in pixels; 0 until it is measured. */
  width: number;
}
