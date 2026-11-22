import { Masonry } from "../../layout/masonry/masonry";
import { LibraryAuthorCard } from "../library-author-card/library-author-card";

import { sectionsOf } from "./library-grid.utilities";
import { LibraryGroupHeading } from "./library-group-heading";

import type { LibraryGroupField } from "../../../graphql/generated/operations";
import type { LibraryAuthorRow, LibraryRequest } from "./library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryGrid component.
 */
export interface LibraryGridProperties {
  authors: LibraryAuthorRow[];
  className?: string;
  /** The groups the authors are under, outermost first. */
  groups?: readonly LibraryGroupField[] | undefined;
  query: LibraryRequest;
}

// 🧩 Component

/**
 * The library's Author cards in a grid, expanded when a search is on. Under a group each run of authors sharing a value follows a heading, and one carries on from the page before under a heading at the top.
 */
export function LibraryGrid(
  properties: Readonly<LibraryGridProperties>,
): ReactNode {
  const { authors, className, groups = [], query } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const sections = sectionsOf(authors, groups);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-grid"
    >
      {sections.map((section) => (
        <section
          key={`${section.heading ?? ""}:${section.rows[0]?.author.id}:${query.search}`}
          className="mb-4"
        >
          {section.heading === null ? null : (
            <LibraryGroupHeading
              className="mb-4"
              heading={section.heading}
            />
          )}
          <Masonry>
            {section.rows.map((row) => (
              <LibraryAuthorCard
                key={`${row.author.id}:${query.search}`}
                query={query}
                row={row}
              />
            ))}
          </Masonry>
        </section>
      ))}
    </div>
  );
}
