import { Fragment } from "react";

import { highlightSegments } from "./library-highlight.utilities";

import type { LibraryMatchRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryHighlight component.
 */
export interface LibraryHighlightProperties {
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
  const { className, field, matches, value } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const segments = highlightSegments(value, field, matches);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-highlight"
    >
      {segments.map((segment, index) =>
        segment.bold ? (
          <strong key={`${String(index)}:bold`}>{segment.text}</strong>
        ) : (
          <Fragment key={`${String(index)}:plain`}>{segment.text}</Fragment>
        ),
      )}
    </div>
  );
}
