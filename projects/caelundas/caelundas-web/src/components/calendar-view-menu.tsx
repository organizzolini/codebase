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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { EVENT_COLOR_RULES } from "../lib/calendar/calendar-colors";
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
                Color events by type
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Color legend</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                <ColorLegend />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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

/**
 * Names the color of each type of event.
 */
function ColorLegend(): ReactNode {
  return (
    <ul className="grid gap-1 p-2">
      {EVENT_COLOR_RULES.map((rule) => (
        <li
          key={rule.path}
          className="flex items-center gap-2 text-xs"
        >
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: rule.color }}
          />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
