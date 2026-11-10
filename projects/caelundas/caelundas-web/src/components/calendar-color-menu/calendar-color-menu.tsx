import { Palette } from "lucide-react";

import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FieldSet,
  Label,
  Switch,
} from "@codebase/presentation";

import { CalendarColorBy } from "../calendar-color-by/calendar-color-by";
import { keepKeysInPanel } from "../night-sky-menu/night-sky-menu.utilities";

import { PANEL_CLASS_NAME } from "./calendar-color-menu.constants";

import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type { EventFacet } from "../events-calendar/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Whether events are colored, what by, the tag roots the data has, and where
 * to send a change to either.
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
 * Renders the toolbar's Color menu: a switch that colors the events, then what they are colored by, with its legend.
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
      <ButtonGroup aria-label="Color menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label="Color options"
                size="sm"
                variant="outline"
              />
            }
          >
            <Palette aria-hidden="true" />
            Color
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={PANEL_CLASS_NAME}
            sideOffset={8}
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
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}
