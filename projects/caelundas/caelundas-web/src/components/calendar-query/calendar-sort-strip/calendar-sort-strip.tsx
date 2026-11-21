import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import {
  Button,
  ButtonGroup,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import {
  ITEM_CLASS_NAME,
  SORT_OPTIONS,
  STRIP_CLASS_NAME,
  TITLE,
} from "./calendar-sort-strip.constants";
import {
  flipSortDirection,
  pickSortKey,
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
 * Renders, for the timeline, the Sort button, which opens a searchable list of what to order groups by, joined to a chip that names the sort and flips its direction.
 */
export function CalendarSortStrip(
  properties: Readonly<CalendarSortStripProperties>,
): ReactNode {
  const { className, onSortChange, sort, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
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
            <Command>
              <CommandInput placeholder="Sort by" />
              <CommandList>
                <CommandEmpty>Nothing to sort by.</CommandEmpty>
                <CommandGroup>
                  {SORT_OPTIONS.map((option) => (
                    <CommandItem
                      key={option.key}
                      className={ITEM_CLASS_NAME}
                      keywords={[option.description]}
                      onSelect={() => {
                        onSortChange(pickSortKey(sort, option.key));
                      }}
                      value={option.label}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span>{option.label}</span>
                        <span className="text-muted-foreground truncate text-xs">
                          {option.description}
                        </span>
                      </span>
                      {sort?.key === option.key ? (
                        <span className="text-muted-foreground ms-auto text-xs">
                          Selected
                        </span>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
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
