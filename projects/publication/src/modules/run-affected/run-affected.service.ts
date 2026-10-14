import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  DEFAULT_SPELLING_PATHS,
  INCLUDE_SPELLING_VALUE,
  REVISIONS_UNSET_MESSAGE,
  TARGET_UNSET_MESSAGE,
} from "./run-affected.constants";

import type { Environment } from "../../constants";
import type {
  RunAffectedFailure,
  RunAffectedInputs,
  RunAffectedOutcome,
  RunAffectedPlan,
} from "./run-affected.types";

/**
 * Decides how `nx affected` runs for one target between `NX_BASE` and
 * `NX_HEAD`, and runs it.
 *
 * Handing Nx its list over `--stdin` is the fallback, not the default, because
 * Nx reads every file it names as changed in full. A lockfile then touches
 * every project, defeating `projectsAffectedByDependencyUpdates: "auto"`, and a
 * release commit's one-line `package.json` version bump affected 47 projects
 * instead of 3. Only `--base`/`--head` let Nx diff those files field by field,
 * so any change set with nothing to drop goes through them unchanged.
 *
 * The change set is listed the way Nx lists its own: the merge base of the two
 * revisions, falling back to `NX_BASE` itself, then
 * `git diff --name-only --no-renames --relative`. An empty list affects nothing
 * and exits cleanly; it never falls back to everything.
 */
@Injectable()
export class RunAffectedService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly processRunner: ProcessRunnerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Lists the files changed between two revisions, or why that failed. */
  private listChangedFiles(
    base: string,
    head: string,
  ): RunAffectedFailure | string[] {
    const mergeBase = this.processRunner.capture("git", [
      "merge-base",
      base,
      head,
    ]);
    const from = mergeBase.status === 0 ? mergeBase.stdout.trim() : base;
    const diff = this.processRunner.capture("git", [
      "diff",
      "--name-only",
      "--no-renames",
      "--relative",
      from,
      head,
    ]);

    if (diff.status !== 0) {
      return {
        exitCode: diff.status,
        kind: "failure",
        message: diff.stderr.trim(),
      };
    }

    return diff.stdout.split("\n").filter((line) => line !== "");
  }

  /** Builds the run that hands Nx a change set with the spelling files gone. */
  private narrowedPlan(
    inputs: RunAffectedInputs,
    changed: readonly string[],
  ): RunAffectedPlan {
    const pattern = this.spellingPattern();
    const { extra, target } = inputs;

    return {
      arguments: [
        "exec",
        "nx",
        "affected",
        "--stdin",
        `--target=${target}`,
        ...extra,
      ],
      input: `${changed.filter((file) => !pattern.test(file)).join("\n")}\n`,
      kind: "run",
      spellingFiles: changed.filter((file) => pattern.test(file)),
      target,
    };
  }

  /** Reads the target, the revisions, and the extra flags, or what is unset. */
  private readInputs(): RunAffectedFailure | RunAffectedInputs {
    const target = this.configService.get("TARGET", { infer: true });
    const base = this.configService.get("NX_BASE", { infer: true });
    const head = this.configService.get("NX_HEAD", { infer: true });

    if (target === undefined || target === "") {
      return { exitCode: 1, kind: "failure", message: TARGET_UNSET_MESSAGE };
    }

    if (
      base === undefined ||
      base === "" ||
      head === undefined ||
      head === ""
    ) {
      return { exitCode: 1, kind: "failure", message: REVISIONS_UNSET_MESSAGE };
    }

    const extra = (this.configService.get("ARGUMENTS", { infer: true }) ?? "")
      .split(/\s+/)
      .filter((argument) => argument !== "");

    return { base, extra, head, kind: "inputs", target };
  }

  /** Builds the run that hands Nx the revisions and lets it diff them. */
  private revisionsPlan(inputs: RunAffectedInputs): RunAffectedPlan {
    const { base, extra, head, target } = inputs;

    return {
      arguments: [
        "exec",
        "nx",
        "affected",
        `--base=${base}`,
        `--head=${head}`,
        `--target=${target}`,
        ...extra,
      ],
      kind: "run",
      spellingFiles: [],
      target,
    };
  }

  /** Builds the pattern that picks the spelling files out of a change set. */
  private spellingPattern(): RegExp {
    const configured = this.configService.get("SPELLING_PATHS", {
      infer: true,
    });

    return new RegExp(
      configured === undefined || configured === ""
        ? DEFAULT_SPELLING_PATHS
        : configured,
    );
  }

  // 🌎 Public Methods

  /**
   * Runs `nx affected` as planned, with this process's output streams.
   *
   * @param plan - The run `plan` produced.
   * @returns `nx affected`'s exit code.
   */
  public execute(plan: RunAffectedPlan): number {
    return this.processRunner.stream("pnpm", plan.arguments, plan.input);
  }

  /**
   * Works out the `nx affected` run this environment asks for.
   *
   * @returns The run to make, or the reason there is none.
   */
  public plan(): RunAffectedOutcome {
    const inputs = this.readInputs();

    if (inputs.kind === "failure") {
      return inputs;
    }

    if (
      this.configService.get("INCLUDE_SPELLING", { infer: true }) ===
      INCLUDE_SPELLING_VALUE
    ) {
      return this.revisionsPlan(inputs);
    }

    const changed = this.listChangedFiles(inputs.base, inputs.head);

    if (!Array.isArray(changed)) {
      return changed;
    }

    const pattern = this.spellingPattern();

    return changed.some((file) => pattern.test(file))
      ? this.narrowedPlan(inputs, changed)
      : this.revisionsPlan(inputs);
  }
}
