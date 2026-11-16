import { Link } from "@tanstack/react-router";

import { LibraryHighlight } from "../library-highlight/library-highlight";

import { editionLabel } from "./library-author-card.utilities";

import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryTextLink component.
 */
export interface LibraryTextLinkProperties {
  className?: string;
  row: LibraryTextRow;
}

// 🧩 Component

/**
 * A Text in an Author card, linked into the Reader, labelled with its
 * collection and edition and sized by its line and word counts.
 */
export function LibraryTextLink(
  properties: Readonly<LibraryTextLinkProperties>,
): ReactNode {
  const { className, row } = properties;
  const { matches, text } = row;

  // 🪝 Hooks

  // 🏗 Setup
  const label = editionLabel(row);
  const counts = [
    text.lineCount === null ? null : `${String(text.lineCount)} lines`,
    text.wordCount === null ? null : `${String(text.wordCount)} words`,
  ].filter((part): part is string => part !== null);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-text-link"
    >
      <Link
        className="block rounded-md underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        params={{ slug: text.slug }}
        to="/texts/$slug"
      >
        <LibraryHighlight
          className="block"
          field="title"
          matches={matches}
          value={text.title}
        />
        {label === "" ? null : (
          <span className="block text-xs text-muted-foreground">{label}</span>
        )}
        {counts.length === 0 ? null : (
          <span className="block text-xs text-muted-foreground">
            {counts.join(" · ")}
          </span>
        )}
      </Link>
    </div>
  );
}
