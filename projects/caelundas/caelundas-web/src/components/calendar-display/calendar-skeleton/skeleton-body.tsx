import { COLUMN_COUNTS } from "./calendar-skeleton.constants";
import { SkeletonColumns } from "./components/skeleton-columns/skeleton-columns";
import { SkeletonMonth } from "./components/skeleton-month/skeleton-month";
import { SkeletonTable } from "./components/skeleton-table/skeleton-table";
import { SkeletonTimeline } from "./components/skeleton-timeline/skeleton-timeline";
import { SkeletonBars } from "./skeleton-bars";
import { SkeletonCards } from "./skeleton-cards";

import type { CalendarViewName } from "../events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view whose body the skeleton stands in for.
 */
export interface SkeletonBodyProperties {
  className?: string;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Draws the body of the skeleton for one view.
 */
export function SkeletonBody(
  properties: Readonly<SkeletonBodyProperties>,
): ReactNode {
  const { className, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  let content: ReactNode;

  switch (view) {
    case "charts": {
      content = (
        <div className="min-h-0 flex-1 overflow-hidden">
          <SkeletonBars />
        </div>
      );

      break;
    }
    case "month": {
      content = <SkeletonMonth />;

      break;
    }
    case "table": {
      content = <SkeletonTable />;

      break;
    }
    case "timeline": {
      content = <SkeletonTimeline />;

      break;
    }
    case "totals": {
      content = (
        <div className="min-h-0 flex-1 overflow-hidden">
          <SkeletonCards />
        </div>
      );

      break;
    }
    case "day":
    case "week": {
      content = <SkeletonColumns count={COLUMN_COUNTS[view]} />;
    }
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="skeleton-body"
      style={{ display: "contents" }}
    >
      {content}
    </div>
  );
}
