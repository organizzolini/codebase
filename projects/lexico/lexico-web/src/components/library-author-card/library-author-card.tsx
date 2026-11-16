import { useState } from "react";

import { LibraryHighlight } from "../library-highlight/library-highlight";

import { ERA_LABELS } from "./library-author-card.constants";
import { collectionsOf, formatYears } from "./library-author-card.utilities";
import { LibraryAuthorTexts } from "./library-author-texts";

import type { LibraryAuthorRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryAuthorCard component.
 */
export interface LibraryAuthorCardProperties {
  className?: string;
  row: LibraryAuthorRow;
  search: string;
}

// 🧩 Component

/**
 * One Author in the library: a summary that expands into its books and Texts.
 * A searched card opens already expanded, so its matched Texts show at once.
 */
export function LibraryAuthorCard(
  properties: Readonly<LibraryAuthorCardProperties>,
): ReactNode {
  const { className, row, search } = properties;
  const { author, matches, textCount, texts } = row;

  // 🪝 Hooks
  const [expanded, setExpanded] = useState(search !== "");

  // 🏗 Setup
  const collections = collectionsOf(texts);
  const years = formatYears(author.startYear, author.endYear);
  const panelId = `library-author-${author.id}`;

  // 💪 Handlers
  const handleToggle = (): void => {
    setExpanded((current) => !current);
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-author-card"
    >
      <button
        aria-controls={panelId}
        aria-expanded={expanded}
        className="w-full space-y-1 p-4 text-left"
        onClick={handleToggle}
        type="button"
      >
        <span className="block text-lg font-semibold">
          <LibraryHighlight
            className="inline"
            field="name"
            matches={matches}
            value={author.name}
          />
        </span>
        {author.fullName === null ? null : (
          <span className="block text-sm">{author.fullName}</span>
        )}
        {author.era === null ? null : (
          <span className="block text-sm">{ERA_LABELS[author.era]}</span>
        )}
        {years === "" ? null : (
          <span className="block text-sm text-muted-foreground">{years}</span>
        )}
        <span className="block text-sm">{`${String(textCount)} texts`}</span>
        {collections.length === 0 ? null : (
          <span className="block text-xs text-muted-foreground">
            {collections.join(", ")}
          </span>
        )}
      </button>
      {expanded ? (
        <LibraryAuthorTexts
          className="space-y-3 border-t p-4"
          id={panelId}
          row={row}
        />
      ) : null}
    </div>
  );
}
