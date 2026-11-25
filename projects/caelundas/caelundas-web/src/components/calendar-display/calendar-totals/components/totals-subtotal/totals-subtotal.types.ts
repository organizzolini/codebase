// 🏷️ Types

/**
 * A group's number for a metric, the previous's, and its share.
 */
export interface RowFigures {
  previous: null | number;
  /**
   * The share of the whole in percent; none for a metric that does not add up.
   */
  share: null | number;
  value: null | number;
}
