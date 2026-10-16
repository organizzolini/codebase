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
   * Nx's own error when it could not say which projects are in the group or
   * where one lives.
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
   *
   * @param specifier - The package and version to look for.
   * @returns Whether npm answers with that version.
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
   * Reports whether `NPM_REGISTRY` names a registry other than npmjs.org,
   * which makes the run a rehearsal: no provenance, and no GitHub records.
   *
   * @returns Whether this run is a rehearsal.
   */
  public isRehearsal(): boolean {
    return this.npmRegistry() !== DEFAULT_NPM_REGISTRY;
  }

  /**
   * The npm registry packages are published to and read from, with no
   * trailing slash: npmjs.org, unless `NPM_REGISTRY` names another to
   * rehearse against.
   *
   * @returns The registry's address.
   */
  public npmRegistry(): string {
    const configured = this.configService.get("NPM_REGISTRY", { infer: true });

    return configured === undefined || configured === ""
      ? DEFAULT_NPM_REGISTRY
      : configured.replace(/\/+$/, "");
  }

  /**
   * Lists every project in the Nx release group, read from nx.json's
   * `release.projects`, with its directory.
   *
   * Two Nx calls in all, rather than one per project: each starts Nx afresh,
   * and asking for every project's root separately took about 90 seconds a
   * step for 28 packages. It fails rather than return nothing, since an empty
   * group would leave `pnpm -r publish` with no filter, publishing every
   * package.
   *
   * @returns The group's members, in the order Nx lists them.
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
   * Reads the name and version of the package in the given directory.
   *
   * @param root - The package's directory, relative to the workspace.
   * @returns Its manifest's name and version.
   */
  public readManifest(root: string): PackageManifest {
    return JSON.parse(
      fs.readFileSync(path.resolve(root, "package.json"), "utf8"),
    ) as PackageManifest;
  }

  /**
   * Calls the task once for each item, `PARALLEL_CALLS` at a time, and
   * reports whether every call succeeded. Each call's output is held back and
   * printed whole, in item order, so concurrent calls never interleave.
   *
   * @param items - What to call the task with.
   * @param task - The work for one item, returning the lines it printed.
   * @returns Whether every call succeeded.
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
