import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  CharacteristicPairCount,
  CharacteristicShapeCount,
  CharacteristicValueCount,
  ShapeCount,
} from "@codebase/meanderaw-db";

import { MeanderFilterPlanService } from "../filters/meander-filter-plan.service";
import { MeanderFilterOperator } from "../filters/meander-filter-rule.entities";

import { AGGREGATE_SHAPE_FIELDS } from "./meander-aggregate.constants";

import type { MeanderFilterRule } from "../filters/meander-filter.types";
import type {
  AggregateFilter,
  AggregateScope,
  AggregateShape,
  ValueTotals,
} from "./meander-aggregate.types";
import type { Repository } from "typeorm";

/**
 * Answers counts from the aggregate tables when they cover a request, and
 * says so with `null` when they do not. Every answer is exact: a 0 or false
 * bucket is the total minus the stored rows, never a guess.
 */
@Injectable()
export class MeanderAggregateService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(ShapeCount)
    private readonly shapeCountRepository: Repository<ShapeCount>,
    @InjectRepository(CharacteristicValueCount)
    private readonly valueCountRepository: Repository<CharacteristicValueCount>,
    @InjectRepository(CharacteristicShapeCount)
    private readonly shapeValueRepository: Repository<CharacteristicShapeCount>,
    @InjectRepository(CharacteristicPairCount)
    private readonly pairCountRepository: Repository<CharacteristicPairCount>,
    @Inject(MeanderFilterPlanService)
    private readonly planService: MeanderFilterPlanService,
  ) {}

  // 🔏 Private Methods

  /** The stored value counts and the total they fall short of, for no filter. */
  private async allValues(
    id: number,
    shapes: readonly ShapeCount[],
  ): Promise<ValueTotals> {
    const stored = new Map<number, number>();

    for (const row of await this.valueCountRepository.findBy({
      characteristicId: id,
    })) {
      stored.set(row.value, row.meanderCount);
    }

    return { stored, total: this.sum(shapes) };
  }

  /** Reads which tables can answer a filter: none, shape rules, or one characteristic rule. */
  private classify(filter: AggregateFilter): AggregateScope | null {
    if (filter === null) {
      return { kind: "all" };
    }

    const { catalog, tree } = filter;
    const [first, ...others] = tree.rules;

    if (
      tree.groups.length > 0 ||
      first === undefined ||
      (tree.combinator === "or" && others.length > 0)
    ) {
      return null;
    }

    if (tree.rules.every((rule) => AGGREGATE_SHAPE_FIELDS.has(rule.field))) {
      return { kind: "shape", rules: tree.rules };
    }

    const characteristic = catalog.get(first.field);

    return others.length === 0 && characteristic !== undefined
      ? { characteristic, kind: "characteristic", rule: first }
      : null;
  }

  /** Whether a scope is one pattern: a boolean characteristic held, not absent. */
  private isPattern(scope: AggregateScope): boolean {
    return (
      scope.kind === "characteristic" &&
      scope.characteristic.valueType === "boolean" &&
      this.planService.holds(scope.rule, 1) &&
      !this.planService.holds(scope.rule, 0)
    );
  }

  /** The stored value counts among the meanders holding one pattern. */
  private async patternValues(held: number, id: number): Promise<ValueTotals> {
    const stored = new Map<number, number>();
    let total = 0;

    for (const row of await this.pairCountRepository.findBy({
      characteristicId: held,
      otherCharacteristicId: id,
    })) {
      stored.set(
        row.otherValue,
        (stored.get(row.otherValue) ?? 0) + row.meanderCount,
      );
    }

    for (const row of await this.valueCountRepository.findBy({
      characteristicId: held,
    })) {
      total += row.meanderCount;
    }

    return { stored, total };
  }

  /** Whether a shape satisfies a rule on rows, columns or lattice. */
  private shapeHolds(rule: MeanderFilterRule, shape: AggregateShape): boolean {
    if (rule.field === "lattice") {
      return (
        (rule.operator === MeanderFilterOperator.EQ) ===
        (shape.lattice === rule.text)
      );
    }

    return this.planService.holds(
      rule,
      rule.field === "rows" ? shape.rows : shape.columns,
    );
  }

  /** Whether a shape satisfies a scope's shape rules; every shape does without any. */
  private shapeKept(scope: AggregateScope, shape: AggregateShape): boolean {
    return (
      scope.kind !== "shape" ||
      scope.rules.every((rule) => this.shapeHolds(rule, shape))
    );
  }

  /** The stored value counts among the meanders of the shapes a scope keeps. */
  private async shapeValues(
    scope: AggregateScope,
    id: number,
    shapes: readonly ShapeCount[],
  ): Promise<ValueTotals> {
    const stored = new Map<number, number>();

    for (const row of await this.shapeValueRepository.findBy({
      characteristicId: id,
    })) {
      if (this.shapeKept(scope, row)) {
        stored.set(row.value, (stored.get(row.value) ?? 0) + row.meanderCount);
      }
    }

    return {
      stored,
      total: this.sum(shapes.filter((row) => this.shapeKept(scope, row))),
    };
  }

  /** The meanders in a list of counted shapes. */
  private sum(rows: readonly ShapeCount[]): number {
    return rows.reduce((total, row) => total + row.meanderCount, 0);
  }

  /** The 0 or false bucket and the stored rows, as one list of counts. */
  private withZeroBucket(
    stored: ReadonlyMap<number, number>,
    total: number,
  ): Map<number, number> {
    const buckets = new Map(stored);
    const zero = total - [...stored.values()].reduce((sum, n) => sum + n, 0);

    if (zero > 0) {
      buckets.set(0, zero);
    }

    return buckets;
  }

  // 🌎 Public Methods

  /**
   * The count of each shape key (`rowsColumns` or `lattice`) among the
   * meanders a filter keeps; null when no table covers it.
   */
  async shapeCounts(
    filter: AggregateFilter,
    field: "lattice" | "rowsColumns",
  ): Promise<Map<string, number> | null> {
    const scope = this.classify(filter);
    const shapes = await this.shapeCountRepository.find();

    if (
      scope === null ||
      scope.kind === "characteristic" ||
      shapes.length === 0
    ) {
      return null;
    }

    const counts = new Map<string, number>();

    for (const row of shapes) {
      if (this.shapeKept(scope, row)) {
        const key =
          field === "lattice" ? row.lattice : `${row.rows}x${row.columns}`;

        counts.set(key, (counts.get(key) ?? 0) + row.meanderCount);
      }
    }

    return counts;
  }

  /**
   * How many meanders a filter keeps; null when no table covers it. A 0 or
   * false bucket is the total minus the stored rows.
   */
  async total(filter: AggregateFilter): Promise<null | number> {
    const scope = this.classify(filter);
    const shapes = await this.shapeCountRepository.find();

    if (scope === null || shapes.length === 0) {
      return null;
    }

    const everything = shapes.reduce((sum, row) => sum + row.meanderCount, 0);

    if (scope.kind !== "characteristic") {
      return shapes
        .filter((row) => this.shapeKept(scope, row))
        .reduce((sum, row) => sum + row.meanderCount, 0);
    }

    const { characteristic, rule } = scope;
    const counts = await this.valueCountRepository.findBy({
      characteristicId: characteristic.id,
    });
    let kept = 0;
    let stored = 0;

    for (const row of counts) {
      stored += row.meanderCount;
      kept += this.planService.holds(rule, row.value) ? row.meanderCount : 0;
    }

    return this.planService.holds(rule, 0) ? kept + everything - stored : kept;
  }

  /**
   * Each value's count among the meanders a filter keeps, the 0 or false
   * bucket included; null when no table covers it.
   */
  async valueCounts(
    filter: AggregateFilter,
    characteristic: { id: number },
  ): Promise<Map<number, number> | null> {
    const scope = this.classify(filter);
    const shapes = await this.shapeCountRepository.find();

    if (scope === null || shapes.length === 0) {
      return null;
    }

    if (scope.kind === "characteristic") {
      if (!this.isPattern(scope)) {
        return null;
      }

      const { stored, total } = await this.patternValues(
        scope.characteristic.id,
        characteristic.id,
      );

      return this.withZeroBucket(stored, total);
    }

    const { stored, total } =
      scope.kind === "all"
        ? await this.allValues(characteristic.id, shapes)
        : await this.shapeValues(scope, characteristic.id, shapes);

    return this.withZeroBucket(stored, total);
  }
}
