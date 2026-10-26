import { Button } from "@codebase/presentation";

import { toGroupLevel } from "../lib/event-groups/event-group-fields";

import { GroupFieldPicker } from "./group-field-picker";
import { GroupTagPicker } from "./group-tag-picker";

import type {
  EventGroupField,
  EventGroupLevel,
} from "../lib/event-groups/event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The level shown, the fields to pick from, whether the tag tree is open
 * beneath it, and where to send a change.
 */
export interface GroupLevelRowProperties {
  className?: string;
  fields: readonly EventGroupField[];
  isOpen: boolean;
  level: EventGroupLevel;
  /**
   * What the level is called for a screen reader, such as "Group 1".
   */
  name: string;
  onChange: (level: EventGroupLevel | null) => void;
  onOpenChange: (open: boolean) => void;
  /**
   * Whether a button removes the level; it does when absent.
   */
  removable?: boolean;
  /**
   * What the tags button says in place of what the level goes by.
   */
  valueLabel?: string | undefined;
}

// How many picked tags a level names before counting the rest.
const NAMED_TAGS = 2;

// 🧩 Component

/**
 * Draws one level like a filter: its field, what it goes by, and a button
 * that removes it, with the tag tree open beneath it when the tags are being
 * picked. It reports the changed level, or `null` once removed. The grouping
 * and the coloring both pick a level this way.
 */
export function GroupLevelRow(
  properties: Readonly<GroupLevelRowProperties>,
): ReactNode {
  const {
    className,
    fields,
    isOpen,
    level,
    name,
    onChange,
    onOpenChange,
    removable = true,
    valueLabel,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const field = fields.find((candidate) => candidate.id === level.field);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="group-level-row"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <GroupFieldPicker
            fields={fields}
            label={`${name} by`}
            onSelect={(next) => {
              onOpenChange(false);
              onChange(toGroupLevel(next));
            }}
            value={level.field}
          />
          {field === undefined || field.options.length === 0 ? (
            <span className="grow" />
          ) : (
            <Button
              aria-expanded={isOpen}
              aria-label={`${name} tags`}
              className="min-w-0 grow justify-start truncate"
              onClick={() => {
                onOpenChange(!isOpen);
              }}
              size="sm"
              variant="outline"
            >
              <span className="truncate">
                {valueLabel ?? describeTags(field, level)}
              </span>
            </Button>
          )}
          {removable ? (
            <Button
              aria-label={`Remove ${name.toLowerCase()}`}
              onClick={() => {
                onOpenChange(false);
                onChange(null);
              }}
              size="sm"
              variant="ghost"
            >
              ×
            </Button>
          ) : null}
        </div>
        {isOpen && field !== undefined ? (
          <GroupTagPicker
            field={field}
            onChange={(tags) => {
              onChange({ field: field.id, tags });
            }}
            tags={level.tags ?? []}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Names what a level goes by: the tags picked, or the level of the root's
 * tree it goes by, the first unless an older link says otherwise.
 */
function describeTags(field: EventGroupField, level: EventGroupLevel): string {
  const tags = level.tags ?? [];

  if (tags.length === 0) {
    const depth = level.depth ?? 1;

    return depth > 1 ? `Level ${String(depth)}` : "First level";
  }

  const names = tags.flatMap((tag) => {
    const option = field.options.find((candidate) => candidate.value === tag);

    return option === undefined ? [] : [option.label];
  });
  const shown = names.slice(0, NAMED_TAGS).join(", ");

  return names.length > NAMED_TAGS
    ? `${shown} +${String(names.length - NAMED_TAGS)}`
    : shown;
}
