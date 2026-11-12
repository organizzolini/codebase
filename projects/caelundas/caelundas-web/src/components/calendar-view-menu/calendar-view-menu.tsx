import { Eye } from "lucide-react";

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

import { DEFAULT_CALENDAR_SYMBOLS } from "../../hooks/use-calendar-search/calendar-symbols.constants";

import type { CalendarSymbols } from "../../hooks/use-calendar-search/calendar-symbols.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Clustering and symbol settings, with their change handlers.
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
  onClustersChange: (enabled: boolean) => void;
  onSymbolsChange?: ((symbols: CalendarSymbols) => void) | undefined;
  symbols?: CalendarSymbols | undefined;
}

// 🧩 Component

/**
 * Renders the View menu: how the calendar looks, its view arrangement, symbol drawing, and crowded-day merging; coloring is elsewhere.
 */
export function CalendarViewMenu(
  properties: Readonly<CalendarViewMenuProperties>,
): ReactNode {
  const {
    children,
    className,
    clusters,
    onClustersChange,
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
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 max-w-[95vw]"
            sideOffset={8}
          >
            {children}
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
