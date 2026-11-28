import { Inject, Injectable } from "@nestjs/common";

import { eventFilterGroupSchema } from "./event-filter.constants";
import { EventFilterCalendarFieldsService } from "./modules/query-building/event-filter-calendar-fields.service";
import {
  TAG_FIELD_PREFIX,
  TAG_OPERATOR_NAMES,
  TAG_OPERATORS,
} from "./modules/query-building/event-filter-fields.constants";
import { EventFilterParametersService } from "./modules/query-building/event-filter-parameters.service";
import { EVENT_TAGS_MATCHING_SQL } from "./modules/query-building/event-filter-sql.constants";
import { EventFilterNumbersService } from "./modules/values/event-filter-numbers.service";
import { UUID_PATTERN } from "./modules/values/event-filter-values.constants";
import { EventFilterValuesService } from "./modules/values/event-filter-values.service";

import type {
  CompiledEventFilter,
  EventFilterGroup,
  EventFilterParameters,
  EventFilterRule,
} from "./event-filter.types";

/**
 * Validates the filter a query was given and compiles it to SQL.
 */
@Injectable()
export class EventFilterService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventFilterCalendarFieldsService)
    private readonly calendarFieldsService: EventFilterCalendarFieldsService,
    @Inject(EventFilterNumbersService)
    private readonly numbersService: EventFilterNumbersService,
    @Inject(EventFilterParametersService)
    private readonly parametersService: EventFilterParametersService,
    @Inject(EventFilterValuesService)
    private readonly valuesService: EventFilterValuesService,
  ) {}

  /**
   * Joins a group's compiled parts under its combinator; `null` when empty.
   */
  private compileGroup(
    group: EventFilterGroup,
    parameters: EventFilterParameters,
  ): null | string {
    const parts: string[] = [];

    // Loops rather than mapping callbacks, which would count as one more
    // frame on every nested group's call stack.
    for (const rule of group.rules) {
      const part = this.compileRule(rule, parameters);

      if (part !== null) {
        parts.push(part);
      }
    }

    for (const child of group.groups) {
      const part = this.compileGroup(child, parameters);

      if (part !== null) {
        parts.push(part);
      }
    }

    return parts.length === 0
      ? null
      : `(${parts.join(` ${group.combinator} `)})`;
  }

  /**
   * Compiles one rule by its field, flipping it when the rule is negated.
   */
  private compileRule(
    rule: EventFilterRule,
    parameters: EventFilterParameters,
  ): null | string {
    const fieldId = rule.path.join(".");
    let compiled: null | string;

    // A rule that compares a number reads it straight away; any other picks
    // from a list, so each kind compiles through its own function.
    if (fieldId.startsWith(TAG_FIELD_PREFIX)) {
      compiled = this.numbersService.isNumberOperator(rule.operator)
        ? this.numbersService.compileTagNumberRule(
            fieldId.slice(TAG_FIELD_PREFIX.length),
            rule,
            parameters,
          )
        : this.compileTagRule(
            rule.operator,
            this.valuesService.readTexts(rule.values),
            parameters,
          );
    } else {
      compiled = this.numbersService.isCalendarNumberRule(
        fieldId,
        rule.operator,
      )
        ? this.numbersService.compileCalendarNumberRule(
            rule,
            fieldId,
            parameters,
          )
        : this.calendarFieldsService.compileCalendarRule(rule, parameters);
    }

    return compiled === null || !rule.negated ? compiled : `(not ${compiled})`;
  }

  /**
   * Compiles a tag rule. Picked tags also match their descendants; non-UUIDs
   * match nothing.
   */
  private compileTagRule(
    operator: string,
    tagIds: readonly string[],
    parameters: EventFilterParameters,
  ): null | string {
    if (tagIds.length === 0 || !TAG_OPERATOR_NAMES.includes(operator)) {
      return null;
    }

    const known: string[] = [];

    for (const tagId of tagIds) {
      if (UUID_PATTERN.test(tagId)) {
        known.push(tagId);
      }
    }

    const matching = (
      parameters.tagsMatching ?? EVENT_TAGS_MATCHING_SQL
    ).replace("{tags}", () => this.parametersService.bind(parameters, known));

    if (operator === TAG_OPERATORS.hasAllOf) {
      const count = this.parametersService.bind(parameters, tagIds.length);

      return `((select count(distinct m.tag_id) from (${matching}) m) = ${count}::integer)`;
    }

    return operator === TAG_OPERATORS.isAnyOf
      ? `(exists (${matching}))`
      : `(not exists (${matching}))`;
  }

  /**
   * Compiles the filter tree to boolean SQL after `offset`, reading tags from
   * `tagsMatching` if given. Unfinished rules drop; an empty tree is `null`.
   */
  public compile(
    filter: EventFilterGroup | null | undefined,
    offset: number,
    tagsMatching?: string,
  ): CompiledEventFilter | null {
    if (filter === null || filter === undefined) {
      return null;
    }

    const parameters: EventFilterParameters = {
      offset,
      tagsMatching,
      values: [],
    };
    const sql = this.compileGroup(filter, parameters);

    return sql === null ? null : { parameters: parameters.values, sql };
  }

  /**
   * Validates a query's filter: `null` for none, a `ZodError` for a
   * malformed one.
   */
  public parse(filter: unknown): EventFilterGroup | null {
    return filter === null || filter === undefined
      ? null
      : eventFilterGroupSchema.parse(filter);
  }
}
