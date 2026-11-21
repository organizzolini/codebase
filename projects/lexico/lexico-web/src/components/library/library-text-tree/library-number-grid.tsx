import { Link } from "@tanstack/react-router";

import { buttonVariants, cn } from "@codebase/presentation";

import type { LibraryNumbered } from "./library-text-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryNumberGrid component.
 */
export interface LibraryNumberGridProperties {
  className?: string;
  items: readonly LibraryNumbered[];
}

// 🧩 Component

/**
 * Numbered Texts as a wrapping grid of small round buttons, each linking to
 * its Text in the Reader. A Text the search matched is filled.
 */
export function LibraryNumberGrid(
  properties: Readonly<LibraryNumberGridProperties>,
): ReactNode {
  const { className, items } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-number-grid"
    >
      <ul className="flex flex-wrap gap-1.5">
        {items.map(({ label, row }) => (
          <li key={row.text.id}>
            <Link
              aria-label={
                row.text.title.includes(label)
                  ? row.text.title
                  : `${row.text.title} (${label})`
              }
              className={cn(
                buttonVariants({
                  size: "icon-sm",
                  variant: row.matches.length > 0 ? "default" : "outline",
                }),
                "h-7 min-w-7 rounded-full border-muted-foreground/40 px-2 dark:border-muted-foreground/40 text-xs",
              )}
              params={{ slug: row.text.slug }}
              to="/texts/$slug"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
