import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { LoggerModule } from "@codebase/observability";

import { environmentSchema } from "./deployment.constants";
import { HelmLintModule } from "./modules/helm-lint/helm-lint.module";
import { HelmRenderModule } from "./modules/helm-render/helm-render.module";
import { LinkPackagesModule } from "./modules/link-packages/link-packages.module";
import { PublishPackagesModule } from "./modules/publish-packages/publish-packages.module";
import { ImageTagsModule } from "./modules/tag-codebase/modules/image-tags/image-tags.module";
import { TagCodebaseModule } from "./modules/tag-codebase/tag-codebase.module";
import { TagPackagesModule } from "./modules/tag-packages/tag-packages.module";
import { VersionPackagesModule } from "./modules/version-packages/version-packages.module";

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
    DiscoveryModule,
    LoggerModule,
    HelmLintModule,
    HelmRenderModule,
    LinkPackagesModule,
    PublishPackagesModule,
    ImageTagsModule,
    TagCodebaseModule,
    TagPackagesModule,
    VersionPackagesModule,
  ],
})
export class MainModule {}
