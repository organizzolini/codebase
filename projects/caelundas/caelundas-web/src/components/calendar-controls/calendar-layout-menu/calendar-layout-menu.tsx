import { LayoutDashboard } from "lucide-react";
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
  TREE_CLASS_NAME,
} from "../calendar-display-menu/calendar-display-menu.constants";
import { findToggledLeaf } from "../calendar-display-menu/calendar-display-menu.utilities";

import { TITLE, VIEW_ICONS } from "./calendar-layout-menu.constants";
import {
  applyLayoutLeaf,
  createLayoutItems,
  isLayoutChoice,
  toForcedBranches,
  toLayoutValue,
  toOpenBranches,
} from "./calendar-layout-menu.utilities";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Props: zone and the view shown. */
export interface CalendarLayoutMenuProperties {
  className?: string;
  timeZone: string;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Layout button, opening a searchable Cascader of the layouts, joined to a chip naming the one shown. */
export function CalendarLayoutMenu(
  properties: Readonly<CalendarLayoutMenuProperties>,
): ReactNode {
  const { className, timeZone, view } = properties;
  const ViewIcon = VIEW_ICONS[view];

  // 🪝 Hooks
  const { handlers, state } = useCalendarDisplay(timeZone);
  const [isOpen, setIsOpen] = useState(false);
  const [opened, setOpened] = useState<string[]>([]);

  // 🏗 Setup
  const value = toLayoutValue(view, state.scale);

  // 💪 Handlers
  const handleValueChange = (next: string[]): void => {
    const leaf = findToggledLeaf(value, next);

    if (leaf !== undefined) {
      applyLayoutLeaf(leaf, { handlers, view });
    }
  };
  const handleExpandedChange = (next: string[]): void => {
    const forced = toForcedBranches(view);

    setOpened(next.filter((branch) => !forced.includes(branch)));
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-layout-menu"
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
                <LayoutDashboard aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Layout options"
            className="w-72 max-w-[95vw] p-0"
          >
            <QueryCascader
              cascade={false}
              className={TREE_CLASS_NAME}
              expanded={toOpenBranches(opened, view)}
              items={createLayoutItems()}
              mode="tree"
              onExpandedChange={handleExpandedChange}
              onValueChange={handleValueChange}
              placeholder="Search layouts"
              selectable={isLayoutChoice}
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
          <ViewIcon aria-hidden="true" />
          {CALENDAR_VIEW_LABELS[view]}
        </Button>
      </ButtonGroup>
    </div>
  );
}
