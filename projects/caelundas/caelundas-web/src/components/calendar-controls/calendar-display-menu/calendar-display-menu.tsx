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
import { QueryCascader } from "../../calendar-query/query-cascader/query-cascader";

import {
  CHIP_CLASS_NAME,
  DISPLAY_MENU_TITLE,
  SYMBOL_CHOICES,
  SYMBOLS_BRANCH,
  TREE_CLASS_NAME,
} from "./calendar-display-menu.constants";
import {
  applyDisplayLeaf,
  createDisplayItems,
  findToggledLeaf,
  isDisplayChoice,
  toDisplayValue,
} from "./calendar-display-menu.utilities";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Props: zone, and the view shown. */
export interface CalendarDisplayMenuProperties {
  className?: string;
  timeZone: string;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Display button, opening a searchable Cascader of how the calendar looks, joined to a chip naming the symbols drawn. */
export function CalendarDisplayMenu(
  properties: Readonly<CalendarDisplayMenuProperties>,
): ReactNode {
  const { className, timeZone, view } = properties;

  // 🪝 Hooks
  const { change, constellations, handlers, sky, state } =
    useCalendarDisplay(timeZone);
  const [isOpen, setIsOpen] = useState(false);
  const [opened, setOpened] = useState<string[]>([SYMBOLS_BRANCH]);

  // 🏗 Setup
  const choices = { ...state, listing: constellations, sky, view };
  const items = createDisplayItems(choices);
  const value = toDisplayValue(choices);
  const SymbolsIcon = SYMBOL_CHOICES[state.symbols].icon;

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

  const handleOpenChange = (open: boolean): void => {
    if (open) {
      setOpened([SYMBOLS_BRANCH]);
    }

    setIsOpen(open);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-display-menu"
    >
      <ButtonGroup aria-label={DISPLAY_MENU_TITLE}>
        <Popover
          onOpenChange={handleOpenChange}
          open={isOpen}
        >
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              >
                <SlidersHorizontal aria-hidden="true" />
                {DISPLAY_MENU_TITLE}
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
              className={TREE_CLASS_NAME}
              expanded={opened}
              items={items}
              mode="tree"
              onExpandedChange={setOpened}
              onValueChange={handleValueChange}
              placeholder="Search display options"
              selectable={isDisplayChoice}
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
          <SymbolsIcon aria-hidden="true" />
          {SYMBOL_CHOICES[state.symbols].label}
        </Button>
      </ButtonGroup>
    </div>
  );
}
