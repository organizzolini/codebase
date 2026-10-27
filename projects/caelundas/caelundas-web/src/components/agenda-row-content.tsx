import { Button } from "@codebase/presentation";

import { formatCalendarDay } from "../utilities/calendar-format.utilities";

import { HEADING_TAGS } from "./calendar-agenda.constants";
import { formatEventCount } from "./calendar-agenda.utilities";
import { CalendarEventRow } from "./calendar-event-row";

import type { AgendaListRow } from "./calendar-agenda.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The agenda row to draw, the zone its times read in, and how deep a day's
 * heading sits beneath the group headings.
 */
export interface AgendaRowContentProperties {
  className?: string;
  /**
   * How many group headings rank above a day's.
   */
  dayLevel: number;
  onShowLater: (() => void) | undefined;
  row: AgendaListRow;
  timeZone: string;
}

// 🧩 Component

/**
 * Draws one agenda row: a group's or a day's heading, an event, or the
 * button that lists later days.
 */
export function AgendaRowContent(
  properties: Readonly<AgendaRowContentProperties>,
): ReactNode {
  const { className, dayLevel, onShowLater, row, timeZone } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  let content: ReactNode;

  switch (row.kind) {
    case "day": {
      const Heading = HEADING_TAGS[dayLevel] ?? "h6";

      content = (
        <Heading className="bg-muted/60 flex h-full items-center border-b px-4 text-sm font-semibold">
          {formatCalendarDay(row.day)}
        </Heading>
      );

      break;
    }
    case "group": {
      const Heading = HEADING_TAGS[row.node.level] ?? "h6";

      content = (
        <Heading
          className="bg-background flex h-full items-center gap-2 border-b px-4 font-semibold"
          style={{ paddingInlineStart: `${String(1 + row.node.level)}rem` }}
        >
          <span className="truncate">{row.node.label}</span>{" "}
          <span className="text-muted-foreground shrink-0 text-xs font-normal">
            {formatEventCount(row.node.count)}
          </span>
        </Heading>
      );

      break;
    }
    case "later": {
      content = (
        <div className="flex h-full items-center justify-center">
          <Button
            onClick={onShowLater}
            size="sm"
            variant="outline"
          >
            Show later events
          </Button>
        </div>
      );

      break;
    }
    case "event": {
      content = (
        <CalendarEventRow
          className="h-full"
          ongoing={row.ongoing}
          record={row.record}
          timeZone={timeZone}
        />
      );
    }
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="agenda-row-content"
      style={{ display: "contents" }}
    >
      {content}
    </div>
  );
}
