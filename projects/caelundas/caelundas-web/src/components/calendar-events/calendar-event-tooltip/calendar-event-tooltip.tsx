import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@codebase/presentation";

import { CalendarEventCard } from "../calendar-event-card/calendar-event-card";

import type { CalendarEventRecord } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The event and the trigger content its tooltip opens over.
 */
export interface CalendarEventTooltipProperties {
  children?: ReactNode;
  className?: string;
  event: CalendarEventRecord;
  /**
   * What the tooltip says in place of the event's own name and description,
   * for a marker that stands for several events.
   */
  label?: undefined | { details?: string; name: string };
}

// 🧩 Component

/**
 * Wraps an event's glyphs in a tooltip that follows the pointer, showing its name in English and its tags as pills.
 */
export function CalendarEventTooltip(
  properties: Readonly<CalendarEventTooltipProperties>,
): ReactNode {
  const { children, className, event, label } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-event-tooltip"
    >
      <Tooltip trackCursorAxis="both">
        <TooltipTrigger
          closeDelay={0}
          delay={100}
          render={
            <span className="block min-w-0 truncate before:absolute before:inset-0 before:content-['']" />
          }
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          className="bg-popover text-popover-foreground border-border flex-col items-start gap-0.5 border shadow-md [&>div:last-child]:hidden"
          sideOffset={12}
        >
          <CalendarEventCard
            className="flex flex-col items-start gap-0.5"
            event={event}
            label={label}
          />
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
