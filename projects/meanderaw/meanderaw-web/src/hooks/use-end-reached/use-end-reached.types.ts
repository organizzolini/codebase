// 🏷️ Types

/**
 * How to hand over the element whose reach is watched.
 */
export interface UseEndReachedResult {
  /** Takes the element to watch, or none to stop. */
  setElement: (element: Element | null) => void;
}
