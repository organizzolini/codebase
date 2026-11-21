import { useCallback, useEffect, useState } from "react";

import { Button } from "@codebase/presentation";

import { isHintSeen, markHintSeen } from "./reader-hint.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderHint accepts.
 */
export interface ReaderHintProperties {
  className?: string;
}

// 🧩 Component

/**
 * A one-time note that the words of a text are clickable, remembered per
 * browser once dismissed.
 */
export function ReaderHint(
  properties: Readonly<ReaderHintProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks
  const [isSeen, setIsSeen] = useState(true);

  // 🏗 Setup

  // 💪 Handlers
  const handleDismiss = useCallback((): void => {
    markHintSeen();
    setIsSeen(true);
  }, []);

  // ♻️ Lifecycle
  useEffect(() => {
    setIsSeen(isHintSeen());
  }, []);

  // 🏁 Early Returns
  if (isSeen) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-hint"
      role="note"
    >
      <p>Tip: words are clickable, so you can look any of them up.</p>
      <Button
        onClick={handleDismiss}
        variant="outline"
      >
        Got it
      </Button>
    </div>
  );
}
