import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In } from "typeorm";
import { z } from "zod";

import { Characteristic } from "@codebase/meanderaw-db";

import { MeanderFilterOperator } from "./meander-filter-rule.entities";
import {
  COMPARISON_SQL,
  MEANDER_FILTER_MAXIMUM_DEPTH,
  meanderFilterGroupSchema,
  SHAPE_FILTER_FIELDS,
} from "./meander-filter.constants";

import type {
  CompiledMeanderFilter,
  MeanderFilterContext as Context,
  MeanderFilterGroup,
  MeanderFilterKind,
  MeanderFilterRule,
} from "./meander-filter.types";
import type { Repository } from "typeorm";

/** Validates the rule tree a query was given and compiles it to SQL. */
@Injectable()
export class MeanderFilterService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(Characteristic)
    private readonly characteristicRepository: Repository<Characteristic>,
  ) {}

  // 🔏 Private Methods

  /** Binds a value under a fresh name and returns the name's placeholder. */
  private bind(context: Context, value: unknown): string {
    const name = `filter${Object.keys(context.parameters).length}`;

    context.parameters[name] = value;

    return `:${name}`;
  }

  /** A boolean field: a shape column, or whether the bridge has a row. */
  private compileBoolean(rule: MeanderFilterRule, context: Context): string {
    const wanted = (rule.operator === MeanderFilterOperator.IS) === rule.flag;
    const characteristic = context.catalog.get(rule.field);

    if (characteristic === undefined) {
      return `"meander"."is_hardcoded" = ${this.bind(context, wanted)}`;
    }

    return `${wanted ? "" : "NOT "}EXISTS ${this.probe(characteristic.id, context, "1")}`;
  }

  /** Joins a group's rules and nested groups under its combinator. */
  private compileGroup(group: MeanderFilterGroup, context: Context): string {
    const parts: string[] = [];

    // Loops rather than callbacks, which would count as one more call-stack frame.
    for (const rule of group.rules) {
      parts.push(this.compileRule(rule, context));
    }

    for (const child of group.groups) {
      parts.push(this.compileGroup(child, context));
    }

    return `(${parts.join(group.combinator === "and" ? " AND " : " OR ")})`;
  }

  /** A number field: a shape column, or a bridge value that reads 0 when missing. */
  private compileNumber(rule: MeanderFilterRule, context: Context): string {
    const { field, numbers, operator } = rule;
    const characteristic = context.catalog.get(field);

    if (
      numbers.length === 0 ||
      (characteristic === undefined &&
        numbers.some((number) => !Number.isInteger(number)))
    ) {
      throw new BadRequestException(
        `Rule on "${field}" needs ${characteristic === undefined ? "whole " : ""}numbers.`,
      );
    }

    const subject =
      characteristic === undefined
        ? `"meander"."${field}"`
        : `COALESCE(${this.probe(characteristic.id, context, `"value"`)}, 0)`;

    if (operator === MeanderFilterOperator.BETWEEN) {
      return `${subject} BETWEEN ${this.bind(context, numbers[0])} AND ${this.bind(context, numbers[1])}`;
    }

    return `${subject} ${COMPARISON_SQL.get(operator)} ${this.bind(context, numbers[0])}`;
  }

  /** The SQL a rule compiles to, refusing an operator its field cannot take. */
  private compileRule(rule: MeanderFilterRule, context: Context): string {
    const { field, operator } = rule;
    const kind = this.kindOf(field, context);
    const isBooleanOperator =
      operator === MeanderFilterOperator.IS ||
      operator === MeanderFilterOperator.IS_NOT;

    if (kind === "boolean" ? !isBooleanOperator : isBooleanOperator) {
      throw new BadRequestException(
        `Cannot use ${operator} on ${kind} field "${field}".`,
      );
    }

    if (kind === "boolean") {
      return this.compileBoolean(rule, context);
    }

    return kind === "text"
      ? this.compileText(rule, context)
      : this.compileNumber(rule, context);
  }

  /** The lattice, compared by eq or ne with a text. */
  private compileText(rule: MeanderFilterRule, context: Context): string {
    const { operator, text } = rule;

    if (
      text === null ||
      (operator !== MeanderFilterOperator.EQ &&
        operator !== MeanderFilterOperator.NE)
    ) {
      throw new BadRequestException(
        `The lattice takes eq or ne with a text, not "${operator}".`,
      );
    }

    return `"meander"."lattice" ${COMPARISON_SQL.get(operator)} ${this.bind(context, text)}`;
  }

  /** What kind of value a rule's field holds, refusing a field that is not filterable. */
  private kindOf(field: string, context: Context): MeanderFilterKind {
    const shapeKind = SHAPE_FILTER_FIELDS.get(field);

    if (shapeKind !== undefined) {
      return shapeKind;
    }

    const characteristic = context.catalog.get(field);

    if (characteristic === undefined) {
      throw new BadRequestException(`Cannot filter by "${field}".`);
    }

    return characteristic.valueType === "boolean" ? "boolean" : "number";
  }

  /** A subquery reading one meander's bridge row for a characteristic. */
  private probe(id: number, context: Context, select: string): string {
    return `(SELECT ${select} FROM "meander_characteristics" WHERE "meander_id" = "meander"."id" AND "characteristic_id" = ${this.bind(context, id)})`;
  }

  /** Every rule and group in the tree, and how deep it nests, without recursing. */
  private survey(root: MeanderFilterGroup): {
    depth: number;
    fields: Set<string>;
  } {
    const fields = new Set<string>();
    let depth = 0;
    let level = [root];

    while (level.length > 0) {
      depth += 1;
      const next: MeanderFilterGroup[] = [];

      for (const group of level) {
        if (group.rules.length === 0 && group.groups.length === 0) {
          throw new BadRequestException(
            "A filter group needs at least one rule or group.",
          );
        }

        for (const rule of group.rules) {
          fields.add(rule.field);
        }

        next.push(...group.groups);
      }

      level = next;
    }

    return { depth, fields };
  }

  // 🌎 Public Methods

  /** Validates a tree and compiles it. A missing characteristic value reads as 0 or false. */
  async compile(filter: unknown): Promise<CompiledMeanderFilter> {
    const parsed = meanderFilterGroupSchema.safeParse(filter);

    if (!parsed.success) {
      throw new BadRequestException(z.prettifyError(parsed.error));
    }

    const { depth, fields } = this.survey(parsed.data);

    if (depth > MEANDER_FILTER_MAXIMUM_DEPTH) {
      throw new BadRequestException(
        `A filter may nest ${MEANDER_FILTER_MAXIMUM_DEPTH} groups deep at most.`,
      );
    }

    const keys = [...fields].filter((field) => !SHAPE_FILTER_FIELDS.has(field));
    const found =
      keys.length === 0
        ? []
        : await this.characteristicRepository.findBy({ key: In(keys) });
    const context: Context = {
      catalog: new Map(found.map((entry) => [entry.key, entry])),
      parameters: {},
    };
    const where = this.compileGroup(parsed.data, context);

    return { parameters: context.parameters, where };
  }
}
