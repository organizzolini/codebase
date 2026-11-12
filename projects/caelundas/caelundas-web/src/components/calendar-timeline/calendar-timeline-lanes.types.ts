import type { TimelineBar } from "./calendar-timeline.types";
import type { GanttEvent, GanttResource } from "@codebase/presentation";

// 🏷️ Types

/**
 * The timeline's rows and bars, with overlapping bars moved to lanes.
 */
export interface TimelineLayout {
  bars: GanttEvent<TimelineBar>[];
  resources: GanttResource[];
}
