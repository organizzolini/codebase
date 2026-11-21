import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@codebase/presentation";

import { CalendarScaleSelect } from "../calendar-scale-select/calendar-scale-select";

import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view, its scale, and the change handler.
 */
export interface CalendarViewOptionsProperties {
  className?: string;
  onScaleChange: (scale: TimelineScale) => void;
  scale: TimelineScale;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders the View menu's arrangement of the view: Scale, for the timeline alone; nothing else draws.
 */
export function CalendarViewOptions(
  properties: Readonly<CalendarViewOptionsProperties>,
): ReactNode {
  const { className, onScaleChange, scale, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
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
      data-testid="calendar-view-options"
    >
      <DropdownMenuGroup>
        <DropdownMenuLabel>Arrange</DropdownMenuLabel>
      </DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Scale</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="p-1">
          <CalendarScaleSelect
            onScaleChange={onScaleChange}
            scale={scale}
          />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
    </div>
  );
}
