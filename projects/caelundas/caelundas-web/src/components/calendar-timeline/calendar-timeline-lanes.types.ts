import type { TimelineBar } from "./calendar-timeline.types";
import type { GanttEvent, GanttResource } from "@codebase/presentation";

// 🏷️ Types

/**
 * The timeline's rows and bars once the bars of a row that overlap have been
 * moved apart into lanes of their own.
 */
export interface TimelineLayout {
  bars: GanttEvent<TimelineBar>[];
  resources: GanttResource[];
}
