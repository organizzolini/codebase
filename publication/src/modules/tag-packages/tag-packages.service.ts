import fs from "node:fs";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MainTipService } from "../main-tip/main-tip.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { requireSuccess } from "../process-runner/process-runner.utilities";
import { ReleaseGroupService } from "../release-group/release-group.service";

import {
  DEFAULT_PUSH_RETRY_DELAY,
  LEFTOVER_COMMIT_MESSAGE,
  LEFTOVER_VERSIONS_MESSAGE,
  noBaselineMessage,
  PUSH_ATTEMPTS,
  pushingMessage,
  REFS_PER_PUSH,
  retryingMessage,
  UNRELEASED_VERSION,
  VERSIONED_FILE_PATTERNS,
} from "./tag-packages.constants";

import type { Environment } from "../../publication.types";
import type { ReleaseGroupMember } from "../release-group/release-group.types";
import type { LeftoverOutcome } from "./tag-packages.types";

/**
 * Tags each newly versioned ic-suite package on the release commit, and
 * pushes the tags.
 *
 * semantic-release's release commit carries the versions and changelogs that
 * `version-packages` wrote. It makes that commit only when the codebase itself
 * releases, which a package-scoped `no-release` commit can prevent while Nx
 * still bumps the package, so anything left uncommitted is committed here
 * instead, on its own.
 *
 * A package is newly versioned when its `<project>@<version>` tag, the pattern
 * nx.json's `release.releaseTag` sets, does not exist yet. Checkout fetches
 * every tag, so only this release's are missing, and a re-run creates nothing
 * twice. GitHub rejects any push to this repository that updates more than 6
 * refs, so the tags go 6 at a time, and a rejected batch is retried. Tags
 * still missing when the run ends are pushed by the next run, which runs this
 * before versioning. The remote must already carry a token allowed to push,
 * as `version-packages` leaves it.
 */
@Injectable()
export class TagPackagesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly mainTipService: MainTipService,
    private readonly processRunner: ProcessRunnerService,
    private readonly releaseGroupService: ReleaseGroupService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Commits and pushes any versions semantic-release left uncommitted. A push
   * rejected because `main` moved steps aside, before anything is tagged.
   */
  private commitLeftoverVersions(): LeftoverOutcome {
    this.mustStream("git", ["add", "--", ...this.versionedFiles()]);

    if (
      this.processRunner.capture("git", ["diff", "--cached", "--quiet"])
        .status === 0
    ) {
      return "continue";
    }

    console.info(LEFTOVER_VERSIONS_MESSAGE);
    const base = this.mainTipService.head();
    this.mustStream("env", [
      "HUSKY=0",
      "git",
      "commit",
      "--message",
      LEFTOVER_COMMIT_MESSAGE,
    ]);

    if (
      this.processRunner.stream("env", [
        "HUSKY=0",
        "git",
        "push",
        "origin",
        "HEAD:refs/heads/main",
      ]) === 0
    ) {
      return "continue";
    }

    if (!this.mainTipService.hasMovedFrom(base)) {
      throw new Error("❌ git push origin HEAD:refs/heads/main was rejected");
    }

    this.mainTipService.stepAsideFrom(base);

    return "superseded";
  }

  /** Makes an annotated tag, on the given commit or on `HEAD`. */
  private createTag(tag: string, commit?: string): void {
    const args = [
      "tag",
      "--annotate",
      tag,
      ...(commit === undefined ? [] : [commit]),
      "--message",
      tag,
    ];
    const status = this.processRunner.stream("git", args);

    if (status !== 0) {
      throw new Error(`❌ git ${args.join(" ")} exited ${String(status)}`);
    }
  }

  /** Streams a command, failing the step when it fails. */
  private mustStream(executable: string, args: readonly string[]): void {
    const status = this.processRunner.stream(executable, args);

    if (status !== 0) {
      throw new Error(
        `❌ ${[executable, ...args].join(" ")} exited ${String(status)}`,
      );
    }
  }

  /** Finds the commit before the one that added a package's manifest. */
  private parentOfAddition(member: ReleaseGroupMember): string {
    const added = requireSuccess(
      this.processRunner.capture("git", [
        "log",
        "--diff-filter=A",
        "--format=%H",
        "--",
        `${member.root}/package.json`,
      ]),
      "git log",
    )
      .split("\n")
      .findLast((line) => line !== "");
    const parent =
      added === undefined
        ? undefined
        : this.processRunner.capture("git", [
            "rev-parse",
            "--verify",
            "--quiet",
            `${added}^`,
          ]);

    if (parent?.status !== 0) {
      throw new Error(noBaselineMessage(member.project));
    }

    return parent.stdout.trim();
  }

  /** Pushes the given refs, trying again after a rejection. */
  private async pushWithRetries(
    references: readonly string[],
  ): Promise<number> {
    const delay = this.retryDelay();

    for (let attempt = 1; attempt < PUSH_ATTEMPTS; attempt += 1) {
      if (
        this.processRunner.stream("git", ["push", "origin", ...references]) ===
        0
      ) {
        return 0;
      }

      console.info(retryingMessage(delay));
      await new Promise((resolve) => {
        setTimeout(resolve, delay * 1000);
      });
    }

    return this.processRunner.stream("git", ["push", "origin", ...references]);
  }

  /** Seconds between push attempts, which tests can shorten. */
  private retryDelay(): number {
    const configured = this.configService.get("PUSH_RETRY_DELAY", {
      infer: true,
    });

    return configured === undefined || configured === ""
      ? DEFAULT_PUSH_RETRY_DELAY
      : Number(configured);
  }

  /**
   * Gives each never-tagged release-group package a `<project>@0.0.0`
   * baseline on the commit before the one that added it.
   *
   * Nx writes a changelog from a package's previous tag and stops when it has
   * none. It reads the baseline as the current version, so the first release
   * versions every commit that touched the package, the one that added it
   * included. A package with any tag, or a version other than `0.0.0`, is left
   * alone, so a released package that lost its tag is never restarted from its
   * first commit; `tagNewVersions` tags it at `HEAD` instead.
   */
  private tagBaselines(group: readonly ReleaseGroupMember[]): string[] {
    const tags: string[] = [];

    for (const member of group) {
      const { version } = this.releaseGroupService.readManifest(member.root);
      const existing = requireSuccess(
        this.processRunner.capture("git", [
          "tag",
          "--list",
          `${member.project}@*`,
        ]),
        "git tag --list",
      );

      if (version !== UNRELEASED_VERSION || existing.trim() !== "") {
        continue;
      }

      const tag = `${member.project}@${UNRELEASED_VERSION}`;
      this.createTag(tag, this.parentOfAddition(member));
      tags.push(tag);
    }

    return tags;
  }

  /**
   * Tags `HEAD` for every release-group package whose version has no tag yet.
   * A new package's hand-written `0.0.0` is never tagged as a release.
   */
  private tagNewVersions(group: readonly ReleaseGroupMember[]): string[] {
    const tags: string[] = [];

    for (const member of group) {
      const { version } = this.releaseGroupService.readManifest(member.root);
      const tag = `${member.project}@${version}`;

      if (
        version === UNRELEASED_VERSION ||
        this.processRunner.capture("git", [
          "rev-parse",
          "--quiet",
          "--verify",
          `refs/tags/${tag}`,
        ]).status === 0
      ) {
        continue;
      }

      this.createTag(tag);
      tags.push(tag);
    }

    return tags;
  }

  /** Lists every file `version-packages` may have written that exists. */
  private versionedFiles(): string[] {
    return VERSIONED_FILE_PATTERNS.flatMap((pattern) =>
      fs.globSync(pattern, { cwd: process.cwd() }).toSorted(),
    );
  }

  // 🌎 Public Methods

  /**
   * Commits any leftover versions, then tags and pushes every newly
   * versioned package.
   *
   * @returns The exit code: 0 when every tag was pushed or the run stepped
   * aside, otherwise the last rejected push's.
   */
  public async run(): Promise<number> {
    if (this.commitLeftoverVersions() === "superseded") {
      return 0;
    }

    const group = this.releaseGroupService.readGroup();
    const tags = [...this.tagBaselines(group), ...this.tagNewVersions(group)];
    console.info(pushingMessage(tags.length));

    for (let start = 0; start < tags.length; start += REFS_PER_PUSH) {
      const references = tags
        .slice(start, start + REFS_PER_PUSH)
        .map((tag) => `refs/tags/${tag}`);
      const status = await this.pushWithRetries(references);

      if (status !== 0) {
        return status;
      }
    }

    return 0;
  }
}
