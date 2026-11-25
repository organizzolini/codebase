import { Fragment } from "react";

import { ButtonGroupText } from "@codebase/presentation";

import { CHIP_CLASS_NAME } from "../../calendar-group-strip.constants";
import { ChipMenu } from "../chip-menu/chip-menu";

import type { ReactNode } from "react";

// 🔖 Type

/** A level's name, its possible moves, and its optional remove. */
export interface GroupLevelChipProperties {
  /**
   * The symbol that leads the name.
   */
  icon?: ReactNode;
  label: string;
  onCollapseAll?: (() => void) | undefined;
  onExpandAll?: (() => void) | undefined;
  onMoveLeft?: (() => void) | undefined;
  onMoveRight?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
}

// 🧩 Component

/**
 * Renders one grouping level as its name, with an ellipsis menu that moves it left or right, or removes it.
 */
export function GroupLevelChip(
  properties: Readonly<GroupLevelChipProperties>,
): ReactNode {
  const {
    icon,
    label,
    onCollapseAll,
    onExpandAll,
    onMoveLeft,
    onMoveRight,
    onRemove,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Fragment>
      <ButtonGroupText className={CHIP_CLASS_NAME}>
        {icon}
        {label}
      </ButtonGroupText>
      <ChipMenu
        label={label}
        onCollapseAll={onCollapseAll}
        onExpandAll={onExpandAll}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onRemove={onRemove}
      />
    </Fragment>
  );
}
