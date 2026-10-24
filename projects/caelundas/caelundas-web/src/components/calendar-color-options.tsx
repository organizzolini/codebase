import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@codebase/presentation";

import { createEventGroupFields } from "../lib/event-groups/event-group-fields";

import { CalendarColorBy } from "./calendar-color-by";

import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";
import type { EventFacet } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the events are colored by, the tag roots the data has, and where to
 * send another.
 */
export interface CalendarColorOptionsProperties {
  className?: string;
  colorBy: EventGroupLevel | undefined;
  facets: readonly EventFacet[];
  onColorByChange: (level: EventGroupLevel | undefined) => void;
}

// 🧩 Component

/**
 * Renders the View menu's Color by submenu, which says what the events are
 * colored by and opens the picker for it. It belongs inside a dropdown menu.
 */
export function CalendarColorOptions(
  properties: Readonly<CalendarColorOptionsProperties>,
): ReactNode {
  const { className, colorBy, facets, onColorByChange } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const fields = createEventGroupFields(facets);
  const label =
    fields.find((field) => field.id === colorBy?.field)?.label ?? "Type";

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-color-options"
    >
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Color by: {label}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <CalendarColorBy
            colorBy={colorBy}
            facets={facets}
            onColorByChange={onColorByChange}
          />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </div>
  );
}
