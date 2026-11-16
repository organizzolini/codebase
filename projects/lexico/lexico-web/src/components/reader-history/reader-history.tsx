import { useCallback } from "react";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@codebase/presentation";

import { isLookupEntry } from "../../hooks/use-lookup-history/use-lookup-history.utilities";
import { HistoryList } from "../history-list/history-list";

import type { HistoryEntry } from "../../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderHistory accepts.
 */
export interface ReaderHistoryProperties {
  className?: string;
  currentSlug: string;
  entries: HistoryEntry[];
  onClear: () => void;
  onFocusEntry: (entry: HistoryEntry | null) => void;
  onOpenEntry: (entry: HistoryEntry) => void;
}

// 🧩 Component

/**
 * The History button and its side sheet. Its This text tab lists the words
 * looked up in this text, newest first; its All tab lists every lookup and
 * search, labelled by origin.
 */
export function ReaderHistory(
  properties: Readonly<ReaderHistoryProperties>,
): ReactNode {
  const {
    className,
    currentSlug,
    entries,
    onClear,
    onFocusEntry,
    onOpenEntry,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const thisText = entries.filter(
    (entry) => isLookupEntry(entry) && entry.slug === currentSlug,
  );

  // 💪 Handlers
  const handleOpenChange = useCallback(
    (isOpen: boolean): void => {
      if (!isOpen) {
        onFocusEntry(null);
      }
    },
    [onFocusEntry],
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-history"
    >
      <Sheet onOpenChange={handleOpenChange}>
        <SheetTrigger render={<Button variant="outline" />}>
          History
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
            <SheetDescription>Words looked up and searches</SheetDescription>
          </SheetHeader>
          <Tabs
            className="flex-1 overflow-y-auto px-4"
            defaultValue="this-text"
          >
            <TabsList>
              <TabsTrigger value="this-text">This text</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="this-text">
              <HistoryList
                emptyMessage="No words looked up in this text yet."
                entries={thisText}
                onFocusEntry={onFocusEntry}
                onOpenEntry={onOpenEntry}
              />
            </TabsContent>
            <TabsContent value="all">
              <HistoryList
                emptyMessage="No words looked up or searches yet."
                entries={entries}
                onFocusEntry={onFocusEntry}
                onOpenEntry={onOpenEntry}
              />
            </TabsContent>
          </Tabs>
          <div className="px-4 pb-4">
            <Button
              onClick={() => {
                onClear();
              }}
              variant="outline"
            >
              Clear history
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
