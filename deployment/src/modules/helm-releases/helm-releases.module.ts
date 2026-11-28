import { Module } from "@nestjs/common";

import { HelmReleasesService } from "./helm-releases.service";

/** Provides the discovery of every Helm release the repository ships. */
@Module({
  controllers: [],
  exports: [HelmReleasesService],
  imports: [],
  providers: [HelmReleasesService],
})
export class HelmReleasesModule {}
