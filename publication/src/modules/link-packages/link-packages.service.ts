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

import type { CapturedProcess } from "../process-runner/process-runner.types";
import type { Environment } from "../../publication.types";
import type { ParallelOutcome } from "../release-group/release-group.types";
import type {
  LinkContext,
  LinkInputs,
  StorageRecords,
} from "./link-packages.types";

/**
 * Links each published ic-suite package on npm to this repository, on the
 * organization's Linked artifacts page, and lists the ones this run
 * published for `actions/attest`.
 *
 * Attesting only those keeps the provenance honest: an attestation says this
 * run built the package, which is untrue of a version an earlier run
 * published. A version this run published is known to be on npm without
 * asking, which matters while npm's metadata has yet to list it. One package
 * failing to link still lets the others be attested, before the step fails.
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
   * Reports whether the organization already has an npm storage record for
   * a digest. The API answers 404 while a digest has no records at all, and
   * any answer that is not a record list counts as none.
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
   * Links the package in the given directory: a version this run published
   * is added to the attestation subjects, a version already on npm is only
   * linked, and a version on neither is left alone.
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
   * Prints the `sha256:…` digest of the tarball npm serves for a
   * `<name>@<version>`, which is what both a storage record and an
   * attestation identify the package by; npm itself reports only a sha512
   * integrity. The tarball's address is built rather than looked up, and
   * fetched with retries, because npm can trail a publish by minutes.
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
      const fetched = await this.processRunner.captureAsync("curl", [
        ...TARBALL_DOWNLOAD_FLAGS,
        "--output",
        tarball,
        `${context.registryUrl}${name}/-/${String(name.split("/").at(-1))}-${version}.tgz`,
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
   * Records every published release-group version that has no record yet,
   * and lists the ones this run published in a checksums file, setting the
   * `attest=true` step output when there is any.
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
