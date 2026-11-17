import { LibraryNumberGrid } from "./library-number-grid";
import { LibraryNumberRange } from "./library-number-range";
import { LibraryTextNode } from "./library-text-node";
import { splitLevel } from "./library-text-tree.utilities";

import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryTextTree component.
 */
export interface LibraryTextTreeProperties {
  className?: string;
  /** How far below the author's works this level sits; works are level 0. */
  depth: number;
  /** Whether the search matched the author, so every work is shown for it. */
  isAuthorMatched?: boolean;
  rows: readonly LibraryTextRow[];
  search: string;
}

// 🧩 Component

/**
 * One level of an author's Texts: each as a row or an expandable group, with
 * numbered leaves gathered into round buttons, in ranges when there are many.
 */
export function LibraryTextTree(
  properties: Readonly<LibraryTextTreeProperties>,
): ReactNode {
  const {
    className,
    depth,
    isAuthorMatched = false,
    rows,
    search,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { groups, rows: listed } = splitLevel(rows, depth);

  // 💪 Handlers
  const renderLevel = (below: readonly LibraryTextRow[]): ReactNode => (
    <LibraryTextTree
      className="space-y-2"
      depth={depth + 1}
      rows={below}
      search={search}
    />
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-text-tree"
    >
      {listed.map((row) => (
        <LibraryTextNode
          key={row.text.id}
          defaultOpen={
            depth === 0 &&
            search !== "" &&
            !isAuthorMatched &&
            row.childCount > 0 &&
            row.matches.length === 0
          }
          renderLevel={renderLevel}
          row={row}
          search={search}
        />
      ))}
      {groups.map((group) =>
        group.label === "" ? (
          <LibraryNumberGrid
            key={group.items[0]?.row.text.id}
            items={group.items}
          />
        ) : (
          <LibraryNumberRange
            key={group.label}
            group={group}
          />
        ),
      )}
    </div>
  );
}
