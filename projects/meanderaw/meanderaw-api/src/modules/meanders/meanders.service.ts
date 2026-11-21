import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In } from "typeorm";

import { CodeService, DrawingService } from "@codebase/meanderaw-core";
import {
  Characteristic,
  Meander,
  MeanderCharacteristic,
} from "@codebase/meanderaw-db";

import {
  cursorSchema,
  DEFAULT_SVG_REPEATS,
  MAXIMUM_SVG_REPEATS,
  meandersArgumentsSchema,
  NO_FILTER,
  SHAPE_SORT_FIELDS,
  svgRepeatsSchema,
} from "./meanders.constants";
import { MeanderAggregateService } from "./modules/aggregates/meander-aggregate.service";
import { MeanderFilterService } from "./modules/filters/meander-filter.service";
import {
  createConnection,
  createEdge,
  fromCursor,
  toCursor,
} from "./modules/pagination/meanderaw-api.utilities";
import { SortDirection } from "./modules/sorting/sort-direction.entities";

import type { MeanderConnection } from "./meander-connection.entities";
import type { MeanderEntity } from "./meanders.entities";
import type {
  Cursor,
  MeandersArguments,
  SortOrder,
  SortTarget,
  SortValue,
} from "./meanders.types";
import type { MeanderCharacteristicValueEntity } from "./modules/characteristics/meander-characteristic-value.entities";
import type { CompiledMeanderFilter } from "./modules/filters/meander-filter.types";
import type { MeanderSortInput } from "./modules/sorting/meander-sort.entities";
import type { Repository, SelectQueryBuilder } from "typeorm";

/** Pages through the meanders, filtered by a rule tree and sorted by any shape field or characteristic. */
@Injectable()
export class MeandersService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(Meander)
    private readonly meanderRepository: Repository<Meander>,
    @InjectRepository(Characteristic)
    private readonly characteristicRepository: Repository<Characteristic>,
    @InjectRepository(MeanderCharacteristic)
    private readonly bridgeRepository: Repository<MeanderCharacteristic>,
    @Inject(MeanderAggregateService)
    private readonly aggregateService: MeanderAggregateService,
    @Inject(MeanderFilterService)
    private readonly filterService: MeanderFilterService,
    @Inject(CodeService) private readonly codeService: CodeService,
    @Inject(DrawingService) private readonly drawingService: DrawingService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Keeps the rows past a cursor in the first sort's order. */
  private applyCursor(
    query: SelectQueryBuilder<Meander>,
    cursor: Cursor | null,
    first: { expression: string | undefined; order: SortOrder | undefined },
  ): void {
    const { expression, order } = first;

    if (cursor === null || order === undefined || expression === undefined) {
      return;
    }

    const beyond = order.direction === SortDirection.DESC ? "<" : ">";

    query.andWhere(
      this.isCode(order.target)
        ? `meander.code ${beyond} :cursorCode`
        : `(${expression} ${beyond} :cursorValue OR (${expression} = :cursorValue AND meander.code > :cursorCode))`,
      { cursorCode: cursor.code, cursorValue: cursor.value },
    );
  }

  /** The query for the rows after a cursor, in the sorts' order, then Code order. */
  private buildQuery(arguments_: {
    cursor: Cursor | null;
    filter: CompiledMeanderFilter | null;
    orders: readonly SortOrder[];
  }): SelectQueryBuilder<Meander> {
    const { cursor, filter, orders } = arguments_;
    const query = this.meanderRepository.createQueryBuilder("meander");
    const expressions: string[] = [];

    for (const [index, { target }] of orders.entries()) {
      expressions.push(this.joinSort(query, index, target));
    }

    this.applyCursor(query, cursor, {
      expression: expressions[0],
      order: orders[0],
    });

    if (filter !== null) {
      query.andWhere(filter.where, filter.parameters);
    }

    for (const [index, order] of orders.entries()) {
      const column = expressions[index] ?? "meander.code";

      if (index === 0) {
        query.orderBy(column, order.direction);
      } else {
        query.addOrderBy(column, order.direction);
      }
    }

    return orders.some(({ target }) => this.isCode(target))
      ? query
      : query.addOrderBy("meander.code", "ASC");
  }

  /** Every meander the filter keeps, counted exactly: from the aggregate tables when they cover it, else from the meanders. */
  private async count(filter: CompiledMeanderFilter | null): Promise<number> {
    const aggregated = await this.aggregateService.total(filter);

    if (aggregated !== null) {
      return aggregated;
    }

    const query = this.meanderRepository
      .createQueryBuilder("meander")
      .select("COUNT(*)", "total");

    if (filter !== null) {
      query.where(filter.where, filter.parameters);
    }

    const row = await query.getRawOne<{ total: string }>();

    return Number(row?.total ?? 0);
  }

  /** Reads a cursor, refusing one this API did not issue or one issued for another sort. */
  private decodeCursor(
    after: null | string | undefined,
    sort: { direction: SortDirection; field: string; filter: string },
  ): Cursor | null {
    if (after === null || after === undefined) {
      return null;
    }

    let cursor: Cursor;

    try {
      cursor = fromCursor(after, (value) => cursorSchema.parse(value));
    } catch {
      throw new BadRequestException("The cursor is not valid.");
    }

    if (cursor.field !== sort.field || cursor.direction !== sort.direction) {
      throw new BadRequestException(
        "The cursor was issued for a different sort.",
      );
    }

    if (cursor.filter !== sort.filter) {
      throw new BadRequestException(
        "The cursor was issued for a different filter.",
      );
    }

    return cursor;
  }

  /** Whether the sort orders by the Code itself, which no tie can follow. */
  private isCode(target: SortTarget): boolean {
    return target.kind === "shape" && target.column === "code";
  }

  /** The SQL a sort target orders by, joining its bridge when it needs one. */
  private joinSort(
    query: SelectQueryBuilder<Meander>,
    index: number,
    target: SortOrder["target"],
  ): string {
    if (target.kind === "shape") {
      return `meander.${target.column}`;
    }

    const expression = `COALESCE(bridge${index}.value, 0)`;

    query
      .leftJoin(
        MeanderCharacteristic,
        `bridge${index}`,
        `bridge${index}.characteristicId = :characteristicId${index} AND bridge${index}.meanderId = meander.id`,
        { [`characteristicId${index}`]: target.characteristicId },
      )
      .addSelect(expression, `sort_value${index}`);

    return expression;
  }

  /** The orders the sorts name, or Code order alone when none is named. */
  private async resolveOrders(
    sorts: readonly MeanderSortInput[],
  ): Promise<SortOrder[]> {
    const orders: SortOrder[] = [];

    for (const entry of sorts) {
      orders.push({
        direction: entry.direction,
        target: await this.resolveTarget(entry),
      });
    }

    return orders.length === 0
      ? [
          {
            direction: SortDirection.ASC,
            target: { column: "code", kind: "shape" },
          },
        ]
      : orders;
  }

  /** Reads what the sort names, refusing a field that is neither shape nor characteristic. */
  private async resolveTarget(sort: MeanderSortInput): Promise<SortTarget> {
    const column = SHAPE_SORT_FIELDS.find((field) => field === sort.field);

    if (column !== undefined) {
      return { column, kind: "shape" };
    }

    const characteristic = await this.characteristicRepository.findOneBy({
      key: sort.field,
    });

    if (characteristic === null) {
      throw new BadRequestException(`Cannot sort by "${sort.field}".`);
    }

    return { characteristicId: characteristic.id, kind: "characteristic" };
  }

  /** The value a cursor holds for one row: its own column, or the joined characteristic. */
  private sortValue(
    meander: Meander,
    target: SortTarget,
    joined: SortValue | undefined,
  ): null | SortValue | undefined {
    if (target.kind === "shape") {
      return meander[target.column];
    }

    return joined;
  }

  // 🌎 Public Methods

  /**
   * The meander's drawing, the SVG document the CLI draws for its Code, with
   * its tile repeated `repeats` times across, from 1 to 24.
   */
  draw(meander: MeanderEntity, repeats = DEFAULT_SVG_REPEATS): string {
    const parsed = svgRepeatsSchema.safeParse(repeats);

    if (!parsed.success) {
      throw new BadRequestException(
        `Repeats must be a whole number from 1 to ${MAXIMUM_SVG_REPEATS}.`,
      );
    }

    const code = this.codeService.parse(
      meander.code,
      meander.rows,
      meander.columns,
    );

    return this.drawingService.render({
      ...code,
      repeats: code.repeats * parsed.data,
    });
  }

  /**
   * One page after a cursor, then past an offset, sorted by the sort, then Code; the total is exact.
   */
  async find(arguments_: MeandersArguments): Promise<MeanderConnection> {
    const parsed = meandersArgumentsSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { after, first, offset, sort } = parsed.data;
    const sorts = sort ?? [];

    if (sorts.length > 1 && after !== null && after !== undefined) {
      throw new BadRequestException(
        "A cursor needs one sort; page with an offset for several.",
      );
    }

    const filter =
      arguments_.filter === null || arguments_.filter === undefined
        ? null
        : await this.filterService.compile(arguments_.filter);
    const [primary] = sorts;
    const direction = primary?.direction ?? SortDirection.ASC;
    const filterHash = filter?.hash ?? NO_FILTER;
    const cursor = this.decodeCursor(after, {
      direction,
      field: primary?.field ?? "code",
      filter: filterHash,
    });
    const orders = await this.resolveOrders(sorts);
    const { entities, raw } = await this.buildQuery({ cursor, filter, orders })
      .offset(offset)
      .limit(first + 1)
      .getRawAndEntities<{ sort_value0: SortValue }>();
    const [firstOrder] = orders;

    return createConnection<MeanderEntity>({
      edges: entities.slice(0, first).map((meander, index) =>
        createEdge(
          {
            code: meander.code,
            columns: meander.columns,
            id: meander.id,
            isHardcoded: meander.isHardcoded,
            lattice: meander.lattice,
            repeats: meander.repeats,
            rows: meander.rows,
            symmetricalCodes: meander.symmetricalCodes,
          },
          toCursor({
            code: meander.code,
            direction,
            field: primary?.field ?? "code",
            filter: filterHash,
            value:
              firstOrder === undefined
                ? null
                : this.sortValue(
                    meander,
                    firstOrder.target,
                    raw[index]?.sort_value0,
                  ),
          }),
        ),
      ),
      hasNextPage: entities.length > first,
      hasPreviousPage: (after !== null && after !== undefined) || offset > 0,
      totalCount: await this.count(filter),
    });
  }

  /**
   * The non-zero values each meander holds, in the order of the ids, in two
   * reads however many ids: the catalog, then the bridge rows.
   */
  async findCharacteristicsFor(
    meanderIds: readonly string[],
  ): Promise<MeanderCharacteristicValueEntity[][]> {
    const catalog = await this.characteristicRepository.find({
      order: { key: "ASC" },
    });
    const rows = await this.bridgeRepository.find({
      where: {
        characteristicId: In(catalog.map(({ id }) => id)),
        meanderId: In([...meanderIds]),
      },
    });
    const values = new Map(
      rows.map((row) => [
        `${row.characteristicId}:${row.meanderId}`,
        row.value,
      ]),
    );

    return meanderIds.map((meanderId) =>
      catalog.flatMap(({ id, isPattern, key, name }) => {
        const value = values.get(`${id}:${meanderId}`);

        return value === undefined ? [] : [{ isPattern, key, name, value }];
      }),
    );
  }
}
