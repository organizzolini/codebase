import { Fragment } from "react";

import { highlightSegments } from "./library-highlight.utilities";

import type { LibraryMatchRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryHighlight component.
 */
export interface LibraryHighlightProperties {
  /** The element to render: a span by default, a div only where block content is valid. */
  as?: "div" | "span";
  className?: string;
  field: string;
  matches: readonly LibraryMatchRow[];
  value: string;
}

// 🧩 Component

/**
 * A field's value with the parts the API matched in bold.
 */
export function LibraryHighlight(
  properties: Readonly<LibraryHighlightProperties>,
): ReactNode {
  const { as = "span", className, field, matches, value } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const segments = highlightSegments(value, field, matches);

  const content = segments.map((segment, index) =>
    segment.bold ? (
      <strong key={`${String(index)}:bold`}>{segment.text}</strong>
    ) : (
      <Fragment key={`${String(index)}:plain`}>{segment.text}</Fragment>
    ),
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (as === "span") {
    return (
      <span
        className={className}
        data-testid="library-highlight"
      >
        {content}
      </span>
    );
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-highlight"
    >
      {content}
    </div>
  );
}
