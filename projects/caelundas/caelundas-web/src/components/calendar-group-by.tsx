import { useMemo } from "react";

import { Button } from "@codebase/presentation";

import { createEventGroupFields } from "../lib/event-groups/event-group-fields";
import { MAXIMUM_GROUP_LEVELS } from "../lib/event-groups/event-groups.constants";

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

// How many of a depth's tag names its option lists before trailing off.
const DEPTH_EXAMPLES = 3;

const SELECT_CLASS_NAME =
  "border-input bg-background h-8 min-w-0 rounded-md border px-2 text-sm";

// 🧩 Component

/**
 * Renders the list of the grouping's levels: each a field, a tag root or a
 * period or the duration, and for a tag root how deep into its tree to go,
 * with a sub-group added beneath the last one or any level removed. The View
 * menu holds it in its Group by submenu.
 */
export function CalendarGroupBy(
  properties: Readonly<CalendarGroupByProperties>,
): ReactNode {
  const { className, facets, grouping, onGroupingChange } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);

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
      <div className="flex w-72 flex-col gap-2 p-1">
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
            level={level}
            onChange={(next) => {
              replaceLevel(index, next);
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
 * Names a depth of a tag root by the first few tags found there, such as
 * "Aspect, Ingress, Retrograde…".
 */
function describeDepth(names: readonly string[]): string {
  const shown = names.slice(0, DEPTH_EXAMPLES).join(", ");

  return names.length > DEPTH_EXAMPLES ? `${shown}…` : shown;
}

/**
 * Draws one level of the grouping: its field, its depth for a tag root, and
 * a button that removes it, reporting the changed level or `null` once
 * removed.
 */
function GroupLevelRow(
  properties: Readonly<{
    fields: readonly EventGroupField[];
    level: EventGroupLevel;
    onChange: (level: EventGroupLevel | null) => void;
    position: number;
  }>,
): ReactNode {
  const { fields, level, onChange, position } = properties;
  const field = fields.find((candidate) => candidate.id === level.field);
  const name = `Group ${String(position)}`;

  return (
    <div className="flex items-center gap-1">
      <select
        aria-label={`${name} by`}
        className={`${SELECT_CLASS_NAME} grow`}
        onChange={(event) => {
          const picked = fields.find(
            (candidate) => candidate.id === event.target.value,
          );

          if (picked !== undefined) {
            onChange(toLevel(picked));
          }
        }}
        value={level.field}
      >
        {fields.map((option) => (
          <option
            key={option.id}
            value={option.id}
          >
            {option.label}
          </option>
        ))}
      </select>
      {field === undefined || field.levels.length === 0 ? null : (
        <select
          aria-label={`${name} depth`}
          className={`${SELECT_CLASS_NAME} w-32`}
          onChange={(event) => {
            onChange({ depth: Number(event.target.value), field: field.id });
          }}
          value={level.depth ?? 1}
        >
          {field.levels.map((names, depth) => (
            <option
              key={names.join(",")}
              value={depth + 1}
            >
              {describeDepth(names)}
            </option>
          ))}
        </select>
      )}
      <Button
        aria-label={`Remove ${name.toLowerCase()}`}
        onClick={() => {
          onChange(null);
        }}
        size="sm"
        variant="ghost"
      >
        ×
      </Button>
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
