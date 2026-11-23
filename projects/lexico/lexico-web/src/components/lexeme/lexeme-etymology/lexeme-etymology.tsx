import { useState } from "react";

import { LexemeSection } from "../lexeme-section/lexeme-section";

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
      <LexemeSection
        label="Etymology"
        onToggle={() => {
          setIsOpen(!isOpen);
        }}
        state={isOpen ? "open" : "closed"}
      >
        <p className="pb-1 text-sm text-muted-foreground">{etymology}</p>
      </LexemeSection>
    </div>
  );
}
