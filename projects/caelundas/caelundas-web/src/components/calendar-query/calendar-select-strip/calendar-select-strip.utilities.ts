import { createElement } from "react";

import { isOfferedRow } from "../calendar-group-strip/calendar-group-strip-items.utilities";
import { createGroupItems } from "../calendar-group-strip/calendar-group-strip.utilities";
import { ALL_TAGS_FIELD } from "../calendar-group-strip/components/event-group-model/event-group-fields.constants";
import { TagIcon } from "../tag-icon/tag-icon";

import { COLUMN_OPTIONS, SELECT_MENU } from "./calendar-select-strip.constants";

import type { EventGroupField } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The nested choices: an event's name and times, then each tag root with its tags that have tags beneath them.
 */
export function createColumnItems(
  fields: readonly EventGroupField[],
): CascaderNode[] {
  const base: CascaderNode[] = COLUMN_OPTIONS.map((option) => ({
    description: option.description,
    icon: createElement(TagIcon, { name: option.icon }),
    keywords: [option.label],
    label: option.label,
    value: option.id,
  }));

  return [
    ...base,
    ...createGroupItems(
      fields.filter((field) => field.levels.length > 0),
      SELECT_MENU,
    ),
  ];
}

/**
 * Whether a row can be ticked as a column: not the Tag row, nor a folder.
 */
export function isColumnChoice(node: Readonly<CascaderNode>): boolean {
  return node.value !== ALL_TAGS_FIELD && isOfferedRow(node);
}

/**
 * The columns after a list click: columns still ticked keep their place, newly ticked ones follow; none means the defaults.
 */
export function toColumnIds(
  next: readonly string[],
  previous: readonly string[],
): string[] | undefined {
  const kept = previous.filter((id) => next.includes(id));
  const added = next.filter((id) => !previous.includes(id));
  const ids = [...kept, ...added];

  return ids.length === 0 ? undefined : ids;
}
