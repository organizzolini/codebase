import { Module } from "@nestjs/common";

import { GateModule } from "../gate/gate.module";

import { BatchService } from "./batch.service";

/** Provides the batch run behind the gate executor's batch implementation. */
@Module({
  controllers: [],
  exports: [BatchService],
  imports: [GateModule],
  providers: [BatchService],
})
export class BatchModule {}
