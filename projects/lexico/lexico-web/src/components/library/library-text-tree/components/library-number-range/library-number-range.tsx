// cspell:ignore Carmina
import { ChevronRightIcon } from "lucide-react";

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

import { LibraryNumberGrid } from "./library-number-grid";

import type { LibraryNumberGroup } from "../../library-text-tree.types";
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
        <CollapsibleTrigger
          render={
            <Button
              className="group/trigger w-full justify-start"
              variant="ghost"
            />
          }
        >
          <ChevronRightIcon
            aria-hidden="true"
            className="transition-transform group-data-[panel-open]/trigger:rotate-90"
          />
          {group.label}
        </CollapsibleTrigger>
        <CollapsibleContent className="py-2">
          <LibraryNumberGrid items={group.items} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
