import { cn, Frame, FramePanel } from "@codebase/presentation";

import { LibraryNumberGrid } from "./components/library-number-range/library-number-grid";
import { LibraryNumberRange } from "./components/library-number-range/library-number-range";
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
 * One level of an author's Texts as a stacked Frame: each a row or an expandable panel, with
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
      depth={depth + 1}
      rows={below}
      search={search}
    />
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (listed.length === 0 && groups.length === 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-text-tree"
    >
      <Frame
        className={cn(depth > 0 && "[--frame-radius:0px]")}
        variant="ghost"
        dense
        stacked
      >
        {listed.map((row) => (
          <FramePanel
            key={row.text.id}
            className="p-0"
          >
            <LibraryTextNode
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
          </FramePanel>
        ))}
        {groups.map((group) => (
          <FramePanel key={group.label || group.items[0]?.row.text.id}>
            {group.label === "" ? (
              <LibraryNumberGrid items={group.items} />
            ) : (
              <LibraryNumberRange group={group} />
            )}
          </FramePanel>
        ))}
      </Frame>
    </div>
  );
}
