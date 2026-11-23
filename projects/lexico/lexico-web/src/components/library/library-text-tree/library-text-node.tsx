import { Link } from "@tanstack/react-router";
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import {
  buttonVariants,
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
 * one with children expands into a nested Frame of its children,
 * and loads them the first time it opens.
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
        <div className="flex items-center">
          <CollapsibleTrigger className="group/trigger flex min-w-0 flex-1 items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted/50">
            <ChevronRightIcon
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform group-data-[panel-open]/trigger:rotate-90"
            />
            <LibraryHighlight
              className="min-w-0 break-words"
              field="title"
              matches={matches}
              value={text.title}
            />
            <span className="ml-auto text-muted-foreground">{childCount}</span>
          </CollapsibleTrigger>
          <Link
            aria-label={`Open ${text.title}`}
            className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
            params={{ slug: text.slug }}
            to="/texts/$slug"
          >
            <ArrowUpRightIcon aria-hidden="true" />
          </Link>
        </div>
        <CollapsibleContent keepMounted>
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
