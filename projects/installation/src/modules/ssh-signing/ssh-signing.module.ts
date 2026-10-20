import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/logging";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";
import { ReporterModule } from "../reporter/reporter.module";

import { SshSigningCommand } from "./ssh-signing.command";
import { SshSigningService } from "./ssh-signing.service";

/** Makes SSH commit signatures verifiable on this machine. */
@Module({
  controllers: [],
  exports: [SshSigningCommand, SshSigningService],
  imports: [LoggerModule, ProcessRunnerModule, ReporterModule],
  providers: [SshSigningCommand, SshSigningService],
})
export class SshSigningModule {}
