import { CalendarDays } from "lucide-react";
import { useMemo } from "react";

import { QueryCascader } from "../../../query-cascader/query-cascader";
import { keepHiddenValues } from "../../../query-cascader/query-cascader.utilities";

import { TAG_PARENT_VALUE } from "./filter-cascader.constants";
import {
  createFilterItems,
  isValue,
  toFilterQuery,
  toFilterValue,
} from "./filter-cascader.utilities";

import type {
  EventFilterField,
  EventFilterQuery,
} from "../event-filter-model/event-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The attributes to filter by, the filter shown, and the change handler.
 */
export interface FilterCascaderProperties {
  className?: string;
  fields: readonly EventFilterField[];
  /**
   * The fields offered to pick from, when fewer than `fields`; filters already on the others stay.
   */
  offered?: readonly EventFilterField[] | undefined;
  /**
   * Opens the picker of the days the view shows, as a Date item below the list; no such item when absent.
   */
  onDateOpen?: (() => void) | undefined;
  onQueryChange: (query: EventFilterQuery) => void;
  query: EventFilterQuery;
}

// 🧩 Component

/** Renders the searchable tree of attributes to filter by, each expanding to its values; every ticked value narrows the calendar. */
export function FilterCascader(
  properties: Readonly<FilterCascaderProperties>,
): ReactNode {
  const {
    className,
    fields,
    offered = fields,
    onDateOpen,
    onQueryChange,
    query,
  } = properties;

  // 🪝 Hooks
  const items = useMemo(() => createFilterItems(offered), [offered]);
  const actions = useMemo(
    () =>
      onDateOpen === undefined
        ? []
        : [
            {
              icon: <CalendarDays aria-hidden="true" />,
              label: (
                <span className="flex flex-col">
                  Date
                  <span className="text-xs text-muted-foreground">
                    The days the view shows
                  </span>
                </span>
              ),
              onSelect: onDateOpen,
              value: "date",
            },
          ],
    [onDateOpen],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-cascader"
    >
      <QueryCascader
        actions={actions}
        cascade={false}
        defaultExpanded={[TAG_PARENT_VALUE]}
        items={items}
        mode="tree"
        onValueChange={(next) => {
          onQueryChange(
            toFilterQuery(
              keepHiddenValues(next, toFilterValue(fields, query), items),
              fields,
              query,
            ),
          );
        }}
        placeholder="Search attributes"
        selectable={isValue}
        value={toFilterValue(fields, query)}
        multiple
      />
    </div>
  );
}
