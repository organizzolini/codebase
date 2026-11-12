import type {
  FilterGroupFieldsFragment,
  PresetFieldsFragment,
} from "../../graphql/generated/operations";
import type { EventFilterNode, EventFilterQuery } from "./event-filters.types";
import type { ResolvedPreset } from "./presets.types";

/**
 * Reads a preset the API answered as the calendar's own ReUI filter tree,
 * each node given an id from the preset's.
 */
export function toPreset(preset: PresetFieldsFragment): ResolvedPreset {
  return {
    description: preset.description,
    filter: toGroup(preset.filter, preset.id, "0"),
    id: preset.id,
    name: preset.name,
  };
}

/**
 * Reads an API filter group as a ReUI group: rules first, then nested groups.
 * `position` locates it in the preset.
 */
function toGroup(
  group: FilterGroupFieldsFragment & {
    groups?: null | readonly FilterGroupFieldsFragment[];
  },
  presetId: string,
  position: string,
): EventFilterQuery {
  const nodes: EventFilterNode[] = [];

  // Loops rather than mapping callbacks, which would add a frame beneath every
  // preset's call stack.
  for (const rule of group.rules ?? []) {
    nodes.push({
      id: `${presetId}-${position}-${String(nodes.length)}`,
      ...(rule.negated === true ? { negated: true } : {}),
      operator: rule.operator,
      path: [...rule.path],
      type: "rule",
      value: rule.values ?? [],
    });
  }

  for (const child of group.groups ?? []) {
    nodes.push(toGroup(child, presetId, `${position}-${String(nodes.length)}`));
  }

  return {
    combinator: group.combinator === "OR" ? "or" : "and",
    id: `${presetId}-${position}`,
    rules: nodes,
    type: "group",
  };
}
