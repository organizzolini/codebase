import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import type { EventsDataset } from "../types/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The dates the data covers, the nearest of them, and where a jump goes.
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
      <Empty className="bg-background/90 pointer-events-auto max-w-md border shadow-sm">
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
