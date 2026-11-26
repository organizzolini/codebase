import { ListTree } from "lucide-react";
import { use, useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useStripLines } from "../../../hooks/use-strip-lines/use-strip-lines";
import { BUTTON_STRIP_CLASS_NAME } from "../../../hooks/use-strip-lines/use-strip-lines.constants";
import { TableGroupsContext } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { QueryCascader } from "../query-cascader/query-cascader";

import {
  isOfferedRow,
  toRowValues,
  toTaggedIds,
} from "./calendar-group-strip-items.utilities";
import {
  listGroupChipNames,
  toGroupRuns,
  toRunLevels,
} from "./calendar-group-strip-runs.utilities";
import { TITLE } from "./calendar-group-strip.constants";
import {
  createGroupItems,
  getGroupHint,
  toGroupingChange,
  toGroupValue,
} from "./calendar-group-strip.utilities";
import { ALL_TAGS_FIELD } from "./components/event-group-model/event-group-fields.constants";
import {
  createEventGroupFields,
  getDefaultGrouping,
  getRootGrouping,
} from "./components/event-group-model/event-group-fields.utilities";
import { GroupRunChips } from "./components/group-run-chips/group-run-chips";
import { PickedGroupChips } from "./components/picked-group-chips/picked-group-chips";
import { StripFoldSection } from "./components/strip-fold-button/strip-fold-section";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";
import type { StripFold } from "./components/strip-fold-button/strip-fold-button.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's facets, the grouping shown, and the change handler.
 */
export interface CalendarGroupStripProperties {
  className?: string;
  facets: readonly EventFacet[];
  /** How the strip folds; it does not when absent. */
  fold?: StripFold | undefined;
  grouping: readonly EventGroupLevel[];
  /** Whether the link names no grouping, so one "Tags" chip, which stays, stands for every root. */
  isDefaultGrouping?: boolean | undefined;
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Group button, opening a searchable list to group by, joined to one chip per level. */
export function CalendarGroupStrip(
  properties: Readonly<CalendarGroupStripProperties>,
): ReactNode {
  const {
    className,
    facets,
    fold,
    grouping: linked,
    isDefaultGrouping = false,
    onGroupingChange,
    view,
  } = properties;

  // 🪝 Hooks
  const { reference } = useStripLines();
  const { state } = use(TableGroupsContext);
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  // The default's menu ticks every tag root, so a change edits that list; its chip opens the levels it draws.
  const { defaultLevels, grouping } = useMemo(
    () => ({
      defaultLevels: [...getDefaultGrouping(fields).keys()],
      grouping: isDefaultGrouping ? getRootGrouping(fields) : linked,
    }),
    [fields, isDefaultGrouping, linked],
  );

  // 🏗 Setup
  const items = useMemo(() => createGroupItems(fields), [fields]);
  const rowValues = useMemo(
    () => toRowValues(toGroupValue(grouping, isDefaultGrouping), fields),
    [fields, grouping, isDefaultGrouping],
  );
  const { runLevels, runs } = useMemo(() => {
    const grouped = toGroupRuns(grouping);

    return { runLevels: toRunLevels(grouped), runs: grouped };
  }, [grouping]);

  const names = useMemo(
    () => listGroupChipNames({ fields, isDefaultGrouping, runs, state, view }),
    [fields, isDefaultGrouping, runs, state, view],
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  const hint = getGroupHint(view);

  return (
    <div
      className={className}
      data-testid="calendar-group-strip"
    >
      <ButtonGroup
        ref={reference}
        aria-label={TITLE}
        className={BUTTON_STRIP_CLASS_NAME}
        data-strip-buttons=""
        title={hint}
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                title={hint}
                variant="outline"
              >
                <ListTree aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Group by"
            className="w-80 max-w-[90vw] p-0"
          >
            <QueryCascader
              cascade={false}
              defaultExpanded={[ALL_TAGS_FIELD]}
              items={items}
              mode="tree"
              onValueChange={(next) => {
                onGroupingChange(
                  toGroupingChange(toTaggedIds(next, rowValues), {
                    fields,
                    grouping,
                    isDefaultGrouping,
                  }),
                );
              }}
              placeholder="Group by"
              selectable={isOfferedRow}
              value={rowValues}
              multiple
            />
          </PopoverContent>
        </Popover>
        <StripFoldSection
          fold={fold}
          names={names}
          title={TITLE}
        >
          <GroupRunChips
            defaultLevels={defaultLevels}
            fields={fields}
            isDefaultGrouping={isDefaultGrouping}
            onGroupingChange={onGroupingChange}
            runLevels={runLevels}
            runs={runs}
            view={view}
          />
          <PickedGroupChips view={view} />
        </StripFoldSection>
      </ButtonGroup>
    </div>
  );
}
