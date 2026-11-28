import {
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import { SkeletonBars } from "../../../calendar-skeleton/skeleton-bars";

import type { ChartsNoticeKind } from "../../calendar-charts.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Why there is no chart, its error, and the retry handler.
 */
export interface ChartsNoticeProperties {
  error: Error | undefined;
  kind: ChartsNoticeKind;
  onRetry: () => void;
}

// 🧩 Component

/**
 * Renders the bars while the metrics load, a failed read with a retry, or that there is no group to chart.
 */
export function ChartsNotice(
  properties: Readonly<ChartsNoticeProperties>,
): ReactNode {
  const { error, kind, onRetry } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (kind === "loading") {
    return <SkeletonBars />;
  }

  if (kind === "error") {
    return (
      <div
        className="flex flex-col items-start gap-2 p-4"
        role="alert"
      >
        <p>{error?.message ?? "The metrics could not be read"}</p>
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  // 🎨 Markup
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Nothing to chart</EmptyTitle>
        <EmptyDescription>
          Group the events by a tag to chart each group.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
