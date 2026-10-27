import { useContext } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@codebase/presentation";

import { CalendarSymbolsContext } from "../constants/calendar-symbols.constants";
import { getEventLabel } from "../utilities/calendar-glyphs.utilities";

import { EventGlyphs } from "./event-glyphs";
import { EventTagPills } from "./event-tag-pills";

import type { CalendarEventRecord } from "../types/events-database.types";
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
 * Wraps what is drawn for an event, its glyphs, in a tooltip that follows the pointer, with the event's
 * name in English, whatever the database says of it, and its tags as pills.
 */
export function CalendarEventTooltip(
  properties: Readonly<CalendarEventTooltipProperties>,
): ReactNode {
  const { children, className, event, label } = properties;

  // 🪝 Hooks
  const symbols = useContext(CalendarSymbolsContext);

  // 🏗 Setup
  const eventLabel = getEventLabel(event);
  const { details, name } = label ?? eventLabel;
  // A marker that stands for several events has no symbols of its own, and
  // an event drawn by its name has none to add.
  const glyphs =
    label === undefined && eventLabel.glyphs !== eventLabel.name
      ? eventLabel.glyphs
      : undefined;

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
          {glyphs === undefined ? null : (
            <span
              className="py-1 text-[1.5em] leading-none"
              data-testid="calendar-event-tooltip-symbols"
            >
              {symbols === "glyphs" ? (
                <EventGlyphs
                  glyphs={glyphs}
                  name={name}
                />
              ) : (
                glyphs
              )}
            </span>
          )}
          <span className="font-medium">{name}</span>
          {details === undefined ? null : (
            <span className="opacity-80">{details}</span>
          )}
          {event.tags.length === 0 ? null : (
            <span className="mt-1 block max-w-xs">
              <EventTagPills tags={event.tags} />
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
