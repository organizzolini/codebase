import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import { EVENT_COLOR_RULES } from "../lib/calendar/calendar-colors";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Whether events are colored by kind, and where to send a change.
 */
export interface CalendarColorsMenuProperties {
  className?: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

// 🧩 Component

/**
 * Renders the Colors button: a menu that turns the coloring of events by kind
 * on or off, and, whichever it is set to, names the color of each kind.
 */
export function CalendarColorsMenu(
  properties: Readonly<CalendarColorsMenuProperties>,
): ReactNode {
  const { className, enabled, onEnabledChange } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-colors-menu"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Colors: ${enabled ? "on" : "off"}`}
              size="sm"
              variant="outline"
            />
          }
        >
          <span
            aria-hidden="true"
            className="flex gap-0.5"
          >
            {EVENT_COLOR_RULES.slice(0, 4).map((rule) => (
              <span
                key={rule.path}
                className="size-2 rounded-full"
                style={{
                  background: enabled ? rule.color : "var(--muted-foreground)",
                }}
              />
            ))}
          </span>
          Colors
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 max-w-[95vw]"
        >
          <DropdownMenuCheckboxItem
            checked={enabled}
            onCheckedChange={(checked) => {
              onEnabledChange(checked);
            }}
          >
            Color events by type
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Types</DropdownMenuLabel>
            <ul className="grid gap-1 px-2 pb-2">
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
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
