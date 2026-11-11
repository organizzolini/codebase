import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import { SURFACE_CLASS_NAMES } from "../events-calendar/calendar-surfaces.constants";

import type { EventsDataset } from "../events-calendar/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's dates, the nearest of them, and the jump target.
 */
export interface OutsideDatasetProperties {
  className?: string;
  dataset: EventsDataset;
  jumpTo: Date;
  onJump: (date: Date) => void;
}

// 🧩 Component

/**
 * Names the dates the data covers and offers to jump to the nearest of them.
 */
export function OutsideDataset(
  properties: Readonly<OutsideDatasetProperties>,
): ReactNode {
  const { className, dataset, jumpTo, onJump } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const format = (date: Date): string =>
    date.toLocaleDateString("en-US", {
      dateStyle: "medium",
      timeZone: dataset.timezone,
    });

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="outside-dataset"
      style={{ display: "contents" }}
    >
      <Empty
        className={`${SURFACE_CLASS_NAMES.emptyCard} pointer-events-auto max-w-md border shadow-sm`}
      >
        <EmptyHeader>
          <EmptyTitle>Outside the data</EmptyTitle>
          <EmptyDescription>
            {`Events run from ${format(dataset.start)} to ${format(dataset.end)}.`}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onClick={() => {
              onJump(jumpTo);
            }}
          >
            {`Go to ${format(jumpTo)}`}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
