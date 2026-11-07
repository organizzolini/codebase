import { CallidescopeModule } from "@callidescope/cli";
import { ConfigurationModule } from "@callidescope/configuration";
import { WorkspaceModule } from "@callidescope/graph";
import { ReportModule } from "@callidescope/output";
import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { OptionsModule } from "../options/options.module";
import { ProjectsModule } from "../projects/projects.module";
import { RunConfigurationModule } from "../run-configuration/run-configuration.module";
import { VerdictModule } from "../verdict/verdict.module";

import { PluginService } from "./plugin.service";

/** Provides target inference and the trace the executor runs. */
@Module({
  controllers: [],
  exports: [PluginService],
  imports: [
    CallidescopeModule,
    ConfigurationModule,
    LoggerModule,
    OptionsModule,
    ProjectsModule,
    ReportModule,
    RunConfigurationModule,
    VerdictModule,
    WorkspaceModule,
  ],
  providers: [PluginService],
})
export class PluginModule {}
