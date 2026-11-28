// 🏷️ Types

/**
 * The widths the names column may take, in pixels.
 */
export interface TreeLimits {
  max: number;
  min: number;
}

/**
 * A tree panel set at its least: the names column's width.
 */
export interface TreePanelBase {
  minWidth?: number;
  nameColumnWidth: number;
  width: number;
}

/**
 * The widths the tree pane takes, in pixels.
 */
export interface TreeWidths {
  /**
   * The names column, which fits its widest visible row.
   */
  name: number;
  /**
   * The whole pane: the names column, the count column, and a gutter.
   */
  pane: number;
}
