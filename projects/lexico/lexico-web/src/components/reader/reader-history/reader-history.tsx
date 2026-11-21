import { XIcon } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@codebase/presentation";

import { isLookupEntry } from "../../../hooks/use-lookup-history/use-lookup-history.utilities";
import { HistoryList } from "../../history/history-list/history-list";

import type { HistoryEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderHistory accepts.
 */
export interface ReaderHistoryProperties {
  className?: string;
  currentSlug: string;
  entries: HistoryEntry[];
  isOpen: boolean;
  onClear: () => void;
  onClose: () => void;
  onFocusEntry: (entry: HistoryEntry | null) => void;
  onOpenEntry: (entry: HistoryEntry) => void;
}

// 🧩 Component

/**
 * The history sidebar: a full-height card on the right edge that opens by
 * pushing the page aside, with no overlay. Its This text tab lists the words
 * looked up in this text, newest first, each with its dictionary card; its
 * All tab lists every lookup and search, labelled by origin.
 */
export function ReaderHistory(
  properties: Readonly<ReaderHistoryProperties>,
): ReactNode {
  const {
    className,
    currentSlug,
    entries,
    isOpen,
    onClear,
    onClose,
    onFocusEntry,
    onOpenEntry,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const thisText = entries.filter(
    (entry) => isLookupEntry(entry) && entry.slug === currentSlug,
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-history"
    >
      <aside
        aria-label="History"
        className={`h-full overflow-hidden transition-[width,margin] duration-300 ease-in-out motion-reduce:transition-none ${isOpen ? "ml-4 w-96 max-w-[calc(100vw-2rem)]" : "ml-0 w-0"}`}
        data-state={isOpen ? "open" : "closed"}
        inert={!isOpen}
      >
        {isOpen ? (
          <Card className="ml-auto h-full w-96 max-w-[calc(100vw-2rem)] gap-3 py-4 shadow-lg">
            <CardHeader className="flex items-center justify-between gap-2">
              <CardTitle>History</CardTitle>
              <Button
                aria-label="Close history"
                onClick={() => {
                  onClose();
                }}
                size="icon"
                variant="ghost"
              >
                <XIcon aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
              <Tabs
                className="flex min-h-0 flex-1 flex-col"
                defaultValue="this-text"
              >
                <TabsList className="h-8 w-full">
                  <TabsTrigger value="this-text">This text</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent
                  className="min-h-0 flex-1 overflow-y-auto"
                  value="this-text"
                >
                  <HistoryList
                    emptyMessage="No words looked up in this text yet."
                    entries={thisText}
                    onFocusEntry={onFocusEntry}
                    onOpenEntry={onOpenEntry}
                    showLexemes
                  />
                </TabsContent>
                <TabsContent
                  className="min-h-0 flex-1 overflow-y-auto"
                  value="all"
                >
                  <HistoryList
                    emptyMessage="No words looked up or searches yet."
                    entries={entries}
                    onFocusEntry={onFocusEntry}
                    onOpenEntry={onOpenEntry}
                    showLexemes
                  />
                </TabsContent>
              </Tabs>
              <Button
                onClick={() => {
                  onClear();
                }}
                variant="outline"
              >
                Clear history
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
