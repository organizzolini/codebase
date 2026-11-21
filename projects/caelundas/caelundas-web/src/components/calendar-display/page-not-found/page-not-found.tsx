import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The class name the page's wrapper takes.
 */
export interface PageNotFoundProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders the page for an address no route matches, with a way back to the
 * calendar.
 */
export function PageNotFound(
  properties: Readonly<PageNotFoundProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="page-not-found"
    >
      <Empty className="h-dvh">
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>Nothing lives at this address.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <a
            className="underline"
            href="/"
          >
            Back to the calendar
          </a>
        </EmptyContent>
      </Empty>
    </div>
  );
}
