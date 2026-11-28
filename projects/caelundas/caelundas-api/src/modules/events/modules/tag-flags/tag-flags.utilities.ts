import { TAG_FIELD_PREFIX } from "../filtering/modules/query-building/event-filter-fields.constants";

import type { EventFilterRuleEntity } from "../filtering/modules/rules/event-filter-rule.entities";
import type { EventFilterGroupEntity } from "../filtering/modules/rules/event-filter.entities";
import type { EventGroupLevelEntity } from "../grouping/event-group-level.entities";

// 🔏 Private Functions

/**
 * One level without the tags a menu leaves out, or nothing when it names only such tags.
 */
export function keepLevel(
  level: EventGroupLevelEntity | null | undefined,
  blocked: ReadonlySet<string>,
): EventGroupLevelEntity | undefined {
  if (
    level === null ||
    level === undefined ||
    blocked.has(readRoot(level)) ||
    blocked.has(level.parent ?? "")
  ) {
    return undefined;
  }

  if (level.tags === null || level.tags === undefined) {
    return level;
  }

  const tags: string[] = [];

  for (const tag of level.tags) {
    if (!blocked.has(tag)) {
      tags.push(tag);
    }
  }

  return tags.length === 0
    ? undefined
    : {
        ...(level.depth === undefined ? {} : { depth: level.depth }),
        field: level.field,
        ...(level.parent === undefined ? {} : { parent: level.parent }),
        tags,
      };
}

/**
 * The filter without the tags a menu leaves out: a rule left with none of its values is dropped, silently.
 */
export function sanitizeFilter(
  filter: EventFilterGroupEntity | null | undefined,
  blocked: ReadonlySet<string>,
): EventFilterGroupEntity | null | undefined {
  if (filter === null || filter === undefined || blocked.size === 0) {
    return filter;
  }

  const rules: EventFilterRuleEntity[] = [];
  const groups: EventFilterGroupEntity[] = [];

  // Loops rather than callbacks keep the call stacks shallow.
  for (const rule of filter.rules ?? []) {
    const kept = keepRule(rule, blocked);

    if (kept !== undefined) {
      rules.push(kept);
    }
  }

  for (const group of filter.groups ?? []) {
    const kept = sanitizeFilter(group, blocked);

    if (kept !== null && kept !== undefined) {
      groups.push(kept);
    }
  }

  return { combinator: filter.combinator, groups, rules };
}

// 🌎 Public Functions

/**
 * The levels without those that name a tag a menu leaves out: a level left with none of its tags is dropped.
 */
export function sanitizeLevels(
  levels: null | readonly EventGroupLevelEntity[] | undefined,
  blocked: ReadonlySet<string>,
): EventGroupLevelEntity[] | null | undefined {
  if (levels === null || levels === undefined) {
    return levels;
  }

  const kept: EventGroupLevelEntity[] = [];

  for (const level of levels) {
    const next = keepLevel(level, blocked);

    if (next !== undefined) {
      kept.push(next);
    }
  }

  return kept;
}

/**
 * A tag rule without the tags a menu leaves out, or nothing when it had values and none are left.
 */
function keepRule(
  rule: EventFilterRuleEntity,
  blocked: ReadonlySet<string>,
): EventFilterRuleEntity | undefined {
  const values = rule.values ?? [];

  if (
    !rule.path.join(".").startsWith(TAG_FIELD_PREFIX) ||
    values.length === 0
  ) {
    return rule;
  }

  const kept: string[] = [];

  for (const value of values) {
    if (!blocked.has(value)) {
      kept.push(value);
    }
  }

  return kept.length === 0
    ? undefined
    : {
        ...(rule.negated === undefined ? {} : { negated: rule.negated }),
        operator: rule.operator,
        path: rule.path,
        values: kept,
      };
}

/**
 * The tag a level names that is a root: the one its field holds, or none for a calendar field.
 */
function readRoot(level: EventGroupLevelEntity): string {
  return level.field.startsWith(TAG_FIELD_PREFIX)
    ? level.field.slice(TAG_FIELD_PREFIX.length)
    : "";
}
