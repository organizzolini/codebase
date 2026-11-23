import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { CatalogManifestsModule } from "./modules/catalog-manifests/catalog-manifests.module";
import { LockfileModule } from "./modules/lockfile/lockfile.module";
import { ReadmeProjectsModule } from "./modules/readme-projects/readme-projects.module";
import { environmentSchema } from "./validation.constants";

/**
 * Root NestJS application module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "configuration/.env",
      isGlobal: true,
      validate: (config: Record<string, unknown>) =>
        environmentSchema.parse(config),
    }),
    CatalogManifestsModule,
    DiscoveryModule,
    LockfileModule,
    LoggerModule,
    ReadmeProjectsModule,
  ],
})
export class MainModule {}
