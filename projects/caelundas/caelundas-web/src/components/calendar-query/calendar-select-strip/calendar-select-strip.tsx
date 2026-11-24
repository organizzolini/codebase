import { MousePointer2 } from "lucide-react";
import { Fragment, useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import {
  DEFAULT_COLUMN_IDS,
  NO_COLUMNS,
} from "../../calendar-display/calendar-table/calendar-table.constants";
import { resolveColumns } from "../../calendar-display/calendar-table/calendar-table.utilities";
import { TagLead } from "../../calendar-events/tag-lead/tag-lead";
import { ChipMenu } from "../calendar-group-strip/components/chip-menu/chip-menu";
import { moveListItem } from "../calendar-group-strip/components/chip-menu/chip-menu.utilities";
import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { QueryCascader } from "../query-cascader/query-cascader";
import { PICK_EVERY_ROW } from "../query-cascader/query-cascader.constants";

import { TITLE } from "./calendar-select-strip.constants";
import {
  createColumnItems,
  toColumnIds,
} from "./calendar-select-strip.utilities";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Facets, the columns shown, view, and the change handler. */
export interface CalendarSelectStripProperties {
  className?: string;
  columns: readonly string[] | undefined;
  facets?: readonly EventFacet[] | undefined;
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
    onColumnsChange,
    view,
  } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const items = useMemo(() => createColumnItems(fields), [fields]);

  // 🏗 Setup
  const ids = columns.length === 0 ? DEFAULT_COLUMN_IDS : columns;
  const shown = resolveColumns(ids, fields);

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
      <ButtonGroup
        aria-label={TITLE}
        className="flex-wrap gap-y-2"
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              >
                <MousePointer2 aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Select columns"
            className="w-80 max-w-[90vw] p-0"
          >
            <QueryCascader
              cascade={false}
              items={items}
              mode="tree"
              onValueChange={(next) => {
                onColumnsChange(toColumnIds(next, ids));
              }}
              placeholder="Select columns"
              selectable={PICK_EVERY_ROW}
              value={[...ids]}
              multiple
            />
          </PopoverContent>
        </Popover>
        {shown.map((column, index) => (
          <Fragment key={column.id}>
            <Button
              className="bg-background dark:bg-input/30"
              size="sm"
              variant="outline"
            >
              <TagLead
                icon={column.icon}
                id={column.id}
                label={column.label}
              />
              {column.label}
            </Button>
            <ChipMenu
              label={column.label}
              onMoveLeft={
                index === 0
                  ? undefined
                  : () => {
                      onColumnsChange(
                        moveListItem(
                          shown.map((entry) => entry.id),
                          index,
                          -1,
                        ),
                      );
                    }
              }
              onMoveRight={
                index === shown.length - 1
                  ? undefined
                  : () => {
                      onColumnsChange(
                        moveListItem(
                          shown.map((entry) => entry.id),
                          index,
                          1,
                        ),
                      );
                    }
              }
              onRemove={() => {
                onColumnsChange(
                  toColumnIds(
                    shown
                      .filter((_entry, at) => at !== index)
                      .map((entry) => entry.id),
                    ids,
                  ),
                );
              }}
            />
          </Fragment>
        ))}
      </ButtonGroup>
    </div>
  );
}
