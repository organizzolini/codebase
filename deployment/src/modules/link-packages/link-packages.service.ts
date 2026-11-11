import { hash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { requireVariable } from "../process-runner/process-runner.utilities";
import { NEWLY_PUBLISHED_FILE } from "../release-group/release-group.constants";
import { ReleaseGroupService } from "../release-group/release-group.service";

import {
  alreadyLinkedMessage,
  ATTEST_OUTPUT_LINE,
  ATTESTATION_SUBJECTS_FILE,
  linkingMessage,
  rehearsalMessage,
  TARBALL_DOWNLOAD_FLAGS,
} from "./link-packages.constants";

import type { Environment } from "../../deployment.types";
import type { CapturedProcess } from "../process-runner/process-runner.types";
import type { ParallelOutcome } from "../release-group/release-group.types";
import type {
  LinkContext,
  LinkInputs,
  StorageRecords,
} from "./link-packages.types";

/**
 * Links each published ic-suite package to this repository, and lists this
 * run's publishes for `actions/attest`.
 *
 * Only versions this run published are attested, since this run built them.
 * Those count as on npm before the metadata lists them. One failed link does
 * not stop the rest.
 */
@Injectable()
export class LinkPackagesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
    private readonly releaseGroupService: ReleaseGroupService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Splits a `<name>@<version>` at its last `@`. */
  private static parse(specifier: string): { name: string; version: string } {
    const at = specifier.lastIndexOf("@");

    return { name: specifier.slice(0, at), version: specifier.slice(at + 1) };
  }

  /**
   * Creates the storage record that lists a package on the Linked artifacts
   * page: where npm keeps it, and which repository it was built from.
   */
  private async createStorageRecord(
    specifier: string,
    digest: string,
    context: LinkContext,
  ): Promise<CapturedProcess> {
    const { name, version } = LinkPackagesService.parse(specifier);

    const directory = fs.mkdtempSync(
      path.join(context.scratchDirectory, "storage-record-"),
    );
    const body = path.join(directory, "storage-record.json");

    fs.writeFileSync(
      body,
      JSON.stringify(
        {
          artifact_url: `https://www.npmjs.com/package/${name}/v/${version}`,
          digest,
          github_repository: context.repository.slice(
            context.repository.indexOf("/") + 1,
          ),
          name,
          registry_url: context.registryUrl,
          status: "active",
          version,
        },
        null,
        2,
      ),
    );

    try {
      return await this.processRunner.captureAsync("gh", [
        "api",
        "--method",
        "POST",
        `orgs/${context.owner}/artifacts/metadata/storage-record`,
        "--input",
        body,
      ]);
    } finally {
      fs.rmSync(directory, { force: true, recursive: true });
    }
  }

  /**
   * Reports whether the organization has an npm storage record for a digest;
   * a 404 or unparsable answer counts as none.
   */
  private async hasStorageRecord(
    digest: string,
    context: LinkContext,
  ): Promise<boolean> {
    const answer = await this.processRunner.captureAsync("gh", [
      "api",
      `orgs/${context.owner}/artifacts/${digest}/metadata/storage-records`,
    ]);

    try {
      const records = JSON.parse(answer.stdout) as StorageRecords;

      return (records.storage_records ?? []).some(
        (record) => record.registry_url === context.registryUrl,
      );
    } catch {
      return false;
    }
  }

  /**
   * Links the package at `root`, and adds a version this run published to the
   * attestation subjects. Skips one on neither.
   */
  private async linkPackage(
    root: string,
    context: LinkContext,
  ): Promise<ParallelOutcome> {
    const specifier = this.releaseGroupService.specifier(root);
    let digest: string;

    if (context.published.has(specifier)) {
      digest = await this.tarballDigest(specifier, context);
      fs.appendFileSync(
        context.subjects,
        `${digest.replace("sha256:", "")}  ${specifier}\n`,
      );
    } else if (await this.releaseGroupService.isOnNpm(specifier)) {
      digest = await this.tarballDigest(specifier, context);
    } else {
      return { lines: [], succeeded: true };
    }

    if (context.rehearsal) {
      return { lines: [rehearsalMessage(specifier)], succeeded: true };
    }

    if (await this.hasStorageRecord(digest, context)) {
      return { lines: [alreadyLinkedMessage(specifier)], succeeded: true };
    }

    const created = await this.createStorageRecord(specifier, digest, context);

    return {
      lines: [
        linkingMessage(specifier, context.repository),
        ...(created.status === 0
          ? []
          : [`❌ ${specifier}: ${created.stderr.trim()}`]),
      ],
      succeeded: created.status === 0,
    };
  }

  /** Reads every input the step needs, failing on the first one unset. */
  private readInputs(): LinkInputs {
    const read = (name: keyof Environment): string =>
      requireVariable(name, this.configService.get(name, { infer: true }));

    return {
      output: read("GITHUB_OUTPUT"),
      owner: read("GITHUB_REPOSITORY_OWNER"),
      repository: read("GITHUB_REPOSITORY"),
      scratchDirectory: read("RUNNER_TEMP"),
    };
  }

  /**
   * Returns the `sha256:` digest of an npm tarball, which npm does not report
   * itself. Retries the fetch, as npm can trail a publish.
   */
  private async tarballDigest(
    specifier: string,
    context: LinkContext,
  ): Promise<string> {
    const { name, version } = LinkPackagesService.parse(specifier);
    const directory = fs.mkdtempSync(
      path.join(context.scratchDirectory, "npm-tarball-"),
    );
    const tarball = path.join(directory, "package.tgz");

    try {
      const viewedTarball = await this.processRunner.captureAsync("npm", [
        "view",
        specifier,
        "dist.tarball",
        "--registry",
        context.registryUrl,
      ]);
      const tarballUrl = viewedTarball.stdout.trim();
      const fallbackUrl = `${context.registryUrl}${name}/-/${String(name.split("/").at(-1))}-${version}.tgz`;

      const fetched = await this.processRunner.captureAsync("curl", [
        ...TARBALL_DOWNLOAD_FLAGS,
        "--output",
        tarball,
        tarballUrl === "" ? fallbackUrl : tarballUrl,
      ]);

      if (fetched.status !== 0) {
        throw new Error(`❌ ${specifier}: ${fetched.stderr.trim()}`);
      }

      return `sha256:${hash("sha256", fs.readFileSync(tarball))}`;
    } finally {
      fs.rmSync(directory, { force: true, recursive: true });
    }
  }

  // 🌎 Public Methods

  /**
   * Records each published version that has no storage record yet.
   *
   * @returns The exit code: 1 when any package failed to link, 0 otherwise.
   */
  public async run(): Promise<number> {
    const inputs = this.readInputs();
    const roots = this.releaseGroupService
      .readGroup()
      .map((member) => member.root);
    const publishedFile = path.join(
      inputs.scratchDirectory,
      NEWLY_PUBLISHED_FILE,
    );
    const subjects = path.join(
      inputs.scratchDirectory,
      ATTESTATION_SUBJECTS_FILE,
    );

    fs.writeFileSync(subjects, "");
    fs.appendFileSync(publishedFile, "");
    const context: LinkContext = {
      owner: inputs.owner,
      published: new Set(
        fs
          .readFileSync(publishedFile, "utf8")
          .split("\n")
          .filter((line) => line !== ""),
      ),
      registryUrl: `${this.releaseGroupService.npmRegistry()}/`,
      rehearsal: this.releaseGroupService.isRehearsal(),
      repository: inputs.repository,
      scratchDirectory: inputs.scratchDirectory,
      subjects,
    };
    const succeeded = await this.releaseGroupService.runInParallel(
      roots,
      async (root) => this.linkPackage(root, context),
    );

    if (fs.statSync(subjects).size > 0) {
      fs.appendFileSync(inputs.output, ATTEST_OUTPUT_LINE);
    }

    return succeeded ? 0 : 1;
  }
}
