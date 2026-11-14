import { Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import {
  AggregateMarker,
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
import type { EntityManager } from "typeorm";

/**
 * Answers counts from the aggregate tables when they cover a request and are
 * current, and with `null` when not. Each read is one snapshot that first
 * finds the marker, so a count never mixes tables or newer meanders.
 */
@Injectable()
export class MeanderAggregateService {
  // 🏗 Dependency Injection

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(MeanderFilterPlanService)
    private readonly planService: MeanderFilterPlanService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The stored value counts and the total they fall short of, for no filter. */
  private async allValues(
    manager: EntityManager,
    id: number,
    shapes: readonly ShapeCount[],
  ): Promise<ValueTotals> {
    const stored = new Map<number, number>();

    for (const row of await manager.findBy(CharacteristicValueCount, {
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
  private async patternValues(
    manager: EntityManager,
    held: number,
    id: number,
  ): Promise<ValueTotals> {
    const stored = new Map<number, number>();

    for (const row of await manager.findBy(CharacteristicPairCount, {
      characteristicId: held,
      otherCharacteristicId: id,
    })) {
      stored.set(
        row.otherValue,
        (stored.get(row.otherValue) ?? 0) + row.meanderCount,
      );
    }

    const heldCounts = await manager.findBy(CharacteristicValueCount, {
      characteristicId: held,
    });

    return {
      stored,
      total: heldCounts.reduce((total, row) => total + row.meanderCount, 0),
    };
  }

  /** Whether a shape satisfies a rule; the lattice takes only eq or ne, so non-eq reads as ne. */
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
    manager: EntityManager,
    request: {
      id: number;
      scope: AggregateScope;
      shapes: readonly ShapeCount[];
    },
  ): Promise<ValueTotals> {
    const { id, scope, shapes } = request;
    const stored = new Map<number, number>();

    for (const row of await manager.findBy(CharacteristicShapeCount, {
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

  /** Runs `work` in one snapshot once the marker agrees with the shapes; else null. */
  private async snapshot<T>(
    work: (
      manager: EntityManager,
      shapes: readonly ShapeCount[],
    ) => Promise<T> | T,
  ): Promise<null | T> {
    return this.dataSource.transaction("REPEATABLE READ", async (manager) => {
      const marker = await manager.findOneBy(AggregateMarker, { id: 1 });
      const shapes = await manager.getRepository(ShapeCount).find();

      return marker === null ||
        shapes.length === 0 ||
        marker.meanderCount !== this.sum(shapes)
        ? null
        : work(manager, shapes);
    });
  }

  /** The meanders in a list of counted shapes. */
  private sum(rows: readonly ShapeCount[]): number {
    return rows.reduce((total, row) => total + row.meanderCount, 0);
  }

  /** The stored rows plus the 0 bucket; null when they exceed the total. */
  private withZeroBucket(
    stored: ReadonlyMap<number, number>,
    total: number,
  ): Map<number, number> | null {
    const buckets = new Map(stored);
    const zero = total - [...stored.values()].reduce((sum, n) => sum + n, 0);

    if (zero < 0) {
      return null;
    }

    if (zero > 0) {
      buckets.set(0, (stored.get(0) ?? 0) + zero);
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

    if (scope === null || scope.kind === "characteristic") {
      return null;
    }

    return this.snapshot((_manager, shapes) => {
      const counts = new Map<string, number>();

      for (const row of shapes.filter((shape) =>
        this.shapeKept(scope, shape),
      )) {
        const key =
          field === "lattice" ? row.lattice : `${row.rows}x${row.columns}`;

        counts.set(key, (counts.get(key) ?? 0) + row.meanderCount);
      }

      return counts;
    });
  }

  /**
   * How many meanders a filter keeps; null when no table covers it. A 0 or
   * false bucket is the total minus the stored rows.
   */
  async total(filter: AggregateFilter): Promise<null | number> {
    const scope = this.classify(filter);

    if (scope === null) {
      return null;
    }

    return this.snapshot(async (manager, shapes) => {
      if (scope.kind !== "characteristic") {
        return this.sum(shapes.filter((row) => this.shapeKept(scope, row)));
      }

      const { characteristic, rule } = scope;
      const counts = await manager.findBy(CharacteristicValueCount, {
        characteristicId: characteristic.id,
      });
      const stored = counts.reduce((sum, row) => sum + row.meanderCount, 0);
      const kept = counts
        .filter((row) => this.planService.holds(rule, row.value))
        .reduce((sum, row) => sum + row.meanderCount, 0);
      const missing = this.sum(shapes) - stored;

      if (missing < 0) {
        return null;
      }

      return this.planService.holds(rule, 0) ? kept + missing : kept;
    });
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

    if (
      scope === null ||
      (scope.kind === "characteristic" && !this.isPattern(scope))
    ) {
      return null;
    }

    return this.snapshot(async (manager, shapes) => {
      let totals: ValueTotals;

      if (scope.kind === "characteristic") {
        totals = await this.patternValues(
          manager,
          scope.characteristic.id,
          characteristic.id,
        );
      } else if (scope.kind === "all") {
        totals = await this.allValues(manager, characteristic.id, shapes);
      } else {
        totals = await this.shapeValues(manager, {
          id: characteristic.id,
          scope,
          shapes,
        });
      }

      return this.withZeroBucket(totals.stored, totals.total);
    });
  }
}
