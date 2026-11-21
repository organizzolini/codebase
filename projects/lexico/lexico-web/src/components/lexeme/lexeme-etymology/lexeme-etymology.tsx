import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties LexemeEtymology accepts.
 */
export interface LexemeEtymologyProperties {
  className?: string;
  etymology?: null | string | undefined;
}

// 🧩 Component

/**
 * Where a lexeme comes from, folded away behind a toggle because it runs long.
 */
export function LexemeEtymology(
  properties: Readonly<LexemeEtymologyProperties>,
): ReactNode {
  const { className, etymology } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (!etymology) {
    return undefined;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-etymology"
    >
      <Collapsible
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <CollapsibleTrigger
          render={
            <Button
              className="w-full justify-between"
              variant="ghost"
            />
          }
        >
          Etymology
          <ChevronDown
            className={cn("transition-transform", isOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="mt-2 text-sm text-muted-foreground">{etymology}</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
