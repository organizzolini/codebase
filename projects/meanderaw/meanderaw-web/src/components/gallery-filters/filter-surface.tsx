import { useEffect, useState } from "react";

import {
  BACKDROP_CLASS_NAMES,
  FILTERS_TITLE,
  SURFACE_CLASS_NAMES,
} from "./gallery-filters.constants";
import {
  describeFiltersButton,
  listFocusable,
  trapTab,
} from "./gallery-filters.utilities";

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
  const [dialog, setDialog] = useState<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);

  // 🏗 Setup

  // 💪 Handlers
  const handleClose = (): void => {
    setIsOpen(false);
  };

  // ♻️ Lifecycle
  // Opening moves focus in, and closing gives it back to the button. Escape
  // and Tab are read on the surface, so a closed one never hears them, and
  // Escape in a select is left to it, which uses it to close its list.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.key === "Escape" &&
        !(event.target instanceof HTMLSelectElement)
      ) {
        setIsOpen(false);
      } else if (
        event.key === "Tab" &&
        dialog?.matches('[aria-modal="true"]') === true
      ) {
        trapTab(event, dialog);
      }
    };

    dialog?.addEventListener("keydown", handleKeyDown);
    (dialog === null
      ? undefined
      : (listFocusable(dialog).at(0) ?? dialog)
    )?.focus();

    return () => {
      dialog?.removeEventListener("keydown", handleKeyDown);

      if (dialog !== null) {
        trigger?.focus();
      }
    };
  }, [dialog, trigger]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-surface"
    >
      <div className="relative">
        <button
          ref={setTrigger}
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
              ref={setDialog}
              aria-label={FILTERS_TITLE}
              aria-modal={kind !== "popover"}
              className={SURFACE_CLASS_NAMES[kind]}
              data-surface={kind}
              role="dialog"
              tabIndex={-1}
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
