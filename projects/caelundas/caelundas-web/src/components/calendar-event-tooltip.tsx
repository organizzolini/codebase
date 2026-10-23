import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@codebase/presentation";

import { getEventLabel } from "../lib/calendar/calendar-glyphs";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The event to describe and what to draw for it, which the tooltip opens
 * over.
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
 * Wraps what is drawn for an event, its glyphs, in a tooltip with the event's
 * name in English and whatever the database says of it.
 */
export function CalendarEventTooltip(
  properties: Readonly<CalendarEventTooltipProperties>,
): ReactNode {
  const { children, className, event, label } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { details, name } = label ?? getEventLabel(event);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-event-tooltip"
    >
      <Tooltip>
        <TooltipTrigger
          closeDelay={0}
          delay={100}
          render={
            <span className="block min-w-0 truncate before:absolute before:inset-0 before:content-['']" />
          }
        >
          {children}
        </TooltipTrigger>
        <TooltipContent className="bg-popover text-popover-foreground border-border flex-col items-start gap-0.5 border shadow-md [&>div:last-child]:hidden">
          <span className="font-medium">{name}</span>
          {details === undefined ? null : (
            <span className="opacity-80">{details}</span>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
