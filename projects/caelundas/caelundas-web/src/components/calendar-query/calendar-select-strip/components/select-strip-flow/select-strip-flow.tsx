import { ButtonGroup } from "@codebase/presentation";

import { useStripLines } from "../../../../../hooks/use-strip-lines/use-strip-lines";

import {
  ITEM_CLASS_NAME,
  SELECT_FLOW_CLASS_NAME,
} from "./select-strip-flow.constants";

import type { SelectStripChip } from "./select-strip-flow.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The group's label, the base button, and the chips after it. */
export interface SelectStripFlowProperties {
  chips: readonly SelectStripChip[];
  label: string;
  trigger: ReactNode;
}

// 🧩 Component

/**
 * Renders the base button with the first chip, then one item per chip, all flowing in the toolbar's row and wrapping between chips.
 */
export function SelectStripFlow(
  properties: Readonly<SelectStripFlowProperties>,
): ReactNode {
  const { chips, label, trigger } = properties;

  // 🪝 Hooks
  const { reference } = useStripLines();

  // 🏗 Setup
  const [first, ...rest] = chips;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      ref={reference}
      className={SELECT_FLOW_CLASS_NAME}
    >
      <ButtonGroup
        aria-label={label}
        className={ITEM_CLASS_NAME}
        data-strip-item=""
      >
        {trigger}
        {first?.content}
      </ButtonGroup>
      {rest.map((chip) => (
        <ButtonGroup
          key={chip.id}
          className={ITEM_CLASS_NAME}
          data-strip-chip=""
          data-strip-item=""
          role="presentation"
        >
          {chip.content}
        </ButtonGroup>
      ))}
    </div>
  );
}
