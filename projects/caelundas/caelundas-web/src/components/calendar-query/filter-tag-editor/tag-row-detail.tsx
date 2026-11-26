import { Link2 } from "lucide-react";

import { describeAlsoUnder } from "./filter-tag-editor.utilities";

import type { FilterOption } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tag option and note to draw beneath its name.
 */
export interface TagRowDetailProperties {
  className?: string;
  item: FilterOption;
  note: string | undefined;
}

// 🧩 Component

/**
 * Draws the line beneath a tag's name: where else a tag under two parents sits, then its note.
 */
export function TagRowDetail(
  properties: Readonly<TagRowDetailProperties>,
): ReactNode {
  const { className, item, note } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const alsoUnder = describeAlsoUnder(item);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (alsoUnder === undefined && note === undefined) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="tag-row-detail"
      style={{ display: "contents" }}
    >
      <span className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs">
        {alsoUnder === undefined ? null : (
          <span
            className="flex shrink-0 items-center gap-0.5 font-medium"
            data-testid="tag-also-under"
            title={alsoUnder.title}
          >
            <Link2
              aria-hidden="true"
              className="size-3"
            />
            {alsoUnder.text}
          </span>
        )}
        {note === undefined ? null : (
          <span className="truncate">
            {alsoUnder === undefined ? "" : "· "}
            {note}
          </span>
        )}
      </span>
    </div>
  );
}
