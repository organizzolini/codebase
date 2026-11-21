// 🏷️ Types

/**
 * What useWindowSize returns.
 */
export interface UseWindowSizeResult {
  /**
   * The window's size, or nothing before it is first measured after mount.
   */
  size: undefined | WindowSize;
}

/**
 * The window's size in pixels.
 */
export interface WindowSize {
  height: number;
  width: number;
}
