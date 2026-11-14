import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { CodeService, DrawingService } from "@codebase/meanderaw-core";
import {
  Characteristic,
  Meander,
  MeanderCharacteristic,
} from "@codebase/meanderaw-db";

import {
  createConnection,
  createEdge,
  fromCursor,
  toCursor,
} from "../../meanderaw-api.utilities";

import { MeanderAggregateService } from "./aggregates/meander-aggregate.service";
import { MeanderFilterService } from "./filters/meander-filter.service";
import {
  cursorSchema,
  meandersArgumentsSchema,
  NO_FILTER,
  SHAPE_SORT_FIELDS,
} from "./meanders.constants";
import { SortDirection } from "./sort-direction.entities";

import type { CompiledMeanderFilter } from "./filters/meander-filter.types";
import type { MeanderConnection } from "./meander-connection.entities";
import type { MeanderSortInput } from "./meander-sort.entities";
import type { MeanderEntity } from "./meanders.entities";
import type {
  Cursor,
  MeandersArguments,
  SortTarget,
  SortValue,
} from "./meanders.types";
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

  /** The query for the rows after a cursor, in the sort's order, then id order. */
  private buildQuery(arguments_: {
    cursor: Cursor | null;
    direction: SortDirection;
    filter: CompiledMeanderFilter | null;
    target: SortTarget;
  }): SelectQueryBuilder<Meander> {
    const { cursor, direction, filter, target } = arguments_;
    const query = this.meanderRepository.createQueryBuilder("meander");
    let expression = "meander.id";

    if (target.kind === "shape") {
      expression = `meander.${target.column}`;
    } else if (target.kind === "characteristic") {
      expression = "COALESCE(bridge.value, 0)";
      query
        .leftJoin(
          MeanderCharacteristic,
          "bridge",
          "bridge.characteristicId = :characteristicId AND bridge.meanderId = meander.id",
          { characteristicId: target.characteristicId },
        )
        .addSelect(expression, "sort_value");
    }

    if (cursor !== null) {
      const beyond = direction === SortDirection.DESC ? "<" : ">";

      query.andWhere(
        target.kind === "id"
          ? "meander.id > :cursorId"
          : `(${expression} ${beyond} :cursorValue OR (${expression} = :cursorValue AND meander.id > :cursorId))`,
        { cursorId: cursor.id, cursorValue: cursor.value },
      );
    }

    if (filter !== null) {
      query.andWhere(filter.where, filter.parameters);
    }

    query.orderBy(expression, direction);

    return target.kind === "id" ? query : query.addOrderBy("meander.id", "ASC");
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

  /** Reads what the sort names, refusing a field that is neither shape nor characteristic. */
  private async resolveTarget(
    sort: MeanderSortInput | null | undefined,
  ): Promise<SortTarget> {
    if (sort === null || sort === undefined) {
      return { kind: "id" };
    }

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

    return target.kind === "id" ? null : joined;
  }

  // 🌎 Public Methods

  /** The meander's drawing, the same SVG document the CLI draws for its Code. */
  draw(meander: MeanderEntity): string {
    return this.drawingService.render(
      this.codeService.parse(meander.code, meander.rows, meander.columns),
    );
  }

  /**
   * One page after a cursor, in the sort's order then id order. A missing
   * characteristic value sorts as 0. The total is exact.
   */
  async find(arguments_: MeandersArguments): Promise<MeanderConnection> {
    const parsed = meandersArgumentsSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { after, first, sort } = parsed.data;
    const filter =
      arguments_.filter === null || arguments_.filter === undefined
        ? null
        : await this.filterService.compile(arguments_.filter);
    const direction = sort?.direction ?? SortDirection.ASC;
    const filterHash = filter?.hash ?? NO_FILTER;
    const cursor = this.decodeCursor(after, {
      direction,
      field: sort?.field ?? "id",
      filter: filterHash,
    });
    const target = await this.resolveTarget(sort);
    const { entities, raw } = await this.buildQuery({
      cursor,
      direction,
      filter,
      target,
    })
      .limit(first + 1)
      .getRawAndEntities<{ sort_value: SortValue }>();

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
            direction,
            field: sort?.field ?? "id",
            filter: filterHash,
            id: meander.id,
            value: this.sortValue(meander, target, raw[index]?.sort_value),
          }),
        ),
      ),
      hasNextPage: entities.length > first,
      hasPreviousPage: after !== null && after !== undefined,
      totalCount: await this.count(filter),
    });
  }
}
