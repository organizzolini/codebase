import { Module } from "@nestjs/common";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { MeandersModule } from "../meanders/meanders.module";

import { MeanderGroupsResolver } from "./meander-groups.resolver";
import { MeanderGroupsService } from "./meander-groups.service";

/**
 * Serves the `meanderGroups` query, counting exactly from the meanders.
 */
@Module({
  controllers: [],
  exports: [MeanderGroupsService],
  imports: [MeandersModule, MeanderawDatabaseModule],
  providers: [MeanderGroupsResolver, MeanderGroupsService],
})
export class MeanderGroupsModule {}
