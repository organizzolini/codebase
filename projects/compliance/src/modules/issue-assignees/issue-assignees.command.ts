import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { IssueAssigneesGithubService } from "./issue-assignees-github.service";
import {
  DEFAULT_ISSUE_ASSIGNEE,
  ISSUE_NUMBER_PATTERN,
} from "./issue-assignees.constants";

/** Assigns unowned issues on issue events and scheduled repository sweeps. */
@Command({
  description: "Assign the repository owner to unassigned open issues",
  name: "issue-assignees",
})
@Injectable()
export class IssueAssigneesCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly issueAssigneesGithubService: IssueAssigneesGithubService,
  ) {
    super();
    this.logger.setContext(IssueAssigneesCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Assigns the owner to every unassigned issue returned by the full sweep. */
  private assignAll(): void {
    const result =
      this.issueAssigneesGithubService.listUnassignedOpenIssueNumbers();

    if (!result.success) {
      this.fail(`❌ Unable to list open issues: ${result.error}`);
    }

    for (const issueNumber of result.issueNumbers) {
      this.assignIssue(String(issueNumber));
    }

    this.logger.info(
      result.issueNumbers.length === 0
        ? "✅ No unassigned open issues found"
        : `✅ Assigned ${String(result.issueNumbers.length)} unassigned open issue(s)`,
    );
  }

  /** Assigns the owner to one issue, surfacing `gh` failures. */
  private assignIssue(issueNumber: string): void {
    const result = this.issueAssigneesGithubService.assignIssue(issueNumber);

    if (!result.succeeded) {
      this.fail(
        `❌ Unable to assign issue ${issueNumber}: ${this.issueAssigneesGithubService.describeFailure(result)}`,
      );
    }

    this.logger.info(
      `✅ Assigned issue ${issueNumber} to ${DEFAULT_ISSUE_ASSIGNEE}`,
    );
  }

  /** Exits with an actionable error instead of reporting a false success. */
  private fail(message: string): never {
    this.logger.error(message);

    return process.exit(1);
  }

  // 🌎 Public Methods

  /** Option parser for sweeping every unassigned open issue. */
  @Option({
    description: "Sweep every open issue without an assignee",
    flags: "-a, --all",
  })
  public parseAllOption(): boolean {
    return true;
  }

  /** Assigns one issue or sweeps based on the CLI input and GitHub event. */
  public async run(
    passedParameters: string[],
    options?: { readonly all?: boolean },
  ): Promise<void> {
    await Promise.resolve();

    const eventName = process.env["GITHUB_EVENT_NAME"] ?? "";
    const argument = passedParameters[0];
    const sweep =
      options?.all === true ||
      argument === "--all" ||
      argument === "-a" ||
      eventName === "schedule" ||
      eventName === "workflow_dispatch";

    if (
      passedParameters.length > 1 ||
      (sweep &&
        argument !== undefined &&
        argument !== "--all" &&
        argument !== "-a")
    ) {
      this.fail("❌ Expected an issue number or --all");
    }

    if (sweep) {
      this.assignAll();

      return;
    }

    const issueNumber = argument ?? process.env["ISSUE_NUMBER"] ?? "";

    if (!ISSUE_NUMBER_PATTERN.test(issueNumber)) {
      this.fail(
        "❌ Expected a positive issue number, --all, or a supported GitHub event",
      );
    }

    this.assignIssue(issueNumber);
  }
}
