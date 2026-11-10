import { Module } from "@nestjs/common";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReleaseGroupService } from "./release-group.service";

/** Provides the Nx release group and the npm lookups the release steps share. */
@Module({
  controllers: [],
  exports: [ReleaseGroupService],
  imports: [ProcessRunnerModule],
  providers: [ReleaseGroupService],
})
export class ReleaseGroupModule {}
