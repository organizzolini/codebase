import { useEffect, useState } from "react";

import {
  BACKDROP_CLASS_NAMES,
  FILTERS_TITLE,
  SURFACE_CLASS_NAMES,
} from "./gallery-filters.constants";
import { describeFiltersButton } from "./gallery-filters.utilities";

import type { FilterSurfaceKind } from "./gallery-filters.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The surface kind, how many filters are active, and what the surface holds.
 */
export interface FilterSurfaceProperties {
  /** How many rules are in force, shown on the button. */
  activeCount: number;
  children?: ReactNode;
  className?: string;
  kind: FilterSurfaceKind;
}

// 🧩 Component

/**
 * Renders the Filters button and, once it is pressed, the builder as a
 * popover, a drawer or a bottom sheet, so it never takes room from the cards.
 */
export function FilterSurface(
  properties: Readonly<FilterSurfaceProperties>,
): ReactNode {
  const { activeCount, children, className, kind } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup

  // 💪 Handlers
  const handleClose = (): void => {
    setIsOpen(false);
  };

  // ♻️ Lifecycle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false);
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);

    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-surface"
    >
      <div className="relative">
        <button
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={describeFiltersButton(activeCount)}
          className="rounded-md border border-(--line) px-3 py-1 text-sm"
          onClick={() => {
            setIsOpen((open) => !open);
          }}
          type="button"
        >
          {FILTERS_TITLE}
          {activeCount > 0 && (
            <span
              aria-hidden="true"
              className="ml-2 rounded-full bg-(--accent) px-2 text-(--accent-ink)"
            >
              {activeCount}
            </span>
          )}
        </button>
        {isOpen && (
          <>
            <button
              aria-label="Close filters"
              className={`fixed inset-0 z-20 cursor-default ${BACKDROP_CLASS_NAMES[kind]}`}
              onClick={handleClose}
              tabIndex={-1}
              type="button"
            />
            <div
              aria-label={FILTERS_TITLE}
              aria-modal={kind !== "popover"}
              className={SURFACE_CLASS_NAMES[kind]}
              data-surface={kind}
              role="dialog"
            >
              {kind !== "popover" && (
                <div className="flex items-center justify-between">
                  <h2 className="text-lg">{FILTERS_TITLE}</h2>
                  <button
                    className="rounded-md border border-(--line) px-3 py-1 text-sm"
                    onClick={handleClose}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              )}
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
