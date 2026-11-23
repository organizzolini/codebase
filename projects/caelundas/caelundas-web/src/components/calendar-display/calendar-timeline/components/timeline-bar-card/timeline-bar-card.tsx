import { CalendarEventCard } from "../../../../calendar-events/calendar-event-card/calendar-event-card";

import type { TimelineBar } from "../../calendar-timeline.types";
import type { GanttRenderEventProps } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The bar whose hover card to draw, from the Gantt's tooltip renderer.
 */
export interface TimelineBarCardProperties extends Pick<
  GanttRenderEventProps<TimelineBar>,
  "occurrence"
> {
  className?: string;
}

// 🧩 Component

/**
 * Draws a bar's hover card, the one an event has everywhere: its symbols, name and tags; a count of several events says how many it stands for.
 */
export function TimelineBarCard(
  properties: Readonly<TimelineBarCardProperties>,
): ReactNode {
  const { className, occurrence } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const records = occurrence.event.data?.records ?? [];
  const [record] = records;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (record === undefined) {
    return <span className="font-medium">{occurrence.event.title}</span>;
  }

  // 🎨 Markup
  return (
    <CalendarEventCard
      className={`flex flex-col items-start gap-0.5 ${className ?? ""}`}
      event={record}
      label={
        records.length > 1
          ? {
              details: "Click to list them.",
              name: `${String(records.length)} events`,
            }
          : undefined
      }
    />
  );
}
