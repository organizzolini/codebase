import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { CatalogManifestsModule } from "./modules/catalog-manifests/catalog-manifests.module";
import { LockfileModule } from "./modules/lockfile/lockfile.module";
import { PublishablePackagesModule } from "./modules/publishable-packages/publishable-packages.module";
import { ReadmeProjectsModule } from "./modules/readme-projects/readme-projects.module";
import { SessionBranchNameModule } from "./modules/session-branch-name/session-branch-name.module";
import { SessionWorktreeNameModule } from "./modules/session-worktree-name/session-worktree-name.module";
import { environmentSchema } from "./validation.constants";

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
    CatalogManifestsModule,
    DiscoveryModule,
    LockfileModule,
    LoggerModule,
    PublishablePackagesModule,
    ReadmeProjectsModule,
    SessionBranchNameModule,
    SessionWorktreeNameModule,
  ],
})
export class MainModule {}
