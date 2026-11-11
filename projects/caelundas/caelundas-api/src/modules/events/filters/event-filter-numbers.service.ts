import { Inject, Injectable } from "@nestjs/common";

import {
  CALENDAR_FIELD_IDS,
  COMPARISONS,
  NUMBER_OPERATORS,
} from "./event-filter-fields.constants";
import { EventFilterParametersService } from "./event-filter-parameters.service";
import {
  CALENDAR_FIELD_SQL,
  EVENT_TAG_NUMBERS_SQL,
  TAG_NUMBER_SQL,
} from "./event-filter-sql.constants";
import { EventFilterValuesService } from "./event-filter-values.service";

import type {
  EventFilterParameters,
  EventFilterRule,
  NumberCondition,
} from "./event-filter.types";

// A rule's compiler reads its operands and builds its condition as two
// siblings rather than one calling the other, which would add a frame to
// every filter's call stack.

/**
 * Compiles the numeric rules of a filter: a comparison or a range over the
 * hour, the duration in minutes, or the number a tag is named for.
 */
@Injectable()
export class EventFilterNumbersService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(EventFilterParametersService)
    private readonly parametersService: EventFilterParametersService,
    @Inject(EventFilterValuesService)
    private readonly valuesService: EventFilterValuesService,
  ) {}

  /**
   * Compiles a numeric rule on the hour or the duration in minutes.
   */
  public compileCalendarNumberRule(
    rule: EventFilterRule,
    fieldId: string,
    parameters: EventFilterParameters,
  ): null | string {
    const expression =
      fieldId === CALENDAR_FIELD_IDS.hour
        ? CALENDAR_FIELD_SQL.hour
        : CALENDAR_FIELD_SQL.durationMinutes;
    const condition = this.compileNumberCondition(expression, rule, parameters);

    if (condition === null) {
      return null;
    }

    return condition.negated ? `(not ${condition.sql})` : condition.sql;
  }

  /**
   * Compiles a numeric comparison over a SQL expression. Answers `null` for
   * unusable operands.
   */
  public compileNumberCondition(
    expression: string,
    rule: EventFilterRule,
    parameters: EventFilterParameters,
  ): null | NumberCondition {
    const { operator } = rule;
    const operands = this.isRangeOperator(operator)
      ? this.valuesService.readNumberRange(rule.values)
      : this.valuesService.readSingleNumber(rule.values);
    const comparison = Object.hasOwn(COMPARISONS, operator)
      ? COMPARISONS[operator]
      : undefined;
    const negated =
      operator === NUMBER_OPERATORS.neq ||
      operator === NUMBER_OPERATORS.notBetween;

    if (operands === null) {
      return null;
    }

    if (operands.length === 2) {
      const from = this.parametersService.bind(parameters, String(operands[0]));
      const to = this.parametersService.bind(parameters, String(operands[1]));

      return {
        negated,
        sql: `(${expression} between ${from}::numeric and ${to}::numeric)`,
      };
    }

    if (comparison === undefined) {
      return null;
    }

    const operand = this.parametersService.bind(
      parameters,
      String(operands[0]),
    );

    return {
      negated,
      sql: `(${expression} ${comparison} ${operand}::numeric)`,
    };
  }

  /**
   * Compiles a numeric rule on a number-named tag root: events with a tag beneath it meeting the comparison; `neq` and not-between invert it.
   */
  public compileTagNumberRule(
    rootId: string,
    rule: EventFilterRule,
    parameters: EventFilterParameters,
  ): null | string {
    const condition = this.compileNumberCondition(
      TAG_NUMBER_SQL,
      rule,
      parameters,
    );

    if (condition === null) {
      return null;
    }

    const root = this.parametersService.bind(parameters, rootId);
    const exists = `exists (${EVENT_TAG_NUMBERS_SQL.replace("{root}", () => root).replace("{condition}", () => condition.sql)})`;

    return condition.negated ? `(not ${exists})` : `(${exists})`;
  }

  /**
   * Whether a rule on a derived field compares a number: any numeric operator on duration, a comparison but not a range on the hour.
   */
  public isCalendarNumberRule(fieldId: string, operator: string): boolean {
    if (fieldId === CALENDAR_FIELD_IDS.durationMinutes) {
      return this.isNumberOperator(operator);
    }

    return (
      fieldId === CALENDAR_FIELD_IDS.hour &&
      Object.hasOwn(COMPARISONS, operator)
    );
  }

  /**
   * Whether an operator compares a number rather than picking from a list.
   */
  public isNumberOperator(operator: string): boolean {
    return (
      Object.hasOwn(COMPARISONS, operator) || this.isRangeOperator(operator)
    );
  }

  /**
   * Whether an operator compares a number with a range of two.
   */
  public isRangeOperator(operator: string): boolean {
    return (
      operator === NUMBER_OPERATORS.between ||
      operator === NUMBER_OPERATORS.notBetween
    );
  }
}
