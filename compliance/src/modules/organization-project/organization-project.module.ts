import { Module } from "@nestjs/common";

import { PullRequestModule } from "../pull-request/pull-request.module";

import { OrganizationProjectCommand } from "./organization-project.command";

/** Owns synchronization of repository issues and pull requests with the project. */
@Module({
  controllers: [],
  exports: [OrganizationProjectCommand],
  imports: [PullRequestModule],
  providers: [OrganizationProjectCommand],
})
export class OrganizationProjectModule {}
