import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";
import {
  describeError,
  requireSuccess,
} from "../process-runner/process-runner.utilities";

import {
  DEFAULT_NPM_REGISTRY,
  GROUP_UNREADABLE_MESSAGE,
  PARALLEL_CALLS,
} from "./release-group.constants";

import type { Environment } from "../../publication.types";
import type {
  NxReleaseConfiguration,
  PackageManifest,
  ParallelOutcome,
  ProjectGraphFile,
  ReleaseGroupMember,
} from "./release-group.types";

/**
 * Reads the Nx release group the release steps work through, and the npm
 * facts each step asks about its packages.
 */
@Injectable()
export class ReleaseGroupService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Runs one task, turning a thrown error into a failed outcome. */
  private static async settle<Item>(
    task: (item: Item) => Promise<ParallelOutcome>,
    item: Item,
  ): Promise<ParallelOutcome> {
    try {
      return await task(item);
    } catch (error: unknown) {
      return {
        lines: [describeError(error)],
        succeeded: false,
      };
    }
  }

  /**
   * Lists the group's members from a written project graph, failing with
   * Nx's error when Nx cannot name them or locate one.
   */
  private membersFrom(graphFile: string): ReleaseGroupMember[] {
    const releaseProjects = (
      JSON.parse(
        fs.readFileSync(path.resolve("nx.json"), "utf8"),
      ) as NxReleaseConfiguration
    ).release.projects.join(",");
    requireSuccess(
      this.processRunner.capture("pnpm", [
        "exec",
        "nx",
        "graph",
        `--file=${graphFile}`,
      ]),
      "pnpm exec nx graph",
    );
    const shown = requireSuccess(
      this.processRunner.capture("pnpm", [
        "exec",
        "nx",
        "show",
        "projects",
        "--projects",
        releaseProjects,
        "--json",
      ]),
      "pnpm exec nx show projects",
    );

    const { nodes } = (
      JSON.parse(fs.readFileSync(graphFile, "utf8")) as ProjectGraphFile
    ).graph;
    const projects = JSON.parse(shown) as string[];

    return projects.map((project) => {
      const root = nodes[project]?.data.root;

      if (root === undefined) {
        throw new Error(`no root for ${project}`);
      }

      return { project, root };
    });
  }

  // 🌎 Public Methods

  /**
   * Reports whether npm already has the given `<name>@<version>`.
   */
  public async isOnNpm(specifier: string): Promise<boolean> {
    const viewed = await this.processRunner.captureAsync("npm", [
      "view",
      specifier,
      "version",
      "--registry",
      this.npmRegistry(),
    ]);

    return viewed.status === 0;
  }

  /**
   * Reports whether `NPM_REGISTRY` names a non-npmjs.org registry, making this
   * a rehearsal: no provenance, no GitHub records.
   */
  public isRehearsal(): boolean {
    return this.npmRegistry() !== DEFAULT_NPM_REGISTRY;
  }

  /**
   * The npm registry to publish to and read from, without a trailing slash:
   * npmjs.org unless `NPM_REGISTRY` overrides it.
   */
  public npmRegistry(): string {
    const configured = this.configService.get("NPM_REGISTRY", { infer: true });

    return configured === undefined || configured === ""
      ? DEFAULT_NPM_REGISTRY
      : configured.replace(/\/+$/, "");
  }

  /**
   * Lists each project in the Nx release group. Fails rather than returning
   * none, since an empty group would publish every package.
   */
  public readGroup(): ReleaseGroupMember[] {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "release-group-"));
    let members: ReleaseGroupMember[];

    try {
      members = this.membersFrom(path.join(directory, "graph.json"));
    } catch (error: unknown) {
      throw new Error(`${GROUP_UNREADABLE_MESSAGE}: ${describeError(error)}`, {
        cause: error,
      });
    } finally {
      fs.rmSync(directory, { force: true, recursive: true });
    }

    if (members.length === 0) {
      throw new Error(`${GROUP_UNREADABLE_MESSAGE}: Nx listed no projects`);
    }

    return members;
  }

  /**
   * Reads the package.json in the directory `root`, relative to the workspace.
   */
  public readManifest(root: string): PackageManifest {
    return JSON.parse(
      fs.readFileSync(path.resolve(root, "package.json"), "utf8"),
    ) as PackageManifest;
  }

  /**
   * Calls the task per item, `PARALLEL_CALLS` at a time, printing each output
   * whole, in order. Resolves to whether all succeeded.
   */
  public async runInParallel<Item>(
    items: readonly Item[],
    task: (item: Item) => Promise<ParallelOutcome>,
  ): Promise<boolean> {
    let active = 0;
    const waiting: (() => void)[] = [];
    const acquire = async (): Promise<void> => {
      if (active < PARALLEL_CALLS) {
        active += 1;

        return;
      }

      await new Promise<void>((resolve) => {
        waiting.push(resolve);
      });
    };
    const release = (): void => {
      const next = waiting.shift();

      if (next === undefined) {
        active -= 1;
      } else {
        next();
      }
    };
    const outcomes = items.map(async (item) => {
      await acquire();

      try {
        return await ReleaseGroupService.settle(task, item);
      } finally {
        release();
      }
    });
    let succeeded = true;

    for (const outcome of outcomes) {
      const { lines, succeeded: itemSucceeded } = await outcome;

      for (const line of lines) {
        console.info(line);
      }

      succeeded &&= itemSucceeded;
    }

    return succeeded;
  }

  /**
   * Names the package in the given directory as `<name>@<version>`.
   *
   * @param root - The package's directory, relative to the workspace.
   * @returns Its specifier.
   */
  public specifier(root: string): string {
    const { name, version } = this.readManifest(root);

    return `${name}@${version}`;
  }
}
