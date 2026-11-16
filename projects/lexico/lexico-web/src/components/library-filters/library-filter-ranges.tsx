import { Input } from "@codebase/presentation";

import { LIBRARY_RANGE_FILTERS } from "./library-filters.constants";

import type { LibraryFilterDraft } from "./library-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the LibraryFilterRanges component.
 */
export interface LibraryFilterRangesProperties {
  className?: string;
  draft: LibraryFilterDraft;
  onText: (key: string, value: string) => void;
}

// 🧩 Component

/**
 * The filters with a minimum and a maximum: years, print year, and counts.
 */
export function LibraryFilterRanges(
  properties: Readonly<LibraryFilterRangesProperties>,
): ReactNode {
  const { className, draft, onText } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-filter-ranges"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIBRARY_RANGE_FILTERS.map((filter) => (
          <fieldset
            key={filter.key}
            className="space-y-1"
          >
            <legend className="text-sm font-medium">{filter.label}</legend>
            <div className="flex gap-2">
              {(["Minimum", "Maximum"] as const).map((end) => (
                <Input
                  key={end}
                  aria-label={`${filter.label} ${end.toLowerCase()}`}
                  inputMode="numeric"
                  onChange={(event) => {
                    onText(`${filter.key}${end}`, event.target.value);
                  }}
                  placeholder={end === "Minimum" ? "From" : "To"}
                  type="number"
                  value={draft.text[`${filter.key}${end}`] ?? ""}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
