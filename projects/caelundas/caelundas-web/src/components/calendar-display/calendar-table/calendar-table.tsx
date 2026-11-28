import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef as useReference,
} from "react";

import { Table } from "@codebase/presentation";

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
  getTableWidth,
  resolveColumns,
} from "./calendar-table.utilities";
import { TableBodyRows } from "./components/table-body-rows/table-body-rows";
import { createRowColors } from "./components/table-group-row/table-group-row.utilities";
import { TableHeadStrip } from "./components/table-head-strip/table-head-strip";
import { TableSizer } from "./components/table-sizer/table-sizer";
import { clipUnderStickyStack } from "./table-sticky.utilities";

import type { CalendarNavigation } from "../../calendar-controls/calendar-navigation-group/calendar-navigation-group.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../events-calendar/components/calendar-loader/calendar-records.types";
import type { ReactNode, UIEvent } from "react";

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
  /**
   * Whether groups with no events are left out; shown when absent.
   */
  hideEmpty?: boolean | undefined;
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
    hideEmpty,
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
    hideEmpty,
    sort,
    timeZone,
  });

  const nodeColors = useMemo(
    () => createRowColors(rows, groupColors),
    [groupColors, rows],
  );

  // 🏗 Setup
  const headReference = useReference<HTMLDivElement>(null);
  const bodyReference = useReference<HTMLDivElement>(null);
  const tableStyle = { width: getTableWidth(columns) };

  // 💪 Handlers
  const syncScroll = (event: UIEvent<HTMLDivElement>): void => {
    if (headReference.current !== null) {
      headReference.current.scrollLeft = event.currentTarget.scrollLeft;
    }

    clipUnderStickyStack(event.currentTarget);
  };

  // ♻️ Lifecycle
  useLayoutEffect(() => {
    clipUnderStickyStack(bodyReference.current);
  }, [bodyReference, columns, rows]);

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
      <div className="flex h-full flex-col border-t">
        <TableHeadStrip
          columns={columns}
          onColumnsChange={onColumnsChange}
          onSortChange={onSortChange}
          scrollReference={headReference}
          sort={sort}
        />
        <div
          ref={bodyReference}
          className="min-h-0 flex-1 overflow-auto [&>div]:overflow-visible"
          data-testid="calendar-table-body"
          onScroll={syncScroll}
        >
          <Table
            className="table-fixed [&_td]:overflow-hidden"
            style={tableStyle}
          >
            <TableSizer columns={columns} />
            <TableBodyRows
              columns={columns}
              levelIcons={levelIcons}
              more={more}
              nodeColors={nodeColors}
              onToggle={toggle}
              rows={rows}
              timeZone={timeZone}
            />
          </Table>
        </div>
      </div>
    </div>
  );
}
