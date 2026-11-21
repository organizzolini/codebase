import { X } from "lucide-react";
import { Fragment } from "react";

import { Button, ButtonGroupText } from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The level's name, and the handler that removes it.
 */
export interface GroupLevelChipProperties {
  label: string;
  onRemove: () => void;
}

// 🧩 Component

/**
 * Renders one grouping level as its name, with a cross that removes it.
 */
export function GroupLevelChip(
  properties: Readonly<GroupLevelChipProperties>,
): ReactNode {
  const { label, onRemove } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Fragment>
      <ButtonGroupText>{label}</ButtonGroupText>
      <Button
        aria-label={`Stop grouping by ${label}`}
        onClick={() => {
          onRemove();
        }}
        size="sm"
        variant="outline"
      >
        <X aria-hidden="true" />
      </Button>
    </Fragment>
  );
}
