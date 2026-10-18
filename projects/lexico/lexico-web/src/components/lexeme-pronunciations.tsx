import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/interface";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * One way a lexeme is pronounced.
 */
export interface LexemePronunciation {
  phonetic: string;
  variant: string;
}

/**
 * The properties LexemePronunciations accepts.
 */
export interface LexemePronunciationsProperties {
  className?: string;
  pronunciations: LexemePronunciation[];
}

// 🧩 Component

/**
 * How a lexeme is pronounced in each variant of Latin that has a
 * transcription, such as classical and ecclesiastical, folded away behind a
 * toggle.
 */
export function LexemePronunciations(
  properties: Readonly<LexemePronunciationsProperties>,
): ReactNode {
  const { className, pronunciations } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (pronunciations.length === 0) {
    return undefined;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-pronunciations"
    >
      <Collapsible
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
          Pronunciation
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <dl className="mt-2 space-y-1 text-sm">
            {pronunciations.map(({ phonetic, variant }) => (
              <div
                key={variant}
                className="flex items-baseline justify-between gap-4"
              >
                <dt className="text-xs text-muted-foreground capitalize">
                  {variant}
                </dt>
                <dd>{phonetic}</dd>
              </div>
            ))}
          </dl>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
