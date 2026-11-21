import { Fragment } from "react";

import { LibraryAuthorCard } from "../library-author-card/library-author-card";
import { groupHeading } from "../library-group/library-group.utilities";

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

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-grid"
    >
      <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {authors.map((row, index) => {
          const heading = groupHeading(row, groups);
          const previous = authors[index - 1];
          const showHeading =
            heading !== null &&
            (previous === undefined ||
              groupHeading(previous, groups) !== heading);

          return (
            <Fragment key={`${row.author.id}:${query.search}`}>
              {showHeading ? (
                <LibraryGroupHeading
                  className="col-span-full"
                  heading={heading}
                />
              ) : null}
              <LibraryAuthorCard
                query={query}
                row={row}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
