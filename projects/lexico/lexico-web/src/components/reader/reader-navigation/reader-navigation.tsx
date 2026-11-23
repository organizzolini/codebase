import { Link } from "@tanstack/react-router";

import type { ReaderLink } from "../reader-lines/reader-lines.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderNavigation accepts.
 */
export interface ReaderNavigationProperties {
  className?: string;
  next: null | ReaderLink;
  previous: null | ReaderLink;
}

// 🧩 Component

/**
 * Links to the sibling texts on either side, shown only where they exist.
 */
export function ReaderNavigation(
  properties: Readonly<ReaderNavigationProperties>,
): ReactNode {
  const { className, next, previous } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-navigation"
    >
      <div
        aria-label="Sibling texts"
        className="flex justify-between gap-4"
        role="navigation"
      >
        {previous === null ? (
          <span />
        ) : (
          <Link
            params={{ slug: previous.slug }}
            to="/texts/$slug"
          >
            {`← Previous: ${previous.title}`}
          </Link>
        )}
        {next === null ? null : (
          <Link
            params={{ slug: next.slug }}
            to="/texts/$slug"
          >
            {`Next: ${next.title} →`}
          </Link>
        )}
      </div>
    </div>
  );
}
