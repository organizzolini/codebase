import { useId } from "react";

import { Button } from "@codebase/presentation";

import { SkeletonBars } from "../../../calendar-skeleton/skeleton-bars";
import { SkeletonCards } from "../../../calendar-skeleton/skeleton-cards";

import type { MetricViewName } from "../../../events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Why the layout is not drawn, and what to do about it.
 */
export interface MetricsPendingProperties {
  className?: string | undefined;
  error: Error | undefined;
  isLoading: boolean;
  onRetry: () => void;
  view: MetricViewName;
}

// 🧩 Component

/**
 * Renders the skeleton of the layout the view names while the catalog loads, or why it could not be read, with a retry.
 */
export function MetricsPending(
  properties: Readonly<MetricsPendingProperties>,
): ReactNode {
  const { className, error, isLoading, onRetry, view } = properties;

  // 🪝 Hooks
  const labelId = useId();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (isLoading) {
    // Named by the skeleton's own announcement, which it does not repeat.
    return (
      <div
        aria-busy="true"
        aria-labelledby={labelId}
        className={className}
        data-testid="calendar-metrics"
        role="region"
      >
        {view === "charts" ? (
          <SkeletonBars labelId={labelId} />
        ) : (
          <SkeletonCards labelId={labelId} />
        )}
      </div>
    );
  }

  // 🎨 Markup
  return (
    <div
      aria-busy="false"
      className={className}
      data-testid="calendar-metrics"
    >
      <div
        className="flex flex-col items-start gap-2 p-4"
        role="alert"
      >
        <p>{error?.message}</p>
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
