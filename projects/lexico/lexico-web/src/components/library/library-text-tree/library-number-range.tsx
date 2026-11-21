// cspell:ignore Carmina
import { ChevronRightIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

import { LibraryNumberGrid } from "./library-number-grid";

import type { LibraryNumberGroup } from "./library-text-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryNumberRange component.
 */
export interface LibraryNumberRangeProperties {
  className?: string;
  group: LibraryNumberGroup;
}

// 🧩 Component

/**
 * One range of a long numbered run, such as "Carmina 21–40", that opens into
 * its round buttons. It opens by itself when a search matched one of them.
 */
export function LibraryNumberRange(
  properties: Readonly<LibraryNumberRangeProperties>,
): ReactNode {
  const { className, group } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const matched = group.items.some(({ row }) => row.matches.length > 0);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-number-range"
    >
      <Collapsible defaultOpen={matched}>
        <CollapsibleTrigger className="group/trigger flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <ChevronRightIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/trigger:rotate-90"
          />
          {group.label}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-1 py-2">
          <LibraryNumberGrid items={group.items} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
