import { useState } from "react";

import { Button, cn } from "@codebase/presentation";

import { LibraryFilterChoices } from "./library-filter-choices";
import { LibraryFilterRanges } from "./library-filter-ranges";
import { draftErrors, fromDraft, toDraft } from "./library-filters.utilities";

import type { LibraryFilterParameters } from "../library-grid/library-grid.types";
import type { ReactNode, SubmitEvent } from "react";

// 🔖 Type

/**
 * Properties for the LibraryFilters component.
 */
export interface LibraryFiltersProperties {
  className?: string;
  filters: LibraryFilterParameters;
  onApply: (filters: LibraryFilterParameters) => void;
  onReset: () => void;
}

// 🧩 Component

/**
 * The library's filter form. It collapses behind a button on a phone, and the
 * route keys it by the filters it shows, so a change of URL refills it.
 */
export function LibraryFilters(
  properties: Readonly<LibraryFiltersProperties>,
): ReactNode {
  const { className, filters, onApply, onReset } = properties;

  // 🪝 Hooks
  const [draft, setDraft] = useState(() => toDraft(filters));
  const [errors, setErrors] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup

  // 💪 Handlers
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const found = draftErrors(draft);
    setErrors(found);
    if (found.length === 0) {
      onApply(fromDraft(draft));
    }
  };
  const handleText = (key: string, value: string): void => {
    setDraft((previous) => ({
      ...previous,
      text: { ...previous.text, [key]: value },
    }));
  };
  const handleTick = (key: string, value: string, isTicked: boolean): void => {
    setDraft((previous) => ({
      ...previous,
      selected: {
        ...previous.selected,
        [key]: [
          ...(previous.selected[key] ?? []).filter((item) => item !== value),
          ...(isTicked ? [value] : []),
        ],
      },
    }));
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-filters"
    >
      <Button
        aria-controls="library-filter-panel"
        aria-expanded={isOpen}
        className="md:hidden"
        onClick={() => {
          setIsOpen((previous) => !previous);
        }}
        type="button"
        variant="outline"
      >
        Filters
      </Button>
      <form
        aria-label="Library filters"
        className={cn("mt-4 space-y-4 md:mt-0 md:block", {
          hidden: !isOpen,
        })}
        id="library-filter-panel"
        onSubmit={handleSubmit}
      >
        <LibraryFilterChoices
          className="space-y-4"
          draft={draft}
          onText={handleText}
          onTick={handleTick}
        />
        <LibraryFilterRanges
          draft={draft}
          onText={handleText}
        />
        {errors.length === 0 ? null : (
          <ul
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Button type="submit">Apply filters</Button>
          <Button
            onClick={() => {
              setErrors([]);
              onReset();
            }}
            type="button"
            variant="ghost"
          >
            Reset filters
          </Button>
        </div>
      </form>
    </div>
  );
}
