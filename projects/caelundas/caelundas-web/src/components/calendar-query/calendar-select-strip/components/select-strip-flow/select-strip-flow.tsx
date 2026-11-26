import { ButtonGroup } from "@codebase/presentation";

import { useStripLines } from "../../../../../hooks/use-strip-lines/use-strip-lines";
import { StripFoldButton } from "../../../calendar-group-strip/components/strip-fold-button/strip-fold-button";
import { StripFoldContext } from "../../../calendar-group-strip/components/strip-fold-button/strip-fold-button.constants";
import { toFoldedStrip } from "../../../calendar-group-strip/components/strip-fold-button/strip-fold-button.utilities";

import {
  ITEM_CLASS_NAME,
  SELECT_FLOW_CLASS_NAME,
} from "./select-strip-flow.constants";

import type { StripFold } from "../../../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";
import type { SelectStripChip } from "./select-strip-flow.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The label, base button, chips, and their fold. */
export interface SelectStripFlowProperties {
  chips: readonly SelectStripChip[];
  fold?: StripFold | undefined;
  label: string;
  trigger: ReactNode;
}

// 🧩 Component

/**
 * Renders the base button and its chips as items flowing in the toolbar's row; folded, the base button and a count of the chips.
 */
export function SelectStripFlow(
  properties: Readonly<SelectStripFlowProperties>,
): ReactNode {
  const { chips, fold, label, trigger } = properties;

  // 🪝 Hooks
  const { reference } = useStripLines();

  // 🏗 Setup
  const [first, ...rest] = chips;
  const folded = toFoldedStrip(fold, chips.length);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <StripFoldContext value={fold?.onFold}>
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
          {folded === undefined ? (
            first?.content
          ) : (
            <StripFoldButton
              names={chips.map((chip) => chip.name)}
              onUnfold={folded.onUnfold}
              title={label}
            />
          )}
        </ButtonGroup>
        {folded === undefined
          ? rest.map((chip) => (
              <ButtonGroup
                key={chip.id}
                className={ITEM_CLASS_NAME}
                data-strip-chip=""
                data-strip-item=""
                role="presentation"
              >
                {chip.content}
              </ButtonGroup>
            ))
          : null}
      </div>
    </StripFoldContext>
  );
}
