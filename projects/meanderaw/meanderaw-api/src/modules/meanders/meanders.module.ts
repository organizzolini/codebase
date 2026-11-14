import { Module } from "@nestjs/common";

import { CodeModule, DrawingModule } from "@codebase/meanderaw-core";
import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { MeanderFilterPlanService } from "./filters/meander-filter-plan.service";
import { MeanderFilterService } from "./filters/meander-filter.service";
import { MeandersResolver } from "./meanders.resolver";
import { MeandersService } from "./meanders.service";

/**
 * Serves the `meanders` query from the tables `MeanderawDatabaseModule` opens,
 * and each meander's drawing through `meanderaw-core`.
 */
@Module({
  controllers: [],
  exports: [MeanderFilterService, MeandersService],
  imports: [CodeModule, DrawingModule, MeanderawDatabaseModule],
  providers: [
    MeandersResolver,
    MeandersService,
    MeanderFilterPlanService,
    MeanderFilterService,
  ],
})
export class MeandersModule {}
