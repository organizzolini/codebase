import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The load's error and the retry handler.
 */
export interface CalendarErrorProperties {
  className?: string;
  error: unknown;
  onRetry: () => void;
}

// 🧩 Component

/**
 * Renders a failed load, with a retry for when it may pass on a second try.
 */
export function CalendarError(
  properties: Readonly<CalendarErrorProperties>,
): ReactNode {
  const { className, error, onRetry } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-error"
      role="alert"
    >
      <Empty className="h-dvh">
        <EmptyHeader>
          <EmptyTitle>The events could not be loaded</EmptyTitle>
          <EmptyDescription>{String(error)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry}>Retry</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
