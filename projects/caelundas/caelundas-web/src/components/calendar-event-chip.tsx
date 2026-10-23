import { useContext } from "react";

import { getEventLabel } from "../lib/calendar/calendar-glyphs";
import { CalendarSymbolsContext } from "../lib/calendar/calendar-symbols";

import { CalendarEventTooltip } from "./calendar-event-tooltip";
import { EventGlyphs } from "./event-glyphs";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The event to draw, and what to spell out for a screen reader beyond its
 * name.
 */
export interface CalendarEventChipProperties {
  className?: string;
  /**
   * The event's tags and duration, spelled out for a screen reader.
   */
  description?: string | undefined;
  event: CalendarEventRecord;
}

// 🧩 Component

/**
 * Draws an event as its glyphs alone, with a tooltip of its name in English
 * and what the database says of it, and for a screen reader the name and the
 * description in full, since the glyphs say neither.
 */
export function CalendarEventChip(
  properties: Readonly<CalendarEventChipProperties>,
): ReactNode {
  const { className = "min-w-0", description, event } = properties;

  // 🪝 Hooks
  const symbols = useContext(CalendarSymbolsContext);

  // 🏗 Setup
  const { glyphs, name } = getEventLabel(event);
  // An event drawn by its name needs it said once.
  const spoken =
    glyphs === name ? description : `${name}. ${description ?? ""}`;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-event-chip"
    >
      <CalendarEventTooltip event={event}>
        {glyphs === name ? (
          glyphs
        ) : (
          // Symbols are drawn larger than the text of an event's name.
          <span
            className="text-[1.35em] leading-none"
            data-testid="calendar-event-symbols"
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
      </CalendarEventTooltip>
      {spoken === undefined ? null : <span className="sr-only">{spoken}</span>}
    </div>
  );
}
