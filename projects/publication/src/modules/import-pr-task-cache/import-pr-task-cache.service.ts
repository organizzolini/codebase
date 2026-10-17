import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { TaskDatabaseService } from "../task-database/task-database.service";

import {
  artifactQuery,
  COULD_NOT_IMPORT_MESSAGE,
  importingMessage,
  MERGE_GROUP_REF,
  noArtifactMessage,
  NOT_MERGE_GROUP_MESSAGE,
  PULL_REQUEST_QUERY,
  untrustedMessage,
  WORK_DIRECTORY_PREFIX,
} from "./import-pr-task-cache.constants";

import type { Environment } from "../../publication.types";
import type { TaskDatabaseReport } from "../task-database/task-database.types";
import type {
  ImportStop,
  LocatedArtifact,
  TrustedPullRequest,
} from "./import-pr-task-cache.types";

/**
 * Imports the Nx task cache the pull request's own run uploaded, into a merge
 * group's run.
 *
 * A merge group runs on a ref of its own, which can read `main`'s caches and
 * its own, never the pull request's, so without this its tasks run twice. A
 * workflow artifact is readable by any run in the repository, so the pull
 * request's run uploads its cache as one (see `cleanup-codebase`) and this
 * downloads it with `gh` and `unzip`.
 *
 * Only a pull request from this repository is trusted: a fork's artifact could
 * carry results crafted for any task hash. Any other outcome, a missing
 * artifact included, ends cleanly with a cold cache.
 */
@Injectable()
export class ImportPrTaskCacheService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
    private readonly taskDatabaseService: TaskDatabaseService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Runs `gh api` and returns its trimmed output, or fails the import. */
  private api(args: readonly string[]): string {
    const result = this.processRunner.capture("gh", ["api", ...args]);

    if (result.status !== 0) {
      throw new Error(result.stderr);
    }

    return result.stdout.trim();
  }

  /** Downloads one artifact and unpacks it into the work directory. */
  private download(repository: string, artifact: string, work: string): string {
    const archive = path.join(work, "cache.zip");
    const unpacked = path.join(work, "cache");
    const downloaded = this.processRunner.captureToFile(
      "gh",
      ["api", `repos/${repository}/actions/artifacts/${artifact}/zip`],
      archive,
    );

    if (downloaded.status !== 0) {
      throw new Error(downloaded.stderr);
    }

    fs.mkdirSync(unpacked);
    const unzipped = this.processRunner.capture("unzip", [
      "-q",
      archive,
      "-d",
      unpacked,
    ]);

    if (unzipped.status !== 0) {
      throw new Error(unzipped.stderr);
    }

    return unpacked;
  }

  /**
   * Finds the pull request a merge group tests, when it comes from this
   * repository, or says why there is nothing to import.
   */
  private findPullRequest(): ImportStop | TrustedPullRequest {
    const number = MERGE_GROUP_REF.exec(this.read("GITHUB_REF"))?.groups?.[
      "number"
    ];

    if (number === undefined) {
      return { kind: "stop", line: NOT_MERGE_GROUP_MESSAGE };
    }

    const repository = this.require("GITHUB_REPOSITORY");
    const [headSha = "", headRepository = "", baseRepository = ""] = this.api([
      `repos/${repository}/pulls/${number}`,
      "--jq",
      PULL_REQUEST_QUERY,
    ]).split(/\s+/v);

    if (headSha === "" || headRepository !== baseRepository) {
      return {
        kind: "stop",
        line: untrustedMessage(number, headRepository, baseRepository),
      };
    }

    return { headSha, kind: "trusted", number, repository };
  }

  /** Finds the artifact to import, or says why there is none. */
  private locate(): ImportStop | LocatedArtifact {
    const pullRequest = this.findPullRequest();

    if (pullRequest.kind === "stop") {
      return pullRequest;
    }

    const { headSha, number, repository } = pullRequest;
    const name = `nx-cache-${this.require("NX_CACHE_SCOPE")}-${headSha}`;
    const repositoryId = this.api([`repos/${repository}`, "--jq", ".id"]);
    const artifact = this.api([
      `repos/${repository}/actions/artifacts?name=${name}&per_page=10`,
      "--jq",
      artifactQuery(headSha, repositoryId),
    ]);

    return artifact === ""
      ? { kind: "stop", line: noArtifactMessage(name) }
      : { artifact, kind: "located", name, number, repository };
  }

  /** Reads one variable, an absent one as empty. */
  private read(
    name: "GITHUB_REF" | "GITHUB_REPOSITORY" | "NX_CACHE_SCOPE" | "RUNNER_TEMP",
  ): string {
    return this.configService.get(name, { infer: true }) ?? "";
  }

  /** Reads one variable the import cannot do without, or fails the import. */
  private require(name: "GITHUB_REPOSITORY" | "NX_CACHE_SCOPE"): string {
    const value = this.read(name);

    if (value === "") {
      throw new Error(`${name} is unset`);
    }

    return value;
  }

  // 🌎 Public Methods

  /**
   * Imports the pull request's cache when this run is a merge group's. Never
   * throws: every failure is the warning that the run goes on cold.
   */
  public import(): TaskDatabaseReport {
    const parent = this.read("RUNNER_TEMP") || os.tmpdir();
    let work: string | undefined;

    try {
      work = fs.mkdtempSync(path.join(parent, WORK_DIRECTORY_PREFIX));
      const located = this.locate();

      if (located.kind === "stop") {
        return { lines: [located.line] };
      }

      const unpacked = this.download(
        located.repository,
        located.artifact,
        work,
      );

      return {
        lines: [
          importingMessage(located.name, located.number),
          ...this.taskDatabaseService.merge(unpacked).lines,
        ],
      };
    } catch {
      return { lines: [COULD_NOT_IMPORT_MESSAGE] };
    } finally {
      if (work !== undefined) {
        fs.rmSync(work, { force: true, recursive: true });
      }
    }
  }
}
