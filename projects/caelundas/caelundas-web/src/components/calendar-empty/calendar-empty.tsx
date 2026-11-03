import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import { SURFACE_CLASS_NAMES } from "../events-calendar/calendar-surfaces.constants";

import { EMPTY_DESCRIPTIONS, EMPTY_TITLES } from "./calendar-empty.constants";
import { OutsideDataset } from "./outside-dataset";

import type { CalendarEmptiness } from "../events-calendar/calendar-loader.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Why the calendar shows no events, and where to send it to find some.
 */
export interface CalendarEmptyProperties {
  className?: string;
  emptiness: CalendarEmptiness;
  /**
   * Called to drop every filter; offered only when they are what emptied the
   * period.
   */
  onClearFilters?: (() => void) | undefined;
  /**
   * Called with the first day the data covers.
   */
  onJump: (date: Date) => void;
  /**
   * The days the view shows, as a phrase such as "this week"; "this month"
   * when absent.
   */
  period?: string | undefined;
}

// 🧩 Component

/**
 * Renders why the calendar shows no events: an empty database, a month
 * outside the dates the data covers, which offers to jump to them, filters
 * that leave nothing, which offer to clear them, or a month inside the dates
 * that holds nothing. It is announced as a status, never as an alert.
 */
export function CalendarEmpty(
  properties: Readonly<CalendarEmptyProperties>,
): ReactNode {
  const {
    className,
    emptiness,
    onClearFilters,
    onJump,
    period = "this month",
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (emptiness.kind === "range") {
    return (
      <div
        className={className}
        data-testid="calendar-empty"
        role="status"
      >
        <OutsideDataset
          dataset={emptiness.dataset}
          jumpTo={emptiness.jumpTo}
          onJump={onJump}
        />
      </div>
    );
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-empty"
      role="status"
    >
      <Empty
        className={`${SURFACE_CLASS_NAMES.emptyCard} pointer-events-auto max-w-md border shadow-sm`}
      >
        <EmptyHeader>
          <EmptyTitle>{EMPTY_TITLES[emptiness.kind](period)}</EmptyTitle>
          <EmptyDescription>
            {EMPTY_DESCRIPTIONS[emptiness.kind](period)}
          </EmptyDescription>
        </EmptyHeader>
        {emptiness.kind === "filter" && onClearFilters !== undefined ? (
          <EmptyContent>
            <Button
              onClick={() => {
                onClearFilters();
              }}
              variant="outline"
            >
              Clear filters
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    </div>
  );
}
