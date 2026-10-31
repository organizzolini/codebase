import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { PullRequestLabelsAssigneesGithubService } from "../pull-request-labels-assignees/pull-request-labels-assignees-github.service";

import {
  COMPLIANCE_REPOSITORY,
  ORGANIZATION_PROJECT_ITEM_LIMIT,
  ORGANIZATION_PROJECT_NUMBER,
  ORGANIZATION_PROJECT_OWNER,
  organizationProjectItemsSchema,
  repositoryResourceUrlsSchema,
} from "./organization-project.constants";

import type { ZodType } from "zod";

/** Synchronizes repository issues and pull requests with the organization project. */
@Command({
  description:
    "Add all codebase issues and pull requests to the organization project",
  name: "organization-project",
})
@Injectable()
export class OrganizationProjectCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly githubService: PullRequestLabelsAssigneesGithubService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(OrganizationProjectCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Adds one item and reports GitHub errors explicitly. */
  private addProjectItem(url: string): void {
    const result = this.githubService.run([
      "project",
      "item-add",
      ORGANIZATION_PROJECT_NUMBER,
      "--owner",
      ORGANIZATION_PROJECT_OWNER,
      "--url",
      url,
    ]);

    if (!result.succeeded) {
      this.fail(
        `❌ Unable to add ${url} to the organization project: ${this.githubService.describeFailure(result)}`,
      );
    }
  }

  /** Logs an error and exits nonzero instead of continuing. */
  private fail(message: string): never {
    this.logger.error(message);

    return process.exit(1);
  }

  /** Collects current item URLs and ignores draft issues without URLs. */
  private readExistingProjectResourceUrls(): ReadonlySet<string> {
    const project = this.readJson(
      [
        "project",
        "item-list",
        ORGANIZATION_PROJECT_NUMBER,
        "--owner",
        ORGANIZATION_PROJECT_OWNER,
        "--limit",
        ORGANIZATION_PROJECT_ITEM_LIMIT,
        "--format",
        "json",
      ],
      "organization project items",
      organizationProjectItemsSchema,
    );

    if (project.items.length >= Number(ORGANIZATION_PROJECT_ITEM_LIMIT)) {
      this.fail(
        `❌ Reached the ${ORGANIZATION_PROJECT_ITEM_LIMIT} item limit while listing organization project items; refusing to synchronize a potentially incomplete list`,
      );
    }

    return new Set(
      project.items.flatMap((item) =>
        item.content?.url === undefined ? [] : [item.content.url],
      ),
    );
  }

  /** Validates JSON returned by a GitHub CLI read command. */
  private readJson<T>(
    commandArguments: readonly string[],
    description: string,
    schema: ZodType<T>,
  ): T {
    const result = this.githubService.run(commandArguments);

    if (!result.succeeded) {
      this.fail(
        `❌ Unable to ${description}: ${this.githubService.describeFailure(result)}`,
      );
    }

    let response: unknown;
    try {
      response = JSON.parse(result.standardOutput) as unknown;
    } catch (error) {
      this.fail(`❌ Unable to parse ${description}: ${String(error)}`);
    }

    const parsed = schema.safeParse(response);

    if (!parsed.success) {
      this.fail(`❌ Invalid ${description}: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  /** Lists repository issue or pull request URLs. */
  private readRepositoryResourceUrls(
    resource: "issue" | "pr",
  ): readonly string[] {
    const resources = this.readJson(
      [
        resource,
        "list",
        "--repo",
        COMPLIANCE_REPOSITORY,
        "--state",
        "all",
        "--limit",
        ORGANIZATION_PROJECT_ITEM_LIMIT,
        "--json",
        "url",
      ],
      resource === "issue" ? "repository issues" : "repository pull requests",
      repositoryResourceUrlsSchema,
    );

    if (resources.length >= Number(ORGANIZATION_PROJECT_ITEM_LIMIT)) {
      this.fail(
        `❌ Reached the ${ORGANIZATION_PROJECT_ITEM_LIMIT} item limit while listing ${resource} resources; refusing to synchronize a potentially incomplete list`,
      );
    }

    return resources.map(({ url }) => url);
  }

  // 🌎 Public Methods

  /** Adds missing repository issues and pull requests, leaving existing items untouched. */
  public async run(passedParameters: string[]): Promise<void> {
    await Promise.resolve();

    if (passedParameters.length > 0) {
      this.fail("❌ organization-project does not accept arguments");
    }

    const issueUrls = this.readRepositoryResourceUrls("issue");
    const pullRequestUrls = this.readRepositoryResourceUrls("pr");
    const existingUrls = this.readExistingProjectResourceUrls();
    const missingUrls = new Set(
      [...issueUrls, ...pullRequestUrls].filter(
        (url) => !existingUrls.has(url),
      ),
    );

    for (const url of missingUrls) {
      this.addProjectItem(url);
    }

    this.logger.info(
      `✅ Added ${String(missingUrls.size)} missing issue or pull request(s) to the organizzolini codebase project`,
    );
  }
}
