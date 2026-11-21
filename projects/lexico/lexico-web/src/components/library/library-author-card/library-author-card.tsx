import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@codebase/presentation";

import { LibraryHighlight } from "../library-highlight/library-highlight";

import { ERA_LABELS } from "./library-author-card.constants";
import { formatYears, previewOf } from "./library-author-card.utilities";
import { LibraryAuthorTexts } from "./library-author-texts";

import type {
  LibraryAuthorRow,
  LibraryRequest,
} from "../library-grid/library-grid.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryAuthorCard component.
 */
export interface LibraryAuthorCardProperties {
  className?: string;
  query: LibraryRequest;
  row: LibraryAuthorRow;
}

// 🧩 Component

/**
 * One Author in the library: its name, dates, and a bullet-separated preview
 * of its works, which expands into the works' hierarchy. A searched card opens
 * already expanded.
 */
export function LibraryAuthorCard(
  properties: Readonly<LibraryAuthorCardProperties>,
): ReactNode {
  const { className, query, row } = properties;
  const { author, matches, workCount, works } = row;

  // 🪝 Hooks
  const [expanded, setExpanded] = useState(query.search !== "");

  // 🏗 Setup
  const preview = previewOf(works, workCount);
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
      <Card>
        <CardHeader>
          <button
            aria-controls={panelId}
            aria-expanded={expanded}
            className="group/toggle flex w-full items-start gap-2 text-left"
            onClick={handleToggle}
            type="button"
          >
            <span className="min-w-0 flex-1">
              <CardTitle>
                <LibraryHighlight
                  className="inline"
                  field="name"
                  matches={matches}
                  value={author.name}
                />
              </CardTitle>
              {author.fullName === null ? null : (
                <LibraryHighlight
                  className="block"
                  field="fullName"
                  matches={matches}
                  value={author.fullName}
                />
              )}
              <CardDescription>
                {[
                  author.era === null ? "" : ERA_LABELS[author.era],
                  years,
                  `${String(workCount)} ${workCount === 1 ? "work" : "works"}`,
                ]
                  .filter((part) => part !== "")
                  .join(" · ")}
              </CardDescription>
            </span>
            <ChevronRightIcon
              aria-hidden="true"
              className="shrink-0 transition-transform group-aria-expanded/toggle:rotate-90"
            />
          </button>
        </CardHeader>
        <CardContent>
          {expanded ? (
            <LibraryAuthorTexts
              className="space-y-3 border-t pt-4"
              id={panelId}
              query={query}
              row={row}
            />
          ) : (
            <p
              className="line-clamp-3 text-muted-foreground"
              data-testid="library-author-preview"
            >
              {preview}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
