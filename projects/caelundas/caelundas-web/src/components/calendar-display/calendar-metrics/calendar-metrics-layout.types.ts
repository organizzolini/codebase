import type { UseMetricLayoutOptions } from "../../../hooks/use-metric-layout/use-metric-layout.types";
import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";

// 🏷️ Types

/**
 * The Charts' and Totals' properties: the table's query and the toolbar's hooks.
 */
export interface MetricLayoutProperties extends UseMetricLayoutOptions {
  className?: string;
  /**
   * Colors by group key; none when colors are off.
   */
  groupColors?: ReadonlyMap<string, string> | undefined;
  /**
   * Sets the sorts the Charts' sort buttons change; the buttons are absent without it.
   */
  onSortChange?: ((sort: GroupSort[] | undefined) => void) | undefined;
}
