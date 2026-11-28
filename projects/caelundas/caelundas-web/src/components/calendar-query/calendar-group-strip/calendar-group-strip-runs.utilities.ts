import { hasGroupRows } from "./calendar-group-strip.utilities";
import { DEFAULT_GROUP_LABEL } from "./components/event-group-model/event-group-fields.constants";
import { listPickedGroups } from "./components/picked-group-chips/picked-group-chips.utilities";

import type { TableGroupsState } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { GroupRun } from "./calendar-group-strip.types";
import type {
  EventGroupField,
  EventGroupLevel,
  GroupNodeOption,
} from "./components/event-group-model/event-groups.types";
import type { ReactNode } from "react";

// 🌎 Public Functions

/**
 * The levels again, from runs.
 */
export function flattenGroupRuns(runs: readonly GroupRun[]): EventGroupLevel[] {
  const levels: EventGroupLevel[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const run of runs) {
    levels.push(...run.levels);
  }

  return levels;
}

/**
 * The symbol that leads a run's chip: the first tag it groups by the children of, else its field's.
 */
export function iconGroupRun(
  run: GroupRun,
  fields: readonly EventGroupField[],
): ReactNode {
  const field = fields.find((candidate) => candidate.id === run.field);

  return findRunNodes(run, field)[0]?.icon ?? field?.icon;
}

/**
 * The name a run's chip shows: the tags it groups by the children of, by their own names, else its field's label.
 */
export function labelGroupRun(
  run: GroupRun,
  fields: readonly EventGroupField[],
): string {
  const field = fields.find((candidate) => candidate.id === run.field);
  const names = findRunNodes(run, field).map((node) => node.name);

  return names.length === 0 ? (field?.label ?? run.field) : names.join(", ");
}

/**
 * The names of the chips the strip draws: the one Tags chip or a name per run, then each group picked in the layout.
 */
export function listGroupChipNames(
  chips: Readonly<{
    fields: readonly EventGroupField[];
    isDefaultGrouping: boolean;
    runs: readonly GroupRun[];
    state: Pick<TableGroupsState, "groupIds" | "picked">;
    view: CalendarViewName;
  }>,
): string[] {
  const names = chips.isDefaultGrouping ? [DEFAULT_GROUP_LABEL] : [];
  const picked = hasGroupRows(chips.view) ? listPickedGroups(chips.state) : [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const run of chips.isDefaultGrouping ? [] : chips.runs) {
    names.push(labelGroupRun(run, chips.fields));
  }

  for (const group of picked) {
    names.push(group.label);
  }

  return names;
}

/**
 * The whole name of a run, for its tooltip: its field's label, then the tags it groups by the children of.
 */
export function pathGroupRun(
  run: GroupRun,
  fields: readonly EventGroupField[],
): string {
  const field = fields.find((candidate) => candidate.id === run.field);
  const label = field?.label ?? run.field;
  const names = findRunNodes(run, field).map((node) => node.name);

  return names.length === 0 ? label : `${label} › ${names.join(", ")}`;
}

/**
 * Gathers a grouping's consecutive levels of one field into runs, in order.
 */
export function toGroupRuns(grouping: readonly EventGroupLevel[]): GroupRun[] {
  const runs: GroupRun[] = [];

  for (const level of grouping) {
    const last = runs.at(-1);

    if (last?.field === level.field) {
      last.levels.push(level);
    } else {
      runs.push({ field: level.field, levels: [level] });
    }
  }

  return runs;
}

/**
 * The grouping's level indexes each run covers, in the runs' order.
 */
export function toRunLevels(runs: readonly GroupRun[]): number[][] {
  const covered: number[][] = [];
  let next = 0;

  for (const run of runs) {
    const indexes: number[] = [];

    for (const _level of run.levels) {
      indexes.push(next);
      next += 1;
    }

    covered.push(indexes);
  }

  return covered;
}

/**
 * The tags a run groups by the children of, in the run's order.
 */
function findRunNodes(
  run: GroupRun,
  field: EventGroupField | undefined,
): GroupNodeOption[] {
  const nodes: GroupNodeOption[] = [];

  for (const level of run.levels) {
    const node = field?.nodes.find(
      (candidate) => candidate.id === level.parent,
    );

    if (node !== undefined) {
      nodes.push(node);
    }
  }

  return nodes;
}
