import { ArrowUpDown } from "lucide-react";
import { useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { moveListItem } from "../calendar-group-strip/components/chip-menu/chip-menu.utilities";
import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import {
  getSelectedColumnIds,
  restrictGroupFields,
  restrictSortKeys,
} from "../calendar-select-strip/calendar-select-strip-scope.utilities";
import { QueryCascader } from "../query-cascader/query-cascader";
import { PICK_EVERY_ROW } from "../query-cascader/query-cascader.constants";
import { keepHiddenValues } from "../query-cascader/query-cascader.utilities";

import {
  DEFAULT_SORT_LABEL,
  DEFAULT_SORTS,
  TITLE,
} from "./calendar-sort-strip.constants";
import {
  createSortItems,
  flipSortAt,
  getSortIcon,
  labelSort,
  toSorts,
  toSortValue,
} from "./calendar-sort-strip.utilities";
import { SortChip } from "./components/sort-chip/sort-chip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Facets, shown sorts, view, and the change handler. */
export interface CalendarSortStripProperties {
  className?: string;
  /**
   * The columns the table shows; in the table, only they can be newly sorted by.
   */
  columns?: readonly string[] | undefined;
  facets?: readonly EventFacet[] | undefined;
  onSortChange: (sort: GroupSort[] | undefined) => void;
  sort: readonly GroupSort[] | undefined;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Sort button, opening a searchable list to order groups by, with one chip per sort. */
export function CalendarSortStrip(
  properties: Readonly<CalendarSortStripProperties>,
): ReactNode {
  const {
    className,
    columns,
    facets = [],
    onSortChange,
    sort,
    view,
  } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const items = useMemo(() => {
    if (view !== "table") {
      return createSortItems(fields);
    }

    const selected = getSelectedColumnIds(columns);

    return createSortItems(
      restrictGroupFields(fields, selected),
      restrictSortKeys(selected),
    );
  }, [columns, fields, view]);

  // 🏗 Setup
  const sorts = sort === undefined || sort.length === 0 ? DEFAULT_SORTS : sort;
  const isDefault = sort === undefined || sort.length === 0;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (view !== "timeline" && view !== "table") {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-sort-strip"
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
                <ArrowUpDown aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Sort by"
            className="w-80 max-w-[90vw] p-0"
          >
            <QueryCascader
              cascade={false}
              items={items}
              mode="tree"
              onValueChange={(next) => {
                onSortChange(
                  toSorts(
                    keepHiddenValues(next, toSortValue(sorts), items),
                    sorts,
                  ),
                );
              }}
              placeholder="Sort by"
              selectable={PICK_EVERY_ROW}
              value={toSortValue(sorts)}
              multiple
            />
          </PopoverContent>
        </Popover>
        {sorts.map((current, index) => (
          <SortChip
            key={`${current.key}|${current.tag ?? ""}`}
            direction={current.direction}
            icon={getSortIcon(current, fields)}
            label={isDefault ? DEFAULT_SORT_LABEL : labelSort(current, fields)}
            onFlip={() => {
              onSortChange(flipSortAt(sorts, index));
            }}
            onMoveLeft={
              index === 0
                ? undefined
                : () => {
                    onSortChange(moveListItem(sorts, index, -1));
                  }
            }
            onMoveRight={
              index === sorts.length - 1
                ? undefined
                : () => {
                    onSortChange(moveListItem(sorts, index, 1));
                  }
            }
            onRemove={
              isDefault
                ? undefined
                : () => {
                    onSortChange(
                      sorts.length === 1
                        ? undefined
                        : sorts.filter((_, position) => position !== index),
                    );
                  }
            }
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
