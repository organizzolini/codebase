import { useMemo, useState } from "react";

import { Button } from "@codebase/presentation";

import { TITLE } from "./calendar-group-by.constants";
import {
  createEventGroupFields,
  toGroupLevel,
} from "./event-group-fields.utilities";
import { MAXIMUM_GROUP_LEVELS } from "./event-groups.constants";
import { GroupLevelRow } from "./group-level-row";

import type { EventFacet } from "../events-calendar/calendar-records.types";
import type { EventGroupLevel } from "./event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's facets, the grouping shown, and the change handler.
 */
export interface CalendarGroupByProperties {
  className?: string;
  facets: readonly EventFacet[];
  grouping: readonly EventGroupLevel[];
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
}

// 🧩 Component

/**
 * Renders the grouping's levels, each a field and what to group it by; a tag root opens its tag tree.
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
