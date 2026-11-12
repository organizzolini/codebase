import { Injectable } from "@nestjs/common";

import { EventFilterCombinator } from "../filters/event-filter-combinator.entities";
import { TAG_FIELD_PREFIX } from "../filters/event-filter-fields.constants";

import { PRESETS } from "./presets.constants";

import type { EventFacetEntity } from "../event-facet.entities";
import type { EventFilterRuleEntity } from "../filters/event-filter-rule.entities";
import type { EventFilterGroupEntity } from "../filters/event-filter.entities";
import type {
  PresetGroup,
  PresetRule,
  ResolveContext,
  ResolvedPreset,
} from "./presets.types";

/**
 * Resolves the named presets the calendar offers against the tags the data has.
 */
@Injectable()
export class PresetsService {
  /**
   * Resolves a group's rules and nested groups, dropping any with no matching tag.
   */
  private resolveGroup(
    group: PresetGroup,
    context: ResolveContext,
  ): EventFilterGroupEntity | null {
    const groups: EventFilterGroupEntity[] = [];
    const rules: EventFilterRuleEntity[] = [];
    let dropped = false;

    for (const node of group.rules) {
      const next =
        "combinator" in node
          ? this.resolveGroup(node, context)
          : this.resolveRule(node, context.facets);

      if (next === null) {
        dropped = true;
      } else if ("combinator" in next) {
        groups.push(next);
      } else {
        rules.push(next);
      }
    }

    // An "and" with a condition missing would keep more than it was written
    // to, so it is left out whole; an "or" simply offers what is there.
    if (
      groups.length + rules.length === 0 ||
      (dropped && group.combinator === EventFilterCombinator.AND)
    ) {
      return null;
    }

    return { combinator: group.combinator, groups, rules };
  }

  /**
   * Resolves a rule to the data's tags for its paths, or `null` when none match.
   */
  private resolveRule(
    rule: PresetRule,
    facets: readonly EventFacetEntity[],
  ): EventFilterRuleEntity | null {
    let facet: EventFacetEntity | undefined;

    // Loops rather than callbacks, which would add a frame beneath every
    // preset's call stack.
    for (const candidate of facets) {
      if (candidate.name === rule.root) {
        facet = candidate;
        break;
      }
    }

    if (facet === undefined) {
      return null;
    }

    const tagIds: string[] = [];

    for (const value of facet.values) {
      if (rule.paths.includes(value.path)) {
        tagIds.push(value.id);
      }
    }

    if (tagIds.length === 0) {
      return null;
    }

    return {
      negated: false,
      operator: rule.operator,
      path: [`${TAG_FIELD_PREFIX}${facet.id}`],
      values: tagIds,
    };
  }

  /**
   * Resolves presets in menu order, dropping any whose tags the data lacks.
   */
  public resolve(facets: readonly EventFacetEntity[]): ResolvedPreset[] {
    const resolved: ResolvedPreset[] = [];

    // A loop rather than a mapping callback keeps the call stacks shallow.
    for (const preset of PRESETS) {
      const filter = this.resolveGroup(preset.filter, { facets });

      if (filter !== null) {
        resolved.push({
          description: preset.description,
          filter,
          id: preset.id,
          name: preset.name,
        });
      }
    }

    return resolved;
  }
}
