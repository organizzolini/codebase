import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In } from "typeorm";
import { z } from "zod";

import {
  Characteristic,
  Meander,
  MeanderCharacteristic,
} from "@codebase/meanderaw-db";

import { MeanderAggregateService } from "../meanders/modules/aggregates/meander-aggregate.service";
import { MeanderFilterService } from "../meanders/modules/filters/meander-filter.service";

import {
  groupByArgumentsSchema,
  KEY_ORDER,
  SHAPE_GROUP_FIELDS,
} from "./meander-groups.constants";

import type { CompiledMeanderFilter } from "../meanders/modules/filters/meander-filter.types";
import type { MeanderGroupEntity } from "./meander-groups.entities";
import type {
  GroupCount,
  GroupLevel,
  ShapeGroupField,
} from "./meander-groups.types";
import type { Repository } from "typeorm";

/** Counts the meanders a filter keeps, grouped, exactly. */
@Injectable()
export class MeanderGroupsService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(Characteristic)
    private readonly characteristicRepository: Repository<Characteristic>,
    @InjectRepository(Meander)
    private readonly meanderRepository: Repository<Meander>,
    @Inject(MeanderFilterService)
    private readonly filterService: MeanderFilterService,
    @Inject(MeanderAggregateService)
    private readonly aggregateService: MeanderAggregateService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Counts from the meanders themselves, one row per distinct key path. */
  private async computed(
    filter: CompiledMeanderFilter | null,
    levels: readonly GroupLevel[],
  ): Promise<{ count: number; keys: string[] }[]> {
    const query = this.meanderRepository
      .createQueryBuilder("meander")
      .select("COUNT(*)", "total");

    for (const [index, level] of levels.entries()) {
      const alias = `bridge${index}`;
      let expression = `meander.${level.kind === "shape" ? "isHardcoded" : "id"}`;

      if (level.kind === "characteristic") {
        query.leftJoin(
          MeanderCharacteristic,
          alias,
          `${alias}.characteristicId = :level${index} AND ${alias}.meanderId = meander.id`,
          { [`level${index}`]: level.id },
        );
        expression = level.isBoolean
          ? `COALESCE(${alias}.value, 0) > 0`
          : `COALESCE(${alias}.value, 0)`;
      } else if (level.field === "lattice") {
        expression = "meander.lattice";
      } else if (level.field === "rowsColumns") {
        expression = "CONCAT(meander.rows, 'x', meander.columns)";
      }

      query.addSelect(expression, `key${index}`).addGroupBy(`key${index}`);
    }

    if (filter !== null) {
      query.where(filter.where, filter.parameters);
    }

    const rows = await query.getRawMany<Record<string, unknown>>();

    return rows.map((row) => ({
      count: Number(row["total"]),
      keys: levels.map((_, index) => String(row[`key${index}`])),
    }));
  }

  /** Counts a single level from the aggregate tables; null when they do not cover it. */
  private async fromTables(
    filter: CompiledMeanderFilter | null,
    level: GroupLevel,
  ): Promise<GroupCount[] | null> {
    if (level.kind === "characteristic") {
      const counts = await this.aggregateService.valueCounts(filter, level);

      return counts === null
        ? null
        : [...counts].map(([value, count]) => ({
            count,
            value: level.isBoolean ? String(value > 0) : String(value),
          }));
    }

    if (level.field === "isHardcoded") {
      return null;
    }

    const counts = await this.aggregateService.shapeCounts(filter, level.field);

    return counts === null
      ? null
      : [...counts].map(([value, count]) => ({ count, value }));
  }

  /** Nests key paths into groups, counts summed up the levels, keys in natural order. */
  private nest(
    rows: readonly { count: number; keys: readonly string[] }[],
    fields: readonly string[],
  ): MeanderGroupEntity[] {
    const roots: MeanderGroupEntity[] = [];
    const nodes = new Map<string, MeanderGroupEntity>();

    for (const row of rows) {
      let branch = roots;
      let path = "";

      for (const [depth, value] of row.keys.entries()) {
        path += `\u0000${value}`;

        const node = nodes.get(path) ?? {
          count: 0,
          field: fields[depth] ?? "",
          groups: [],
          value,
        };

        if (!nodes.has(path)) {
          nodes.set(path, node);
          branch.push(node);
        }

        node.count += row.count;
        branch = node.groups;
      }
    }

    return this.ordered(roots, nodes);
  }

  /** Sorts every list of groups by key, in place. */
  private ordered(
    roots: MeanderGroupEntity[],
    nodes: ReadonlyMap<string, MeanderGroupEntity>,
  ): MeanderGroupEntity[] {
    for (const list of [roots, ...[...nodes.values()].map((n) => n.groups)]) {
      list.sort((left, right) => KEY_ORDER.compare(left.value, right.value));
    }

    return roots;
  }

  /** Reads what each level names, refusing a field that is neither shape nor characteristic. */
  private async resolveLevels(
    fields: readonly string[],
  ): Promise<GroupLevel[]> {
    const keys = fields.filter((field) => !this.shapeField(field));
    const found =
      keys.length === 0
        ? []
        : await this.characteristicRepository.findBy({ key: In(keys) });
    const catalog = new Map(found.map((entry) => [entry.key, entry]));

    return fields.map((field): GroupLevel => {
      const characteristic = catalog.get(field);

      if (characteristic !== undefined) {
        return {
          field,
          id: characteristic.id,
          isBoolean: characteristic.valueType === "boolean",
          kind: "characteristic",
        };
      }

      const shape = this.shapeField(field);

      if (shape === undefined) {
        throw new BadRequestException(`Cannot group by "${field}".`);
      }

      return { field: shape, kind: "shape" };
    });
  }

  /** The shape field a level names, if it names one. */
  private shapeField(field: string): ShapeGroupField | undefined {
    return SHAPE_GROUP_FIELDS.find((candidate) => candidate === field);
  }

  // 🌎 Public Methods

  /**
   * The groups of a filter's meanders, nested by level, exactly: a lone
   * level the tables cover is read from them, the rest counted.
   */
  async group(arguments_: {
    filter?: unknown;
    groupBy: readonly { field: string }[];
  }): Promise<MeanderGroupEntity[]> {
    const parsed = groupByArgumentsSchema.safeParse(arguments_.groupBy);

    if (!parsed.success) {
      throw new BadRequestException(z.prettifyError(parsed.error));
    }

    const fields = parsed.data.map(({ field }) => field);
    const levels = await this.resolveLevels(fields);
    const filter =
      arguments_.filter === null || arguments_.filter === undefined
        ? null
        : await this.filterService.compile(arguments_.filter);
    const [only] = levels;
    const stored =
      levels.length === 1 && only !== undefined
        ? await this.fromTables(filter, only)
        : null;
    const rows =
      stored?.map(({ count, value }) => ({ count, keys: [value] })) ??
      (await this.computed(filter, levels));

    return this.nest(rows, fields);
  }
}
