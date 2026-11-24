import type { GroupRun } from "./calendar-group-strip.types";
import type {
  EventGroupField,
  EventGroupLevel,
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
 * The symbol that leads a run's chip: its field's, a tag root's glyph or icon or a derived field's icon.
 */
export function iconGroupRun(
  run: GroupRun,
  fields: readonly EventGroupField[],
): ReactNode {
  return fields.find((candidate) => candidate.id === run.field)?.icon;
}

/**
 * The name a run's chip shows: its field's label, then the tags it groups by the children of, the root's own being implied.
 */
export function labelGroupRun(
  run: GroupRun,
  fields: readonly EventGroupField[],
): string {
  const field = fields.find((candidate) => candidate.id === run.field);
  const label = field?.label ?? run.field;
  const names: string[] = [];

  for (const level of run.levels) {
    const node = field?.nodes.find(
      (candidate) => candidate.id === level.parent,
    );

    if (node !== undefined) {
      names.push(node.name);
    }
  }

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
