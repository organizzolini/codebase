import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./compliance.constants";
import { AuditFilesModule } from "./modules/audit-files/audit-files.module";
import { IssueModule } from "./modules/issue/issue.module";
import { OrganizationProjectModule } from "./modules/organization-project/organization-project.module";
import { PullRequestModule } from "./modules/pull-request/pull-request.module";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    AuditFilesModule,
    DiscoveryModule,
    IssueModule,
    LoggerModule,
    OrganizationProjectModule,
    PullRequestModule,
  ],
})
export class MainModule {}
