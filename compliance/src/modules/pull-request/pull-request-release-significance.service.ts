import { createRequire } from "node:module";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  BREAKING_CHANGE_FOOTER_PATTERN,
  COMMIT_ANALYZER_PLUGIN_NAME,
  commitAnalyzerOptionsSchema,
  CONVENTIONAL_SUBJECT_PATTERN,
  pullRequestDocumentSchema,
  RELEASE_CONFIG_PATH,
  RELEASE_LEVEL_RANK,
  releaseConfigSchema,
  SUBJECT_SCOPE_SEPARATOR_PATTERN,
} from "./pull-request-release-significance.constants";

import type {
  ConventionalSubject,
  PullRequestCommit,
  PullRequestCommitsResolution,
  ReleaseRule,
  SignificanceVerdict,
} from "./pull-request-release-significance.types";

/**
 * Reads a pull request's title and commits and says whether the title is at
 * least as release-significant as every commit behind it.
 *
 * Pure throughout, except `readReleaseRules`, which reads `release.config.cjs`
 * fresh on every run so the rules cannot drift from a copy here.
 */
@Injectable()
export class PullRequestReleaseSignificanceService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  private readonly requireFromCurrentModule = createRequire(import.meta.url);

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Every missing-scope failure, one line per scope across all commits. */
  private describeMissingScopeFailures(
    missingScopeCommits: ReadonlyMap<string, readonly string[]>,
  ): string[] {
    return [...missingScopeCommits.entries()].map(
      ([scope, shas]) =>
        `❌ Scope "${scope}" is used in commit${shas.length > 1 ? "s" : ""} ${shas.join(", ")} but missing from the title`,
    );
  }

  /** The one failure line for a title that understates its most significant commit. */
  private describeSignificanceFailure(
    mostSignificantCommit: { commit: PullRequestCommit; rank: number },
    releaseRules: readonly ReleaseRule[],
  ): string {
    const level = this.releaseLevelName(mostSignificantCommit.rank);
    const example = releaseRules.find(
      (rule) => rule.type !== undefined && rule.release === level,
    )?.type;

    return (
      `❌ Commit ${mostSignificantCommit.commit.sha} (${mostSignificantCommit.commit.subject}) ` +
      `needs a title of at least ${level} significance (e.g. ${example ?? level}): retitle with a more significant type`
    );
  }

  /**
   * Commits that share no scope with the title, grouped by scope and SHA.
   */
  private findMissingScopes(
    commits: readonly PullRequestCommit[],
    titleConvention: ConventionalSubject,
  ): Map<string, string[]> {
    const missingScopeCommits = new Map<string, string[]>();

    for (const commit of commits) {
      if (commit.convention === undefined) {
        continue;
      }

      const overlapsTitle = commit.convention.scopes.some((scope) =>
        titleConvention.scopes.includes(scope),
      );

      if (overlapsTitle) {
        continue;
      }

      for (const scope of commit.convention.scopes) {
        const shas = missingScopeCommits.get(scope) ?? [];
        shas.push(commit.sha);
        missingScopeCommits.set(scope, shas);
      }
    }

    return missingScopeCommits;
  }

  /** The commit whose own type and scopes rank most release-significant. */
  private findMostSignificantCommit(
    commits: readonly PullRequestCommit[],
    releaseRules: readonly ReleaseRule[],
  ): undefined | { commit: PullRequestCommit; rank: number } {
    let mostSignificant:
      | undefined
      | { commit: PullRequestCommit; rank: number };

    for (const commit of commits) {
      if (commit.convention === undefined) {
        continue;
      }

      const rank = this.significanceRank(commit.convention, releaseRules);

      if (mostSignificant === undefined || rank > mostSignificant.rank) {
        mostSignificant = { commit, rank };
      }
    }

    return mostSignificant;
  }

  /** Whether this value can be read by property name at all. */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
  }

  /** The numeric rank a release level carries, `false` lowest. */
  private rankOfRelease(release: ReleaseRule["release"]): number {
    return release === false ? 0 : (RELEASE_LEVEL_RANK[release] ?? 0);
  }

  /** Reads one raw `commits` array entry into a `PullRequestCommit`. */
  private readRawCommit(entry: unknown): PullRequestCommit {
    const record = this.isRecord(entry) ? entry : {};
    const subject =
      typeof record["messageHeadline"] === "string"
        ? record["messageHeadline"]
        : "";
    const body =
      typeof record["messageBody"] === "string" ? record["messageBody"] : "";
    const sha =
      typeof record["oid"] === "string" ? record["oid"].slice(0, 7) : "";

    return {
      convention: this.parseConventionalSubject(subject, body),
      sha,
      subject,
    };
  }

  /** The release level name this rank came from, for a report line. */
  private releaseLevelName(rank: number): string {
    const entry = Object.entries(RELEASE_LEVEL_RANK).find(
      ([, levelRank]) => levelRank === rank,
    );

    return entry?.[0] ?? "release-significant";
  }

  /** Whether every key this rule declares agrees with the subject. */
  private ruleMatches(
    rule: ReleaseRule,
    subject: ConventionalSubject,
  ): boolean {
    return (
      (rule.breaking === undefined || rule.breaking === subject.breaking) &&
      (rule.revert === undefined ||
        rule.revert === (subject.type === "revert")) &&
      (rule.type === undefined || rule.type === subject.type) &&
      (rule.scope === undefined || subject.scopes.includes(rule.scope))
    );
  }

  // 🌎 Public Methods

  /**
   * Every way the title understates its commits, by type or by a shared scope.
   */
  public checkSignificance(options: {
    readonly commits: readonly PullRequestCommit[];
    readonly releaseRules: readonly ReleaseRule[];
    readonly titleConvention: ConventionalSubject;
  }): SignificanceVerdict {
    const { commits, releaseRules, titleConvention } = options;
    const titleRank = this.significanceRank(titleConvention, releaseRules);
    const mostSignificantCommit = this.findMostSignificantCommit(
      commits,
      releaseRules,
    );
    const missingScopeCommits = this.findMissingScopes(
      commits,
      titleConvention,
    );
    const failures: string[] = [];

    if (
      mostSignificantCommit !== undefined &&
      mostSignificantCommit.rank > titleRank
    ) {
      failures.push(
        this.describeSignificanceFailure(mostSignificantCommit, releaseRules),
      );
    }

    failures.push(...this.describeMissingScopeFailures(missingScopeCommits));

    return { failures };
  }

  /** Whatever went wrong, as the one line a report can carry. */
  public describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Reads the type, scopes, and breaking marker of a conventional subject.
   * Breaking means `!` or a `BREAKING CHANGE:` footer.
   */
  public parseConventionalSubject(
    subject: string,
    body = "",
  ): ConventionalSubject | undefined {
    const match = CONVENTIONAL_SUBJECT_PATTERN.exec(subject.trim());
    const type = match?.[1];

    if (match === null || type === undefined) {
      return undefined;
    }

    const scopes = [
      ...new Set(
        (match[2] ?? "")
          .split(SUBJECT_SCOPE_SEPARATOR_PATTERN)
          .map((scope) => scope.trim().toLowerCase())
          .filter((scope) => scope !== ""),
      ),
    ];

    const breaking =
      match.groups?.["breaking"] === "!" ||
      BREAKING_CHANGE_FOOTER_PATTERN.test(body);

    return { breaking, scopes, type };
  }

  /**
   * Reads `release.config.cjs`'s `releaseRules`, wherever `cwd` is.
   * Throws when the commit-analyzer plugin is missing: a broken repository invariant.
   */
  public readReleaseRules(): ReleaseRule[] {
    const configPath = path.join(process.cwd(), RELEASE_CONFIG_PATH);
    const config = releaseConfigSchema.parse(
      this.requireFromCurrentModule(configPath) as unknown,
    );

    const commitAnalyzerEntry = config.plugins.find(
      (plugin): plugin is [string, unknown] =>
        Array.isArray(plugin) && plugin[0] === COMMIT_ANALYZER_PLUGIN_NAME,
    );

    if (commitAnalyzerEntry === undefined) {
      throw new Error(
        `❌ ${RELEASE_CONFIG_PATH} has no ${COMMIT_ANALYZER_PLUGIN_NAME} plugin`,
      );
    }

    return commitAnalyzerOptionsSchema.parse(commitAnalyzerEntry[1])
      .releaseRules;
  }

  /** Reads the title and commits out of a `gh pr view` document. */
  public resolveFromDocument(
    documentText: string,
  ): PullRequestCommitsResolution {
    let parsed: unknown;

    try {
      parsed = JSON.parse(documentText);
    } catch (error) {
      return {
        failure: `❌ Unable to parse the gh pr view output: ${this.describeError(error)}`,
        resolved: false,
      };
    }

    const result = pullRequestDocumentSchema.safeParse(parsed);
    const document = result.success ? result.data : {};
    const rawCommits = document.commits ?? [];

    return {
      commits: rawCommits.map((entry) => this.readRawCommit(entry)),
      resolved: true,
      title: document.title ?? "",
    };
  }

  /**
   * How release-significant a subject is under these `releaseRules`.
   * The first matching rule decides, mirroring `commit-analyzer`.
   */
  public significanceRank(
    subject: ConventionalSubject,
    releaseRules: readonly ReleaseRule[],
  ): number {
    const rule = releaseRules.find((candidate) =>
      this.ruleMatches(candidate, subject),
    );

    return rule === undefined ? 0 : this.rankOfRelease(rule.release);
  }
}
