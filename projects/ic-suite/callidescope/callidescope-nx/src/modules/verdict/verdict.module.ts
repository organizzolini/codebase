import { ProjectReportsModule } from "@callidescope/output";
import { Module } from "@nestjs/common";

import { VerdictService } from "./verdict.service";

/** Decides whether a traced result passes, once per project it judges. */
@Module({
  controllers: [],
  exports: [VerdictService],
  imports: [ProjectReportsModule],
  providers: [VerdictService],
})
export class VerdictModule {}
