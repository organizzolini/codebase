import { useContext } from "react";

import { CalendarSymbolsContext } from "../../hooks/use-calendar-search/calendar-symbols.constants";
import { CalendarEventTooltip } from "../calendar-event-tooltip/calendar-event-tooltip";
import { getEventLabel } from "../event-glyphs/calendar-glyphs.utilities";
import { EventGlyphs } from "../event-glyphs/event-glyphs";

import type { CalendarEventRecord } from "../events-calendar/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The event to draw, and extra text for screen readers.
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
 * Draws an event as its glyphs, with a tooltip of its name; a screen reader gets the name and description in full.
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
            className="py-0.5 text-[1.4em] leading-none"
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
