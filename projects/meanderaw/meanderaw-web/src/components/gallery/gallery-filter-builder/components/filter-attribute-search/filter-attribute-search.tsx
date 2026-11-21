import { useEffect, useId, useState } from "react";

import { searchFields } from "../../filter-search.utilities";
import { FIELD_SEARCH_LIMIT } from "../../gallery-filter-builder.constants";
import { FilterAttributeOption } from "../filter-attribute-option/filter-attribute-option";

import type { FilterField } from "../../gallery-filter-builder.types";
import type { KeyboardEvent, ReactNode } from "react";

// 🔖 Type

/**
 * The attributes to search, and what to do with the one picked.
 */
export interface FilterAttributeSearchProperties {
  className?: string;
  fields: readonly FilterField[];
  onSelect: (field: FilterField) => void;
}

// 🧩 Component

/**
 * Renders a search over the attributes by category, bounded, picked by click or arrows and Enter.
 */
export function FilterAttributeSearch(
  properties: Readonly<FilterAttributeSearchProperties>,
): ReactNode {
  const { className, fields, onSelect } = properties;

  // 🪝 Hooks
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // 🏗 Setup
  const { groups, total } = searchFields(fields, query);
  const options = groups.flatMap((group) => group.fields);
  const shown = options.length;

  // 💪 Handlers
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (shown === 0) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive(
        (current) =>
          (current + (event.key === "ArrowDown" ? 1 : shown - 1)) % shown,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();

      const field = options[active];

      if (field !== undefined) {
        onSelect(field);
      }
    }
  };

  // ♻️ Lifecycle
  // The active option stays in view as the arrow keys move through the list.
  useEffect(() => {
    globalThis.document
      .querySelector(`[id="${listId}-${String(active)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, listId, shown]);

  // 🏁 Early Returns

  // 🎨 Markup
  let position = -1;

  return (
    <div
      className={className}
      data-testid="filter-attribute-search"
    >
      <div className="flex flex-col gap-2">
        <input
          aria-activedescendant={
            shown === 0 ? undefined : `${listId}-${String(active)}`
          }
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded="true"
          aria-label="Search attributes"
          autoComplete="off"
          className="rounded-md border border-(--line) bg-(--surface-raised) px-3 py-2 text-sm"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search attributes…"
          role="combobox"
          value={query}
        />
        <div
          aria-label="Attributes"
          className="flex max-h-72 flex-col gap-1 overflow-y-auto"
          id={listId}
          role="listbox"
        >
          {groups.map((group) => (
            <div
              key={group.category}
              aria-label={group.category}
              role="group"
            >
              <p className="px-2 pt-1 text-xs tracking-wide text-(--ink-muted) uppercase">
                {group.category}
              </p>
              {group.fields.map((field) => {
                const index = (position += 1);

                return (
                  <FilterAttributeOption
                    key={field.key}
                    field={field}
                    id={`${listId}-${String(index)}`}
                    isActive={index === active}
                    onActivate={() => {
                      setActive(index);
                    }}
                    onSelect={() => {
                      onSelect(field);
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {shown === 0 && (
          <p className="px-2 text-sm text-(--ink-muted)">
            No attributes match.
          </p>
        )}
        {total > FIELD_SEARCH_LIMIT && (
          <p className="px-2 text-xs text-(--ink-muted)">
            Showing {FIELD_SEARCH_LIMIT} of {total.toLocaleString("en-US")}:
            refine your search.
          </p>
        )}
      </div>
    </div>
  );
}
