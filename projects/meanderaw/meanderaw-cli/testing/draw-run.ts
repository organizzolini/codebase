import {
  Meander,
  MEANDERAW_DATABASE_MIGRATIONS,
  MeanderawDatabaseModule,
  MeanderawDatabaseService,
} from "@codebase/meanderaw-db";
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { environmentSchema } from "../src/meanderaw-cli.constants";
import { CharacteristicsModule } from "../src/modules/characteristics/characteristics.module";
import { CharacteristicsService } from "../src/modules/characteristics/characteristics.service";
import { CodeModule } from "../src/modules/code/code.module";
import { CorpusService } from "../src/modules/corpus/corpus.service";
import { DrawEnumerationService } from "../src/modules/draw/draw-enumeration.service";
import { DrawIndexService } from "../src/modules/draw/draw-index.service";
import { DrawPoolService } from "../src/modules/draw/draw-pool.service";
import { DrawRecordService } from "../src/modules/draw/draw-record.service";
import { DrawWorkerService } from "../src/modules/draw/draw-worker.service";
import { DrawCommand } from "../src/modules/draw/draw.command";
import { DrawingModule } from "../src/modules/drawing/drawing.module";
import { EnumerationModule } from "../src/modules/enumeration/enumeration.module";
import { EnumerationService } from "../src/modules/enumeration/enumeration.service";
import { GeometryModule } from "../src/modules/geometry/geometry.module";
import { SymmetryModule } from "../src/modules/symmetry/symmetry.module";

import { DRAW_TEST_EDGE_BUDGET, DRAW_TEST_WORKERS } from "./draw-run-budget";

import type { Provider } from "@nestjs/common";
import type { DataSource, Repository } from "typeorm";

/** Time limit for one `DrawCommand` run, above the five-second default. */
export const DRAW_RUN_TIMEOUT_MILLISECONDS = 300_000;

/** Everything a draw-run case reads back from one compiled `DrawCommand`. */
export interface DrawRunFixture {
  /** Closes the module and stops its throwaway Postgres container. */
  close: () => Promise<void>;
  command: DrawCommand;
  corpus: CorpusService;
  /** The connection, for reading the catalog and the bridge back. */
  dataSource: DataSource;
  enumeration: EnumerationService;
  /** The evaluators the draw run measures with, to recompute what a row should hold. */
  evaluators: CharacteristicsService;
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
    close: database.close,
    command: await database.module.resolve(DrawCommand),
    corpus: database.module.get(CorpusService),
    dataSource: database.dataSource,
    enumeration: database.module.get(EnumerationService),
    evaluators: database.module.get(CharacteristicsService),
    repository: database.repository(Meander),
    service: database.module.get(MeanderawDatabaseService),
  };
}
