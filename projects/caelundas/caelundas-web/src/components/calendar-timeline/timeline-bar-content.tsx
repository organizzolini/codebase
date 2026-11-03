import { CalendarEventChip } from "../calendar-event-chip/calendar-event-chip";
import { CalendarEventTooltip } from "../calendar-event-tooltip/calendar-event-tooltip";

import type { TimelineBar } from "./calendar-timeline.types";
import type { GanttRenderEventProps } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The bar to draw, as the Gantt hands it to its event renderer.
 */
export interface TimelineBarContentProperties extends Pick<
  GanttRenderEventProps<TimelineBar>,
  "occurrence"
> {
  className?: string;
}

// 🧩 Component

/**
 * Draws what a bar holds: a circle for an instant, at its moment and never
 * narrower than a lane is tall; the count of a cluster of crowded markers, in
 * a circle; or a span's title.
 */
export function TimelineBarContent(
  properties: Readonly<TimelineBarContentProperties>,
): ReactNode {
  const { className, occurrence } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const records = occurrence.event.data?.records ?? [];
  const [record] = records;
  let content: ReactNode;

  if (record === undefined) {
    content = (
      <span className="truncate font-medium">{occurrence.event.title}</span>
    );
  } else if (records.length > 1) {
    // A count says nothing of what is behind it, so it has a tooltip too.
    content = (
      <CalendarEventTooltip
        className="flex w-full justify-center"
        event={record}
        label={{
          details: "Click to list them.",
          name: `${String(records.length)} events`,
        }}
      >
        <span
          className="flex h-4 min-w-4 items-center justify-center rounded-full bg-(--gantt-event-color) px-1 text-[10px] leading-none font-semibold text-white tabular-nums"
          data-slot="timeline-cluster"
        >
          {records.length}
        </span>
      </CalendarEventTooltip>
    );
  } else if (occurrence.start.getTime() === occurrence.end.getTime()) {
    // The circle says nothing of what the event is, so it has the tooltip.
    content = (
      <CalendarEventTooltip
        className="flex"
        event={record}
      >
        <span
          className="block size-3.5 shrink-0 rounded-full border border-(--gantt-event-color) bg-(--gantt-event-color)/80"
          data-slot="timeline-instant"
          aria-hidden
        />
      </CalendarEventTooltip>
    );
  } else {
    content = (
      <CalendarEventChip
        className="min-w-0 font-medium"
        event={record}
      />
    );
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="timeline-bar-content"
      style={{ display: "contents" }}
    >
      {content}
    </div>
  );
}
