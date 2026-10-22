import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import {
  parseTimelineScale,
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
  /**
   * Shortens the button for a phone's toolbar row.
   */
  compact?: boolean | undefined;
  onScaleChange: (scale: TimelineScale) => void;
  scale: TimelineScale;
}

// 🧩 Component

/**
 * Renders a menu button naming the timeline's scale that lists every scale,
 * from a day of minutes to a year of months.
 */
export function CalendarScaleSelect(
  properties: Readonly<CalendarScaleSelectProperties>,
): ReactNode {
  const { className, compact = false, onScaleChange, scale } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleValueChange = (value: unknown): void => {
    const next = parseTimelineScale(value);

    if (next !== undefined && next !== scale) {
      onScaleChange(next);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-scale-select"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={`Scale: ${TIMELINE_SCALE_LABELS[scale]}`}
              size="sm"
              variant="outline"
            />
          }
        >
          {compact
            ? TIMELINE_SCALE_LABELS[scale]
            : `Scale: ${TIMELINE_SCALE_LABELS[scale]}`}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            onValueChange={handleValueChange}
            value={scale}
          >
            {TIMELINE_SCALES.map((option) => (
              <DropdownMenuRadioItem
                key={option}
                value={option}
              >
                {TIMELINE_SCALE_LABELS[option]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
