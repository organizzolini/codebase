import { Injectable } from "@nestjs/common";

import { PullRequestGithubService } from "./pull-request-github.service";
import { LABEL_LIST_LIMIT } from "./pull-request-labels.constants";
import { PullRequestLabelsService } from "./pull-request-labels.service";

import type {
  ConventionalLabel,
  LabelReconciliationPlan,
} from "./pull-request-labels.types";
import type { WriteOutcome } from "./pull-request.types";

/**
 * Reconciles the repository's label vocabulary with `conventional.config.cjs`.
 *
 * It reports on the repository rather than on the change under review, so
 * nothing it finds is ever a failure: every problem is a warning line.
 */
@Injectable()
export class PullRequestLabelVocabularyService {
  // 🏗 Dependency Injection

  constructor(
    private readonly pullRequestGithubService: PullRequestGithubService,
    private readonly pullRequestLabelsService: PullRequestLabelsService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Creates or edits each label, reporting what happened to every one. */
  private apply(
    verb: "create" | "edit",
    labels: readonly ConventionalLabel[],
  ): string[] {
    return labels.map((label) => {
      const result = this.pullRequestGithubService.run([
        "label",
        verb,
        label.name,
        "--color",
        label.color,
        "--description",
        label.description,
      ]);

      return result.succeeded
        ? `- ✅ ${verb === "create" ? "Created" : "Updated"} label: ${label.name}`
        : `- ⚠️ Unable to reconcile labels: gh label ${verb} failed for ${label.name} (${this.pullRequestGithubService.describeFailure(result)})`;
    });
  }

  /** Names what a write would do, without doing it. */
  private describePlan(
    plan: LabelReconciliationPlan,
    writeHint: string,
  ): string[] {
    return [
      ...plan.creations.map((label) => `- ⚠️ Missing label: ${label.name}`),
      ...plan.updates.map(
        (label) =>
          `- ⚠️ Drifted label: ${label.name} — its color or description differs from the configuration`,
      ),
      `- 🔧 Reconcile with: ${writeHint}`,
    ];
  }

  /** Compares the repository's labels with the configuration. */
  private plan(): LabelReconciliationPlan | string {
    const listing = this.pullRequestGithubService.run([
      "label",
      "list",
      "--limit",
      LABEL_LIST_LIMIT,
      "--json",
      "name,color,description",
    ]);

    if (!listing.succeeded) {
      return `- ⚠️ Unable to reconcile labels: gh label list failed (${this.pullRequestGithubService.describeFailure(listing)})`;
    }

    try {
      return this.pullRequestLabelsService.planReconciliation({
        currentLabels: this.pullRequestLabelsService.parseRepositoryLabels(
          listing.standardOutput,
        ),
        expectedLabels: this.pullRequestLabelsService.readExpectedLabels(),
      });
    } catch (error) {
      return `- ⚠️ Unable to reconcile labels: label comparison failed (${error instanceof Error ? error.message : String(error)})`;
    }
  }

  // 🌎 Public Methods

  /** Checks the vocabulary, creating and updating labels only when asked. */
  public reconcile(options: {
    readonly write: boolean;
    readonly writeHint: string;
  }): WriteOutcome {
    const plan = this.plan();

    if (typeof plan === "string") {
      return { failures: [], lines: [plan] };
    }

    const stale = plan.staleNames.map(
      (name) =>
        `- ⚠️ Stale label (not in conventional.config.cjs): ${name} — remove with: gh label delete "${name}"`,
    );

    if (plan.creations.length === 0 && plan.updates.length === 0) {
      return {
        failures: [],
        lines: [
          "- ✅ All conventional labels are present and match the configuration",
          ...stale,
        ],
      };
    }

    const lines = options.write
      ? [
          ...this.apply("create", plan.creations),
          ...this.apply("edit", plan.updates),
        ]
      : this.describePlan(plan, options.writeHint);

    return { failures: [], lines: [...lines, ...stale] };
  }
}
