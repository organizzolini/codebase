import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { LocalServicesCommand } from "./local-services.command";
import { LocalServicesService } from "./local-services.service";

/** Starts the Docker daemon and the Postgres container that development needs. */
@Module({
  controllers: [],
  exports: [LocalServicesCommand, LocalServicesService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [LocalServicesCommand, LocalServicesService],
})
export class LocalServicesModule {}
