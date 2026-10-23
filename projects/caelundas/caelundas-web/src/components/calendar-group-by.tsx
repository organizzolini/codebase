import { useMemo, useState } from "react";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@codebase/presentation";

import { createEventGroupFields } from "../lib/event-groups/event-group-fields";
import { MAXIMUM_GROUP_LEVELS } from "../lib/event-groups/event-groups.constants";

import { GroupTagPicker } from "./group-tag-picker";

import type {
  EventGroupField,
  EventGroupLevel,
} from "../lib/event-groups/event-groups.types";
import type { EventFacet } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tag roots the data has, the grouping shown, and where to send a
 * changed one.
 */
export interface CalendarGroupByProperties {
  className?: string;
  facets: readonly EventFacet[];
  grouping: readonly EventGroupLevel[];
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
}

const TITLE = "Group by";

// How many picked tags a level names before counting the rest.
const NAMED_TAGS = 2;

// 🧩 Component

/**
 * Renders the list of the grouping's levels, each shaped like a filter: a
 * field, the same ones the filter offers, and what to group it by. A tag
 * root opens the filter's own tag tree to pick groups from, so several tags
 * are one pick; with none picked it groups by the root's first level. A
 * sub-group is added beneath the last level and any level removed. The View
 * menu holds it in its Group by submenu.
 */
export function CalendarGroupBy(
  properties: Readonly<CalendarGroupByProperties>,
): ReactNode {
  const { className, facets, grouping, onGroupingChange } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const [openField, setOpenField] = useState<string>();

  // 🏗 Setup
  const unused = fields.filter(
    (field) => !grouping.some((level) => level.field === field.id),
  );
  const [nextField] = unused;

  // 💪 Handlers
  const replaceLevel = (index: number, level: EventGroupLevel | null): void => {
    onGroupingChange(
      grouping.flatMap((current, position) => {
        if (position !== index) {
          return [current];
        }

        return level === null ? [] : [level];
      }),
    );
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-group-by"
    >
      <div className="flex w-80 max-w-[90vw] flex-col gap-2 p-1">
        <h2 className="text-sm font-semibold">{TITLE}</h2>
        {grouping.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not grouped</p>
        ) : null}
        {grouping.map((level, index) => (
          <GroupLevelRow
            key={level.field}
            fields={fields.filter(
              (option) => option.id === level.field || unused.includes(option),
            )}
            isOpen={openField === level.field}
            level={level}
            onChange={(next) => {
              replaceLevel(index, next);
            }}
            onOpenChange={(open) => {
              setOpenField(open ? level.field : undefined);
            }}
            position={index + 1}
          />
        ))}
        {grouping.length < MAXIMUM_GROUP_LEVELS && nextField !== undefined ? (
          <Button
            className="self-start"
            onClick={() => {
              onGroupingChange([...grouping, toLevel(nextField)]);
            }}
            size="sm"
            variant="ghost"
          >
            {grouping.length === 0 ? "Add group" : "Add sub-group"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Names what a level groups by: the tags picked, or the level of the root's
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

/**
 * Draws one level of the grouping like a filter: its field, what it groups
 * by, and a button that removes it, with the tag tree open beneath it when
 * the value is being picked. It reports the changed level or `null` once
 * removed.
 */
function GroupLevelRow(
  properties: Readonly<{
    fields: readonly EventGroupField[];
    isOpen: boolean;
    level: EventGroupLevel;
    onChange: (level: EventGroupLevel | null) => void;
    onOpenChange: (open: boolean) => void;
    position: number;
  }>,
): ReactNode {
  const { fields, isOpen, level, onChange, onOpenChange, position } =
    properties;
  const field = fields.find((candidate) => candidate.id === level.field);
  const name = `Group ${String(position)}`;
  const items = fields.map((option) => ({
    label: option.label,
    value: option.id,
  }));

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Select
          items={items}
          onValueChange={(picked) => {
            const next = fields.find((candidate) => candidate.id === picked);

            if (next !== undefined) {
              onOpenChange(false);
              onChange(toLevel(next));
            }
          }}
          value={level.field}
        >
          <SelectTrigger
            aria-label={`${name} by`}
            className="w-32 shrink-0"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {items.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <span className="truncate">{describeTags(field, level)}</span>
          </Button>
        )}
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
  );
}

/**
 * A field's first level: a tag root's children, or the derived value.
 */
function toLevel(field: EventGroupField): EventGroupLevel {
  return field.levels.length === 0
    ? { field: field.id }
    : { depth: 1, field: field.id };
}
