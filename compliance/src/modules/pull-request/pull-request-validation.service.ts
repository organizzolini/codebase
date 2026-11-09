import { Injectable } from "@nestjs/common";

import { PullRequestAncestorIssuesService } from "./pull-request-ancestor-issues.service";
import { linkedIssueNumbersSchema } from "./pull-request-body-links.constants";
import {
  BODY_GUIDANCE_LINES,
  BODY_MISSING_MESSAGE,
  EMPTY_SECTIONS_MESSAGE,
  MALFORMED_SECTIONS_MESSAGE,
  MISSING_HEADINGS_MESSAGE,
  OVERSIZED_SECTIONS_MESSAGE,
  PULL_REQUEST_TEMPLATE_PATH,
  UNFILLED_COMMENTS_MESSAGE,
} from "./pull-request-body.constants";
import { PullRequestBodyService } from "./pull-request-body.service";
import { PullRequestGithubService } from "./pull-request-github.service";
import { PullRequestLabelsAssigneesService } from "./pull-request-labels-assignees.service";
import { PullRequestReleaseSignificanceService } from "./pull-request-release-significance.service";
import { PullRequestTitleService } from "./pull-request-title.service";
import { DEPENDABOT_LOGIN } from "./pull-request.constants";

import type { BodyVerdict } from "./pull-request-body.types";
import type { PullRequestContext } from "./pull-request-context.types";
import type { CheckOutcome } from "./pull-request.types";

/**
 * Runs every validation check against one pull request and keeps going past
 * the first failure, so a single run reports everything that is wrong.
 */
@Injectable()
export class PullRequestValidationService {
  // 🏗 Dependency Injection

  constructor(
    private readonly pullRequestAncestorIssuesService: PullRequestAncestorIssuesService,
    private readonly pullRequestBodyService: PullRequestBodyService,
    private readonly pullRequestGithubService: PullRequestGithubService,
    private readonly pullRequestLabelsAssigneesService: PullRequestLabelsAssigneesService,
    private readonly pullRequestReleaseSignificanceService: PullRequestReleaseSignificanceService,
    private readonly pullRequestTitleService: PullRequestTitleService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The body, its sections, and the template comments left in it. */
  private checkBody(context: PullRequestContext): CheckOutcome {
    const base = {
      heading: "❌ Pull request body is invalid",
      remediationCommands: [],
      successMessage: "✅ Pull request body has every required section",
    };

    if (context.body.trim() === "") {
      return { ...base, failures: [BODY_MISSING_MESSAGE] };
    }

    const failures = this.describeBodyVerdict(
      this.pullRequestBodyService.checkBody({
        body: context.body,
        templateComments: this.pullRequestBodyService.extractTemplateComments(
          PULL_REQUEST_TEMPLATE_PATH,
        ),
      }),
    );

    return {
      ...base,
      failures:
        failures.length === 0 ? [] : [...failures, ...BODY_GUIDANCE_LINES],
    };
  }

  /** A pull request must close at least one issue; the write phase then relates its ancestors. */
  private checkLinkedIssue(context: PullRequestContext): CheckOutcome {
    const base = {
      heading: "❌ Pull request is not linked to an issue",
      remediationCommands: [],
      successMessage: "✅ Pull request closes at least one issue",
    };
    const view = this.pullRequestGithubService.run([
      "pr",
      "view",
      String(context.number),
      "--json",
      "closingIssuesReferences",
      "--jq",
      "[.closingIssuesReferences[].number]",
    ]);

    if (!view.succeeded) {
      return {
        ...base,
        failures: [
          `❌ Unable to read the issues closed by pull request ${String(context.number)}: ${this.pullRequestGithubService.describeFailure(view)}`,
        ],
      };
    }

    try {
      const linked = linkedIssueNumbersSchema.parse(
        JSON.parse(view.standardOutput),
      );

      return {
        ...base,
        failures:
          linked.length === 0
            ? [
                "❌ No issue is closed by this pull request. Add a `Closes #<issue>` bullet to the 🔗 Related section.",
              ]
            : [],
      };
    } catch (error) {
      return {
        ...base,
        failures: [
          `❌ Unable to parse the issues closed by pull request ${String(context.number)}: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }

  /** Labels and assignees against what the title declares. */
  private checkMetadata(context: PullRequestContext): CheckOutcome {
    const base = {
      heading: "❌ Pull request metadata is invalid",
      successMessage: "✅ Pull request metadata is valid",
    };
    const titleConvention = this.pullRequestLabelsAssigneesService.parseTitle(
      context.title,
    );

    if (titleConvention === undefined) {
      return {
        ...base,
        failures: [
          `❌ Unable to parse type and scope from title: ${context.title}`,
        ],
        remediationCommands: [],
      };
    }

    const verdict = this.pullRequestLabelsAssigneesService.checkMetadata({
      metadata: {
        assigneeLogins: context.assignees,
        labelNames: context.labels,
        title: context.title,
      },
      pullRequestNumber: String(context.number),
      titleConvention,
    });

    return { ...base, ...verdict };
  }

  /** The title's release level against the most significant commit. */
  private checkSignificance(context: PullRequestContext): CheckOutcome {
    const base = {
      heading: "❌ Pull request title is not release-significant enough",
      remediationCommands: [],
      successMessage:
        "✅ Pull request title is release-significant enough for its commits",
    };
    const titleConvention =
      this.pullRequestReleaseSignificanceService.parseConventionalSubject(
        context.title,
      );

    if (titleConvention === undefined) {
      return {
        ...base,
        failures: [
          `❌ Unable to parse type and scope from title: ${context.title}`,
        ],
      };
    }

    const view = this.pullRequestGithubService.run([
      "pr",
      "view",
      String(context.number),
      "--json",
      "title,commits",
    ]);

    if (!view.succeeded) {
      return {
        ...base,
        failures: [
          `❌ Unable to read pull request ${String(context.number)}: gh pr view failed (${this.pullRequestGithubService.describeFailure(view)})`,
        ],
      };
    }

    const resolution =
      this.pullRequestReleaseSignificanceService.resolveFromDocument(
        view.standardOutput,
      );

    if (!resolution.resolved) {
      return { ...base, failures: [resolution.failure] };
    }

    try {
      return {
        ...base,
        failures: this.pullRequestReleaseSignificanceService.checkSignificance({
          commits: resolution.commits,
          releaseRules:
            this.pullRequestReleaseSignificanceService.readReleaseRules(),
          titleConvention,
        }).failures,
      };
    } catch (error) {
      return {
        ...base,
        failures: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /** The title against the Conventional Commits configuration. */
  private checkTitle(context: PullRequestContext): CheckOutcome {
    return {
      failures: this.pullRequestTitleService.check(context.title),
      heading: "❌ Pull request title does not follow Conventional Commits",
      remediationCommands: [],
      successMessage: "✅ Pull request title follows Conventional Commits",
    };
  }

  /** Lists one family of body failures behind its introduction. */
  private describeBodyVerdict(verdict: BodyVerdict): string[] {
    return [
      ...(verdict.missingHeadings.length === 0
        ? []
        : [
            `${MISSING_HEADINGS_MESSAGE}${this.listHeadings(verdict.missingHeadings)}`,
          ]),
      ...(verdict.emptySections.length === 0
        ? []
        : [
            `${EMPTY_SECTIONS_MESSAGE}${this.listHeadings(verdict.emptySections)}`,
          ]),
      ...this.listItems(MALFORMED_SECTIONS_MESSAGE, verdict.malformedSections),
      ...this.listItems(OVERSIZED_SECTIONS_MESSAGE, verdict.oversizedSections),
      ...this.listItems(UNFILLED_COMMENTS_MESSAGE, verdict.unfilledComments),
    ];
  }

  /** Heading names, each behind a space, for a one-line message. */
  private listHeadings(list: readonly string[]): string {
    return list.map((heading) => ` ${heading.replace("## ", "")}`).join("");
  }

  /** One family of failures behind its introduction, or nothing. */
  private listItems(message: string, list: readonly string[]): string[] {
    return list.length === 0
      ? []
      : [message, ...list.map((item) => `  - ${item}`)];
  }

  // 🌎 Public Methods

  /**
   * Every check that applies to this pull request.
   * Dependabot writes its own title and body, so those checks exempt its pull requests.
   */
  public validate(context: PullRequestContext): CheckOutcome[] {
    const authoredByDependabot = context.author === DEPENDABOT_LOGIN;

    return [
      ...(authoredByDependabot
        ? []
        : [this.checkTitle(context), this.checkBody(context)]),
      this.checkMetadata(context),
      this.checkSignificance(context),
      ...(authoredByDependabot || context.draft
        ? []
        : [this.checkLinkedIssue(context)]),
      this.pullRequestAncestorIssuesService.verify(context),
    ];
  }
}
