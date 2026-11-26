import { ListFilter } from "lucide-react";
import { createElement } from "react";

import { Button, flattenFilterRules } from "@codebase/presentation";

import { StripFoldButton } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button";
import { toFoldedStrip } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.utilities";

import {
  FILTERS_BUTTON_CLASS_NAME,
  FOLD_BUTTON_CLASS_NAME,
  JOINED_BUTTON_CLASS_NAME,
  TITLE,
} from "./calendar-filters.constants";
import { DERIVED_FIELD_IDS } from "./components/event-filter-model/event-filters.constants";

import type { StripFold } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";
import type { FilterRule } from "@codebase/presentation";
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
 * The chips drawn, the names a fold hides, the fold in effect, and whether chips follow the head; nothing is drawn below a tablet.
 */
export function deriveFilterStrip(
  query: Parameters<typeof flattenFilterRules>[0],
  options: {
    activeCount: number;
    fields: readonly { id: string; label: string }[];
    fold: StripFold | undefined;
    isTablet: boolean;
  },
): {
  folded: StripFold | undefined;
  hasChipsAfter: boolean;
  names: string[];
} {
  const drawn = options.isTablet ? flattenFilterRules(query) : [];
  const names = listFoldedFilterNames(drawn, options.fields);
  const folded = toFoldedStrip(options.fold, names.length);
  const hasChipsAfter = hasChipsAfterHead(
    folded !== undefined,
    options.activeCount,
    drawn,
  );

  return { folded, hasChipsAfter, names };
}

/**
 * Whether chips follow the strip's head: every active one drawn, or once folded only the required ones.
 */
export function hasChipsAfterHead(
  isFolded: boolean,
  activeCount: number,
  drawn: readonly FilterRule[],
): boolean {
  if (drawn.length === 0) {
    return false;
  }

  return isFolded
    ? drawn.some((rule) => isRequiredFilterRule(rule))
    : activeCount > 0;
}

/**
 * Whether a rule's chip stays drawn when the strip folds: the date range, which every view reads.
 */
export function isRequiredFilterRule(rule: Readonly<FilterRule>): boolean {
  return rule.path[0] === DERIVED_FIELD_IDS.date;
}

/**
 * The names of the chips a fold hides: each rule's field, those that stay drawn left out.
 */
export function listFoldedFilterNames(
  rules: readonly FilterRule[],
  fields: readonly { id: string; label: string }[],
): string[] {
  const names: string[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const rule of rules) {
    if (!isRequiredFilterRule(rule)) {
      const id = rule.path[0] ?? "";

      names.push(fields.find((field) => field.id === id)?.label ?? id);
    }
  }

  return names;
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

/**
 * The folded strip's count button, joined to the date facet and squared when chips follow; none unfolded.
 */
export function renderFoldButton(
  folded: StripFold | undefined,
  names: readonly string[],
  hasChipsAfter: boolean,
): null | ReactElement {
  return folded === undefined
    ? null
    : createElement(StripFoldButton, {
        className: hasChipsAfter
          ? `${FOLD_BUTTON_CLASS_NAME} rounded-r-none!`
          : FOLD_BUTTON_CLASS_NAME,
        names,
        onUnfold: folded.onUnfold,
        title: TITLE,
      });
}
