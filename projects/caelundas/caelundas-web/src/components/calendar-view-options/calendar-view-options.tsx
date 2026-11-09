import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@codebase/presentation";

import { CalendarGroupBy } from "../calendar-group-by/calendar-group-by";
import { createEventGroupFields } from "../calendar-group-by/event-group-fields.utilities";
import { CalendarScaleSelect } from "../calendar-scale-select/calendar-scale-select";

import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type { EventFacet } from "../events-calendar/calendar-records.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../events-calendar/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view shown, which decides what can be arranged, and the grouping and
 * scale with where to send a changed one.
 */
export interface CalendarViewOptionsProperties {
  className?: string;
  facets: readonly EventFacet[];
  grouping: readonly EventGroupLevel[];
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  onScaleChange: (scale: TimelineScale) => void;
  scale: TimelineScale;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders the View menu's arrangement of the view: Group by for agenda and timeline, and Scale for the timeline; nothing else draws.
 */
export function CalendarViewOptions(
  properties: Readonly<CalendarViewOptionsProperties>,
): ReactNode {
  const {
    className,
    facets,
    grouping,
    onGroupingChange,
    onScaleChange,
    scale,
    view,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const canGroup = view === "agenda" || view === "timeline";
  const fields = createEventGroupFields(facets);
  const groupLabels = grouping.map(
    (level) =>
      fields.find((field) => field.id === level.field)?.label ?? level.field,
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (!canGroup) {
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
        <DropdownMenuSubTrigger>
          Group by: {groupLabels.length === 0 ? "none" : groupLabels.join(", ")}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <CalendarGroupBy
            facets={facets}
            grouping={grouping}
            onGroupingChange={onGroupingChange}
          />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      {view === "timeline" ? (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Scale</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="p-1">
            <CalendarScaleSelect
              onScaleChange={onScaleChange}
              scale={scale}
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      ) : null}
      <DropdownMenuSeparator />
    </div>
  );
}
