import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Frame,
  FramePanel,
} from "@codebase/presentation";

import { LibraryHighlight } from "../library-highlight/library-highlight";

import { ERA_LABELS } from "./library-author-card.constants";
import { formatYears, previewOf } from "./library-author-card.utilities";
import { LibraryAuthorTexts } from "./library-author-texts";

import type {
  LibraryAuthorRow,
  LibraryRequest,
} from "../library-grid/library-grid.types";
import type { MouseEvent, ReactNode } from "react";

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
  const era = author.era === null ? null : ERA_LABELS[author.era];

  // 💪 Handlers
  const handleOpenChange = (open: boolean): void => {
    setExpanded(open);
  };

  const handleCardClick = (event: MouseEvent<HTMLElement>): void => {
    const { target } = event;
    if (!(target instanceof Element)) {
      return;
    }
    const isInteractive = target.closest("a, button, input") !== null;
    const isInsideTexts = target.closest(`[id="${panelId}"]`) !== null;
    if (!isInteractive && !isInsideTexts) {
      setExpanded((open) => !open);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-author-card"
    >
      <Collapsible
        onOpenChange={handleOpenChange}
        open={expanded}
      >
        <Card
          className="cursor-pointer"
          onClick={handleCardClick}
        >
          <CardHeader>
            <CardTitle>
              <LibraryHighlight
                className="inline"
                field="name"
                matches={matches}
                value={author.name}
              />
            </CardTitle>
            <CardDescription>
              {author.fullName === null ? null : (
                <LibraryHighlight
                  className="block"
                  field="fullName"
                  matches={matches}
                  value={author.fullName}
                />
              )}
              {[
                years,
                `${String(workCount)} ${workCount === 1 ? "work" : "works"}`,
              ]
                .filter((part) => part !== "")
                .join(" · ")}
            </CardDescription>
            <CardAction className="flex items-center gap-2">
              {era === null ? null : <Badge variant="secondary">{era}</Badge>}
              <CollapsibleTrigger
                render={
                  <Button
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${author.name}`}
                    className="aria-expanded:not-hover:bg-transparent"
                    size="icon-sm"
                    variant="ghost"
                  />
                }
              >
                <ChevronRightIcon
                  aria-hidden="true"
                  className="transition-transform group-data-[panel-open]/button:rotate-90"
                />
              </CollapsibleTrigger>
            </CardAction>
          </CardHeader>
          <CardContent className="-mb-(--card-spacing)">
            {expanded ? null : (
              <Frame
                className="-mx-4"
                variant="ghost"
                dense
                stacked
              >
                <FramePanel>
                  <p
                    className="text-muted-foreground"
                    data-testid="library-author-preview"
                  >
                    {preview}
                  </p>
                </FramePanel>
              </Frame>
            )}
            <CollapsibleContent>
              <LibraryAuthorTexts
                className="space-y-3 pt-2"
                id={panelId}
                query={query}
                row={row}
              />
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    </div>
  );
}
