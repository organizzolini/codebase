import { ListFilter } from "lucide-react";
import { createElement } from "react";

import { Button } from "@codebase/presentation";

import {
  FILTERS_BUTTON_CLASS_NAME,
  JOINED_BUTTON_CLASS_NAME,
  TITLE,
} from "./calendar-filters.constants";

import type { ReactElement } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * What the Filter list's Date item does: closes the list, then opens the picker; none without a picker.
 */
export function createDateOpener(
  openPicker: (() => void) | null,
  setOpen: (open: boolean) => void,
): (() => void) | undefined {
  if (openPicker === null) {
    return undefined;
  }

  return () => {
    setOpen(false);
    openPicker();
  };
}

/**
 * The Filters button, squared on its right when chips join it; an element, not a component, so the surface's trigger can clone it.
 */
export function renderFiltersButton(
  activeCount: number,
  joined: boolean,
): ReactElement {
  return createElement(
    Button,
    {
      "aria-label":
        activeCount === 0 ? TITLE : `${TITLE}, ${String(activeCount)} active`,
      // The surface's root sits between the trigger and the button group,
      // so the group's joining styles are applied to the trigger here, under
      // the same variant as the button's own rounding inside a group, which
      // would otherwise win.
      className: joined
        ? `${FILTERS_BUTTON_CLASS_NAME} ${JOINED_BUTTON_CLASS_NAME}`
        : FILTERS_BUTTON_CLASS_NAME,
      size: "sm",
      variant: "outline",
    },
    createElement(ListFilter, { "aria-hidden": "true" }),
    TITLE,
  );
}
