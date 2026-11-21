import { MAXIMUM_GROUP_LEVELS } from "./gallery-group-by.constants";

import type { GroupField } from "./gallery-group-by.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields, the grouping in force, and how to change it.
 */
export interface GalleryGroupByProperties {
  className?: string;
  fields: readonly GroupField[];
  /** The field of each level, outermost first. */
  grouping: readonly string[];
  onGroupingChange: (grouping: string[]) => void;
}

// 🧩 Component

/**
 * Renders each level as a field picker and a remove button, and a button
 * that adds a level.
 */
export function GalleryGroupBy(
  properties: Readonly<GalleryGroupByProperties>,
): ReactNode {
  const { className, fields, grouping, onGroupingChange } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const unused = fields.filter(({ key }) => !grouping.includes(key));
  const [nextField] = unused;

  // 💪 Handlers
  const replaceLevel = (index: number, key?: string): void => {
    onGroupingChange(
      grouping.flatMap((current, position) => {
        if (position !== index) {
          return [current];
        }

        return key === undefined ? [] : [key];
      }),
    );
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-group-by"
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {grouping.length === 0 ? (
          <span className="text-(--ink-muted)">Not grouped</span>
        ) : null}
        {grouping.map((key, index) => (
          <div
            key={key}
            className="flex items-center gap-1"
          >
            <label className="flex items-center gap-2">
              {index === 0 ? "Group by" : "Then by"}
              <select
                aria-label={`Group ${String(index + 1)} by`}
                className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
                onChange={(event) => {
                  replaceLevel(index, event.target.value);
                }}
                value={key}
              >
                {fields
                  .filter(
                    (field) => field.key === key || unused.includes(field),
                  )
                  .map((field) => (
                    <option
                      key={field.key}
                      value={field.key}
                    >
                      {field.label}
                    </option>
                  ))}
              </select>
            </label>
            <button
              aria-label={`Remove group ${String(index + 1)}`}
              className="rounded-md border border-(--line) px-2 py-1"
              onClick={() => {
                replaceLevel(index);
              }}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
        {grouping.length < MAXIMUM_GROUP_LEVELS && nextField !== undefined ? (
          <button
            className="rounded-md border border-(--line) px-3 py-1"
            onClick={() => {
              onGroupingChange([...grouping, nextField.key]);
            }}
            type="button"
          >
            {grouping.length === 0 ? "Group cards" : "Add sub-group"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
