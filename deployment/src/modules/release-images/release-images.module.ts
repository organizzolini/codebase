import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { ReleaseImagesCommand } from "./release-images.command";
import { ReleaseImagesService } from "./release-images.service";

/** Provides the command that builds the Caelundas images and records their tags. */
@Module({
  controllers: [],
  exports: [ReleaseImagesCommand, ReleaseImagesService],
  imports: [LoggerModule, ProcessRunnerModule],
  providers: [ReleaseImagesCommand, ReleaseImagesService],
})
export class ReleaseImagesModule {}
