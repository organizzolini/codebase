import { Skeleton } from "@codebase/presentation";

import { listKeys } from "../../calendar-skeleton.utilities";

import { TOOLBAR_CHIPS, TOOLBAR_HEIGHTS } from "./skeleton-toolbar.constants";

import type { CalendarViewName } from "../../../events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view whose toolbar the stand-in has the height of.
 */
export interface SkeletonToolbarProperties {
  className?: string;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Draws the toolbar's chips, wrapped into the rows it holds: six on a phone, three or four on a tablet or wider by view.
 */
export function SkeletonToolbar(
  properties: Readonly<SkeletonToolbarProperties>,
): ReactNode {
  const { className, view } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const keys = listKeys("chip", TOOLBAR_CHIPS.length);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`flex h-56 shrink-0 flex-wrap content-start gap-2 overflow-hidden p-2 ${TOOLBAR_HEIGHTS[view]} ${className ?? ""}`}
      data-testid="skeleton-toolbar"
    >
      {TOOLBAR_CHIPS.map((width, index) => (
        <Skeleton
          key={keys[index]}
          className={`h-7 shrink-0 ${width}`}
        />
      ))}
    </div>
  );
}
