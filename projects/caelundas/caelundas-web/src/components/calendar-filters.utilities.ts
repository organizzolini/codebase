import { ListFilter } from "lucide-react";
import { createElement } from "react";

import { Badge, Button } from "@codebase/presentation";

import { TITLE } from "./calendar-filters.constants";

import type { ReactElement } from "react";

/**
 * The Filters button, badged with the number of finished rules, which its
 * accessible name also says. It is an element rather than a component
 * because the surface hands it to its trigger's `render`, which must clone
 * the button itself.
 */
export function renderFiltersButton(activeCount: number): ReactElement {
  return createElement(
    Button,
    {
      "aria-label":
        activeCount === 0 ? TITLE : `${TITLE}, ${String(activeCount)} active`,
      // The surface's root sits between the trigger and the button group,
      // so the group's joining styles are applied to the trigger here.
      className: "rounded-r-none focus-visible:relative focus-visible:z-10",
      size: "sm",
      variant: "outline",
    },
    createElement(ListFilter, { "aria-hidden": "true" }),
    TITLE,
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
