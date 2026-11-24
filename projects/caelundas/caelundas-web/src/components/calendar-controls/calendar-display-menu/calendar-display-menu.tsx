import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useCalendarDisplay } from "../../../hooks/use-calendar-display/use-calendar-display";
import { CALENDAR_VIEW_LABELS } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { QueryCascader } from "../../calendar-query/query-cascader/query-cascader";

import {
  CHIP_CLASS_NAME,
  LAYOUT_BRANCH,
  TITLE,
} from "./calendar-display-menu.constants";
import {
  applyDisplayLeaf,
  createDisplayItems,
  findToggledLeaf,
  toDisplayValue,
} from "./calendar-display-menu.utilities";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Props: zone and the view shown. */
export interface CalendarDisplayMenuProperties {
  className?: string;
  timeZone: string;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Display button, opening a searchable Cascader of how the calendar looks; the chip beside it names the view. */
export function CalendarDisplayMenu(
  properties: Readonly<CalendarDisplayMenuProperties>,
): ReactNode {
  const { className, timeZone, view } = properties;

  // 🪝 Hooks
  const { change, constellations, handlers, sky, state } =
    useCalendarDisplay(timeZone);
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup
  const choices = { ...state, listing: constellations, sky, view };
  const items = createDisplayItems(choices);
  const value = toDisplayValue(choices);

  // 💪 Handlers
  const applyLeaf = (leaf: string): void => {
    applyDisplayLeaf(leaf, {
      choices,
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
              defaultExpanded={[LAYOUT_BRANCH]}
              items={items}
              mode="tree"
              onValueChange={handleValueChange}
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
