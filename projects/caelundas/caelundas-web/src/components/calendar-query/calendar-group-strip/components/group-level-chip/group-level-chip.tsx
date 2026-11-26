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
  onOnly?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  /**
   * The full tag path, for the tooltip and menu.
   */
  title?: string | undefined;
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
    onOnly,
    onRemove,
    title,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Fragment>
      <ButtonGroupText
        className={CHIP_CLASS_NAME}
        title={title}
      >
        {icon}
        {label}
      </ButtonGroupText>
      <ChipMenu
        label={title ?? label}
        onCollapseAll={onCollapseAll}
        onExpandAll={onExpandAll}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onOnly={onOnly}
        onRemove={onRemove}
      />
    </Fragment>
  );
}
