import { ListTree, X } from "lucide-react";
import { useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Checkbox,
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

import { createEventGroupFields } from "../calendar-group-by/components/event-group-model/event-group-fields.utilities";
import { MAXIMUM_GROUP_LEVELS } from "../calendar-group-by/components/event-group-model/event-groups.constants";

import {
  ITEM_CLASS_NAME,
  STRIP_CLASS_NAME,
  TITLE,
} from "./calendar-group-strip.constants";
import {
  labelGroupLevel,
  toggleGroupLevel,
} from "./calendar-group-strip.utilities";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupLevel } from "../calendar-group-by/components/event-group-model/event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's facets, the grouping shown, and the change handler.
 */
export interface CalendarGroupStripProperties {
  className?: string;
  facets: readonly EventFacet[];
  grouping: readonly EventGroupLevel[];
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders, for the agenda and timeline, the Group button, which opens a searchable checklist of what to group by, joined to one chip per level in order; a chip's cross takes its level out.
 */
export function CalendarGroupStrip(
  properties: Readonly<CalendarGroupStripProperties>,
): ReactNode {
  const { className, facets, grouping, onGroupingChange, view } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);

  // 🏗 Setup
  const isFull = grouping.length >= MAXIMUM_GROUP_LEVELS;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (view !== "agenda" && view !== "timeline") {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-group-strip"
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
                <ListTree aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Group by"
            className="w-80 max-w-[90vw] p-0"
          >
            <Command>
              <CommandInput placeholder="Group by" />
              <CommandList>
                <CommandEmpty>Nothing to group by.</CommandEmpty>
                <CommandGroup>
                  {fields.map((field) => {
                    const isChecked = grouping.some(
                      (level) => level.field === field.id,
                    );

                    return (
                      <CommandItem
                        key={field.id}
                        className={ITEM_CLASS_NAME}
                        disabled={isFull && !isChecked}
                        keywords={[field.description]}
                        onSelect={() => {
                          onGroupingChange(toggleGroupLevel(grouping, field));
                        }}
                        value={field.label}
                      >
                        <Checkbox
                          aria-hidden="true"
                          checked={isChecked}
                          tabIndex={-1}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span>{field.label}</span>
                          <span className="text-muted-foreground truncate text-xs">
                            {field.description}
                          </span>
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {grouping.map((level) => {
          const label = labelGroupLevel(level, fields);

          return (
            <Button
              key={level.field}
              aria-label={`Stop grouping by ${label}`}
              onClick={() => {
                onGroupingChange(
                  grouping.filter((other) => other.field !== level.field),
                );
              }}
              size="sm"
              variant="outline"
            >
              {label}
              <X aria-hidden="true" />
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
}
