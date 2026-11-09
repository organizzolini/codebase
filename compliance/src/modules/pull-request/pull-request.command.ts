import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { PullRequestAncestorIssuesService } from "./pull-request-ancestor-issues.service";
import { PullRequestContextService } from "./pull-request-context.service";
import { PullRequestLabelVocabularyService } from "./pull-request-label-vocabulary.service";
import { PullRequestReportService } from "./pull-request-report.service";
import { PullRequestValidationService } from "./pull-request-validation.service";

import type { PullRequestContext } from "./pull-request-context.types";

/**
 * CLI command that writes, then validates, one pull request.
 *
 * The write phase links the description to the ancestors of the issues it closes
 * and reconciles labels. It runs only on `pull_request` events, or locally with
 * `write`, so a merge group never writes to the pull request it judges. Exits 1
 * if anything failed.
 */
@Command({
  arguments: "[number] [write]",
  description:
    "Write ancestor and descendant references and labels (pull_request events or `write` only), then validate a pull request's title, body, metadata, and release significance",
  name: "pull-request",
})
@Injectable()
export class PullRequestCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly pullRequestContextService: PullRequestContextService,
    private readonly pullRequestLabelVocabularyService: PullRequestLabelVocabularyService,
    private readonly pullRequestAncestorIssuesService: PullRequestAncestorIssuesService,
    private readonly pullRequestReportService: PullRequestReportService,
    private readonly pullRequestValidationService: PullRequestValidationService,
  ) {
    super();
    this.logger.setContext(PullRequestCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reports one line that ended the run before any check could start. */
  private abort(failure: string): never {
    this.pullRequestReportService.publish([failure]);

    return process.exit(1);
  }

  /** Resolves the invocation and the pull request, or ends the run. */
  private begin(passedParameters: string[]): {
    readonly initial: PullRequestContext;
    readonly writable: boolean;
  } {
    const invocation = this.pullRequestContextService.resolveInvocation(
      passedParameters,
      process.env,
    );

    if (!invocation.ok) {
      this.abort(invocation.failure);
    }

    const initial = this.load(invocation.value.number);

    try {
      this.pullRequestContextService.writeStepOutputs(initial, process.env);
    } catch (error) {
      this.abort(
        `❌ Unable to write pull request context: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return { initial, writable: invocation.value.writable };
  }

  /** The pull request as it is now, or the end of the run. */
  private load(number: string): PullRequestContext {
    const fetched = this.pullRequestContextService.fetch(number);

    return fetched.ok ? fetched.value : this.abort(fetched.failure);
  }

  // 🌎 Public Methods

  /** Runs both phases and exits 0 only when every applicable check passed. */
  public async run(passedParameters: string[]): Promise<void> {
    // Nothing here is asynchronous; the base class signature is.
    await Promise.resolve();

    const { initial, writable } = this.begin(passedParameters);
    const written = writable
      ? [
          this.pullRequestAncestorIssuesService.link(initial).outcome,
          this.pullRequestLabelVocabularyService.reconcile({
            write: true,
            writeHint: `compliance pull-request ${String(initial.number)} write`,
          }),
        ]
      : [];
    // The write phase changes the labels and the body the checks then judge.
    const current =
      written.length === 0 ? initial : this.load(String(initial.number));
    const report = this.pullRequestReportService.compose({
      outcomes: this.pullRequestValidationService.validate(current),
      writeFailures: written.flatMap((outcome) => outcome.failures),
      writeLines: written.flatMap((outcome) => outcome.lines),
    });

    this.pullRequestReportService.publish(report.lines);

    if (report.failureCount > 0) {
      process.exit(1);
    }
  }
}
