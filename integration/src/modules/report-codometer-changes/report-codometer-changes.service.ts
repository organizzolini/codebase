import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { BASELINE_DIRECTORY } from "../collect-codometer-baseline/collect-codometer-baseline.constants";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  BASELINE_ARTIFACT,
  BASELINE_WORKFLOW,
  baselineFoundMessage,
  baselineSkippedMessage,
  BODY_FILE_NAME,
  failedMessage,
  NO_BASELINE_MESSAGE,
  PULL_REQUEST_UNSET_MESSAGE,
} from "./report-codometer-changes.constants";

import type { Environment } from "../../integration.types";
import type {
  CodometerBaseline,
  ReportCodometerChangesOutcome,
} from "./report-codometer-changes.types";

/**
 * Writes the changes in codometer's measurements onto a pull request.
 *
 * It fetches the baseline the latest green `main` run uploaded, when there is
 * one, has `codometer-cli` diff this run's reports against it inside the pull
 * request body, and edits the pull request. A baseline that cannot be fetched
 * only costs the comparison: the report is still written.
 */
@Injectable()
export class ReportCodometerChangesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Downloads the baseline of the latest green `main` run, if there is one. */
  private fetchBaseline(): CodometerBaseline {
    const listed = this.processRunner.capture("gh", [
      "run",
      "list",
      `--workflow=${BASELINE_WORKFLOW}`,
      "--branch=main",
      "--status=success",
      "--limit=1",
      "--json=databaseId",
      "--jq=.[0].databaseId",
    ]);

    if (listed.status !== 0) {
      return {
        kind: "none",
        line: baselineSkippedMessage(listed.stderr.trim()),
      };
    }

    const runId = listed.stdout.trim();

    if (runId === "" || runId === "null") {
      return { kind: "none", line: NO_BASELINE_MESSAGE };
    }

    const downloaded = this.processRunner.capture("gh", [
      "run",
      "download",
      runId,
      `--name=${BASELINE_ARTIFACT}`,
      `--dir=${BASELINE_DIRECTORY}`,
    ]);

    if (downloaded.status !== 0) {
      return {
        kind: "none",
        line: baselineSkippedMessage(downloaded.stderr.trim()),
      };
    }

    const server =
      this.configService.get("GITHUB_SERVER_URL", { infer: true }) ??
      "https://github.com";
    const repository = this.configService.get("GITHUB_REPOSITORY", {
      infer: true,
    });

    return {
      kind: "found",
      url: `${server}/${repository}/actions/runs/${runId}`,
    };
  }

  /**
   * Writes the pull request body, has `codometer-cli` rewrite it with the
   * changes, and saves it back.
   */
  private rewriteBody(
    pullRequest: string,
    baseline: CodometerBaseline,
    lines: string[],
  ): ReportCodometerChangesOutcome {
    const bodyFile = path.join(
      this.configService.get("RUNNER_TEMP", { infer: true }) || os.tmpdir(),
      BODY_FILE_NAME,
    );
    const body = this.processRunner.capture("gh", [
      "pr",
      "view",
      pullRequest,
      "--json=body",
      "--jq=.body",
    ]);

    if (body.status !== 0) {
      return {
        exitCode: body.status,
        lines: [
          ...lines,
          failedMessage("Reading the pull request", body.stderr.trim()),
        ],
      };
    }

    fs.writeFileSync(bodyFile, body.stdout);

    const status = this.processRunner.stream("pnpm", [
      "exec",
      "nx",
      "run",
      "codometer-cli:start",
      "--",
      "changes",
      ...(baseline.kind === "found"
        ? [`--baseline=${BASELINE_DIRECTORY}`, `--baseline-url=${baseline.url}`]
        : []),
      `--markdown=${bodyFile}`,
    ]);

    if (status !== 0) {
      return {
        exitCode: status,
        lines: [...lines, failedMessage("Measuring the changes", "")],
      };
    }

    const edited = this.processRunner.capture("gh", [
      "pr",
      "edit",
      pullRequest,
      `--body-file=${bodyFile}`,
    ]);

    return edited.status === 0
      ? { exitCode: 0, lines }
      : {
          exitCode: edited.status,
          lines: [
            ...lines,
            failedMessage("Editing the pull request", edited.stderr.trim()),
          ],
        };
  }

  // 🌎 Public Methods

  /**
   * Fetches the baseline, rewrites the pull request body with the changes
   * against it, and saves the body.
   *
   * @returns Lines to print, and 0 or the exit code of the step that failed.
   */
  public report(): ReportCodometerChangesOutcome {
    const pullRequest = this.configService.get("PULL_REQUEST", { infer: true });

    if (pullRequest === undefined || pullRequest === "") {
      return { exitCode: 1, lines: [PULL_REQUEST_UNSET_MESSAGE] };
    }

    const baseline = this.fetchBaseline();

    return this.rewriteBody(pullRequest, baseline, [
      baseline.kind === "found"
        ? baselineFoundMessage(baseline.url)
        : baseline.line,
    ]);
  }
}
