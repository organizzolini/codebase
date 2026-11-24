import { useContext } from "react";

import { formatEventWhen } from "../../calendar-display/events-calendar/components/calendar-format/calendar-format.utilities";
import { CalendarSymbolsContext } from "../event-glyphs/calendar-symbols.constants";
import { getEventLabel } from "../event-glyphs/components/calendar-glyphs/calendar-glyphs.utilities";
import { EventGlyphs } from "../event-glyphs/event-glyphs";
import { EventTagPills } from "../event-tag-pills/event-tag-pills";

import { getCardGlyphs } from "./calendar-event-card.utilities";

import type { CalendarEventRecord } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The event, and optional text replacing its name and description. */
export interface CalendarEventCardProperties {
  className?: string;
  event: CalendarEventRecord;
  label?: undefined | { details?: string; name: string };
}

// 🧩 Component

/** Renders an event's hover card: its symbols, English name, when it is, and tags as pills, laid out by the card it sits in. */
export function CalendarEventCard(
  properties: Readonly<CalendarEventCardProperties>,
): ReactNode {
  const { className, event, label } = properties;

  // 🪝 Hooks
  const symbols = useContext(CalendarSymbolsContext);

  // 🏗 Setup
  const eventLabel = getEventLabel(event);
  const { details, name } = label ?? eventLabel;
  // A marker that stands for several events has no symbols of its own, and
  // an event drawn by its name has none to add.
  const glyphs = getCardGlyphs(label, eventLabel);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-event-card"
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
      {label === undefined ? (
        <span
          className="opacity-80"
          data-testid="calendar-event-card-time"
        >
          {formatEventWhen(event)}
        </span>
      ) : null}
      {event.tags.length === 0 ? null : (
        <span className="mt-1 block max-w-xs">
          <EventTagPills tags={event.tags} />
        </span>
      )}
    </div>
  );
}
