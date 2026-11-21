import { Module } from "@nestjs/common";

import { CodeModule, DrawingModule } from "@codebase/meanderaw-core";
import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { MeandersResolver } from "./meanders.resolver";
import { MeandersService } from "./meanders.service";
import { MeanderAggregateService } from "./modules/aggregates/meander-aggregate.service";
import { MeanderCharacteristicsLoader } from "./modules/characteristics/meander-characteristics.loader";
import { MeanderCharacteristicsResolver } from "./modules/characteristics/meander-characteristics.resolver";
import { MeanderFilterPlanService } from "./modules/filters/meander-filter-plan.service";
import { MeanderFilterService } from "./modules/filters/meander-filter.service";

/**
 * Serves the `meanders` query from the tables `MeanderawDatabaseModule` opens,
 * and each meander's drawing through `meanderaw-core`.
 */
@Module({
  controllers: [],
  exports: [MeanderAggregateService, MeanderFilterService, MeandersService],
  imports: [CodeModule, DrawingModule, MeanderawDatabaseModule],
  providers: [
    MeanderCharacteristicsLoader,
    MeanderCharacteristicsResolver,
    MeandersResolver,
    MeandersService,
    MeanderAggregateService,
    MeanderFilterPlanService,
    MeanderFilterService,
  ],
})
export class MeandersModule {}
