import { useState } from "react";

import { LexemeSection } from "../lexeme-section/lexeme-section";

import type { LexemePronunciation } from "./lexeme-pronunciations.types";
import type { ReactNode } from "react";

// 🔖 Type

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
      <LexemeSection
        label="Pronunciation"
        onToggle={() => {
          setIsOpen(!isOpen);
        }}
        state={isOpen ? "open" : "closed"}
      >
        <dl className="pb-1 text-sm">
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
      </LexemeSection>
    </div>
  );
}
