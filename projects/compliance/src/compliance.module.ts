import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./compliance.constants";
import { AuditGovernanceModule } from "./modules/audit-governance/audit-governance.module";
import { IssueAssigneesModule } from "./modules/issue-assignees/issue-assignees.module";
import { IssueLabelsModule } from "./modules/issue-labels/issue-labels.module";
import { IssueMetadataModule } from "./modules/issue-metadata/issue-metadata.module";
import { OrganizationProjectModule } from "./modules/organization-project/organization-project.module";
import { PullRequestBodyModule } from "./modules/pull-request-body/pull-request-body.module";
import { PullRequestLabelsAssigneesModule } from "./modules/pull-request-labels-assignees/pull-request-labels-assignees.module";
import { PullRequestLabelsModule } from "./modules/pull-request-labels/pull-request-labels.module";
import { PullRequestParentLinksModule } from "./modules/pull-request-parent-links/pull-request-parent-links.module";
import { PullRequestReleaseSignificanceModule } from "./modules/pull-request-release-significance/pull-request-release-significance.module";
import { PullRequestTitleBodyModule } from "./modules/pull-request-title-body/pull-request-title-body.module";

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
    OrganizationProjectModule,
    PullRequestBodyModule,
    PullRequestLabelsAssigneesModule,
    PullRequestLabelsModule,
    PullRequestParentLinksModule,
    PullRequestReleaseSignificanceModule,
    PullRequestTitleBodyModule,
  ],
})
export class MainModule {}
