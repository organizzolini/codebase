import { useCallback } from "react";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@codebase/presentation";

import type { LookupEntry } from "../../hooks/use-lookup-history/use-lookup-history.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderHistory accepts.
 */
export interface ReaderHistoryProperties {
  className?: string;
  entries: LookupEntry[];
  onClear: () => void;
  onFocusEntry: (entry: LookupEntry | null) => void;
}

// 🧩 Component

/**
 * The History button and its side sheet, which lists the words looked up in
 * this text, newest first, and lights up an entry's word while it is hovered.
 */
export function ReaderHistory(
  properties: Readonly<ReaderHistoryProperties>,
): ReactNode {
  const { className, entries, onClear, onFocusEntry } = properties;

  // 🪝 Hooks

  // 🏗 Setup

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
            <SheetDescription>This text</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            {entries.length === 0 ? (
              <p className="text-muted-foreground">
                No words looked up in this text yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {entries.map((entry) => (
                  <li key={`${entry.line}-${entry.token}`}>
                    <button
                      className="w-full rounded-md p-2 text-left hover:bg-accent"
                      onBlur={() => {
                        onFocusEntry(null);
                      }}
                      onFocus={() => {
                        onFocusEntry(entry);
                      }}
                      onMouseEnter={() => {
                        onFocusEntry(entry);
                      }}
                      onMouseLeave={() => {
                        onFocusEntry(null);
                      }}
                      type="button"
                    >
                      <span className="font-medium">{entry.word}</span>{" "}
                      <span className="text-muted-foreground">
                        {entry.form}
                      </span>
                      {entry.definition === null ? null : (
                        <span className="block">{entry.definition}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="px-4 pb-4">
            <Button
              onClick={onClear}
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
