import { CalendarEventChip } from "../../../../calendar-events/calendar-event-chip/calendar-event-chip";
import { CalendarGroupChip } from "../calendar-group-chip/calendar-group-chip";

import { isEdgeId } from "./components/calendar-edges/calendar-edges.utilities";

import type { CalendarGroupReference } from "../calendar-groups/calendar-groups.types";
import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * An hour-view event, and what stands behind it as a cluster.
 */
export interface CalendarGridEventProperties {
  className?: string;
  /**
   * The events a cluster stands for; none for an event of its own.
   */
  count: number;
  description: string | undefined;
  eventId: string;
  expanded: boolean;
  /**
   * The group a cluster is of; none for an event of its own.
   */
  group: CalendarGroupReference | undefined;
  record: CalendarEventRecord;
}

// 🧩 Component

/**
 * Draws an hour-view event: a cluster as its group chip, else its chip, marked when a long event's block.
 */
export function CalendarGridEvent(
  properties: Readonly<CalendarGridEventProperties>,
): ReactNode {
  const { className, count, description, eventId, expanded, group, record } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (group !== undefined) {
    // The event's box carries the group's color; the chip is bare inside it.
    return (
      <span className="@container block h-full w-full">
        <CalendarGroupChip
          count={count}
          expanded={expanded}
          group={group}
          bare
        />
      </span>
    );
  }

  // 🎨 Markup
  // A block's clipped side is squared off by the surface classes, which read this marker.
  return (
    <span
      className={className ?? "block min-w-0"}
      data-edge={isEdgeId(eventId) ? eventId.split(":")[1] : undefined}
      data-testid="calendar-grid-event"
    >
      <CalendarEventChip
        description={description}
        event={record}
      />
    </span>
  );
}
