import { LibraryHighlight } from "../library-highlight/library-highlight";

import { groupTexts } from "./library-author-card.utilities";
import { LibraryTextLink } from "./library-text-link";

import type { LibraryAuthorRow } from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryAuthorTexts component.
 */
export interface LibraryAuthorTextsProperties {
  className?: string;
  id: string;
  row: LibraryAuthorRow;
}

// 🧩 Component

/**
 * The books and Texts an expanded Author card lists, and how many it omits.
 */
export function LibraryAuthorTexts(
  properties: Readonly<LibraryAuthorTextsProperties>,
): ReactNode {
  const { className, id, row } = properties;
  const { textCount, texts } = row;

  // 🪝 Hooks

  // 🏗 Setup
  const entries = groupTexts(texts);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-author-texts"
      id={id}
    >
      {entries.map((entry) =>
        entry.kind === "book" ? (
          <section key={entry.id}>
            <h3 className="font-medium">
              <LibraryHighlight
                className="inline"
                field="title"
                matches={entry.matches}
                value={entry.title}
              />
            </h3>
            <ul className="space-y-2 pl-3">
              {entry.children.map((child) => (
                <li key={child.text.id}>
                  <LibraryTextLink row={child} />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <LibraryTextLink
            key={entry.row.text.id}
            row={entry.row}
          />
        ),
      )}
      {textCount > texts.length ? (
        <p className="text-sm text-muted-foreground">
          {`Showing ${String(texts.length)} of ${String(textCount)} texts`}
        </p>
      ) : null}
    </div>
  );
}
