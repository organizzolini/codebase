import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@codebase/presentation";

import { PAGE_SIZES } from "../../../../../hooks/use-gallery-search/use-gallery-search.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The size showing, and what to call when another is picked.
 */
export interface PageSizesProperties {
  onSizeChange: (size: number) => void;
  size: number;
}

// 🧩 Component

/**
 * Renders the menu's sizes to show per page, a check on the one showing.
 */
export function PageSizes(
  properties: Readonly<PageSizesProperties>,
): ReactNode {
  const { onSizeChange, size } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Per page</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        onValueChange={(value: string) => {
          onSizeChange(Number(value));
        }}
        value={String(size)}
      >
        {PAGE_SIZES.map((option) => (
          <DropdownMenuRadioItem
            key={option}
            value={String(option)}
          >
            {option}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
}
