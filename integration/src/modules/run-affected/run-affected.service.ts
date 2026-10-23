import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ProcessRunnerService } from "../process-runner/process-runner.service";

import {
  INCLUDE_TEMPLATES_VALUE,
  REVISIONS_UNSET_MESSAGE,
  TARGET_UNSET_MESSAGE,
  TEMPLATE_PATTERN,
  TEMPLATE_SELECTOR,
} from "./run-affected.constants";

import type { Environment } from "../../integration.types";
import type {
  RunAffectedFailure,
  RunAffectedInputs,
  RunAffectedOutcome,
  RunAffectedPlan,
} from "./run-affected.types";

/**
 * Runs one Nx target on the projects a CI change affects.
 *
 * Nx's task-based affected selects by each task's own inputs, so a dictionary
 * edit reaches only `spell-check` and a lockfile edit is diffed field by field
 * from `--base`/`--head`. One gap remains: `.nxignore` hides some conformetry
 * templates from Nx, so a template edit alone selects none of the instance
 * projects generated from it. With `INCLUDE_TEMPLATES`, a changed template adds
 * a second run over the conformetry config, an input of every instance project.
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

  /** Builds the `nx affected` arguments for one way of selecting projects. */
  private runOf(
    selection: readonly string[],
    inputs: RunAffectedInputs,
  ): readonly string[] {
    return [
      "exec",
      "nx",
      "affected",
      ...selection,
      `--target=${inputs.target}`,
      ...inputs.extra,
    ];
  }

  /** Picks out the changed templates, when the target asks for them. */
  private templatesChanged(
    inputs: RunAffectedInputs,
  ): RunAffectedFailure | string[] {
    const addTemplates =
      this.configService.get("INCLUDE_TEMPLATES", { infer: true }) ===
      INCLUDE_TEMPLATES_VALUE;

    if (!addTemplates) {
      return [];
    }

    const changed = this.listChangedFiles(inputs.base, inputs.head);

    return Array.isArray(changed)
      ? changed.filter((file) => TEMPLATE_PATTERN.test(file))
      : changed;
  }

  // 🌎 Public Methods

  /**
   * Runs `nx affected` as planned, with this process's output streams, and
   * stops at the first run that fails.
   *
   * @param plan - The runs `plan` produced.
   * @returns The exit code of the first failing run, or 0.
   */
  public execute(plan: RunAffectedPlan): number {
    for (const run of plan.runs) {
      const status = this.processRunner.stream("pnpm", run);

      if (status !== 0) {
        return status;
      }
    }

    return 0;
  }

  /**
   * Works out the `nx affected` runs this environment asks for.
   *
   * @returns The runs to make, or the reason there are none.
   */
  public plan(): RunAffectedOutcome {
    const inputs = this.readInputs();

    if (inputs.kind === "failure") {
      return inputs;
    }

    const templateFiles = this.templatesChanged(inputs);

    if (!Array.isArray(templateFiles)) {
      return templateFiles;
    }

    return {
      kind: "run",
      runs: [
        this.runOf([`--base=${inputs.base}`, `--head=${inputs.head}`], inputs),
        ...(templateFiles.length > 0
          ? [this.runOf([`--files=${TEMPLATE_SELECTOR}`], inputs)]
          : []),
      ],
      target: inputs.target,
      templateFiles,
    };
  }
}
