import { useEffect, useMemo } from "react";

import { Table, TableBody, TableHeader } from "@codebase/presentation";

import { useTableRows } from "../../../hooks/use-table-rows/use-table-rows";
import { createEventGroupFields } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { AGENDA_DAY_COUNT } from "../events-calendar/components/calendar-views/calendar-views.constants";

import {
  GROUP_COLUMN,
  NO_COLUMNS,
  NUMBER_COLUMN,
} from "./calendar-table.constants";
import {
  createTableNavigation,
  resolveColumns,
} from "./calendar-table.utilities";
import { TableColumnHeads } from "./components/table-column-heads/table-column-heads";
import { createRowColors } from "./components/table-group-row/table-group-row.utilities";
import {
  MemoEventRow,
  MemoGroupRow,
  MemoMoreRow,
} from "./table-rows.constants";

import type { CalendarNavigation } from "../../calendar-controls/calendar-navigation-group/calendar-navigation-group.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../events-calendar/components/calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Events, tag roots, grouping, sorts, columns, days, and handlers. */
export interface CalendarTableProperties {
  agendaDays?: number | undefined;
  anchor: Date;
  className?: string;
  /**
   * The columns to show, as the link names them; the defaults when absent.
   */
  columns?: readonly string[] | undefined;
  events: readonly CalendarEventRecord[];
  facets: readonly EventFacet[];
  /**
   * Colors by tag key for the group pills; none when colors are off.
   */
  groupColors?: ReadonlyMap<string, string> | undefined;
  grouping: readonly EventGroupLevel[];
  onColumnsChange?:
    | ((columns: readonly string[] | undefined) => void)
    | undefined;
  onDateChange: (date: Date) => void;
  onNavigationChange: (navigation: CalendarNavigation) => void;
  onSortChange?: ((sort: GroupSort[] | undefined) => void) | undefined;
  sort?: readonly GroupSort[] | undefined;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders the events as a table, a row each with the columns picked, nested under groups that open and close.
 */
export function CalendarTable(
  properties: Readonly<CalendarTableProperties>,
): ReactNode {
  const {
    agendaDays = AGENDA_DAY_COUNT,
    anchor,
    className,
    columns: columnIds = NO_COLUMNS,
    events,
    facets,
    groupColors,
    grouping,
    onColumnsChange,
    onDateChange,
    onNavigationChange,
    onSortChange,
    sort,
    timeZone,
  } = properties;

  // 🪝 Hooks
  const grouped = grouping.length > 0;
  const { columns, fields } = useMemo(() => {
    const groupFields = createEventGroupFields(facets);
    const picked = resolveColumns(columnIds, groupFields);

    return {
      columns: [grouped ? GROUP_COLUMN : NUMBER_COLUMN, ...picked],
      fields: groupFields,
    };
  }, [columnIds, facets, grouped]);
  const { levelIcons, more, rows, toggle } = useTableRows({
    anchor,
    dayCount: agendaDays,
    events,
    facets,
    fields,
    grouping,
    sort,
    timeZone,
  });

  const nodeColors = useMemo(
    () => createRowColors(rows, groupColors),
    [groupColors, rows],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    onNavigationChange(
      createTableNavigation({
        anchor,
        dayCount: agendaDays,
        onDateChange,
        timeZone,
      }),
    );
  }, [agendaDays, anchor, onDateChange, onNavigationChange, timeZone]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-table"
    >
      <div className="h-full overflow-auto border-t [&>div]:overflow-visible">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableColumnHeads
              columns={columns}
              onColumnsChange={onColumnsChange}
              onSortChange={onSortChange}
              sort={sort}
            />
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              if (row.kind === "group") {
                return (
                  <MemoGroupRow
                    key={row.id}
                    columns={columns}
                    levelIcons={levelIcons}
                    nodeColors={nodeColors}
                    onToggle={toggle}
                    row={row}
                    timeZone={timeZone}
                  />
                );
              }

              if (row.kind === "more") {
                return (
                  <MemoMoreRow
                    key={row.id}
                    columnCount={columns.length}
                    onMore={more}
                    row={row}
                  />
                );
              }

              return (
                <MemoEventRow
                  key={row.id}
                  columns={columns}
                  row={row}
                  timeZone={timeZone}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
