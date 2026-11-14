import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import {
  CodeModule,
  DrawingModule,
  SymmetryModule,
} from "@codebase/meanderaw-core";

import { environmentSchema } from "../../meanderaw-cli.constants";
import { CharacteristicsModule } from "../characteristics/characteristics.module";
import { EnumerationModule } from "../enumeration/enumeration.module";

import { DrawRecordService } from "./draw-record.service";
import { DrawWorkerService } from "./draw-worker.service";

/**
 * What one draw run worker thread boots: the services that turn an orbit
 * minimum into a row, and nothing that writes one.
 *
 * A worker holds no database connection; rows travel back to the main thread,
 * which inserts them.
 */
@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    CharacteristicsModule,
    CodeModule,
    DrawingModule,
    EnumerationModule,
    SymmetryModule,
  ],
  providers: [DrawRecordService, DrawWorkerService],
})
export class DrawWorkerModule {}
