import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import type { CalendarEmptiness } from "../lib/calendar/calendar-loader";
import type { EventsDataset } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Why the calendar shows no events, and where to send it to find some.
 */
export interface CalendarEmptyProperties {
  className?: string;
  emptiness: CalendarEmptiness;
  /**
   * Called with the first day the data covers.
   */
  onJump: (date: Date) => void;
}

// 🧩 Component

/**
 * Renders why the calendar shows no events: an empty database, a month
 * outside the dates the data covers, which offers to jump to them, or a
 * month inside them that holds nothing.
 */
export function CalendarEmpty(
  properties: Readonly<CalendarEmptyProperties>,
): ReactNode {
  const { className, emptiness, onJump } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (emptiness.kind === "range") {
    return (
      <div
        className={className}
        data-testid="calendar-empty"
      >
        <OutsideDataset
          dataset={emptiness.dataset}
          jumpTo={emptiness.jumpTo}
          onJump={onJump}
        />
      </div>
    );
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-empty"
    >
      <Empty className="bg-background/90 pointer-events-auto max-w-md border shadow-sm">
        <EmptyHeader>
          <EmptyTitle>
            {emptiness.kind === "database"
              ? "No events yet"
              : "No events this month"}
          </EmptyTitle>
          <EmptyDescription>
            {emptiness.kind === "database"
              ? "The events database is empty."
              : "Nothing in the data falls in this month."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

/**
 * Names the dates the data covers and offers to jump to the nearest of them.
 */
function OutsideDataset(
  properties: Readonly<{
    dataset: EventsDataset;
    jumpTo: Date;
    onJump: (date: Date) => void;
  }>,
): ReactNode {
  const { dataset, jumpTo, onJump } = properties;
  const format = (date: Date): string =>
    date.toLocaleDateString("en-US", {
      dateStyle: "medium",
      timeZone: dataset.timezone,
    });

  return (
    <Empty className="bg-background/90 pointer-events-auto max-w-md border shadow-sm">
      <EmptyHeader>
        <EmptyTitle>Outside the data</EmptyTitle>
        <EmptyDescription>
          {`Events run from ${format(dataset.start)} to ${format(dataset.end)}.`}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={() => {
            onJump(jumpTo);
          }}
        >
          {`Go to ${format(jumpTo)}`}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
