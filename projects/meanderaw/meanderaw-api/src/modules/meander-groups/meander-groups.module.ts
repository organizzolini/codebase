import { Module } from "@nestjs/common";

import { MeanderawDatabaseModule } from "@codebase/meanderaw-db";

import { MeandersModule } from "../meanders/meanders.module";

import { MeanderGroupsResolver } from "./meander-groups.resolver";
import { MeanderGroupsService } from "./meander-groups.service";

/**
 * Serves the `meanderGroups` query, counting from the aggregate tables where
 * they cover a request and from the meanders where they do not.
 */
@Module({
  controllers: [],
  exports: [MeanderGroupsService],
  imports: [MeandersModule, MeanderawDatabaseModule],
  providers: [MeanderGroupsResolver, MeanderGroupsService],
})
export class MeanderGroupsModule {}
