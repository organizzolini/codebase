import { TagPillLabel } from "../../../../calendar-events/tag-pill-label/tag-pill-label";
import { PILL_CLASS_NAME } from "../../calendar-table.constants";
import { getTagCellEntries } from "../../calendar-table.utilities";

import type { CalendarEventRecord } from "../../../events-calendar/components/calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The event, and the path whose tags the cell names. */
export interface TableTagCellProperties {
  className?: string;
  prefix: string;
  record: CalendarEventRecord;
}

// 🧩 Component

/**
 * Renders the tags an event has beneath a path, each as an opaque pill of its icon or symbol and its name.
 */
export function TableTagCell(
  properties: Readonly<TableTagCellProperties>,
): ReactNode {
  const { className, prefix, record } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const entries = getTagCellEntries(record, prefix);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <span
      className={`flex flex-wrap gap-1 ${className ?? ""}`}
      data-testid="table-tag-cell"
    >
      {entries.map((entry) => (
        <span
          key={`${entry.id}|${entry.label}`}
          className={`${PILL_CLASS_NAME} text-xs`}
          data-testid="table-tag-pill"
        >
          <TagPillLabel
            id={entry.id}
            label={entry.label}
          />
        </span>
      ))}
    </span>
  );
}
