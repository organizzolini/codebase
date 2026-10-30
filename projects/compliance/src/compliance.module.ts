import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./compliance.constants";
import { AuditGovernanceModule } from "./modules/audit-governance/audit-governance.module";
import { IssueAssigneesModule } from "./modules/issue-assignees/issue-assignees.module";
import { IssueLabelsModule } from "./modules/issue-labels/issue-labels.module";
import { IssueMetadataModule } from "./modules/issue-metadata/issue-metadata.module";
import { PullRequestBodyModule } from "./modules/pull-request-body/pull-request-body.module";
import { PullRequestContextModule } from "./modules/pull-request-context/pull-request-context.module";
import { PullRequestLabelsModule } from "./modules/pull-request-labels/pull-request-labels.module";
import { PullRequestMetadataModule } from "./modules/pull-request-metadata/pull-request-metadata.module";
import { PullRequestReleaseSignificanceModule } from "./modules/pull-request-release-significance/pull-request-release-significance.module";

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
    AuditGovernanceModule,
    DiscoveryModule,
    IssueAssigneesModule,
    IssueLabelsModule,
    IssueMetadataModule,
    LoggerModule,
    PullRequestBodyModule,
    PullRequestContextModule,
    PullRequestLabelsModule,
    PullRequestMetadataModule,
    PullRequestReleaseSignificanceModule,
  ],
})
export class MainModule {}
