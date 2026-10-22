import { Button, ButtonGroup } from "@codebase/presentation";

import {
  TIMELINE_SCALE_LABELS,
  TIMELINE_SCALES,
  type TimelineScale,
} from "../lib/calendar/calendar-views";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The scale the timeline shows and where to send another.
 */
export interface CalendarScaleSelectProperties {
  className?: string;
  onScaleChange: (scale: TimelineScale) => void;
  scale: TimelineScale;
}

// 🧩 Component

/**
 * Renders one button for each of the timeline's scales, from a day of
 * minutes to a year of months, the one shown pressed. The View menu holds it
 * in its Scale submenu.
 */
export function CalendarScaleSelect(
  properties: Readonly<CalendarScaleSelectProperties>,
): ReactNode {
  const { className, onScaleChange, scale } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-scale-select"
    >
      <ButtonGroup aria-label="Scale">
        {TIMELINE_SCALES.map((option) => (
          <Button
            key={option}
            aria-pressed={option === scale}
            className={
              option === scale ? "bg-accent text-accent-foreground" : undefined
            }
            onClick={() => {
              // The scale already shown is not a change.
              if (option !== scale) {
                onScaleChange(option);
              }
            }}
            size="sm"
            variant="outline"
          >
            {TIMELINE_SCALE_LABELS[option]}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
