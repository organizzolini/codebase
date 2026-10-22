import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import { UnsupportedBrowserError } from "../lib/events-database/events-database.errors";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The error a load failed with, and what to do when the reader asks to try
 * again.
 */
export interface CalendarErrorProperties {
  className?: string;
  error: unknown;
  onRetry: () => void;
}

// 🧩 Component

/**
 * Renders a failed load: a retry for anything that may pass on a second try,
 * and a plain explanation for a browser that can never run the database.
 */
export function CalendarError(
  properties: Readonly<CalendarErrorProperties>,
): ReactNode {
  const { className, error, onRetry } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const unsupported = error instanceof UnsupportedBrowserError;

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
          <EmptyTitle>
            {unsupported
              ? "This browser cannot run the calendar"
              : "The events could not be loaded"}
          </EmptyTitle>
          <EmptyDescription>
            {unsupported
              ? "The calendar reads its events with WebAssembly in a Web Worker. Open it in a current version of Chrome, Edge, Firefox, or Safari."
              : String(error)}
          </EmptyDescription>
        </EmptyHeader>
        {unsupported ? null : (
          <EmptyContent>
            <Button onClick={onRetry}>Retry</Button>
          </EmptyContent>
        )}
      </Empty>
    </div>
  );
}
