import { useState } from "react";

import { OpenDatePickerContext } from "../calendar-date-picker/calendar-date-picker.constants";
import { CalendarNavigationGroup } from "../calendar-navigation-group/calendar-navigation-group";
import { CalendarNavigationSlot } from "../calendar-navigation-group/calendar-navigation-slot.constants";

import { hasContent } from "./calendar-toolbar.utilities";

import type {
  CalendarDatePickerBinding,
  CalendarNavigation,
} from "../calendar-navigation-group/calendar-navigation-group.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The toolbar's navigation, plus the controls it shows.
 */
export interface CalendarToolbarProperties {
  className?: string;
  /**
   * Narrows the row for a phone, with the date above the controls.
   */
  compact?: boolean | undefined;
  /**
   * What the title's date picker needs; the title is plain text when absent.
   */
  datePicker?:
    | Omit<CalendarDatePickerBinding, "onOpenChange" | "open">
    | undefined;
  /**
   * Drawn on one line: the Layout, Display, View, Group and Sort strips, then Filter
   * with the date selector and the filters' chips.
   */
  filters?: ReactNode;
  navigation: CalendarNavigation;
}

// 🧩 Component

/** Renders the toolbar's controls on one line, wrapping when cramped; a phone's date selector takes its own row. */
export function CalendarToolbar(
  properties: Readonly<CalendarToolbarProperties>,
): ReactNode {
  const { className, compact, datePicker, filters, navigation } = properties;

  // 🪝 Hooks

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // 🏗 Setup
  const hasFilters = hasContent(filters);
  const picker =
    datePicker === undefined
      ? undefined
      : { ...datePicker, onOpenChange: setIsPickerOpen, open: isPickerOpen };

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  // A button presses down a pixel when it is clicked, which in a row of
  // buttons that change what is shown reads as a bounce; the buttons here stay
  // put, the way the menu buttons, which are exempt from it, already do.
  return (
    <div
      className={className}
      data-testid="calendar-toolbar"
    >
      <OpenDatePickerContext
        value={
          picker === undefined
            ? null
            : () => {
                setIsPickerOpen(true);
              }
        }
      >
        {compact ? (
          <div className="flex min-w-0 items-start gap-2 px-2 py-2 [&_[data-slot=button]]:active:translate-y-0!">
            <div className="min-w-0 grow">
              <CalendarNavigationGroup
                navigation={navigation}
                picker={picker}
                compact
              />
            </div>
          </div>
        ) : (
          <div
            className="flex min-w-0 flex-wrap items-start gap-2 px-2 py-2 [&_[data-slot=button]]:active:translate-y-0!"
            data-testid="calendar-toolbar-row"
          >
            <CalendarNavigationSlot
              value={
                hasFilters ? (
                  <CalendarNavigationGroup
                    className="contents"
                    navigation={navigation}
                    picker={picker}
                  />
                ) : null
              }
            >
              {filters}
            </CalendarNavigationSlot>
            {hasFilters ? null : (
              <CalendarNavigationGroup
                navigation={navigation}
                picker={picker}
              />
            )}
          </div>
        )}
        {compact && hasFilters ? (
          // A phone's row has no room beside the title for the controls, so
          // they take a row under it, wrapping onto more rows if they outgrow it.
          <div
            className="flex min-w-0 flex-wrap items-center gap-2 px-2 pb-2 [&_[data-slot=button]]:active:translate-y-0!"
            data-testid="calendar-toolbar-controls"
          >
            {filters}
          </div>
        ) : null}
      </OpenDatePickerContext>
    </div>
  );
}
