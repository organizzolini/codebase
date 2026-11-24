import { useContext } from "react";

import { CalendarSymbolsContext } from "../../../../calendar-events/event-glyphs/calendar-symbols.constants";
import { getEventLabel } from "../../../../calendar-events/event-glyphs/components/calendar-glyphs/calendar-glyphs.utilities";
import { EventGlyphs } from "../../../../calendar-events/event-glyphs/event-glyphs";
import { PILL_CLASS_NAME } from "../../calendar-table.constants";

import { getNameTint } from "./table-name-cell.utilities";

import type { CalendarEventRecord } from "../../../events-calendar/components/calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The event whose name the cell shows. */
export interface TableNameCellProperties {
  className?: string;
  record: CalendarEventRecord;
}

// 🧩 Component

/**
 * Renders an event's name, led by its symbols as icons or as emojis, whichever the calendar's setting says.
 */
export function TableNameCell(
  properties: Readonly<TableNameCellProperties>,
): ReactNode {
  const { className, record } = properties;

  // 🪝 Hooks
  const symbols = useContext(CalendarSymbolsContext);

  // 🏗 Setup
  const { glyphs, name } = getEventLabel(record);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <span
      className={`${PILL_CLASS_NAME} ${className ?? ""}`}
      data-testid="table-name-cell"
      style={getNameTint(record.color)}
    >
      {glyphs === name ? null : (
        <span className="shrink-0 text-[1.25em] leading-none">
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
      <span>{name}</span>
    </span>
  );
}
