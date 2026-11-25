// 🏷️ Types

import type { CalendarNavigation } from "../../components/calendar-controls/calendar-navigation-group/calendar-navigation-group.types";
import type {
  EventMetricsData,
  MetricNode,
} from "../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { UseEventMetricsOptions } from "./hooks/use-event-metrics/use-event-metrics.types";

/**
 * The metrics' options, the sorts, and what the toolbar and date move.
 */
export interface UseMetricLayoutOptions extends UseEventMetricsOptions {
  onDateChange: (date: Date) => void;
  onNavigationChange: (navigation: CalendarNavigation) => void;
  /**
   * Shows only the top-level groups until a group is opened or closed.
   */
  rootsUntilTouched?: boolean;
  sort: readonly GroupSort[] | undefined;
}

/**
 * What a layout draws: the data, its groups, how to open one.
 */
export interface UseMetricLayoutResult {
  /**
   * The metrics read, the last answer kept while the next loads; its groups are sorted.
   */
  data: EventMetricsData | undefined;
  error: Error | undefined;
  /**
   * The ids of the groups that are open, shared with the table.
   */
  expanded: ReadonlySet<string>;
  /**
   * Opens a group and the one above it, so its subgroups show in its place, and names it for the Group strip.
   */
  open: (parent: string, id: string, color?: string) => void;
  refetch: () => void;
  /**
   * The groups shown now, in order.
   */
  rows: readonly MetricNode[];
  status: "error" | "loading" | "ready";
  /**
   * Opens a closed group and closes an open one, by its id, naming an opened one for the Group strip.
   */
  toggle: (id: string, color?: string) => void;
}
