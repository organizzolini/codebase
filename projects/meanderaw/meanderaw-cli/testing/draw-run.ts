import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { environmentSchema } from "../src/meanderaw-cli.constants";
import { CharacteristicsModule } from "../src/modules/characteristics/characteristics.module";
import { CodeModule } from "../src/modules/code/code.module";
import { CorpusService } from "../src/modules/corpus/corpus.service";
import { DatabaseModule } from "../src/modules/database/database.module";
import { Meander } from "../src/modules/database/entities/meander.entity";
import { Migration1791160950069 } from "../src/modules/database/migrations/1791160950069-migration";
import { Migration1791414023001 } from "../src/modules/database/migrations/1791414023001-migration";
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
import type { Repository } from "typeorm";

/** Time limit for one `DrawCommand` run, above the five-second default. */
export const DRAW_RUN_TIMEOUT_MILLISECONDS = 300_000;

/** Everything a draw-run case reads back from one compiled `DrawCommand`. */
export interface DrawRunFixture {
  /** Closes the module and stops its throwaway Postgres container. */
  close: () => Promise<void>;
  command: DrawCommand;
  corpus: CorpusService;
  enumeration: EnumerationService;
  repository: Repository<Meander>;
}

/**
 * Starts a throwaway Postgres container and compiles the draw run module over
 * it. Callers mock `node:fs/promises` themselves.
 */
export async function startDrawRun(
  mocks: readonly Provider[],
): Promise<DrawRunFixture> {
  const database = await startDatabaseTestingModule({
    database: DatabaseModule,
    entities: [Meander],
    imports: [
      GeometryModule,
      CharacteristicsModule,
      CodeModule,
      EnumerationModule,
      SymmetryModule,
      DrawingModule,
    ],
    migrations: [Migration1791160950069, Migration1791414023001],
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
    enumeration: database.module.get(EnumerationService),
    repository: database.repository(Meander),
  };
}
