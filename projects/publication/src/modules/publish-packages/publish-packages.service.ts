import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { requireVariable } from "../process-runner/process-runner.utilities";
import { NEWLY_PUBLISHED_FILE } from "../release-group/release-group.constants";
import { ReleaseGroupService } from "../release-group/release-group.service";

import {
  alreadyMirroredMessage,
  authenticationLine,
  DEFAULT_GITHUB_PACKAGES_REGISTRY,
  MIRROR_UNSEALED_MESSAGE,
  mirroringMessage,
  MIRRORS_DIRECTORY,
  PUBLISH_SUMMARY_FILE,
  PUBLISHING_MESSAGE,
  unsealedMessage,
} from "./publish-packages.constants";

import type { Environment } from "../../publication.types";
import type { CapturedProcess } from "../process-runner/process-runner.types";
import type { ParallelOutcome } from "../release-group/release-group.types";
import type {
  MirrorContext,
  PublishInputs,
  PublishSummary,
} from "./publish-packages.types";

/**
 * Publishes each released ic-suite package to npm and to GitHub Packages.
 *
 * Each package's changes are in the `CHANGELOG.md` it ships, which the version
 * step wrote, rather than in a GitHub release of its own: the repository's
 * releases are the codebase's `v*` ones alone.
 */
@Injectable()
export class PublishPackagesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
    private readonly releaseGroupService: ReleaseGroupService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Mirrors the package in the given directory to GitHub Packages, unless
   * that version is there already. Each package packs and unpacks in a
   * directory of its own, so several can mirror at once.
   */
  private async mirrorPackage(
    root: string,
    context: MirrorContext,
  ): Promise<ParallelOutcome> {
    const { name, version } = this.releaseGroupService.readManifest(root);
    const mirror = `@${context.scope}/${path.basename(root)}`;
    const viewed = await this.processRunner.captureAsync("npm", [
      "view",
      `${mirror}@${version}`,
      "version",
      "--registry",
      context.registry,
    ]);

    if (viewed.status === 0) {
      return {
        lines: [alreadyMirroredMessage(`${mirror}@${version}`)],
        succeeded: true,
      };
    }

    const unpacked = await this.packRenamed(root, mirror, context);

    if (unpacked.status !== 0) {
      return {
        lines: [`❌ ${mirror}: ${unpacked.stderr.trim()}`],
        succeeded: false,
      };
    }

    const published = await this.processRunner.captureAsync("npm", [
      "publish",
      unpacked.stdout,
      "--ignore-scripts",
      "--registry",
      context.registry,
    ]);

    return {
      lines: [
        mirroringMessage(`${name}@${version}`, mirror),
        ...[published.stdout.trim(), published.stderr.trim()].filter(Boolean),
      ],
      succeeded: published.status === 0,
    };
  }

  /**
   * Packs a package exactly as npm got it, unpacks it, and renames it into
   * the mirror's scope, dropping its `publishConfig`, whose `registry`
   * overrides `--registry` and would send the mirror to npm instead.
   *
   * @returns The unpacked directory as its output, or the failure.
   */
  private async packRenamed(
    root: string,
    mirror: string,
    context: MirrorContext,
  ): Promise<CapturedProcess> {
    const tarball = path.join(context.mirrors, `${path.basename(root)}.tgz`);
    const unpacked = path.join(context.mirrors, path.basename(root));
    const packed = await this.processRunner.captureAsync("pnpm", [
      "--dir",
      root,
      "pack",
      "--out",
      tarball,
    ]);

    if (packed.status !== 0) {
      return packed;
    }

    fs.mkdirSync(unpacked, { recursive: true });
    const extracted = await this.processRunner.captureAsync("tar", [
      "-xzf",
      tarball,
      "-C",
      unpacked,
      "--strip-components",
      "1",
    ]);

    if (extracted.status !== 0) {
      return extracted;
    }

    const file = path.join(unpacked, "package.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
      string,
      unknown
    >;

    manifest["name"] = mirror;
    delete manifest["publishConfig"];
    fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);

    return { status: 0, stderr: "", stdout: unpacked };
  }

  /**
   * Prepares to mirror every release-group package to GitHub Packages,
   * under the owner's scope.
   *
   * GitHub Packages is what lists each package in the repository's Packages
   * sidebar. That registry accepts only packages scoped to the repository's
   * owner, so `@codometer/cli` is mirrored as `@organizzolini/codometer-cli`,
   * packed by pnpm exactly as npm got it and then renamed. It goes last
   * because it is a copy: npm stays where the packages are installed from.
   */
  private prepareMirrors(inputs: PublishInputs): MirrorContext {
    const context: MirrorContext = {
      mirrors: path.join(inputs.scratchDirectory, MIRRORS_DIRECTORY),
      registry: inputs.githubPackagesRegistry,
      scope: inputs.owner.toLowerCase(),
    };

    fs.appendFileSync(
      path.join(os.homedir(), ".npmrc"),
      authenticationLine(context.registry, inputs.githubPackagesToken),
    );
    fs.rmSync(context.mirrors, { force: true, recursive: true });
    fs.mkdirSync(context.mirrors, { recursive: true });

    return context;
  }

  /**
   * Publishes every release-group package whose version is not on npm yet.
   *
   * pnpm rather than `nx release publish`, because pnpm honors provenance
   * only as the `--provenance` flag, which Nx cannot pass. `setup-node`
   * writes no registry `.npmrc`, so the token goes in the user config. What
   * this run published, which is all the next step may attest as built here,
   * comes from pnpm's own summary of it: asking npm afterwards once missed 21
   * of 23 new versions, since a version npm has just accepted can still read
   * as missing for minutes. A publish that fails part way still records
   * whatever pnpm reports, before the step fails.
   */
  private publishToNpm(
    roots: readonly string[],
    inputs: PublishInputs,
  ): number {
    const registry = this.releaseGroupService.npmRegistry();
    const published = path.join(inputs.scratchDirectory, NEWLY_PUBLISHED_FILE);
    const summary = path.resolve(PUBLISH_SUMMARY_FILE);

    fs.appendFileSync(
      path.join(os.homedir(), ".npmrc"),
      authenticationLine(registry, inputs.npmToken),
    );
    console.info(PUBLISHING_MESSAGE);
    fs.rmSync(summary, { force: true });
    fs.writeFileSync(published, "");
    const status = this.processRunner.stream("pnpm", [
      "-r",
      ...roots.flatMap((root) => ["--filter", `./${root}`]),
      "publish",
      ...(this.releaseGroupService.isRehearsal() ? [] : ["--provenance"]),
      "--no-git-checks",
      "--tag",
      "latest",
      "--registry",
      registry,
      "--report-summary",
    ]);

    if (fs.existsSync(summary)) {
      const { publishedPackages } = JSON.parse(
        fs.readFileSync(summary, "utf8"),
      ) as PublishSummary;

      fs.writeFileSync(
        published,
        (publishedPackages ?? [])
          .map(({ name, version }) => `${name}@${version}\n`)
          .join(""),
      );
      fs.rmSync(summary);
    }

    return status;
  }

  /** Reads every input the step needs, failing on the first one unset. */
  private readInputs(): PublishInputs {
    const configured = this.configService.get("GITHUB_PACKAGES_REGISTRY", {
      infer: true,
    });

    return {
      githubPackagesRegistry:
        configured === undefined || configured === ""
          ? DEFAULT_GITHUB_PACKAGES_REGISTRY
          : configured.replace(/\/+$/v, ""),
      githubPackagesToken: requireVariable(
        "GITHUB_PACKAGES_TOKEN",
        this.configService.get("GITHUB_PACKAGES_TOKEN", { infer: true }),
      ),
      npmToken: requireVariable(
        "NPM_TOKEN",
        this.configService.get("NPM_TOKEN", { infer: true }),
      ),
      owner: requireVariable(
        "GITHUB_REPOSITORY_OWNER",
        this.configService.get("GITHUB_REPOSITORY_OWNER", { infer: true }),
      ),
      scratchDirectory: requireVariable(
        "RUNNER_TEMP",
        this.configService.get("RUNNER_TEMP", { infer: true }),
      ),
    };
  }

  /**
   * Refuses a rehearsal that would still reach a real registry: provenance
   * needs a CI token, a package's `publishConfig.registry` overrides
   * `--registry`, and the mirror would go to GitHub Packages. Checked before
   * anything is written or published; a real release passes untouched.
   */
  private refuseUnsealedRehearsal(
    roots: readonly string[],
    inputs: PublishInputs,
  ): void {
    if (!this.releaseGroupService.isRehearsal()) {
      return;
    }

    if (inputs.githubPackagesRegistry === DEFAULT_GITHUB_PACKAGES_REGISTRY) {
      throw new Error(MIRROR_UNSEALED_MESSAGE);
    }

    for (const root of roots) {
      const { name, publishConfig } =
        this.releaseGroupService.readManifest(root);
      const registry = publishConfig?.registry?.replace(/\/+$/v, "");

      if (
        registry !== undefined &&
        registry !== this.releaseGroupService.npmRegistry()
      ) {
        throw new Error(unsealedMessage(name, registry));
      }
    }
  }

  // 🌎 Public Methods

  /**
   * Publishes the release group to npm, then mirrors it to GitHub Packages.
   * Both skip any version already there, so a re-run sends only what is
   * missing.
   *
   * @returns The exit code: pnpm's when publishing to npm failed, 1 when a
   * mirror failed, and 0 otherwise.
   */
  public async run(): Promise<number> {
    const inputs = this.readInputs();
    const roots = this.releaseGroupService
      .readGroup()
      .map((member) => member.root);

    this.refuseUnsealedRehearsal(roots, inputs);
    const status = this.publishToNpm(roots, inputs);

    if (status !== 0) {
      return status;
    }

    const context = this.prepareMirrors(inputs);
    const mirrored = await this.releaseGroupService.runInParallel(
      roots,
      async (root) => this.mirrorPackage(root, context),
    );

    return mirrored ? 0 : 1;
  }
}
