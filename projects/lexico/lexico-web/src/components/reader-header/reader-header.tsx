import { Link } from "@tanstack/react-router";

import type { ReaderLink } from "../reader-lines/reader-lines.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderHeader accepts.
 */
export interface ReaderHeaderProperties {
  author: string;
  className?: string;
  parent: null | ReaderLink;
}

// 🧩 Component

/**
 * The byline of a text: its author and the book it belongs to.
 */
export function ReaderHeader(
  properties: Readonly<ReaderHeaderProperties>,
): ReactNode {
  const { author, className, parent } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-header"
    >
      <p className="text-sm text-muted-foreground">
        <Link
          className="underline"
          search={{ search: author }}
          to="/library"
        >
          {author}
        </Link>
        {parent === null ? null : (
          <>
            {" · "}
            <Link
              className="underline"
              params={{ slug: parent.slug }}
              to="/texts/$slug"
            >
              {parent.title}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
