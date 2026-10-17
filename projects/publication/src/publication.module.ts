import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/logging";

import { LinkPackagesModule } from "./modules/link-packages/link-packages.module";
import { PublishPackagesModule } from "./modules/publish-packages/publish-packages.module";
import { PublishablePackagesGateModule } from "./modules/publishable-packages-gate/publishable-packages-gate.module";
import { TagCodebaseModule } from "./modules/tag-codebase/tag-codebase.module";
import { TagPackagesModule } from "./modules/tag-packages/tag-packages.module";
import { VersionPackagesModule } from "./modules/version-packages/version-packages.module";
import { environmentSchema } from "./publication.constants";

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
    DiscoveryModule,
    LoggerModule,
    LinkPackagesModule,
    PublishPackagesModule,
    PublishablePackagesGateModule,
    TagCodebaseModule,
    TagPackagesModule,
    VersionPackagesModule,
  ],
})
export class MainModule {}
