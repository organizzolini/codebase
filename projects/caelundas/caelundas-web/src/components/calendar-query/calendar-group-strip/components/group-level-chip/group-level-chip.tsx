import { Fragment } from "react";

import { ButtonGroupText } from "@codebase/presentation";

import { ChipMenu } from "../../../chip-menu/chip-menu";
import { CHIP_CLASS_NAME } from "../../calendar-group-strip.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The level's name, the moves it can make, and the handler that removes it.
 */
export interface GroupLevelChipProperties {
  label: string;
  onMoveLeft?: (() => void) | undefined;
  onMoveRight?: (() => void) | undefined;
  onRemove: () => void;
}

// 🧩 Component

/**
 * Renders one grouping level as its name, with an ellipsis menu that moves it left or right, or removes it.
 */
export function GroupLevelChip(
  properties: Readonly<GroupLevelChipProperties>,
): ReactNode {
  const { label, onMoveLeft, onMoveRight, onRemove } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Fragment>
      <ButtonGroupText className={CHIP_CLASS_NAME}>{label}</ButtonGroupText>
      <ChipMenu
        label={label}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onRemove={onRemove}
      />
    </Fragment>
  );
}
