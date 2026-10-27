import type { TimelineBar } from "../../types/calendar-timeline.types";
import type { CalendarEventRecord } from "../../types/events-database.types";
import type { GanttOccurrence } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🏷️ Types

/**
 * The events a clicked marker holds, and the title its dialog opens under.
 */
export interface OpenedBar {
  records: readonly CalendarEventRecord[];
  title: string;
}

/**
 * The dialog a clicked marker opens, and the handler that opens it.
 */
export interface UseBarDialogResult {
  /**
   * The dialog to draw, closed until a marker is clicked.
   */
  dialog: ReactNode;
  handleEventClick: (occurrence: GanttOccurrence<TimelineBar>) => void;
}
