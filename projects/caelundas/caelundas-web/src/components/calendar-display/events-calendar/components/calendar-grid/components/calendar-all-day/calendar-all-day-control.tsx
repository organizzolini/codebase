import { Layers } from "lucide-react";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@codebase/presentation";

import { ALL_DAY_LABELS } from "./calendar-all-day.constants";
import { getNextAllDayMode } from "./calendar-all-day.utilities";

import type { AllDayMode } from "./calendar-all-day.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The all-day row's state, and where to ask for the next.
 */
export interface CalendarAllDayControlProperties {
  className?: string;
  mode: AllDayMode;
  onModeChange: (mode: AllDayMode) => void;
}

// 🧩 Component

/**
 * An icon button that steps the all-day row from slim to grouped to every event, with a tooltip.
 */
export function CalendarAllDayControl(
  properties: Readonly<CalendarAllDayControlProperties>,
): ReactNode {
  const { className, mode, onModeChange } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const next = getNextAllDayMode(mode);
  const label = `All day: ${ALL_DAY_LABELS[mode]}. Show ${ALL_DAY_LABELS[next]}.`;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-all-day-control"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-expanded={mode !== "contracted"}
              aria-label={label}
              className="bg-background h-6 max-w-full min-w-0 cursor-pointer gap-1 px-1.5 text-xs whitespace-nowrap"
              onClick={() => {
                onModeChange(next);
              }}
              size="sm"
              variant="outline"
            />
          }
        >
          <Layers
            aria-hidden="true"
            className="size-3 shrink-0"
          />
          All day
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </div>
  );
}
