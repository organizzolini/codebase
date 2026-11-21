import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { QueryCascader } from "../query-cascader/query-cascader";

import {
  SORT_OPTIONS,
  STRIP_CLASS_NAME,
  TITLE,
} from "./calendar-sort-strip.constants";
import {
  createSortItems,
  flipSortDirection,
  toSort,
  toSortValue,
} from "./calendar-sort-strip.utilities";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { GroupSort } from "../calendar-group-by/components/event-group-tree/event-group-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view, the sort shown, and the change handler.
 */
export interface CalendarSortStripProperties {
  className?: string;
  onSortChange: (sort: GroupSort | undefined) => void;
  sort: GroupSort | undefined;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders, for the timeline, the Sort button, which opens a searchable list of what to order groups by, each key with its two directions beneath it, joined to a chip that names the sort and flips its direction.
 */
export function CalendarSortStrip(
  properties: Readonly<CalendarSortStripProperties>,
): ReactNode {
  const { className, onSortChange, sort, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const items = createSortItems();
  const active = SORT_OPTIONS.find((option) => option.key === sort?.key);

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
        className={STRIP_CLASS_NAME}
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
              items={items}
              onValueChange={(next) => {
                onSortChange(toSort(next));
              }}
              placeholder="Sort by"
              value={toSortValue(sort)}
            />
          </PopoverContent>
        </Popover>
        {sort !== undefined && active !== undefined ? (
          <Button
            aria-label={`Sorted by ${active.label}, ${sort.direction === "asc" ? "ascending" : "descending"}; reverse`}
            onClick={() => {
              onSortChange(flipSortDirection(sort));
            }}
            size="sm"
            variant="outline"
          >
            {active.label}
            {sort.direction === "asc" ? (
              <ArrowUp aria-hidden="true" />
            ) : (
              <ArrowDown aria-hidden="true" />
            )}
          </Button>
        ) : null}
      </ButtonGroup>
    </div>
  );
}
