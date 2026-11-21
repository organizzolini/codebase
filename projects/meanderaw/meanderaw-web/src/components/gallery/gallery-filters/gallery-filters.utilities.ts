import { ListFilter } from "lucide-react";
import { createElement } from "react";

import { Badge, Button } from "@codebase/presentation";

import {
  FILTERS_BUTTON_CLASS_NAME,
  FILTERS_TITLE,
} from "./gallery-filters.constants";

import type { ReactElement } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The Filter button, badged with the count of finished rules; an element, not a component, so the surface's trigger can clone it.
 */
export function renderFiltersButton(activeCount: number): ReactElement {
  return createElement(
    Button,
    {
      "aria-label":
        activeCount === 0
          ? FILTERS_TITLE
          : `${FILTERS_TITLE}, ${String(activeCount)} active`,
      // The surface sits between the trigger and the button group, so the
      // group's joining styles are applied to the trigger here.
      className: FILTERS_BUTTON_CLASS_NAME,
      size: "sm",
      variant: "outline",
    },
    createElement(ListFilter, { "aria-hidden": "true" }),
    FILTERS_TITLE,
    activeCount === 0
      ? null
      : createElement(
          Badge,
          {
            "aria-hidden": "true",
            className: "tabular-nums",
            variant: "secondary",
          },
          activeCount,
        ),
  );
}
