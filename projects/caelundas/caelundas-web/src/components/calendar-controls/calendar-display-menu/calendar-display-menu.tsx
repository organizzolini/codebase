import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useCalendarDisplay } from "../../../hooks/use-calendar-display/use-calendar-display";
import { CALENDAR_VIEW_LABELS } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { createEventGroupFields } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { QueryCascader } from "../../calendar-query/query-cascader/query-cascader";

import {
  CALENDAR_BRANCH,
  CHIP_CLASS_NAME,
  SCALE_BRANCH,
  TITLE,
} from "./calendar-display-menu.constants";
import {
  applyDisplayLeaf,
  createDisplayItems,
  findToggledLeaf,
  toDisplayValue,
} from "./calendar-display-menu.utilities";
import { DisplayRadios } from "./components/display-radios/display-radios";
import {
  SCALE_OPTIONS,
  VIEW_OPTIONS,
} from "./components/display-radios/display-radios.constants";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Props: color facets, zone, and the view shown. */
export interface CalendarDisplayMenuProperties {
  className?: string;
  colorBy: EventGroupLevel | undefined;
  facets: readonly EventFacet[];
  timeZone: string;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Display button, opening a searchable Cascader of how the calendar looks; the chip beside it names the view. */
export function CalendarDisplayMenu(
  properties: Readonly<CalendarDisplayMenuProperties>,
): ReactNode {
  const { className, colorBy, facets, timeZone, view } = properties;

  // 🪝 Hooks
  const { change, constellations, handlers, sky, state } =
    useCalendarDisplay(timeZone);
  const [isOpen, setIsOpen] = useState(false);
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);

  // 🏗 Setup
  const choices = { ...state, colorBy, listing: constellations, sky, view };
  const items = createDisplayItems(fields, choices);
  const value = toDisplayValue(choices);

  // 💪 Handlers
  const applyLeaf = (leaf: string): void => {
    applyDisplayLeaf(leaf, {
      choices,
      fields,
      handlers,
      onSkyChange: change,
    });
  };
  const handleValueChange = (next: string[]): void => {
    const leaf = findToggledLeaf(value, next);

    if (leaf !== undefined) {
      applyLeaf(leaf);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-display-menu"
    >
      <ButtonGroup aria-label={TITLE}>
        <Popover
          onOpenChange={setIsOpen}
          open={isOpen}
        >
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              >
                <SlidersHorizontal aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Display options"
            className="w-72 max-w-[95vw] p-0"
          >
            <QueryCascader
              cascade={false}
              items={items}
              mode="drill"
              onValueChange={handleValueChange}
              panels={{
                [CALENDAR_BRANCH]: (
                  <DisplayRadios
                    label="Calendar"
                    onValueChange={(next) => {
                      applyLeaf(`calendar:${next}`);
                    }}
                    options={VIEW_OPTIONS}
                    value={view}
                  />
                ),
                [SCALE_BRANCH]: (
                  <DisplayRadios
                    label="Scale"
                    onValueChange={(next) => {
                      applyLeaf(`scale:${next}`);
                    }}
                    options={SCALE_OPTIONS}
                    value={state.scale}
                  />
                ),
              }}
              placeholder="Search display options"
              value={value}
              multiple
            />
          </PopoverContent>
        </Popover>
        <Button
          className={CHIP_CLASS_NAME}
          onClick={() => {
            setIsOpen(true);
          }}
          size="sm"
          variant="outline"
        >
          {CALENDAR_VIEW_LABELS[view]}
        </Button>
      </ButtonGroup>
    </div>
  );
}
