import { FieldSet, Label, Switch } from "@codebase/presentation";

import { CalendarColorBy } from "../calendar-color-by/calendar-color-by";
import { keepKeysInPanel } from "../night-sky-menu/night-sky-menu.utilities";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventGroupLevel } from "../../calendar-query/calendar-group-by/components/event-group-model/event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Whether events are colored, the color level, and the change handlers.
 */
export interface CalendarColorMenuProperties {
  className?: string;
  colorBy: EventGroupLevel | undefined;
  colors: boolean;
  facets: readonly EventFacet[];
  onColorByChange: (level: EventGroupLevel | undefined) => void;
  onColorsChange: (enabled: boolean) => void;
}

// 🧩 Component

/**
 * Renders the Color settings: a switch that colors the events, then what they are colored by, with its legend.
 */
export function CalendarColorMenu(
  properties: Readonly<CalendarColorMenuProperties>,
): ReactNode {
  const {
    className,
    colorBy,
    colors,
    facets,
    onColorByChange,
    onColorsChange,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-color-menu"
    >
      <FieldSet
        aria-label="Color settings"
        className="flex flex-col gap-2 p-2"
        onKeyDown={keepKeysInPanel}
      >
        <Label className="justify-between text-xs">
          Color events
          <Switch
            checked={colors}
            onCheckedChange={(checked: boolean) => {
              onColorsChange(checked);
            }}
          />
        </Label>
        <CalendarColorBy
          colorBy={colorBy}
          facets={facets}
          onColorByChange={onColorByChange}
        />
      </FieldSet>
    </div>
  );
}
