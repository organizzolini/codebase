import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In } from "typeorm";

import { CharacteristicValueCount } from "@codebase/meanderaw-db";

import { MeanderFilterOperator } from "./meander-filter-rule.entities";

import type {
  MeanderFilterGroup,
  MeanderFilterRule,
} from "./meander-filter.types";
import type { Characteristic } from "@codebase/meanderaw-db";
import type { Repository } from "typeorm";

/** Picks the rule a flat AND filter should start from, using the per-value counts. */
@Injectable()
export class MeanderFilterPlanService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(CharacteristicValueCount)
    private readonly valueCountRepository: Repository<CharacteristicValueCount>,
  ) {}

  // 🔏 Private Methods

  /** How many meanders a rule keeps among those holding the characteristic. */
  private estimate(
    rule: MeanderFilterRule,
    id: number | undefined,
    counts: readonly CharacteristicValueCount[],
  ): number {
    let estimate = 0;

    for (const row of counts) {
      if (row.characteristicId === id && this.holds(rule, row.value)) {
        estimate += row.meanderCount;
      }
    }

    return estimate;
  }

  /** Whether a rule holds when its field has this value; 0 stands for a missing row. */
  private holds(rule: MeanderFilterRule, value: number): boolean {
    const [first = 0, second = 0] = rule.numbers;

    switch (rule.operator) {
      case MeanderFilterOperator.BETWEEN: {
        return value >= first && value <= second;
      }
      case MeanderFilterOperator.EQ: {
        return value === first;
      }
      case MeanderFilterOperator.GT: {
        return value > first;
      }
      case MeanderFilterOperator.GTE: {
        return value >= first;
      }
      case MeanderFilterOperator.IS: {
        return value > 0 === rule.flag;
      }
      case MeanderFilterOperator.IS_NOT: {
        return value > 0 !== rule.flag;
      }
      case MeanderFilterOperator.LT: {
        return value < first;
      }
      case MeanderFilterOperator.LTE: {
        return value <= first;
      }
      case MeanderFilterOperator.NE: {
        break;
      }
    }

    return value !== first;
  }

  // 🌎 Public Methods

  /**
   * The qualifying rule that keeps the fewest meanders; null for a tree that
   * is not a flat AND. The rest are probed through the primary key.
   */
  async chooseDriver(
    group: MeanderFilterGroup,
    catalog: ReadonlyMap<string, Characteristic>,
  ): Promise<MeanderFilterRule | null> {
    if (group.combinator !== "and" || group.groups.length > 0) {
      return null;
    }

    const candidates = group.rules.filter(
      (rule) => catalog.has(rule.field) && !this.holds(rule, 0),
    );
    const ids = candidates.map((rule) => catalog.get(rule.field)?.id ?? 0);

    if (candidates.length === 0) {
      return null;
    }

    const counts = await this.valueCountRepository.findBy({
      characteristicId: In(ids),
    });
    let driver: MeanderFilterRule | null = null;
    let fewest = Number.POSITIVE_INFINITY;

    for (const rule of candidates) {
      const estimate = this.estimate(rule, catalog.get(rule.field)?.id, counts);

      if (estimate < fewest) {
        driver = rule;
        fewest = estimate;
      }
    }

    return driver;
  }
}
