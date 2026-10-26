import { ChevronDown, Eye } from "lucide-react";

import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { DEFAULT_CALENDAR_SYMBOLS } from "../lib/calendar/calendar-symbols";

import type { CalendarSymbols } from "../lib/calendar/calendar-symbols";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Whether events are colored by type, whether crowded days merge their
 * events, how symbols are drawn, and where to send a change to either.
 */
export interface CalendarViewMenuProperties {
  /**
   * More of the menu, drawn ahead of its own sections: what the view shown
   * can be arranged by.
   */
  children?: ReactNode;
  className?: string;
  /**
   * Whether the views of hours merge events that run together.
   */
  clusters: boolean;
  /**
   * What the events are colored by, drawn in the Colors section after its
   * switch: the Color by submenu.
   */
  colorOptions?: ReactNode;
  colors: boolean;
  onClustersChange: (enabled: boolean) => void;
  onColorsChange: (enabled: boolean) => void;
  onSymbolsChange?: ((symbols: CalendarSymbols) => void) | undefined;
  symbols?: CalendarSymbols | undefined;
}

// 🧩 Component

/**
 * Renders the View menu: how the calendar looks. It arranges the view shown,
 * where that has anything to arrange, then turns the coloring of events by
 * type on or off, with a legend of the colors in a submenu, and the merging of
 * crowded days.
 */
export function CalendarViewMenu(
  properties: Readonly<CalendarViewMenuProperties>,
): ReactNode {
  const {
    children,
    className,
    clusters,
    colorOptions,
    colors,
    onClustersChange,
    onColorsChange,
    onSymbolsChange = () => {},
    symbols = DEFAULT_CALENDAR_SYMBOLS,
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
      data-testid="calendar-view-menu"
    >
      <ButtonGroup aria-label="View menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label="View options"
                size="sm"
                variant="outline"
              />
            }
          >
            <Eye aria-hidden="true" />
            View
            <ChevronDown
              aria-hidden="true"
              className="opacity-60"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 max-w-[95vw]"
            sideOffset={8}
          >
            {children}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Colors</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={colors}
                onCheckedChange={(checked) => {
                  onColorsChange(checked);
                }}
              >
                Color events
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            {colorOptions}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Symbols</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                onValueChange={(value: unknown) => {
                  onSymbolsChange(value === "emojis" ? "emojis" : "glyphs");
                }}
                value={symbols}
              >
                <DropdownMenuRadioItem value="glyphs">
                  Glyphs
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="emojis">
                  Emojis
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Crowded days</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={clusters}
                onCheckedChange={(checked) => {
                  onClustersChange(checked);
                }}
              >
                Group similar events
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}
