import { useMemo, useState } from "react";

import { Button } from "@codebase/presentation";

import { MAXIMUM_GROUP_LEVELS } from "../constants/event-groups.constants";
import {
  createEventGroupFields,
  toGroupLevel,
} from "../utilities/event-group-fields.utilities";

import { TITLE } from "./calendar-group-by.constants";
import { GroupLevelRow } from "./group-level-row";

import type { EventGroupLevel } from "../types/event-groups.types";
import type { EventFacet } from "../types/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tag roots the data has, the grouping shown, and where to send a
 * changed one.
 */
export interface CalendarGroupByProperties {
  className?: string;
  facets: readonly EventFacet[];
  grouping: readonly EventGroupLevel[];
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
}

// 🧩 Component

/**
 * Renders the list of the grouping's levels, each shaped like a filter: a
 * field, the same ones the filter offers, and what to group it by. A tag
 * root opens the filter's own tag tree to pick groups from, so several tags
 * are one pick; with none picked it groups by the root's first level. A
 * sub-group is added beneath the last level and any level removed. The View
 * menu holds it in its Group by submenu.
 */
export function CalendarGroupBy(
  properties: Readonly<CalendarGroupByProperties>,
): ReactNode {
  const { className, facets, grouping, onGroupingChange } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const [openField, setOpenField] = useState<string>();

  // 🏗 Setup
  const unused = fields.filter(
    (field) => !grouping.some((level) => level.field === field.id),
  );
  const [nextField] = unused;

  // 💪 Handlers
  const replaceLevel = (index: number, level: EventGroupLevel | null): void => {
    onGroupingChange(
      grouping.flatMap((current, position) => {
        if (position !== index) {
          return [current];
        }

        return level === null ? [] : [level];
      }),
    );
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-group-by"
    >
      <div className="flex w-80 max-w-[90vw] flex-col gap-2 p-1">
        <h2 className="text-sm font-semibold">{TITLE}</h2>
        {grouping.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not grouped</p>
        ) : null}
        {grouping.map((level, index) => (
          <GroupLevelRow
            key={level.field}
            fields={fields.filter(
              (option) => option.id === level.field || unused.includes(option),
            )}
            isOpen={openField === level.field}
            level={level}
            name={`Group ${String(index + 1)}`}
            onChange={(next) => {
              replaceLevel(index, next);
            }}
            onOpenChange={(open) => {
              setOpenField(open ? level.field : undefined);
            }}
          />
        ))}
        {grouping.length < MAXIMUM_GROUP_LEVELS && nextField !== undefined ? (
          <Button
            className="self-start"
            onClick={() => {
              onGroupingChange([...grouping, toGroupLevel(nextField)]);
            }}
            size="sm"
            variant="ghost"
          >
            {grouping.length === 0 ? "Add group" : "Add sub-group"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
