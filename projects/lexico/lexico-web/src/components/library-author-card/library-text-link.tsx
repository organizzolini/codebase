import { Link } from "@tanstack/react-router";

import { LibraryHighlight } from "../library-highlight/library-highlight";

import { JOINED_FIELD } from "./library-author-card.constants";
import {
  attributeLine,
  countsOf,
  editionLine,
} from "./library-author-card.utilities";

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
  const label = editionLine(row);
  const attributes = attributeLine(row);
  const counts = countsOf(text);

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
        <span className="block text-xs text-muted-foreground">
          {label.value === "" ? null : (
            <LibraryHighlight
              className="inline"
              field={JOINED_FIELD}
              matches={label.matches}
              value={label.value}
            />
          )}
          <span>{label.value === "" ? counts : ` · ${counts}`}</span>
        </span>
        {attributes.value === "" ? null : (
          <LibraryHighlight
            className="block text-xs text-muted-foreground"
            field={JOINED_FIELD}
            matches={attributes.matches}
            value={attributes.value}
          />
        )}
      </Link>
    </div>
  );
}
