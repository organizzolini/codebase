import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@codebase/presentation";

import {
  entryDetail,
  entryTitle,
} from "../history-list/history-list.utilities";

import { KIND_DISPLAY } from "./history-card.constants";
import { cardSummary, formatRecordedAt } from "./history-card.utilities";

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The properties HistoryCard accepts. */
export interface HistoryCardProperties {
  className?: string;
  /** The interaction to show: a word lookup, a search, or a text opening. */
  entry: HistoryEntry;
  /** Called when the reader opens the entry from its card. */
  onOpen: (entry: HistoryEntry) => void;
}

// 🧩 Component

/**
 * One interaction from the reader's history as a card: a word looked up, a
 * search made, or a text opened. It shows the kind as a badge with an icon,
 * what happened, when, and a button that opens it again.
 */
export function HistoryCard(
  properties: Readonly<HistoryCardProperties>,
): ReactNode {
  const { className, entry, onOpen } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { icon: Icon, label } = KIND_DISPLAY[entry.kind];
  const title = entryTitle(entry);
  const detail = entryDetail(entry);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="history-card"
    >
      <Card size="sm">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Icon
                aria-hidden="true"
                className="size-4 shrink-0"
              />
              {title}
            </span>
          </CardTitle>
          <CardDescription>
            {detail === "" ? null : `${detail} · `}
            <time dateTime={new Date(entry.recordedAt).toISOString()}>
              {formatRecordedAt(entry.recordedAt)}
            </time>
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">{label}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>{cardSummary(entry)}</CardContent>
        <CardFooter>
          <Button
            aria-label={`Open ${title}`}
            onClick={() => {
              onOpen(entry);
            }}
            size="sm"
            variant="outline"
          >
            Open
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
