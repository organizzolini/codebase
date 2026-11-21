import {
  CodeModule,
  DrawingModule,
  GeometryModule,
  SymmetryModule,
} from "@codebase/meanderaw-core";
import {
  Meander,
  MEANDERAW_DATABASE_MIGRATIONS,
  MeanderawDatabaseModule,
  MeanderawDatabaseService,
} from "@codebase/meanderaw-db";
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { environmentSchema } from "../src/meanderaw-cli.constants";
import { AggregateCommand } from "../src/modules/aggregate/aggregate.command";
import { CharacteristicsModule } from "../src/modules/characteristics/characteristics.module";
import { CharacteristicsService } from "../src/modules/characteristics/characteristics.service";
import { CorpusService } from "../src/modules/corpus/corpus.service";
import { DrawCommand } from "../src/modules/draw/draw.command";
import { DrawEnumerationService } from "../src/modules/draw/modules/enumeration/draw-enumeration.service";
import { DrawRecordService } from "../src/modules/draw/modules/enumeration/draw-record.service";
import { DrawIndexService } from "../src/modules/draw/modules/index/draw-index.service";
import { DrawPoolService } from "../src/modules/draw/modules/pool/draw-pool.service";
import { DrawWorkerService } from "../src/modules/draw/modules/pool/draw-worker.service";
import { EnumerationModule } from "../src/modules/enumeration/enumeration.module";
import { EnumerationService } from "../src/modules/enumeration/enumeration.service";

import { DRAW_TEST_EDGE_BUDGET, DRAW_TEST_WORKERS } from "./draw-run-budget";

import type { Provider } from "@nestjs/common";
import type { DataSource, Repository } from "typeorm";

/** Time limit for one `DrawCommand` run, above the five-second default. */
export const DRAW_RUN_TIMEOUT_MILLISECONDS = 300_000;

/** Everything a draw-run case reads back from one compiled `DrawCommand`. */
export interface DrawRunFixture {
  /** The `aggregate` command, for rebuilding the count tables on its own. */
  aggregate: AggregateCommand;
  /** Closes the module and stops its throwaway Postgres container. */
  close: () => Promise<void>;
  command: DrawCommand;
  corpus: CorpusService;
  /** The connection, for reading the catalog and the bridge back. */
  dataSource: DataSource;
  enumeration: EnumerationService;
  /** The evaluators the draw run measures with, to recompute what a row should hold. */
  evaluators: CharacteristicsService;
  /** Builds the row a Code describes, as the draw run would write it. */
  records: DrawRecordService;
  repository: Repository<Meander>;
  /** The database service the command writes through. */
  service: MeanderawDatabaseService;
}

/**
 * Starts a throwaway Postgres container and compiles the draw run module over
 * it. Callers mock `node:fs/promises` themselves.
 */
export async function startDrawRun(
  mocks: readonly Provider[],
): Promise<DrawRunFixture> {
  const database = await startDatabaseTestingModule({
    database: MeanderawDatabaseModule,
    entities: [Meander],
    imports: [
      GeometryModule,
      CharacteristicsModule,
      CodeModule,
      EnumerationModule,
      SymmetryModule,
      DrawingModule,
    ],
    migrations: [...MEANDERAW_DATABASE_MIGRATIONS],
    project: "meanderaw",
    providers: [
      AggregateCommand,
      DrawCommand,
      DrawEnumerationService,
      DrawIndexService,
      DrawPoolService,
      DrawRecordService,
      DrawWorkerService,
      CorpusService,
      ...mocks,
    ],
    validate: (config) =>
      environmentSchema.parse({
        ...config,
        DRAW_EDGE_BUDGET: DRAW_TEST_EDGE_BUDGET,
        DRAW_WORKERS: DRAW_TEST_WORKERS,
      }),
  });

  return {
    aggregate: await database.module.resolve(AggregateCommand),
    close: database.close,
    command: await database.module.resolve(DrawCommand),
    corpus: database.module.get(CorpusService),
    dataSource: database.dataSource,
    enumeration: database.module.get(EnumerationService),
    evaluators: database.module.get(CharacteristicsService),
    records: database.module.get(DrawRecordService),
    repository: database.repository(Meander),
    service: database.module.get(MeanderawDatabaseService),
  };
}
