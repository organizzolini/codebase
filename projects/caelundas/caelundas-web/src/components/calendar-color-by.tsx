import { useMemo, useState } from "react";

import { createColorScheme } from "../utilities/calendar-color-schemes.utilities";
import {
  createEventGroupFields,
  toGroupLevel,
} from "../utilities/event-group-fields.utilities";

import { TITLE } from "./calendar-color-by.constants";
import { GroupLevelRow } from "./group-level-row";

import type { EventGroupLevel } from "../types/event-groups.types";
import type { EventFacet } from "../types/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tag roots the data has, what the events are colored by, and where to
 * send another.
 */
export interface CalendarColorByProperties {
  className?: string;
  /**
   * What the events are colored by; the type, kind by kind, when absent.
   */
  colorBy: EventGroupLevel | undefined;
  facets: readonly EventFacet[];
  /**
   * Called with the level picked, or `undefined` for the default.
   */
  onColorByChange: (level: EventGroupLevel | undefined) => void;
}

// 🧩 Component

/**
 * Renders what the events are colored by, picked the way a grouping's level
 * is: any field the events can be filtered or grouped by, and for a tag root
 * the tags, or the depth of its tree, that each get a color, beside the
 * colors and what each stands for. The type is the default, drawn kind by
 * kind. The View menu holds it in its Color by submenu.
 */
export function CalendarColorBy(
  properties: Readonly<CalendarColorByProperties>,
): ReactNode {
  const { className, colorBy, facets, onColorByChange } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup
  const typeField = fields.find(
    (field) => field.label === "Type" && field.options.length > 0,
  );
  const level =
    colorBy ?? (typeField === undefined ? undefined : toGroupLevel(typeField));
  const scheme = createColorScheme(colorBy, fields, 0);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-color-by"
    >
      <div className="flex w-80 max-w-[90vw] flex-col gap-2 p-1">
        <h2 className="text-sm font-semibold">{TITLE}</h2>
        {level === undefined ? null : (
          <GroupLevelRow
            fields={fields}
            isOpen={isOpen}
            level={level}
            name="Color"
            onChange={(next) => {
              // Picking the type with all of its tags is the default.
              const isDefault =
                next?.field === typeField?.id &&
                (next?.tags ?? []).length === 0;

              onColorByChange(next === null || isDefault ? undefined : next);
            }}
            onOpenChange={setIsOpen}
            removable={false}
            valueLabel={colorBy === undefined ? "By kind" : undefined}
          />
        )}
        <ul
          aria-label="Colors"
          className="flex max-h-60 flex-col gap-1 overflow-y-auto text-sm"
        >
          {scheme.legend.map((entry) => (
            <li
              key={entry.key}
              className="flex items-center gap-2"
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="truncate">{entry.label}</span>
            </li>
          ))}
        </ul>
        {scheme.legend.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Each value gets a color of its own.
          </p>
        ) : null}
      </div>
    </div>
  );
}
