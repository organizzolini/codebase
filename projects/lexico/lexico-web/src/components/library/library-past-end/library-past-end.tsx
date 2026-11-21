import { Button } from "@codebase/presentation";

import { pastEndMessage } from "../library-pagination/library-pagination.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryPastEnd component.
 */
export interface LibraryPastEndProperties {
  className?: string;
  onLastPage: () => void;
  page: number;
  pageCount: number;
}

// 🧩 Component

/**
 * What the library shows when the page asked for lies beyond the last: how
 * many pages exist, and a button to the last one.
 */
export function LibraryPastEnd(
  properties: Readonly<LibraryPastEndProperties>,
): ReactNode {
  const { className, onLastPage, page, pageCount } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-past-end"
    >
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          {pastEndMessage(page, pageCount)}
        </p>
        <Button
          onClick={() => {
            onLastPage();
          }}
          variant="outline"
        >
          {`Go to page ${String(pageCount)}`}
        </Button>
      </div>
    </div>
  );
}
