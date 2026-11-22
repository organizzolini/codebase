import { ArrowUpDown } from "lucide-react";
import { useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { moveListItem } from "../chip-menu/chip-menu.utilities";
import { QueryCascader } from "../query-cascader/query-cascader";
import { JOINED_STRIP_CLASS_NAME } from "../query-cascader/query-cascader.constants";

import { SORT_OPTIONS, TITLE } from "./calendar-sort-strip.constants";
import {
  createSortItems,
  flipSortAt,
  labelDefaultSort,
  toSorts,
  toSortValue,
} from "./calendar-sort-strip.utilities";
import { SortChip } from "./components/sort-chip/sort-chip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGrouping } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's facets, the grouping, the sorts shown, the view, and the change handler.
 */
export interface CalendarSortStripProperties {
  className?: string;
  facets?: readonly EventFacet[] | undefined;
  grouping?: EventGrouping | undefined;
  onSortChange: (sort: GroupSort[] | undefined) => void;
  sort: readonly GroupSort[] | undefined;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders, for the timeline, the Sort button, which opens a searchable list of what to order groups by, joined to one chip per sort in order, each with an ellipsis menu; with none chosen, a chip for the first group's names.
 */
export function CalendarSortStrip(
  properties: Readonly<CalendarSortStripProperties>,
): ReactNode {
  const {
    className,
    facets = [],
    grouping = [],
    onSortChange,
    sort,
    view,
  } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);

  // 🏗 Setup
  const items = createSortItems();
  const sorts = sort ?? [];
  const isDefault = sorts.length === 0;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (view !== "timeline") {
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
        className={JOINED_STRIP_CLASS_NAME}
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
            className="w-72 max-w-[90vw] p-0"
          >
            <QueryCascader
              cascade={false}
              items={items}
              onValueChange={(next) => {
                onSortChange(toSorts(next, sorts));
              }}
              placeholder="Sort by"
              value={toSortValue(sorts)}
              multiple
            />
          </PopoverContent>
        </Popover>
        {isDefault ? (
          <SortChip
            direction="asc"
            label={labelDefaultSort(grouping, fields)}
            onFlip={() => {
              onSortChange([{ direction: "desc", key: "name" }]);
            }}
          />
        ) : (
          sorts.map((current, index) => (
            <SortChip
              key={current.key}
              direction={current.direction}
              label={
                SORT_OPTIONS.find((option) => option.key === current.key)
                  ?.label ?? current.key
              }
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
              onRemove={() => {
                onSortChange(
                  sorts.length === 1
                    ? undefined
                    : sorts.filter((_, position) => position !== index),
                );
              }}
            />
          ))
        )}
      </ButtonGroup>
    </div>
  );
}
