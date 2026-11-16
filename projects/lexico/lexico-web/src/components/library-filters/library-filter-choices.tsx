import { Input, Label } from "@codebase/presentation";

import {
  LIBRARY_CHECKBOX_FILTERS,
  LIBRARY_LIST_FILTERS,
} from "./library-filters.constants";

import type { LibraryFilterDraft } from "./library-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryFilterChoices component.
 */
export interface LibraryFilterChoicesProperties {
  className?: string;
  draft: LibraryFilterDraft;
  onText: (key: string, value: string) => void;
  onTick: (key: string, value: string, isTicked: boolean) => void;
}

// 🧩 Component

/**
 * The filters that pick values: a ticked list of eras,
 * and typed lists of provinces, inscription types, and materials.
 */
export function LibraryFilterChoices(
  properties: Readonly<LibraryFilterChoicesProperties>,
): ReactNode {
  const { className, draft, onText, onTick } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-filter-choices"
    >
      {LIBRARY_CHECKBOX_FILTERS.map((filter) => (
        <fieldset
          key={filter.key}
          className="flex flex-wrap gap-x-4 gap-y-1"
        >
          <legend className="mb-1 text-sm font-medium">{filter.label}</legend>
          {filter.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                checked={(draft.selected[filter.key] ?? []).includes(
                  option.value,
                )}
                onChange={(event) => {
                  onTick(filter.key, option.value, event.target.checked);
                }}
                type="checkbox"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      ))}
      <div className="grid gap-4 sm:grid-cols-3">
        {LIBRARY_LIST_FILTERS.map((filter) => (
          <div
            key={filter.key}
            className="space-y-1"
          >
            <Label htmlFor={`library-filter-${filter.key}`}>
              {filter.label}
            </Label>
            <Input
              id={`library-filter-${filter.key}`}
              onChange={(event) => {
                onText(filter.key, event.target.value);
              }}
              placeholder="Comma-separated"
              value={draft.text[filter.key] ?? ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
