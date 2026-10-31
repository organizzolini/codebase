import { Module } from "@nestjs/common";

import { PullRequestMetadataModule } from "../pull-request-metadata/pull-request-metadata.module";

import { OrganizationProjectCommand } from "./organization-project.command";

/** Owns synchronization of repository issues and pull requests with the project. */
@Module({
  controllers: [],
  exports: [OrganizationProjectCommand],
  imports: [PullRequestMetadataModule],
  providers: [OrganizationProjectCommand],
})
export class OrganizationProjectModule {}
