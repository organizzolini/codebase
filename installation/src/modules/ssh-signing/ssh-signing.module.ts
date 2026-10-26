import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { SshSigningService } from "./ssh-signing.service";

/** Makes SSH commit signatures verifiable on this machine. */
@Module({
  controllers: [],
  exports: [SshSigningService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [SshSigningService],
})
export class SshSigningModule {}
