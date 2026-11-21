import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

import { LibraryTextLink } from "../library-author-card/library-text-link";
import { LibraryHighlight } from "../library-highlight/library-highlight";

import { LibraryTextChildren } from "./library-text-children";

import type { LibraryTextRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryTextNode component.
 */
export interface LibraryTextNodeProperties {
  className?: string;
  /** Whether the node starts open, as when its children hold a search match. */
  defaultOpen?: boolean;
  /** Draws the children once loaded, one level below this Text. */
  renderLevel: (rows: readonly LibraryTextRow[]) => ReactNode;
  row: LibraryTextRow;
  search: string;
}

// 🧩 Component

/**
 * One Text in a card. A Text with no children links straight to the Reader;
 * one with children is an accordion that loads them the first time it opens.
 */
export function LibraryTextNode(
  properties: Readonly<LibraryTextNodeProperties>,
): ReactNode {
  const {
    className = "",
    defaultOpen = false,
    renderLevel,
    row,
    search,
  } = properties;
  const { childCount, matches, text } = row;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasOpened, setHasOpened] = useState(defaultOpen);

  // 🏗 Setup

  // 💪 Handlers
  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    setHasOpened((opened) => opened || open);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (childCount === 0) {
    return (
      <LibraryTextLink
        className={className}
        row={row}
      />
    );
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-text-node"
    >
      <Collapsible
        onOpenChange={handleOpenChange}
        open={isOpen}
      >
        <div className="flex items-center gap-1">
          <CollapsibleTrigger className="group/trigger flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1 text-left font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            <ChevronRightIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/trigger:rotate-90"
            />
            <LibraryHighlight
              className="min-w-0 break-words"
              field="title"
              matches={matches}
              value={text.title}
            />
            <span className="ml-auto shrink-0 text-xs font-normal text-muted-foreground">
              {childCount}
            </span>
          </CollapsibleTrigger>
          <Link
            aria-label={`Open ${text.title}`}
            className="shrink-0 rounded-md px-1.5 py-1 text-xs text-muted-foreground underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            params={{ slug: text.slug }}
            to="/texts/$slug"
          >
            Open
          </Link>
        </div>
        <CollapsibleContent
          className="space-y-1 pt-1 pl-4"
          keepMounted
        >
          {hasOpened ? (
            <LibraryTextChildren
              childCount={childCount}
              parentTextId={text.id}
              renderLevel={renderLevel}
              search={search}
            />
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
