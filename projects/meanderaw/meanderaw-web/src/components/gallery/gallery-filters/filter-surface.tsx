import { useEffect, useState } from "react";

import { FILTERS_TITLE, POPUP_CLASS_NAME } from "./gallery-filters.constants";
import {
  describeFiltersButton,
  listFocusable,
} from "./gallery-filters.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Whether it is open, how to change that, and what it holds.
 */
export interface FilterSurfaceProperties {
  /** How many rules are in force, shown on the button. */
  activeCount: number;
  children?: ReactNode;
  className?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// 🧩 Component

/**
 * Renders the Filter button and, once it is pressed, a small popup beneath
 * it holding the add-a-filter steps, at every width.
 */
export function FilterSurface(
  properties: Readonly<FilterSurfaceProperties>,
): ReactNode {
  const { activeCount, children, className, isOpen, onOpenChange } = properties;

  // 🪝 Hooks
  const [dialog, setDialog] = useState<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  // Opening moves focus in, and closing gives it back to the button. Escape
  // is read on the popup, so a closed one never hears it, and Escape in a
  // select is left to it, which uses it to close its list.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.key === "Escape" &&
        !(event.target instanceof HTMLSelectElement)
      ) {
        onOpenChange(false);
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
  }, [dialog, onOpenChange, trigger]);

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
            onOpenChange(!isOpen);
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
              className="fixed inset-0 z-20 cursor-default bg-transparent"
              onClick={() => {
                onOpenChange(false);
              }}
              tabIndex={-1}
              type="button"
            />
            <div
              ref={setDialog}
              aria-label={FILTERS_TITLE}
              className={POPUP_CLASS_NAME}
              role="dialog"
              tabIndex={-1}
            >
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
