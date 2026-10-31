import { Module } from "@nestjs/common";

import { PullRequestLabelsAssigneesModule } from "../pull-request-labels-assignees/pull-request-labels-assignees.module";

import { OrganizationProjectCommand } from "./organization-project.command";

/** Owns synchronization of repository issues and pull requests with the project. */
@Module({
  controllers: [],
  exports: [OrganizationProjectCommand],
  imports: [PullRequestLabelsAssigneesModule],
  providers: [OrganizationProjectCommand],
})
export class OrganizationProjectModule {}
