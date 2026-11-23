import { CalendarEventChip } from "../../../../calendar-events/calendar-event-chip/calendar-event-chip";

import type { TimelineBar } from "../../calendar-timeline.types";
import type { GanttRenderEventProps } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The bar to draw, from the Gantt's event renderer.
 */
export interface TimelineBarContentProperties extends Pick<
  GanttRenderEventProps<TimelineBar>,
  "occurrence"
> {
  className?: string;
}

// 🧩 Component

/**
 * Draws a bar's content: an instant's circle, a cluster's count in a circle, or a span's title.
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
    // The bar's hover card says what the count stands for.
    content = (
      <span className="flex w-full justify-center">
        <span
          className="flex h-4 min-w-4 items-center justify-center rounded-full bg-(--gantt-event-color) px-1 text-[10px] leading-none font-semibold text-white tabular-nums"
          data-slot="timeline-cluster"
        >
          {records.length}
        </span>
      </span>
    );
  } else if (occurrence.start.getTime() === occurrence.end.getTime()) {
    // The bar's hover card says what the circle is.
    content = (
      <span
        className="block size-3.5 shrink-0 rounded-full border border-(--gantt-event-color) bg-(--gantt-event-color)/80"
        data-slot="timeline-instant"
        aria-hidden
      />
    );
  } else {
    content = (
      <CalendarEventChip
        className="sticky start-1.5 end-1.5 min-w-0 max-w-full font-medium"
        event={record}
        plain
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
