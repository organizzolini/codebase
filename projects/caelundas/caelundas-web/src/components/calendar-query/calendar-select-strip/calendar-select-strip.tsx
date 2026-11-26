import { useMemo } from "react";

import { Button } from "@codebase/presentation";

import {
  DEFAULT_COLUMN_IDS,
  NO_COLUMNS,
} from "../../calendar-display/calendar-table/calendar-table.constants";
import { resolveColumns } from "../../calendar-display/calendar-table/calendar-table.utilities";
import { TagLead } from "../../calendar-events/tag-lead/tag-lead";
import { ChipMenu } from "../calendar-group-strip/components/chip-menu/chip-menu";
import { moveListItem } from "../calendar-group-strip/components/chip-menu/chip-menu.utilities";
import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";

import { TITLE } from "./calendar-select-strip.constants";
import {
  createColumnItems,
  toColumnIds,
} from "./calendar-select-strip.utilities";
import { ColumnPicker } from "./components/column-picker/column-picker";
import { SelectStripFlow } from "./components/select-strip-flow/select-strip-flow";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { StripFold } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Facets, the columns shown, view, and the change handler. */
export interface CalendarSelectStripProperties {
  className?: string;
  columns: readonly string[] | undefined;
  facets?: readonly EventFacet[] | undefined;
  /** How the strip folds; it does not when absent. */
  fold?: StripFold | undefined;
  onColumnsChange: (columns: readonly string[] | undefined) => void;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Select button, opening a searchable list of columns to show in the table, with one chip per column and its ellipsis menu. */
export function CalendarSelectStrip(
  properties: Readonly<CalendarSelectStripProperties>,
): ReactNode {
  const {
    className,
    columns = NO_COLUMNS,
    facets = [],
    fold,
    onColumnsChange,
    view,
  } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const items = useMemo(() => createColumnItems(fields), [fields]);

  // 🏗 Setup
  const ids = columns.length === 0 ? DEFAULT_COLUMN_IDS : columns;
  const shown = resolveColumns(ids, fields);
  const order = shown.map((entry) => entry.id);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (view !== "table") {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-select-strip"
    >
      <SelectStripFlow
        chips={shown.map((column, index) => ({
          content: (
            <>
              <Button
                className="bg-background dark:bg-input/30"
                size="sm"
                title={column.label}
                variant="outline"
              >
                <TagLead
                  icon={column.icon}
                  id={column.id}
                  label={column.label}
                />
                {column.name ?? column.label}
              </Button>
              <ChipMenu
                label={column.label}
                onMoveLeft={
                  index === 0
                    ? undefined
                    : () => {
                        onColumnsChange(moveListItem(order, index, -1));
                      }
                }
                onMoveRight={
                  index === shown.length - 1
                    ? undefined
                    : () => {
                        onColumnsChange(moveListItem(order, index, 1));
                      }
                }
                onOnly={
                  shown.length === 1
                    ? undefined
                    : () => {
                        onColumnsChange(toColumnIds([column.id], ids));
                      }
                }
                onRemove={() => {
                  onColumnsChange(
                    toColumnIds(
                      order.filter((_entry, at) => at !== index),
                      ids,
                    ),
                  );
                }}
              />
            </>
          ),
          id: column.id,
          name: column.name ?? column.label,
        }))}
        fold={fold}
        label={TITLE}
        trigger={
          <ColumnPicker
            ids={ids}
            items={items}
            onColumnsChange={onColumnsChange}
          />
        }
      />
    </div>
  );
}
